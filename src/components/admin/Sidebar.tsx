import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Flag, Settings, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo';
import { signOut } from '../../lib/auth';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Listings', href: '/admin/listings', icon: ShoppingBag },
  { name: 'messagerie', href: '/admin/chatList', icon: MessageSquare },
  { name: 'Reports', href: '/admin/reports', icon: Flag },
  { name: 'Settings', href: '/admin/setting', icon: Settings },
];

export default function Sidebar({ isCollapsed = false, closeSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r">
      {/* Logo */}
      <div className={`${isCollapsed ? 'p-3' : 'p-6'} flex justify-center`}>
        {isCollapsed ? (
          <div className="w-10 h-10">
            <Logo compact />
          </div>
        ) : (
          <Logo />
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} space-y-1`}>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={handleLinkClick}
              className={`
                flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} 
                px-4 py-3 text-sm font-medium rounded-lg
                ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}
              `}
              title={isCollapsed ? item.name : ""}
            >
              <Icon className="h-5 w-5" />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t`}>
        <button
          onClick={handleSignOut}
          className={`
            flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} 
            px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg w-full
          `}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}