import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/admin/Sidebar';
import NotFound from '../pages/NotFound';

export default function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated and has admin role
  const isAdmin = user?.user_metadata?.role === 'admin';

  // Redirect non-authenticated users to login
  /* useEffect(() => {
     /* if (!user) {
        navigate('/auth');
      }
}, [user, navigate]);

  // Show 404 for non-admin authenticated users
  if (user && !isAdmin) {
    return <NotFound />;
  }

  // Show loading state while checking authentication
  /* if (!user) {
     return (
       <div className="flex h-screen items-center justify-center bg-gray-100">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
       </div>
     );
   }
  */
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}