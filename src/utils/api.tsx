import { projectId, publicAnonKey } from './supabase/info.tsx';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-25fd7150`;

export const api = {
  async signup(email: string, password: string, petName: string, species: string, breed: string, age: number) {
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, petName, species, breed, age })
    });
    return res.json();
  },

  async getProfile(userId: string) {
    const res = await fetch(`${API_BASE}/profile/${userId}`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    return res.json();
  },

  async updateProfile(accessToken: string, updates: any) {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async createPost(accessToken: string, post: any) {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(post)
    });
    return res.json();
  },

  async getFeed() {
    const res = await fetch(`${API_BASE}/feed`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    return res.json();
  },

  async likePost(accessToken: string, postId: string) {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return res.json();
  },

  async reactToPost(accessToken: string, postId: string, reactionType: string) {
    const res = await fetch(`${API_BASE}/posts/${postId}/react`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ reactionType })
    });
    return res.json();
  },

  async commentOnPost(accessToken: string, postId: string, content: string) {
    const res = await fetch(`${API_BASE}/posts/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ content })
    });
    return res.json();
  },

  async repost(accessToken: string, postId: string) {
    const res = await fetch(`${API_BASE}/posts/${postId}/repost`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return res.json();
  },

  async followUser(accessToken: string, targetUserId: string) {
    const res = await fetch(`${API_BASE}/follow/${targetUserId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return res.json();
  },

  async getNotifications(accessToken: string) {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return res.json();
  },

  async markNotificationRead(accessToken: string, notificationId: string) {
    const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return res.json();
  },

  async getContests() {
    const res = await fetch(`${API_BASE}/contests`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    return res.json();
  },

  async createContest(accessToken: string, contest: any) {
    const res = await fetch(`${API_BASE}/contests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(contest)
    });
    return res.json();
  },

  async awardBadge(accessToken: string, targetUserId: string, badge: any) {
    const res = await fetch(`${API_BASE}/badges/award`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ targetUserId, ...badge })
    });
    return res.json();
  },

  async createReport(accessToken: string, report: any) {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(report)
    });
    return res.json();
  },

  async getReports(accessToken: string) {
    const res = await fetch(`${API_BASE}/reports`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return res.json();
  },

  async updateReport(accessToken: string, reportId: string, updates: any) {
    const res = await fetch(`${API_BASE}/reports/${reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async getSuggestedPets(accessToken: string) {
    const res = await fetch(`${API_BASE}/suggested-pets`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return res.json();
  }
};
