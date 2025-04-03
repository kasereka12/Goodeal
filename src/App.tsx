import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import CreateListing from './pages/CreateListing';
import ListingDetails from './pages/ListingDetails';
import CategoryListings from './pages/CategoryListings';
import Profile from './pages/Profile';
import SellerProfile from './pages/SellerProfile';
import Settings from './pages/Settings';
import Requests from './pages/Requests';
import CreateRequest from './pages/CreateRequest';
import Filters from './pages/Filters';
import NotFound from './pages/NotFound';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminListings from './pages/admin/Listings';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ChatInterface from './pages/Chat';
import ChatList from './pages/Chat';
import Chatperso from './pages/Chatperso';
import { ThemeProvider } from './contexts/ThemeContext';
import FavoritesPage from './pages/Favoris';
import ReportPage from './pages/Report';
import ProfilesUsers from './pages/admin/ProfilesUsers';
import Listingdetails from './pages/admin/Listingdetails';

// Component to handle scrolling to top on page navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Use smooth scrolling for better UX
    });
  }, [pathname]);

  return null;
}


function App() {

  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="listings" element={<AdminListings />} />
              <Route path="chat/:userId" element={<Chatperso />} />
              <Route path="reports" element={<ReportPage />} />
              <Route path="setting" element={<Settings />} />
              <Route path="chatList" element={<ChatList />} />
              <Route path="profils/:id" element={<ProfilesUsers />} />
              <Route path="listings/:id" element={<Listingdetails />} />

            </Route>

            {/* Public routes */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-page-background flex flex-col">
                  <Navbar />
                  <main className="container mx-auto px-4 py-8 flex-grow">
                    <Routes>
                      <Route path="/" element={<Home />} />


                      <Route path="/chat">
                        <Route index element={<ChatList />} />
                        <Route
                          path=":userId"
                          element={<Chatperso />}
                          // Ajoutez cette prop pour passer les query params
                          loader={({ params, request }) => {
                            const url = new URL(request.url);
                            const listingId = url.searchParams.get("listingId");
                            return { listingId };
                          }}
                        />
                      </Route>
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/create-listing" element={<CreateListing />} />
                      <Route path="/listings/:id" element={<ListingDetails />} />
                      <Route path="/category/:category" element={<CategoryListings />} />
                      <Route path="/profile" element={<Profile />} />

                      <Route path="/favorites" element={<FavoritesPage />} />
                      <Route path="/profile/:id" element={<SellerProfile />} />
                      <Route path="/requests" element={<Requests />} />
                      <Route path="/create-request" element={<CreateRequest />} />
                      <Route path="/filters" element={<Filters />} />

                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;