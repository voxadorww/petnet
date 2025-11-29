import { useState, useEffect } from 'react';
import { createClient } from './utils/supabase/client.tsx';
import { api } from './utils/api.tsx';
import { AuthForm } from './components/AuthForm.tsx';
import { Header } from './components/Header.tsx';
import { Feed } from './components/Feed.tsx';
import { Profile } from './components/Profile.tsx';
import { Friends } from './components/Friends.tsx';
import { Contests } from './components/Contests.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'feed' | 'profile' | 'friends' | 'contests' | 'admin'>('feed');
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAccessToken(session.access_token);
        setUserId(session.user.id);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    if (!userId) return;
    
    try {
      const result = await api.getProfile(userId);
      if (result.profile) {
        setProfile(result.profile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleAuthSuccess = (token: string, id: string) => {
    setAccessToken(token);
    setUserId(id);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAccessToken(null);
      setUserId(null);
      setProfile(null);
      setCurrentView('feed');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#240046] to-[#3c096c] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#9d4edd]/30 border-t-[#9d4edd] rounded-full animate-spin" />
      </div>
    );
  }

  if (!accessToken || !userId) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#240046] to-[#3c096c] relative overflow-hidden">
      {/* Animated Background Stars */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(2px 2px at 20% 30%, rgba(199, 125, 255, 0.4), transparent),
            radial-gradient(2px 2px at 60% 70%, rgba(157, 78, 221, 0.3), transparent),
            radial-gradient(1px 1px at 50% 50%, rgba(199, 125, 255, 0.2), transparent),
            radial-gradient(1px 1px at 80% 10%, rgba(157, 78, 221, 0.3), transparent),
            radial-gradient(2px 2px at 90% 60%, rgba(199, 125, 255, 0.2), transparent),
            radial-gradient(1px 1px at 33% 85%, rgba(157, 78, 221, 0.2), transparent),
            radial-gradient(1px 1px at 15% 70%, rgba(199, 125, 255, 0.3), transparent)
          `,
          backgroundSize: '200% 200%',
          backgroundPosition: '50% 50%',
        }} />
      </div>

      {/* Glowing Orbs */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-[#9d4edd]/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-[#7209b7]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative z-10">
        <Header
          currentView={currentView}
          onViewChange={setCurrentView}
          accessToken={accessToken}
          isAdmin={profile?.isAdmin || false}
          onLogout={handleLogout}
        />

        <main>
          {currentView === 'feed' && (
            <Feed accessToken={accessToken} userId={userId} />
          )}

          {currentView === 'profile' && (
            <Profile userId={userId} accessToken={accessToken} />
          )}

          {currentView === 'friends' && (
            <Friends userId={userId} accessToken={accessToken} />
          )}

          {currentView === 'contests' && (
            <Contests accessToken={accessToken} isAdmin={profile?.isAdmin || false} />
          )}

          {currentView === 'admin' && profile?.isAdmin && (
            <AdminPanel accessToken={accessToken} />
          )}
        </main>
      </div>
    </div>
  );
}
