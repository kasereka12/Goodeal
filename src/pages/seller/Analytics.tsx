import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import {
  BarChart2,
  TrendingUp,
  Eye,
  Users,
  MessageSquare,
  Calendar,
  Filter,
  Download,
  HelpCircle,
  Home
} from 'lucide-react';

export default function SellerAnalytics() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [analyticsData, setAnalyticsData] = useState({
    totalViews: 0,
    totalMessages: 0,
    totalListings: 0,
    viewsByDay: [],
    messagesByDay: [],
    viewsByListing: [],
    popularCategories: []
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch listings data
        const { data: listings, error: listingsError } = await supabase
          .from('listings')
          .select('id, title, views, category, created_at')
          .eq('user_id', user.id);

        if (listingsError) throw listingsError;

        // Calculate total views
        const totalViews = listings?.reduce((sum, listing) => sum + (listing.views || 0), 0) || 0;

        // Generate mock data for demonstration
        const today = new Date();
        const days = getDaysArray(timeRange);
        
        // Views by day (mock data)
        const viewsByDay = days.map(day => ({
          date: day,
          views: Math.floor(Math.random() * 50) + 5
        }));

        // Messages by day (mock data)
        const messagesByDay = days.map(day => ({
          date: day,
          messages: Math.floor(Math.random() * 10)
        }));

        // Views by listing
        const viewsByListing = listings
          ?.map(listing => ({
            id: listing.id,
            title: listing.title,
            views: listing.views || Math.floor(Math.random() * 100)
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5) || [];

        // Popular categories
        const categoryCounts = {};
        listings?.forEach(listing => {
          if (listing.category) {
            categoryCounts[listing.category] = (categoryCounts[listing.category] || 0) + 1;
          }
        });

        const popularCategories = Object.entries(categoryCounts)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count);

        setAnalyticsData({
          totalViews,
          totalMessages: Math.floor(Math.random() * 50) + 10, // Mock data
          totalListings: listings?.length || 0,
          viewsByDay,
          messagesByDay,
          viewsByListing,
          popularCategories
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user, timeRange]);

  // Helper function to generate array of dates
  const getDaysArray = (range) => {
    const today = new Date();
    const days = [];
    let daysCount;

    switch (range) {
      case '7days':
        daysCount = 7;
        break;
      case '30days':
        daysCount = 30;
        break;
      case '90days':
        daysCount = 90;
        break;
      default:
        daysCount = 30;
    }

    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(formatDate(date));
    }

    return days;
  };

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
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
          {t('sellerDashboard.analytics') || 'Statistiques'}
        </h1>
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="flex items-center text-sm font-medium text-primary hover:text-primary-dark"
          >
            <Home className="h-4 w-4 mr-1" />
            {t('common.backToHome') || 'Retour à l\'accueil'}
          </Link>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7days">{t('sellerDashboard.last7Days') || '7 derniers jours'}</option>
                <option value="30days">{t('sellerDashboard.last30Days') || '30 derniers jours'}</option>
                <option value="90days">{t('sellerDashboard.last90Days') || '90 derniers jours'}</option>
              </select>
            </div>
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('common.export') || 'Exporter'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Eye className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">{t('sellerDashboard.totalViews') || 'Vues totales'}</h2>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalViews}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+12% {t('common.fromLastPeriod') || 'par rapport à la période précédente'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">{t('sellerDashboard.totalMessages') || 'Messages reçus'}</h2>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalMessages}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+5% {t('common.fromLastPeriod') || 'par rapport à la période précédente'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <BarChart2 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">{t('sellerDashboard.conversionRate') || 'Taux de conversion'}</h2>
              <p className="text-2xl font-bold text-gray-900">8.2%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+2.3% {t('common.fromLastPeriod') || 'par rapport à la période précédente'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Views chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{t('sellerDashboard.viewsOverTime') || 'Évolution des vues'}</h2>
        <div className="h-64">
          {/* Chart placeholder */}
          <div className="relative h-full">
            <div className="absolute inset-0 flex items-end">
              {analyticsData.viewsByDay.map((day, index) => (
                <div 
                  key={day.date} 
                  className="flex-1 flex flex-col items-center"
                  title={`${formatDisplayDate(day.date)}: ${day.views} vues`}
                >
                  <div 
                    className="w-full max-w-[20px] bg-blue-500 rounded-t-sm mx-auto"
                    style={{ height: `${(day.views / Math.max(...analyticsData.viewsByDay.map(d => d.views))) * 100}%` }}
                  ></div>
                  {index % Math.ceil(analyticsData.viewsByDay.length / 10) === 0 && (
                    <span className="text-xs text-gray-500 mt-2">{formatDisplayDate(day.date)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popular listings and categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('sellerDashboard.popularListings') || 'Annonces populaires'}</h2>
          <div className="space-y-4">
            {analyticsData.viewsByListing.map((listing, index) => (
              <div key={listing.id} className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
                  <div className="flex items-center mt-1">
                    <Eye className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500">{listing.views} {t('common.views') || 'vues'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('sellerDashboard.popularCategories') || 'Catégories populaires'}</h2>
          <div className="space-y-4">
            {analyticsData.popularCategories.map((category) => (
              <div key={category.category} className="flex items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  {getCategoryIcon(category.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{getCategoryName(category.category)}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${(category.count / analyticsData.totalListings) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="ml-2 text-sm text-gray-500">{category.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visitor demographics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">{t('sellerDashboard.visitorDemographics') || 'Démographie des visiteurs'}</h2>
          <button className="text-sm text-gray-500 flex items-center">
            <HelpCircle className="h-4 w-4 mr-1" />
            {t('common.howIsThisCalculated') || 'Comment est-ce calculé ?'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">{t('sellerDashboard.ageGroups') || 'Tranches d\'âge'}</h3>
            <div className="space-y-2">
              {[
                { label: '18-24', value: 15 },
                { label: '25-34', value: 40 },
                { label: '35-44', value: 25 },
                { label: '45-54', value: 12 },
                { label: '55+', value: 8 }
              ].map((group) => (
                <div key={group.label} className="flex items-center">
                  <span className="text-sm text-gray-500 w-12">{group.label}</span>
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${group.value}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{group.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">{t('sellerDashboard.gender') || 'Genre'}</h3>
            <div className="flex items-center h-32">
              <div className="w-32 h-32 mx-auto relative">
                <div className="absolute inset-0 rounded-full border-8 border-blue-500"></div>
                <div 
                  className="absolute inset-0 rounded-full border-8 border-purple-500"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)' }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">65%</div>
                    <div className="text-xs text-gray-500">{t('common.male') || 'Homme'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">{t('sellerDashboard.location') || 'Localisation'}</h3>
            <div className="space-y-2">
              {[
                { label: 'Paris', value: 35 },
                { label: 'Lyon', value: 20 },
                { label: 'Marseille', value: 15 },
                { label: 'Bordeaux', value: 10 },
                { label: 'Autres', value: 20 }
              ].map((location) => (
                <div key={location.label} className="flex items-center">
                  <span className="text-sm text-gray-500 w-20">{location.label}</span>
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${location.value}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{location.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tips for improvement */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{t('sellerDashboard.tipsForImprovement') || 'Conseils pour améliorer vos performances'}</h2>
        <div className="space-y-4">
          <div className="flex p-4 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-blue-800">{t('sellerDashboard.improveVisibility') || 'Améliorez la visibilité'}</h3>
              <p className="mt-1 text-sm text-blue-700">
                {t('sellerDashboard.improveVisibilityTip') || 'Ajoutez plus de photos de qualité à vos annonces pour augmenter l\'engagement des visiteurs de 40%.'}
              </p>
            </div>
          </div>

          <div className="flex p-4 bg-green-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-green-800">{t('sellerDashboard.improveResponseRate') || 'Améliorez votre taux de réponse'}</h3>
              <p className="mt-1 text-sm text-green-700">
                {t('sellerDashboard.improveResponseRateTip') || 'Répondez aux messages dans les 2 heures pour augmenter vos chances de vente de 80%.'}
              </p>
            </div>
          </div>

          <div className="flex p-4 bg-purple-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-purple-800">{t('sellerDashboard.timingMatters') || 'Le timing est important'}</h3>
              <p className="mt-1 text-sm text-purple-700">
                {t('sellerDashboard.timingMattersTip') || 'Publiez vos annonces le dimanche soir pour maximiser les vues pendant la semaine.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getCategoryIcon(category) {
  switch (category) {
    case 'immobilier':
      return <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
    case 'auto-moto':
      return <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 4H5a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 16v2a2 2 0 002 2h8a2 2 0 002-2v-2" /><circle cx="8.5" cy="9.5" r="1.5" /><circle cx="15.5" cy="9.5" r="1.5" /></svg>;
    case 'services':
      return <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    case 'deco-artisanat':
      return <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;
    default:
      return <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
  }
}

function getCategoryName(category) {
  switch (category) {
    case 'immobilier':
      return 'Immobilier';
    case 'auto-moto':
      return 'Auto-Moto';
    case 'services':
      return 'Services';
    case 'deco-artisanat':
      return 'Déco & Artisanat';
    default:
      return category;
  }
}
