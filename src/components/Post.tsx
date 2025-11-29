import { Heart, MessageCircle, Share2, Flag, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { api } from '../utils/api.tsx';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PostProps {
  post: any;
  accessToken: string;
  currentUserId: string;
  onUpdate: () => void;
}

export function Post({ post, accessToken, currentUserId, onUpdate }: PostProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const isLiked = post.likes?.includes(currentUserId);
  const isReposted = post.reposts?.includes(currentUserId);

  const handleLike = async () => {
    try {
      await api.likePost(accessToken, post.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleReaction = async (reactionType: string) => {
    try {
      await api.reactToPost(accessToken, post.id, reactionType);
      setShowReactions(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to react to post:', error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      await api.commentOnPost(accessToken, post.id, commentText);
      setCommentText('');
      onUpdate();
    } catch (error) {
      console.error('Failed to comment:', error);
    }
  };

  const handleRepost = async () => {
    try {
      await api.repost(accessToken, post.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to repost:', error);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    
    try {
      await api.createReport(accessToken, {
        reportedItemId: post.id,
        reportedItemType: 'post',
        reason: reportReason,
        description: ''
      });
      setShowReport(false);
      setReportReason('');
      alert('Report submitted successfully');
    } catch (error) {
      console.error('Failed to report post:', error);
    }
  };

  const formatHashtags = (text: string) => {
    return text.split(' ').map((word, i) => {
      if (word.startsWith('#')) {
        return (
          <span key={i} className="text-[#c77dff] hover:text-[#9d4edd] cursor-pointer">
            {word}{' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  return (
    <div className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-all shadow-lg">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9d4edd] to-[#7209b7] p-0.5">
            {post.profile?.profilePicture ? (
              <ImageWithFallback
                src={post.profile.profilePicture}
                alt={post.profile.petName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#240046] flex items-center justify-center">
                <span className="text-2xl">
                  {post.profile?.species === 'Dog' ? '🐕' : post.profile?.species === 'Cat' ? '🐱' : '🐾'}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[#e8e4ff]">{post.profile?.petName || 'Unknown Pet'}</h3>
              {post.profile?.badges?.some((b: any) => b.name === 'Verified') && (
                <span className="text-[#9d4edd]" title="Verified">✓</span>
              )}
              {post.profile?.isAdmin && (
                <span className="text-[#c77dff]" title="Admin">👑</span>
              )}
            </div>
            <p className="text-sm text-[#c8b8e6]">
              {post.profile?.breed} • {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowReport(!showReport)}
          className="p-2 text-[#c8b8e6] hover:text-[#ff006e] hover:bg-[#240046] rounded-lg transition-all"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* Post Content */}
      {post.content && (
        <p className="text-[#e8e4ff] mb-4 whitespace-pre-wrap">
          {formatHashtags(post.content)}
        </p>
      )}

      {/* Post Image/Video */}
      {post.imageUrl && (
        <ImageWithFallback
          src={post.imageUrl}
          alt="Post content"
          className="w-full rounded-xl mb-4 object-cover max-h-96"
        />
      )}

      {post.videoUrl && (
        <video
          src={post.videoUrl}
          controls
          className="w-full rounded-xl mb-4"
        />
      )}

      {/* Reactions Summary */}
      <div className="flex items-center gap-4 mb-4 text-sm text-[#c8b8e6]">
        {post.likes?.length > 0 && (
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4 fill-[#ff006e] text-[#ff006e]" />
            {post.likes.length}
          </span>
        )}
        {post.reactions?.paw?.length > 0 && (
          <span className="flex items-center gap-1">
            🐾 {post.reactions.paw.length}
          </span>
        )}
        {post.reactions?.sniff?.length > 0 && (
          <span className="flex items-center gap-1">
            👃 {post.reactions.sniff.length}
          </span>
        )}
        {post.reactions?.tailwag?.length > 0 && (
          <span className="flex items-center gap-1">
            🎾 {post.reactions.tailwag.length}
          </span>
        )}
        {post.comments?.length > 0 && (
          <span>{post.comments.length} comments</span>
        )}
        {post.reposts?.length > 0 && (
          <span>{post.reposts.length} reposts</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#9d4edd]/20">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            isLiked
              ? 'bg-[#ff006e]/20 text-[#ff006e]'
              : 'text-[#c8b8e6] hover:bg-[#240046]'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#ff006e]' : ''}`} />
          <span>Like</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#c8b8e6] hover:bg-[#240046] transition-all"
          >
            <Sparkles className="w-5 h-5" />
            <span>React</span>
          </button>

          {showReactions && (
            <div className="absolute bottom-full mb-2 left-0 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl p-3 flex gap-2 shadow-xl">
              <button
                onClick={() => handleReaction('paw')}
                className="text-2xl hover:scale-125 transition-transform"
                title="Paw"
              >
                🐾
              </button>
              <button
                onClick={() => handleReaction('sniff')}
                className="text-2xl hover:scale-125 transition-transform"
                title="Sniff"
              >
                👃
              </button>
              <button
                onClick={() => handleReaction('tailwag')}
                className="text-2xl hover:scale-125 transition-transform"
                title="Tail Wag"
              >
                🎾
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#c8b8e6] hover:bg-[#240046] transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Comment</span>
        </button>

        <button
          onClick={handleRepost}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            isReposted
              ? 'bg-[#7209b7]/20 text-[#c77dff]'
              : 'text-[#c8b8e6] hover:bg-[#240046]'
          }`}
        >
          <Share2 className="w-5 h-5" />
          <span>Repost</span>
        </button>
      </div>

      {/* Report Form */}
      {showReport && (
        <div className="mb-4 p-4 bg-[#240046] rounded-xl border border-[#ff006e]/30">
          <h4 className="text-[#e8e4ff] mb-2">Report Post</h4>
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full px-3 py-2 mb-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-lg text-[#e8e4ff]"
          >
            <option value="">Select reason</option>
            <option value="spam">Spam</option>
            <option value="inappropriate">Inappropriate content</option>
            <option value="harassment">Harassment or bullying</option>
            <option value="other">Other</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleReport}
              className="px-4 py-2 bg-[#ff006e] text-white rounded-lg hover:bg-[#ff006e]/80 transition-colors"
            >
              Submit Report
            </button>
            <button
              onClick={() => setShowReport(false)}
              className="px-4 py-2 bg-[#240046] text-[#c8b8e6] rounded-lg hover:bg-[#3c096c] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-3">
          {/* Comment Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] placeholder-[#c8b8e6]/50 focus:outline-none focus:border-[#9d4edd]"
              onKeyPress={(e) => e.key === 'Enter' && handleComment()}
            />
            <button
              onClick={handleComment}
              className="px-4 py-2 bg-gradient-to-r from-[#9d4edd] to-[#7209b7] text-white rounded-xl hover:shadow-lg hover:shadow-[#9d4edd]/50 transition-all"
            >
              Post
            </button>
          </div>

          {/* Comments List */}
          {post.comments?.map((comment: any) => (
            <div key={comment.id} className="flex gap-3 p-3 bg-[#240046]/50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9d4edd] to-[#7209b7] flex items-center justify-center">
                <span className="text-sm">🐾</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#e8e4ff]">Pet</span>
                  <span className="text-xs text-[#c8b8e6]">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[#c8b8e6]">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
