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
  Heart,
  Bell,
  Home
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
  const [scrolled, setScrolled] = useState(false);

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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {Math.min(unreadMessages, 9)}
        </span>
      )}
    </div>
  );

  return (
    <nav
      className={`${scrolled
        ? 'bg-white/90 backdrop-blur-md shadow-sm'
        : 'bg-white'
        } border-b border-gray-100 sticky top-0 z-50 transition-all duration-300`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Logo />

          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <LanguageSwitch />

            {/* Main action buttons */}
            <div className="flex items-center gap-2">
              <Link
                to="/create-listing"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-full font-medium transition-colors shadow-sm hover:shadow"
                onClick={closeAllMenus}
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.postListing')}</span>
                <span className="sm:hidden">{t('nav.postListing').split(' ')[0]}</span>
              </Link>

              {user && (
                <Link
                  to="/chat"
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors relative"
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

            {/* Desktop profile menu - hidden on mobile */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium hidden sm:block">
                      {user.email?.split('@')[0]}
                    </span>
                    {isProfileOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  {/* Profile dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <div className="px-3 py-2">
                          <p className="text-sm font-medium text-gray-700">{user.email}</p>
                          <p className="text-xs text-gray-500">Membre depuis 2023</p>
                        </div>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                          onClick={closeAllMenus}
                        >
                          <User className="mr-3 h-5 w-5 text-gray-400" />
                          {t('nav.profile')}
                        </Link>
                       
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                          onClick={closeAllMenus}
                        >
                          <Settings className="mr-3 h-5 w-5 text-gray-400" />
                          {t('nav.settings')}
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="mr-3 h-5 w-5" />
                          {t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 text-gray-700 transition-all"
                >
                  <User className="h-5 w-5" />
                  <span>{t('auth.signIn')}</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu with animation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className="py-3 space-y-1 border-t border-gray-100">
            <Link
              to="/"
              className="flex items-center w-full px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
              onClick={closeAllMenus}
            >
              <Home className="mr-3 h-5 w-5 text-gray-400" />
              {t('nav.home')}
            </Link>

            <Link
              to="/search"
              className="flex items-center w-full px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
              onClick={closeAllMenus}
            >
              <Search className="mr-3 h-5 w-5 text-gray-400" />
              {t('nav.search')}
            </Link>

            {user ? (
              <>
                <div className="border-t border-gray-100 my-2"></div>
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-gray-700">{user.email}</p>
                  <p className="text-xs text-gray-500">Membre depuis 2023</p>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center w-full px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                  onClick={closeAllMenus}
                >
                  <User className="mr-3 h-5 w-5 text-gray-400" />
                  {t('nav.profile')}
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center w-full px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                  onClick={closeAllMenus}
                >
                  <Heart className="mr-3 h-5 w-5 text-gray-400" />
                  {t('nav.favorites')}
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center w-full px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                  onClick={closeAllMenus}
                >
                  <Settings className="mr-3 h-5 w-5 text-gray-400" />
                  {t('nav.settings')}
                </Link>
                <button
                  onClick={() => { handleSignOut(); closeAllMenus(); }}
                  className="flex items-center w-full px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center w-full px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                onClick={closeAllMenus}
              >
                <User className="mr-3 h-5 w-5 text-gray-400" />
                {t('auth.signIn')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}