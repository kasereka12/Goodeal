import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { signOut } from '../../lib/auth';
import {
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  DollarSign,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  PlusCircle,
  User
} from 'lucide-react';

export default function SellerSidebar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Navigation items for the sidebar
  const navItems = [
    {
      name: t('nav.overview') || 'Vue d\'ensemble',
      path: '/seller',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: t('nav.listings') || 'Mes annonces',
      path: '/seller/listings',
      icon: <ListChecks className="h-5 w-5" />
    },
    {
      name: t('nav.messages') || 'Messages',
      path: '/seller/messages',
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      name: t('nav.sales') || 'Ventes',
      path: '/seller/sales',
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      name: t('nav.analytics') || 'Statistiques',
      path: '/seller/analytics',
      icon: <BarChart2 className="h-5 w-5" />
    },
    {
      name: t('nav.settings') || 'Paramètres',
      path: '/seller/settings',
      icon: <Settings className="h-5 w-5" />
    },
    {
      name: t('nav.help') || 'Aide',
      path: '/seller/help',
      icon: <HelpCircle className="h-5 w-5" />
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* User profile section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={t('profile.photo')}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.user_metadata?.display_name || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              end={item.path === '/seller'}
            >
              <span className="mr-3 text-gray-500">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Actions section */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <NavLink
          to="/create-listing"
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('nav.postListing') || 'Déposer une annonce'}
        </NavLink>
        
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-500" />
          {t('nav.logout') || 'Déconnexion'}
        </button>
      </div>
    </div>
  );
}
