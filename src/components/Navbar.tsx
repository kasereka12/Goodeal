import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PlusCircle, Search, User, MessageSquare, LogOut, Menu, X } from 'lucide-react';
import { signOut } from '../lib/auth';
import Logo from './Logo';
import LanguageSwitch from './LanguageSwitch';

export default function Navbar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Main buttons (desktop and mobile) */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language switch */}
            <LanguageSwitch />

            {/* Post listing button always visible */}
            <Link to="/create-listing" className="btn btn-primary whitespace-nowrap">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.postListing')}</span>
              <span className="sm:hidden">{t('nav.postListing').split(' ')[0]}</span>
            </Link>

            {/* Desktop menu */}
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
                  <button 
                    onClick={handleSignOut}
                    className="btn btn-secondary"
                    title={t('nav.logout')}
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
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
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-100">
            <Link
              to="/requests"
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={closeMenu}
            >
              <MessageSquare className="mr-3 h-5 w-5 text-gray-400" />
              {t('nav.requests')}
            </Link>

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  <User className="mr-3 h-5 w-5 text-gray-400" />
                  {user.email?.split('@')[0]}
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    closeMenu();
                  }}
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
                onClick={closeMenu}
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