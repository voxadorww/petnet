import { useState, useEffect } from 'react';
import { UserPlus, Check } from 'lucide-react';
import { api } from '../utils/api.tsx';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FriendsProps {
  userId: string;
  accessToken: string;
}

export function Friends({ userId, accessToken }: FriendsProps) {
  const [profile, setProfile] = useState<any>(null);
  const [suggestedPets, setSuggestedPets] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'suggested' | 'followers' | 'following'>('suggested');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileResult, suggestedResult] = await Promise.all([
        api.getProfile(userId),
        api.getSuggestedPets(accessToken)
      ]);

      if (profileResult.profile) {
        setProfile(profileResult.profile);
        
        // Load follower and following profiles
        const followerProfiles = await Promise.all(
          (profileResult.profile.followers || []).map((id: string) => api.getProfile(id))
        );
        setFollowers(followerProfiles.map(r => r.profile).filter(Boolean));

        const followingProfiles = await Promise.all(
          (profileResult.profile.following || []).map((id: string) => api.getProfile(id))
        );
        setFollowing(followingProfiles.map(r => r.profile).filter(Boolean));
      }

      if (suggestedResult.suggested) {
        setSuggestedPets(suggestedResult.suggested);
      }
    } catch (error) {
      console.error('Failed to load friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    try {
      await api.followUser(accessToken, targetUserId);
      loadData();
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const isFollowing = (petId: string) => {
    return profile?.following?.includes(petId);
  };

  const PetCard = ({ pet }: { pet: any }) => (
    <div className="bg-gradient-to-br from-[#140a2e]/60 to-[#240046]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-all shadow-lg">
      <div className="flex items-start gap-4">
        {/* Profile Picture */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9d4edd] to-[#7209b7] p-0.5 flex-shrink-0">
          {pet.profilePicture ? (
            <ImageWithFallback
              src={pet.profilePicture}
              alt={pet.petName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-[#240046] flex items-center justify-center">
              <span className="text-3xl">
                {pet.species === 'Dog' ? '🐕' : pet.species === 'Cat' ? '🐱' : '🐾'}
              </span>
            </div>
          )}
        </div>

        {/* Pet Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg text-[#e8e4ff] truncate">{pet.petName}</h3>
            {pet.badges?.some((b: any) => b.name === 'Verified') && (
              <span className="text-[#9d4edd]">✓</span>
            )}
            {pet.isAdmin && (
              <span className="text-[#c77dff]">👑</span>
            )}
          </div>
          
          <p className="text-sm text-[#c8b8e6] mb-2">
            {pet.breed} • {pet.age} years
          </p>

          {pet.aboutMe && (
            <p className="text-sm text-[#c8b8e6] line-clamp-2 mb-3">
              {pet.aboutMe}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-[#c8b8e6]">
            <span>{pet.postCount || 0} posts</span>
            <span>{pet.followers?.length || 0} followers</span>
          </div>
        </div>

        {/* Follow Button */}
        {pet.id !== userId && (
          <button
            onClick={() => handleFollow(pet.id)}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 flex-shrink-0 ${
              isFollowing(pet.id)
                ? 'bg-[#240046] text-[#c8b8e6] hover:bg-[#3c096c]'
                : 'bg-gradient-to-r from-[#9d4edd] to-[#7209b7] text-white hover:shadow-lg hover:shadow-[#9d4edd]/50'
            }`}
          >
            {isFollowing(pet.id) ? (
              <>
                <Check className="w-4 h-4" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Follow</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#9d4edd]/30 border-t-[#9d4edd] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl text-[#e8e4ff] mb-2">Friends & Following</h1>
          <p className="text-[#c8b8e6]">Connect with other amazing pets!</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('suggested')}
            className={`px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'suggested'
                ? 'bg-gradient-to-r from-[#9d4edd] to-[#7209b7] text-white shadow-lg shadow-[#9d4edd]/30'
                : 'bg-[#240046] text-[#c8b8e6] hover:bg-[#3c096c]'
            }`}
          >
            Suggested Pets
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'followers'
                ? 'bg-gradient-to-r from-[#9d4edd] to-[#7209b7] text-white shadow-lg shadow-[#9d4edd]/30'
                : 'bg-[#240046] text-[#c8b8e6] hover:bg-[#3c096c]'
            }`}
          >
            Followers ({followers.length})
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'following'
                ? 'bg-gradient-to-r from-[#9d4edd] to-[#7209b7] text-white shadow-lg shadow-[#9d4edd]/30'
                : 'bg-[#240046] text-[#c8b8e6] hover:bg-[#3c096c]'
            }`}
          >
            Following ({following.length})
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'suggested' && (
            <>
              {suggestedPets.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 rounded-2xl border border-[#9d4edd]/20">
                  <p className="text-[#c8b8e6]">No suggestions available at the moment</p>
                </div>
              ) : (
                suggestedPets.map((pet) => <PetCard key={pet.id} pet={pet} />)
              )}
            </>
          )}

          {activeTab === 'followers' && (
            <>
              {followers.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 rounded-2xl border border-[#9d4edd]/20">
                  <p className="text-[#c8b8e6]">No followers yet</p>
                </div>
              ) : (
                followers.map((pet) => <PetCard key={pet.id} pet={pet} />)
              )}
            </>
          )}

          {activeTab === 'following' && (
            <>
              {following.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 rounded-2xl border border-[#9d4edd]/20">
                  <p className="text-[#c8b8e6]">Not following anyone yet</p>
                </div>
              ) : (
                following.map((pet) => <PetCard key={pet.id} pet={pet} />)
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
