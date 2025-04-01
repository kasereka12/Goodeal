import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  PlusCircle,
  Search,
  User,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Settings,
  Heart
} from 'lucide-react';
import { signOut } from '../lib/auth';
import Logo from './Logo';
import LanguageSwitch from './LanguageSwitch';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  // Realtime updates for unread messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("realtime-messages")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "messages"
      }, (payload) => {
        if (payload.new.receiver_id === user.id && !payload.new.read) {
          setUnreadMessages(prev => prev + 1);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Fetch initial unread messages count
  useEffect(() => {
    if (!user) return;

    const fetchUnreadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id")
        .eq("receiver_id", user.id)
        .eq("read", false);

      if (!error) {
        setUnreadMessages(data.length);
      }
    };

    fetchUnreadMessages();
  }, [user]);

  const markMessagesAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', user.id)
      .eq('read', false);

    if (!error) {
      setUnreadMessages(0);
    }
  };

  const MessageIcon = () => (
    <div className="relative">
      <MessageSquare className="h-5 w-5" />
      {unreadMessages > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {Math.min(unreadMessages, 9)}
        </span>
      )}
    </div>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitch />

            {/* Main action buttons */}
            <div className="flex items-center gap-2">
              <Link
                to="/create-listing"
                className="btn btn-primary whitespace-nowrap"
                onClick={closeAllMenus}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.postListing')}</span>
                <span className="sm:hidden">{t('nav.postListing').split(' ')[0]}</span>
              </Link>

              {user && (
                <Link
                  to="/chat"
                  className="btn btn-secondary"
                  title={t('nav.chat')}
                  onClick={() => {
                    markMessagesAsRead();
                    closeAllMenus();
                  }}
                >
                  <MessageIcon />
                </Link>
              )}
            </div>

            {/* Desktop navigation - hidden on mobile */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">{user.email?.split('@')[0]}</span>
                    {isProfileOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {/* Profile dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={closeAllMenus}
                        >
                          <User className="mr-3 h-5 w-5 text-gray-400" />
                          {t('nav.profile')}
                        </Link>
                        <Link
                          to="/favorites"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={closeAllMenus}
                        >
                          <Heart className="mr-3 h-5 w-5 text-gray-400" />
                          {t('nav.favorites')}
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={closeAllMenus}
                        >
                          <Settings className="mr-3 h-5 w-5 text-gray-400" />
                          {t('nav.settings')}
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="mr-3 h-5 w-5" />
                          {t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="btn btn-secondary">
                  {t('auth.signIn')}
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-100">
            {user ? (
              <>
                <Link
                  to="/profiles"
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={closeAllMenus}
                >
                  <User className="mr-3 h-5 w-5 text-gray-400" />
                  {t('nav.profile')}
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={closeAllMenus}
                >
                  <Heart className="mr-3 h-5 w-5 text-gray-400" />
                  {t('nav.favorites')}
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={closeAllMenus}
                >
                  <Settings className="mr-3 h-5 w-5 text-gray-400" />
                  {t('nav.settings')}
                </Link>
                <button
                  onClick={() => { handleSignOut(); closeAllMenus(); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={closeAllMenus}
              >
                <User className="mr-3 h-5 w-5 text-gray-400" />
                {t('auth.signIn')}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}