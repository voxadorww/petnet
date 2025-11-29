import { useState, useEffect } from 'react';
import { Trophy, Star, Award, Sparkles } from 'lucide-react';
import { api } from '../utils/api.tsx';

interface ContestsProps {
  accessToken: string;
  isAdmin: boolean;
}

export function Contests({ accessToken, isAdmin }: ContestsProps) {
  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateContest, setShowCreateContest] = useState(false);
  const [newContest, setNewContest] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: ''
  });

  useEffect(() => {
    loadContests();
  }, []);

  const loadContests = async () => {
    try {
      setLoading(true);
      const result = await api.getContests();
      if (result.contests) {
        setContests(result.contests);
      }
    } catch (error) {
      console.error('Failed to load contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContest = async () => {
    if (!newContest.title || !newContest.description) return;

    try {
      await api.createContest(accessToken, newContest);
      setNewContest({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        category: ''
      });
      setShowCreateContest(false);
      loadContests();
    } catch (error) {
      console.error('Failed to create contest:', error);
    }
  };

  const sampleBadges = [
    { icon: '⭐', name: 'Rising Star', description: 'First 100 posts' },
    { icon: '🏆', name: 'Top Dog', description: 'Most liked post of the month' },
    { icon: '🎯', name: 'Goal Getter', description: 'Completed 10 challenges' },
    { icon: '🌟', name: 'Influencer', description: '1000+ followers' },
    { icon: '💎', name: 'Premium Pet', description: 'Active for 1 year' },
    { icon: '🔥', name: 'Streak Master', description: '30 day posting streak' },
    { icon: '🎨', name: 'Creative Paws', description: 'Posted 50 photos' },
    { icon: '💬', name: 'Chatty Pet', description: 'Made 500 comments' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#9d4edd]/30 border-t-[#9d4edd] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl text-[#e8e4ff] mb-2 flex items-center gap-3">
              <Trophy className="w-10 h-10 text-[#c77dff]" />
              Contests & Badges
            </h1>
            <p className="text-[#c8b8e6]">Compete, earn achievements, and show off your badges!</p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowCreateContest(!showCreateContest)}
              className="px-6 py-3 bg-gradient-to-r from-[#9d4edd] to-[#7209b7] text-white rounded-xl hover:shadow-lg hover:shadow-[#9d4edd]/50 transition-all"
            >
              Create Contest
            </button>
          )}
        </div>

        {/* Create Contest Form */}
        {showCreateContest && isAdmin && (
          <div className="mb-6 bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 shadow-lg">
            <h2 className="text-2xl text-[#e8e4ff] mb-4">Create New Contest</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-[#e8e4ff]">Title</label>
                <input
                  type="text"
                  value={newContest.title}
                  onChange={(e) => setNewContest({ ...newContest, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] focus:outline-none focus:border-[#9d4edd]"
                  placeholder="Funniest Nap Photo Contest"
                />
              </div>

              <div>
                <label className="block mb-2 text-[#e8e4ff]">Description</label>
                <textarea
                  value={newContest.description}
                  onChange={(e) => setNewContest({ ...newContest, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] focus:outline-none focus:border-[#9d4edd] resize-none"
                  rows={3}
                  placeholder="Share your pet's funniest nap position!"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-[#e8e4ff]">Start Date</label>
                  <input
                    type="date"
                    value={newContest.startDate}
                    onChange={(e) => setNewContest({ ...newContest, startDate: e.target.value })}
                    className="w-full px-4 py-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] focus:outline-none focus:border-[#9d4edd]"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[#e8e4ff]">End Date</label>
                  <input
                    type="date"
                    value={newContest.endDate}
                    onChange={(e) => setNewContest({ ...newContest, endDate: e.target.value })}
                    className="w-full px-4 py-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] focus:outline-none focus:border-[#9d4edd]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[#e8e4ff]">Category</label>
                <select
                  value={newContest.category}
                  onChange={(e) => setNewContest({ ...newContest, category: e.target.value })}
                  className="w-full px-4 py-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] focus:outline-none focus:border-[#9d4edd]"
                >
                  <option value="">Select category</option>
                  <option value="photo">Photo Contest</option>
                  <option value="video">Video Contest</option>
                  <option value="story">Story Contest</option>
                  <option value="trick">Best Trick</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateContest}
                  className="px-6 py-3 bg-gradient-to-r from-[#9d4edd] to-[#7209b7] text-white rounded-xl hover:shadow-lg hover:shadow-[#9d4edd]/50 transition-all"
                >
                  Create Contest
                </button>
                <button
                  onClick={() => setShowCreateContest(false)}
                  className="px-6 py-3 bg-[#240046] text-[#c8b8e6] rounded-xl hover:bg-[#3c096c] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Contests */}
        <div className="mb-8">
          <h2 className="text-2xl text-[#e8e4ff] mb-4">Active Contests</h2>
          {contests.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 rounded-2xl border border-[#9d4edd]/20">
              <Trophy className="w-16 h-16 text-[#c8b8e6] mx-auto mb-4" />
              <p className="text-[#c8b8e6]">No active contests at the moment</p>
              <p className="text-[#c8b8e6] text-sm mt-2">Check back soon for new challenges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contests.map((contest) => (
                <div
                  key={contest.id}
                  className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-all shadow-lg"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#9d4edd] to-[#7209b7] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl text-[#e8e4ff] mb-2">{contest.title}</h3>
                      <p className="text-[#c8b8e6] mb-3">{contest.description}</p>
                      {contest.startDate && contest.endDate && (
                        <p className="text-sm text-[#c8b8e6]">
                          {new Date(contest.startDate).toLocaleDateString()} - {new Date(contest.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="w-full py-3 bg-gradient-to-r from-[#9d4edd] to-[#7209b7] text-white rounded-xl hover:shadow-lg hover:shadow-[#9d4edd]/50 transition-all">
                    Enter Contest
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Badges */}
        <div>
          <h2 className="text-2xl text-[#e8e4ff] mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-[#c77dff]" />
            Achievement Badges
          </h2>
          <p className="text-[#c8b8e6] mb-6">Unlock these badges by completing challenges and milestones!</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sampleBadges.map((badge, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-all shadow-lg text-center group hover:scale-105 transform"
              >
                <div className="text-5xl mb-3 group-hover:animate-pulse">{badge.icon}</div>
                <h4 className="text-[#e8e4ff] mb-2">{badge.name}</h4>
                <p className="text-sm text-[#c8b8e6]">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="mt-8">
          <h2 className="text-2xl text-[#e8e4ff] mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-[#c77dff]" />
            Leaderboard
          </h2>
          
          <div className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 shadow-lg">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((rank) => (
                <div
                  key={rank}
                  className="flex items-center gap-4 p-4 bg-[#240046]/50 rounded-xl hover:bg-[#240046] transition-all"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                    rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                    'bg-[#3c096c]'
                  }`}>
                    <span className="text-white">{rank}</span>
                  </div>
                  
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9d4edd] to-[#7209b7] flex items-center justify-center">
                    <span className="text-2xl">🐾</span>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-[#e8e4ff]">Pet #{rank}</h4>
                    <p className="text-sm text-[#c8b8e6]">Coming soon...</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[#c77dff]">0 points</p>
                    <p className="text-xs text-[#c8b8e6]">0 posts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
