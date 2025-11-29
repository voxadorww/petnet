import { useState, useEffect } from 'react';
import { Plus, Image, Video, Hash } from 'lucide-react';
import { api } from '../utils/api.tsx';
import { Post } from './Post.tsx';

interface FeedProps {
  accessToken: string;
  userId: string;
}

export function Feed({ accessToken, userId }: FeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [hashtags, setHashtags] = useState('');

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const result = await api.getFeed();
      if (result.posts) {
        setPosts(result.posts);
      }
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !postImage) return;

    try {
      const hashtagsArray = hashtags
        .split(' ')
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.trim());

      await api.createPost(accessToken, {
        content: postContent,
        imageUrl: postImage || null,
        videoUrl: null,
        hashtags: hashtagsArray
      });

      setPostContent('');
      setPostImage('');
      setHashtags('');
      setShowCreatePost(false);
      loadFeed();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const trendingHashtags = ['#Zoomies', '#SnackTime', '#Caturday', '#DogLife', '#NapTime', '#PlayTime'];

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Create Post Card */}
        <div className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 shadow-lg">
          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#240046] hover:bg-[#3c096c] rounded-xl text-[#c8b8e6] transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>What's on your pet's mind?</span>
          </button>

          {showCreatePost && (
            <div className="mt-4 space-y-4">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share your pet's adventures..."
                className="w-full px-4 py-3 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] placeholder-[#c8b8e6]/50 focus:outline-none focus:border-[#9d4edd] resize-none"
                rows={4}
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  value={postImage}
                  onChange={(e) => setPostImage(e.target.value)}
                  placeholder="Image URL (optional)"
                  className="flex-1 px-4 py-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] placeholder-[#c8b8e6]/50 focus:outline-none focus:border-[#9d4edd]"
                />
                <button className="p-2 text-[#c8b8e6] hover:bg-[#240046] rounded-lg transition-all">
                  <Image className="w-5 h-5" />
                </button>
              </div>

              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="Add hashtags (e.g., #Zoomies #SnackTime)"
                className="w-full px-4 py-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] placeholder-[#c8b8e6]/50 focus:outline-none focus:border-[#9d4edd]"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleCreatePost}
                  className="flex-1 py-3 bg-gradient-to-r from-[#9d4edd] to-[#7209b7] text-white rounded-xl hover:shadow-lg hover:shadow-[#9d4edd]/50 transition-all"
                >
                  Post
                </button>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="px-6 py-3 bg-[#240046] text-[#c8b8e6] rounded-xl hover:bg-[#3c096c] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trending Hashtags */}
        <div className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 shadow-lg">
          <h2 className="text-xl text-[#e8e4ff] mb-4 flex items-center gap-2">
            <Hash className="w-5 h-5 text-[#c77dff]" />
            Trending Now
          </h2>
          <div className="flex flex-wrap gap-2">
            {trendingHashtags.map((tag) => (
              <button
                key={tag}
                className="px-4 py-2 bg-[#240046] hover:bg-[#9d4edd]/20 text-[#c77dff] rounded-full transition-all border border-[#9d4edd]/30"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-[#9d4edd]/30 border-t-[#9d4edd] rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 rounded-2xl border border-[#9d4edd]/20">
            <p className="text-[#c8b8e6]">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                accessToken={accessToken}
                currentUserId={userId}
                onUpdate={loadFeed}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
