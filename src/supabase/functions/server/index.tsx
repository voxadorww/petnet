import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Auth Routes
app.post('/make-server-25fd7150/signup', async (c) => {
  try {
    const { email, password, petName, species, breed, age } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { petName, species, breed, age },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Create profile in KV store
    await kv.set(`profile:${data.user.id}`, {
      id: data.user.id,
      email,
      petName,
      species,
      breed,
      age,
      profilePicture: null,
      aboutMe: '',
      favoriteToys: [],
      favoriteFoods: [],
      quirks: [],
      badges: [],
      isAdmin: false,
      createdAt: new Date().toISOString(),
      followers: [],
      following: [],
      postCount: 0
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Signup server error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-25fd7150/profile/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const profile = await kv.get(`profile:${userId}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.log(`Get profile error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-25fd7150/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();
    const existingProfile = await kv.get(`profile:${user.id}`);
    
    if (!existingProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const updatedProfile = { ...existingProfile, ...updates };
    await kv.set(`profile:${user.id}`, updatedProfile);

    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log(`Update profile error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Posts Routes
app.post('/make-server-25fd7150/posts', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { content, imageUrl, videoUrl, hashtags } = await c.req.json();
    const postId = `post:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const post = {
      id: postId,
      userId: user.id,
      content,
      imageUrl,
      videoUrl,
      hashtags: hashtags || [],
      likes: [],
      reactions: { paw: [], sniff: [], tailwag: [] },
      comments: [],
      reposts: [],
      createdAt: new Date().toISOString()
    };

    await kv.set(postId, post);
    
    // Update user's post count
    const profile = await kv.get(`profile:${user.id}`);
    if (profile) {
      profile.postCount = (profile.postCount || 0) + 1;
      await kv.set(`profile:${user.id}`, profile);
    }

    return c.json({ post });
  } catch (error) {
    console.log(`Create post error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-25fd7150/feed', async (c) => {
  try {
    const posts = await kv.getByPrefix('post:');
    
    // Sort by createdAt descending
    const sortedPosts = posts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Get profiles for each post
    const postsWithProfiles = await Promise.all(
      sortedPosts.map(async (post) => {
        const profile = await kv.get(`profile:${post.userId}`);
        return { ...post, profile };
      })
    );

    return c.json({ posts: postsWithProfiles });
  } catch (error) {
    console.log(`Get feed error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-25fd7150/posts/:postId/like', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');
    const post = await kv.get(postId);
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Toggle like
    if (post.likes.includes(user.id)) {
      post.likes = post.likes.filter(id => id !== user.id);
    } else {
      post.likes.push(user.id);
    }

    await kv.set(postId, post);
    return c.json({ post });
  } catch (error) {
    console.log(`Like post error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-25fd7150/posts/:postId/react', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');
    const { reactionType } = await c.req.json();
    const post = await kv.get(postId);
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Toggle reaction
    if (post.reactions[reactionType]?.includes(user.id)) {
      post.reactions[reactionType] = post.reactions[reactionType].filter(id => id !== user.id);
    } else {
      if (!post.reactions[reactionType]) {
        post.reactions[reactionType] = [];
      }
      post.reactions[reactionType].push(user.id);
    }

    await kv.set(postId, post);
    return c.json({ post });
  } catch (error) {
    console.log(`React to post error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-25fd7150/posts/:postId/comment', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');
    const { content } = await c.req.json();
    const post = await kv.get(postId);
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    const comment = {
      id: `comment:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      content,
      createdAt: new Date().toISOString()
    };

    post.comments.push(comment);
    await kv.set(postId, post);
    
    return c.json({ post });
  } catch (error) {
    console.log(`Comment on post error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-25fd7150/posts/:postId/repost', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');
    const post = await kv.get(postId);
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Toggle repost
    if (post.reposts.includes(user.id)) {
      post.reposts = post.reposts.filter(id => id !== user.id);
    } else {
      post.reposts.push(user.id);
    }

    await kv.set(postId, post);
    return c.json({ post });
  } catch (error) {
    console.log(`Repost error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Following Routes
app.post('/make-server-25fd7150/follow/:targetUserId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const targetUserId = c.req.param('targetUserId');
    
    const userProfile = await kv.get(`profile:${user.id}`);
    const targetProfile = await kv.get(`profile:${targetUserId}`);
    
    if (!userProfile || !targetProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Toggle follow
    if (userProfile.following.includes(targetUserId)) {
      userProfile.following = userProfile.following.filter(id => id !== targetUserId);
      targetProfile.followers = targetProfile.followers.filter(id => id !== user.id);
    } else {
      userProfile.following.push(targetUserId);
      targetProfile.followers.push(user.id);
      
      // Create notification
      const notificationId = `notification:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await kv.set(notificationId, {
        id: notificationId,
        userId: targetUserId,
        type: 'follow',
        fromUserId: user.id,
        message: `${userProfile.petName} started following you!`,
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    await kv.set(`profile:${user.id}`, userProfile);
    await kv.set(`profile:${targetUserId}`, targetProfile);

    return c.json({ following: userProfile.following.includes(targetUserId) });
  } catch (error) {
    console.log(`Follow user error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Notifications
app.get('/make-server-25fd7150/notifications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allNotifications = await kv.getByPrefix('notification:');
    const userNotifications = allNotifications
      .filter(n => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ notifications: userNotifications });
  } catch (error) {
    console.log(`Get notifications error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-25fd7150/notifications/:notificationId/read', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notificationId = c.req.param('notificationId');
    const notification = await kv.get(notificationId);
    
    if (!notification || notification.userId !== user.id) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    notification.read = true;
    await kv.set(notificationId, notification);

    return c.json({ notification });
  } catch (error) {
    console.log(`Mark notification read error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Contests & Badges
app.get('/make-server-25fd7150/contests', async (c) => {
  try {
    const contests = await kv.getByPrefix('contest:');
    return c.json({ contests });
  } catch (error) {
    console.log(`Get contests error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-25fd7150/contests', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`profile:${user.id}`);
    if (!profile?.isAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const { title, description, startDate, endDate, category } = await c.req.json();
    const contestId = `contest:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const contest = {
      id: contestId,
      title,
      description,
      startDate,
      endDate,
      category,
      entries: [],
      createdAt: new Date().toISOString()
    };

    await kv.set(contestId, contest);
    return c.json({ contest });
  } catch (error) {
    console.log(`Create contest error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-25fd7150/badges/award', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const adminProfile = await kv.get(`profile:${user.id}`);
    if (!adminProfile?.isAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const { targetUserId, badgeName, badgeIcon, badgeColor } = await c.req.json();
    const targetProfile = await kv.get(`profile:${targetUserId}`);
    
    if (!targetProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const badge = {
      name: badgeName,
      icon: badgeIcon,
      color: badgeColor,
      awardedAt: new Date().toISOString()
    };

    targetProfile.badges.push(badge);
    await kv.set(`profile:${targetUserId}`, targetProfile);

    return c.json({ profile: targetProfile });
  } catch (error) {
    console.log(`Award badge error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Moderation & Reports
app.post('/make-server-25fd7150/reports', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { reportedItemId, reportedItemType, reason, description } = await c.req.json();
    const reportId = `report:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const report = {
      id: reportId,
      reporterId: user.id,
      reportedItemId,
      reportedItemType,
      reason,
      description,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await kv.set(reportId, report);
    return c.json({ report });
  } catch (error) {
    console.log(`Create report error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-25fd7150/reports', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`profile:${user.id}`);
    if (!profile?.isAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const reports = await kv.getByPrefix('report:');
    const sortedReports = reports.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ reports: sortedReports });
  } catch (error) {
    console.log(`Get reports error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-25fd7150/reports/:reportId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`profile:${user.id}`);
    if (!profile?.isAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const reportId = c.req.param('reportId');
    const { status, action } = await c.req.json();
    const report = await kv.get(reportId);
    
    if (!report) {
      return c.json({ error: 'Report not found' }, 404);
    }

    report.status = status;
    report.action = action;
    report.reviewedBy = user.id;
    report.reviewedAt = new Date().toISOString();

    await kv.set(reportId, report);
    return c.json({ report });
  } catch (error) {
    console.log(`Update report error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Suggested Pets
app.get('/make-server-25fd7150/suggested-pets', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`profile:${user.id}`);
    const allProfiles = await kv.getByPrefix('profile:');
    
    // Filter out current user and already following
    const suggested = allProfiles
      .filter(p => p.id !== user.id && !userProfile.following.includes(p.id))
      .slice(0, 10);

    return c.json({ suggested });
  } catch (error) {
    console.log(`Get suggested pets error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);
