import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SellerSidebar from '../components/seller/SellerSidebar';
import { useLanguage } from '../contexts/LanguageContext';

export default function SellerDashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Redirect non-authenticated users to login
  useEffect(() => {
    if (!user) {
      sessionStorage.setItem('redirectAfterAuth', window.location.pathname);
      navigate('/auth');
    }
  }, [user, navigate]);

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white">
        <SellerSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="md:hidden sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-600"
            onClick={() => document.getElementById('mobile-sidebar')?.classList.toggle('hidden')}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile sidebar */}
        <div id="mobile-sidebar" className="hidden md:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => document.getElementById('mobile-sidebar')?.classList.add('hidden')}></div>
          <div className="relative flex flex-col w-80 max-w-xs h-full bg-white">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">{t('sellerDashboard.menu')}</h2>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-600"
                onClick={() => document.getElementById('mobile-sidebar')?.classList.add('hidden')}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SellerSidebar />
          </div>
        </div>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
