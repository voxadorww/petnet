import { Bell, Home, User, Trophy, Shield, Users, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../utils/api.tsx';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  accessToken: string;
  isAdmin: boolean;
  onLogout: () => void;
}

export function Header({ currentView, onViewChange, accessToken, isAdmin, onLogout }: HeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [accessToken]);

  const loadNotifications = async () => {
    try {
      const result = await api.getNotifications(accessToken);
      if (result.notifications) {
        setNotifications(result.notifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationRead(accessToken, notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#140a2e]/95 to-[#240046]/95 backdrop-blur-lg border-b border-[#9d4edd]/30 shadow-lg shadow-[#9d4edd]/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl bg-gradient-to-r from-[#c77dff] to-[#9d4edd] bg-clip-text text-transparent">
              🐾 PetNet
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onViewChange('feed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                currentView === 'feed'
                  ? 'bg-[#9d4edd] text-white shadow-lg shadow-[#9d4edd]/30'
                  : 'text-[#c8b8e6] hover:bg-[#240046] hover:text-[#e8e4ff]'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => onViewChange('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                currentView === 'profile'
                  ? 'bg-[#9d4edd] text-white shadow-lg shadow-[#9d4edd]/30'
                  : 'text-[#c8b8e6] hover:bg-[#240046] hover:text-[#e8e4ff]'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => onViewChange('friends')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                currentView === 'friends'
                  ? 'bg-[#9d4edd] text-white shadow-lg shadow-[#9d4edd]/30'
                  : 'text-[#c8b8e6] hover:bg-[#240046] hover:text-[#e8e4ff]'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Friends</span>
            </button>

            <button
              onClick={() => onViewChange('contests')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                currentView === 'contests'
                  ? 'bg-[#9d4edd] text-white shadow-lg shadow-[#9d4edd]/30'
                  : 'text-[#c8b8e6] hover:bg-[#240046] hover:text-[#e8e4ff]'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span>Contests</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => onViewChange('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  currentView === 'admin'
                    ? 'bg-[#9d4edd] text-white shadow-lg shadow-[#9d4edd]/30'
                    : 'text-[#c8b8e6] hover:bg-[#240046] hover:text-[#e8e4ff]'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-[#c8b8e6] hover:text-[#e8e4ff] hover:bg-[#240046] rounded-xl transition-all"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff006e] text-white rounded-full flex items-center justify-center text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#140a2e] border border-[#9d4edd]/30 rounded-xl shadow-2xl shadow-[#9d4edd]/20 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-[#c8b8e6]">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`p-4 border-b border-[#9d4edd]/10 hover:bg-[#240046] cursor-pointer transition-colors ${
                          !notification.read ? 'bg-[#9d4edd]/10' : ''
                        }`}
                      >
                        <p className="text-[#e8e4ff]">{notification.message}</p>
                        <p className="text-xs text-[#c8b8e6] mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 text-[#c8b8e6] hover:text-[#ff006e] hover:bg-[#240046] rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-1 mt-3 overflow-x-auto pb-2">
          <button
            onClick={() => onViewChange('feed')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              currentView === 'feed'
                ? 'bg-[#9d4edd] text-white'
                : 'text-[#c8b8e6] hover:bg-[#240046]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => onViewChange('profile')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              currentView === 'profile'
                ? 'bg-[#9d4edd] text-white'
                : 'text-[#c8b8e6] hover:bg-[#240046]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => onViewChange('friends')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              currentView === 'friends'
                ? 'bg-[#9d4edd] text-white'
                : 'text-[#c8b8e6] hover:bg-[#240046]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Friends</span>
          </button>

          <button
            onClick={() => onViewChange('contests')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              currentView === 'contests'
                ? 'bg-[#9d4edd] text-white'
                : 'text-[#c8b8e6] hover:bg-[#240046]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Contests</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => onViewChange('admin')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                currentView === 'admin'
                  ? 'bg-[#9d4edd] text-white'
                  : 'text-[#c8b8e6] hover:bg-[#240046]'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
