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
  Mail,       // Alternative 1: Icône email
  MessageCircle, // Alternative 2: Icône message rond
  Bell,       // Alternative 3: Icône notification
  Inbox       // Alternative 4: Icône boîte de réception
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
  const [unreadMessages, setUnreadMessages] = useState(0);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel("realtime-messages")
        .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
          if (payload.new.receiver_id === user.id && !payload.new.read) {
            setUnreadMessages((prev) => prev + 1);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Fetch unread messages count from the message_read_status table
  useEffect(() => {
    if (user) {
      const fetchUnreadMessages = async () => {
        if (user) {
          const { data, error } = await supabase
            .from("messages")
            .select("id")
            .eq("receiver_id", user.id)
            .eq("read", false);

          if (error) {
            console.error("Erreur lors de la récupération des messages non lus:", error);
          } else {
            setUnreadMessages(data.length);
          }
        }
      };

      fetchUnreadMessages();
    }
  }, [user]);

  // Mark messages as read when user navigates to chat
  const markMessagesAsRead = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking messages as read:', error);
      } else {
        setUnreadMessages(0); // Reset unread messages count after marking them as read
      }
    }
  };

  // Custom message icon with notification badge - Utilisant l'icône Mail à la place
  const MessageIcon = ({ className }) => (
    <div className="relative inline-flex">
      <Mail className={className || 'h-4 w-4'} />
      {unreadMessages > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
          {unreadMessages}
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

            {/* Zone principale des boutons - remodelée */}
            <div className="flex items-center gap-2">
              {/* Bouton Déposer - toujours visible */}
              <Link to="/create-listing" className="btn btn-primary whitespace-nowrap">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.postListing')}</span>
                <span className="sm:hidden">{t('nav.postListing').split(' ')[0]}</span>
              </Link>

              {/* Bouton Messages - maintenant visible sur tous les écrans si l'utilisateur est connecté */}
              {user && (
                <Link
                  to="/chat"
                  className="btn btn-secondary"
                  title={t('nav.chat')}
                  onClick={markMessagesAsRead}
                >
                  <MessageIcon className="h-5 w-5" />
                </Link>
              )}
            </div>

            {/* Contenu visible uniquement sur écrans moyens et grands */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/requests" className="btn btn-secondary">
                <MessageSquare className="mr-2 h-4 w-4" />
                {t('nav.requests')}
              </Link>

              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="btn btn-secondary">
                    <User className="mr-2 h-4 w-4" />
                    {user.email?.split('@')[0]}
                  </Link>
                  <button onClick={handleSignOut} className="btn btn-secondary" title={t('nav.logout')}>
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="btn btn-secondary">
                  {t('auth.signIn')}
                </Link>
              )}
            </div>

            {/* Bouton de menu hamburger pour les petits écrans */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Menu déroulant pour les petits écrans - maintenant SANS l'icône de message */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-100">
            <Link to="/requests" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={closeMenu}>
              <MessageSquare className="mr-3 h-5 w-5 text-gray-400" />
              {t('nav.requests')}
            </Link>

            {user ? (
              <>
                <Link to="/profile" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={closeMenu}>
                  <User className="mr-3 h-5 w-5 text-gray-400" />
                  {user.email?.split('@')[0]}
                </Link>
                <button onClick={() => { handleSignOut(); closeMenu(); }} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="mr-3 h-5 w-5" />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link to="/auth" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={closeMenu}>
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