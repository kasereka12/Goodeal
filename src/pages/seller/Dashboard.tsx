import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import {
  BarChart2,
  Eye,
  Clock,
  Plus,
  ChevronRight,
  ListChecks,
  MessageSquare,
  DollarSign,
  Home
} from 'lucide-react';

interface Stat {
  activeListings: number;
  totalViews: number;
  unreadMessages: number;
  pendingOffers: number;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  views: number;
  created_at: string;
  category: string;
}

interface Activity {
  id: number;
  type: string;
  message: string;
  time: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stat>({
    activeListings: 0,
    totalViews: 0,
    unreadMessages: 0,
    pendingOffers: 0
  });
  const [popularListings, setPopularListings] = useState<Listing[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch active listings count
        const { data: listings, error: listingsError } = await supabase
          .from('listings')
          .select('id, title, price, views, created_at, category')
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (listingsError) throw listingsError;

        // Fetch unread messages count
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('id')
          .eq('receiver_id', user.id)
          .eq('read', false);

        if (messagesError) throw messagesError;

        // Calculate total views
        const totalViews = listings?.reduce((sum, listing) => sum + (listing.views || 0), 0) || 0;

        // Sort listings by views to get most popular
        const popularItems = [...(listings || [])].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);

        // Set stats
        setStats({
          activeListings: listings?.length || 0,
          totalViews,
          unreadMessages: messages?.length || 0,
          pendingOffers: 0 // This would be fetched from an offers table if you have one
        });

        setPopularListings(popularItems);

        // Mock recent activity for now
        // In a real app, you would fetch this from a notifications or activity table
        setRecentActivity([
          { 
            id: 1, 
            type: 'view', 
            message: 'Votre annonce "Appartement T3 Centre Ville" a reçu 5 nouvelles vues', 
            time: '2h' 
          },
          { 
            id: 2, 
            type: 'message', 
            message: 'Nouveau message de Jean concernant "Voiture Peugeot 208"', 
            time: '5h' 
          },
          { 
            id: 3, 
            type: 'offer', 
            message: 'Nouvelle offre reçue pour "MacBook Pro 2021"', 
            time: '1j' 
          }
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Stat card component
  const StatCard = ({ title, value, icon, color, link }: { 
    title: string; 
    value: number; 
    icon?: React.ReactNode; 
    color?: string;
    link?: string;
  }) => {
    const content = (
      <div className={`bg-white p-6 rounded-lg shadow-sm border ${color ? `border-${color}-200` : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
      </div>
    );

    if (link) {
      return <Link to={link} className="block">{content}</Link>;
    }

    return content;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('welcomeBack') || 'Bienvenue'}, {user?.user_metadata?.display_name || user?.email?.split('@')[0]}!
        </h1>
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="flex items-center text-sm font-medium text-primary hover:text-primary-dark"
          >
            <Home className="h-4 w-4 mr-1" />
            {t('common.backToHome') || 'Retour à l\'accueil'}
          </Link>
          <Link
            to="/create-listing"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('nav.postListing') || 'Déposer une annonce'}
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title={t('activeListings') || "Annonces actives"} 
          value={stats.activeListings} 
          icon={<ListChecks className="h-6 w-6" />}
          link="/seller/listings"
        />
        <StatCard 
          title={t('totalViews') || "Vues totales"} 
          value={stats.totalViews} 
          icon={<Eye className="h-6 w-6" />}
          link="/seller/analytics"
        />
        <StatCard 
          title={t('unreadMessages') || "Messages non lus"} 
          value={stats.unreadMessages} 
          icon={<MessageSquare className="h-6 w-6" />}
          link="/seller/messages"
        />
        <StatCard 
          title={t('pendingOffers') || "Offres en attente"} 
          value={stats.pendingOffers} 
          icon={<DollarSign className="h-6 w-6" />}
          link="/seller/sales"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Popular Listings */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {t('popularListings') || "Annonces populaires"}
              </h2>
              <Link to="/seller/listings" className="text-sm text-primary hover:text-primary/80 flex items-center">
                {t('viewAll') || "Voir tout"}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {popularListings.length > 0 ? (
              popularListings.map((listing) => (
                <div key={listing.id} className="p-6 hover:bg-gray-50">
                  <Link to={`/listings/${listing.id}`} className="flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-1">
                        {getCategoryLabel(listing.category)}
                      </span>
                      <p className="text-sm font-medium text-gray-900">{listing.title}</p>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-500">{formatPrice(listing.price)} • {listing.views} {t('views') || "vues"}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">{t('noPopularListings') || "Aucune annonce populaire pour le moment"}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {t('recentActivity') || "Activité récente"}
              </h2>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className={`mt-1 mr-4 rounded-full p-2 ${getActivityIconBg(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">{t('noRecentActivity') || "Aucune activité récente"}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {t('performance') || "Performance"}
          </h2>
        </div>
        <div className="p-6 flex items-center justify-center h-64 bg-gray-50">
          <div className="text-center">
            <BarChart2 className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">
              {t('performanceChartPlaceholder') || "Le graphique de performance sera bientôt disponible"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {t('comingSoon') || "Bientôt disponible"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0
  }).format(price);
}

function getCategoryLabel(category: string): string {
  const categories: Record<string, string> = {
    'electronics': 'Électronique',
    'fashion': 'Mode',
    'home': 'Maison',
    'sports': 'Sports',
    'other': 'Autre'
  };
  
  return categories[category] || category;
}

function getActivityIcon(type: string): JSX.Element {
  switch (type) {
    case 'message':
      return <MessageSquare className="h-4 w-4 text-white" />;
    case 'offer':
      return <DollarSign className="h-4 w-4 text-white" />;
    case 'view':
      return <Eye className="h-4 w-4 text-white" />;
    default:
      return <Clock className="h-4 w-4 text-white" />;
  }
}

function getActivityIconBg(type: string): string {
  switch (type) {
    case 'message':
      return 'bg-blue-500';
    case 'offer':
      return 'bg-green-500';
    case 'view':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
}
