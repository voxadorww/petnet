import { useState, useEffect } from 'react';
import { Edit, Share2, Star, Crown, CheckCircle, Download } from 'lucide-react';
import { api } from '../utils/api.tsx';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProfileProps {
  userId: string;
  accessToken: string;
}

export function Profile({ userId, accessToken }: ProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [formData, setFormData] = useState({
    petName: '',
    species: '',
    breed: '',
    age: '',
    aboutMe: '',
    favoriteToys: '',
    favoriteFoods: '',
    quirks: '',
    profilePicture: ''
  });

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const result = await api.getProfile(userId);
      if (result.profile) {
        setProfile(result.profile);
        setFormData({
          petName: result.profile.petName || '',
          species: result.profile.species || '',
          breed: result.profile.breed || '',
          age: result.profile.age?.toString() || '',
          aboutMe: result.profile.aboutMe || '',
          favoriteToys: result.profile.favoriteToys?.join(', ') || '',
          favoriteFoods: result.profile.favoriteFoods?.join(', ') || '',
          quirks: result.profile.quirks?.join(', ') || '',
          profilePicture: result.profile.profilePicture || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleSave = async () => {
    try {
      await api.updateProfile(accessToken, {
        petName: formData.petName,
        species: formData.species,
        breed: formData.breed,
        age: parseInt(formData.age),
        aboutMe: formData.aboutMe,
        favoriteToys: formData.favoriteToys.split(',').map(s => s.trim()).filter(s => s),
        favoriteFoods: formData.favoriteFoods.split(',').map(s => s.trim()).filter(s => s),
        quirks: formData.quirks.split(',').map(s => s.trim()).filter(s => s),
        profilePicture: formData.profilePicture || null
      });
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#9d4edd]/30 border-t-[#9d4edd] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-3xl p-8 border border-[#9d4edd]/20 shadow-lg mb-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(157, 78, 221, 0.3) 0%, transparent 50%)',
          }} />

          <div className="relative">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#9d4edd] to-[#7209b7] p-1 shadow-lg shadow-[#9d4edd]/30">
                  {profile.profilePicture ? (
                    <ImageWithFallback
                      src={profile.profilePicture}
                      alt={profile.petName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#240046] flex items-center justify-center">
                      <span className="text-6xl">
                        {profile.species === 'Dog' ? '🐕' : profile.species === 'Cat' ? '🐱' : '🐾'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Badges Overlay */}
                {profile.badges && profile.badges.length > 0 && (
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                    {profile.badges.map((badge: any, idx: number) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9d4edd] to-[#7209b7] flex items-center justify-center shadow-lg animate-pulse"
                        title={badge.name}
                      >
                        <span className="text-sm">{badge.icon}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl text-[#e8e4ff]">{profile.petName}</h1>
                  {profile.badges?.some((b: any) => b.name === 'Verified') && (
                    <CheckCircle className="w-6 h-6 text-[#9d4edd]" title="Verified" />
                  )}
                  {profile.isAdmin && (
                    <Crown className="w-6 h-6 text-[#c77dff]" title="Admin" />
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 text-[#c8b8e6] mb-4">
                  <span>{profile.species}</span>
                  <span>•</span>
                  <span>{profile.breed}</span>
                  <span>•</span>
                  <span>{profile.age} years old</span>
                </div>

                <div className="flex flex-wrap gap-6 text-[#e8e4ff]">
                  <div>
                    <span className="text-2xl">{profile.postCount || 0}</span>
                    <p className="text-sm text-[#c8b8e6]">Posts</p>
                  </div>
                  <div>
                    <span className="text-2xl">{profile.followers?.length || 0}</span>
                    <p className="text-sm text-[#c8b8e6]">Followers</p>
                  </div>
                  <div>
                    <span className="text-2xl">{profile.following?.length || 0}</span>
                    <p className="text-sm text-[#c8b8e6]">Following</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-4 py-2 bg-gradient-to-r from-[#9d4edd] to-[#7209b7] text-white rounded-xl hover:shadow-lg hover:shadow-[#9d4edd]/50 transition-all flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setShowShareCard(!showShareCard)}
                  className="px-4 py-2 bg-[#240046] text-[#c8b8e6] rounded-xl hover:bg-[#3c096c] transition-all flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 shadow-lg mb-6">
            <h2 className="text-2xl text-[#e8e4ff] mb-6">Edit Profile</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-[#e8e4ff]">Pet Name</label>
                  <input
                    type="text"
                    value={formData.petName}
                    onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                    className="w-full px-4 py-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] focus:outline-none focus:border-[#9d4edd]"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[#e8e4ff]">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] focus:outline-none focus:border-[#9d4edd]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[#e8e4ff]">Profile Picture URL</label>
                <input
                  type="text"
                  value={formData.profilePicture}
                  onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                  className="w-full px-4 py-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] focus:outline-none focus:border-[#9d4edd]"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block mb-2 text-[#e8e4ff]">About Me (in your pet's voice)</label>
                <textarea
                  value={formData.aboutMe}
                  onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  className="w-full px-4 py-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] focus:outline-none focus:border-[#9d4edd] resize-none"
                  rows={4}
                  placeholder="Woof! I love belly rubs and chasing squirrels..."
                />
              </div>

              <div>
                <label className="block mb-2 text-[#e8e4ff]">Favorite Toys (comma separated)</label>
                <input
                  type="text"
                  value={formData.favoriteToys}
                  onChange={(e) => setFormData({ ...formData, favoriteToys: e.target.value })}
                  className="w-full px-4 py-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] focus:outline-none focus:border-[#9d4edd]"
                  placeholder="Ball, Squeaky toy, Rope"
                />
              </div>

              <div>
                <label className="block mb-2 text-[#e8e4ff]">Favorite Foods (comma separated)</label>
                <input
                  type="text"
                  value={formData.favoriteFoods}
                  onChange={(e) => setFormData({ ...formData, favoriteFoods: e.target.value })}
                  className="w-full px-4 py-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] focus:outline-none focus:border-[#9d4edd]"
                  placeholder="Treats, Chicken, Cheese"
                />
              </div>

              <div>
                <label className="block mb-2 text-[#e8e4ff]">Quirks (comma separated)</label>
                <input
                  type="text"
                  value={formData.quirks}
                  onChange={(e) => setFormData({ ...formData, quirks: e.target.value })}
                  className="w-full px-4 py-2 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] focus:outline-none focus:border-[#9d4edd]"
                  placeholder="Tilts head when confused, Afraid of vacuum"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-[#9d4edd] to-[#7209b7] text-white rounded-xl hover:shadow-lg hover:shadow-[#9d4edd]/50 transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 bg-[#240046] text-[#c8b8e6] rounded-xl hover:bg-[#3c096c] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* About Me */}
          {profile.aboutMe && (
            <div className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 shadow-lg">
              <h3 className="text-xl text-[#e8e4ff] mb-4">About Me</h3>
              <p className="text-[#c8b8e6]">{profile.aboutMe}</p>
            </div>
          )}

          {/* Favorites */}
          {(profile.favoriteToys?.length > 0 || profile.favoriteFoods?.length > 0) && (
            <div className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 shadow-lg">
              <h3 className="text-xl text-[#e8e4ff] mb-4">Favorites</h3>
              {profile.favoriteToys?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-[#c77dff] mb-2">Toys</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.favoriteToys.map((toy: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-[#240046] text-[#c8b8e6] rounded-full">
                        {toy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile.favoriteFoods?.length > 0 && (
                <div>
                  <h4 className="text-[#c77dff] mb-2">Foods</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.favoriteFoods.map((food: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-[#240046] text-[#c8b8e6] rounded-full">
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quirks */}
          {profile.quirks?.length > 0 && (
            <div className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 shadow-lg">
              <h3 className="text-xl text-[#e8e4ff] mb-4">Quirks</h3>
              <ul className="space-y-2">
                {profile.quirks.map((quirk: string, idx: number) => (
                  <li key={idx} className="text-[#c8b8e6] flex items-start gap-2">
                    <span className="text-[#c77dff]">✨</span>
                    <span>{quirk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Badges */}
          {profile.badges?.length > 0 && (
            <div className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 shadow-lg">
              <h3 className="text-xl text-[#e8e4ff] mb-4">Achievements</h3>
              <div className="grid grid-cols-2 gap-4">
                {profile.badges.map((badge: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-gradient-to-br from-[#9d4edd]/20 to-[#7209b7]/20 rounded-xl border border-[#9d4edd]/30 text-center hover:scale-105 transition-transform"
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <p className="text-[#e8e4ff]">{badge.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Shareable Card Modal */}
        {showShareCard && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-[#140a2e] to-[#240046] rounded-3xl p-8 max-w-md w-full border border-[#9d4edd]/30 relative">
              <button
                onClick={() => setShowShareCard(false)}
                className="absolute top-4 right-4 text-[#c8b8e6] hover:text-[#e8e4ff]"
              >
                ✕
              </button>

              {/* Card Content */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#9d4edd] to-[#7209b7] p-1 mb-4">
                  {profile.profilePicture ? (
                    <ImageWithFallback
                      src={profile.profilePicture}
                      alt={profile.petName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#240046] flex items-center justify-center">
                      <span className="text-6xl">
                        {profile.species === 'Dog' ? '🐕' : profile.species === 'Cat' ? '🐱' : '🐾'}
                      </span>
                    </div>
                  )}
                </div>

                <h2 className="text-3xl text-[#e8e4ff] mb-2">{profile.petName}</h2>
                <p className="text-[#c8b8e6] mb-4">{profile.breed} • {profile.age} years</p>

                {profile.aboutMe && (
                  <p className="text-[#c8b8e6] mb-4 text-sm">{profile.aboutMe.slice(0, 100)}...</p>
                )}

                {profile.badges?.length > 0 && (
                  <div className="flex justify-center gap-2 mb-4">
                    {profile.badges.slice(0, 3).map((badge: any, idx: number) => (
                      <span key={idx} className="text-2xl">{badge.icon}</span>
                    ))}
                  </div>
                )}

                <button className="w-full py-3 bg-gradient-to-r from-[#9d4edd] to-[#7209b7] text-white rounded-xl hover:shadow-lg hover:shadow-[#9d4edd]/50 transition-all flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>Download Card</span>
                </button>

                <p className="text-xs text-[#c8b8e6] mt-4">
                  Share this card on your social media!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
