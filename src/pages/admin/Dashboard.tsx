import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Users, ShoppingBag, UserPlus, Shield, Tag, Home, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  activeListings: number;
  newUsersLast7Days: number;
  listingsByCategory: Record<string, number>;
  recentListings: any[];
  recentUsers: any[];
}

interface Category {
  name: string;
  icon: JSX.Element;
  key: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSellers: 0,
    activeListings: 0,
    newUsersLast7Days: 0,
    listingsByCategory: {},
    recentListings: [],
    recentUsers: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérification des permissions admin
  useEffect(() => {
    if (user?.user_metadata?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Récupération des données du tableau de bord
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Date pour les nouveaux utilisateurs (7 derniers jours)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Requêtes principales en parallèle
      const [
        { count: totalUsers },
        { data: allProfiles },
        { count: activeListings },
        { data: listingsByCategory },
        { count: newUsersLast7Days },
        { data: recentListings },
        { data: recentUsers }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('id, is_seller, created_at'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('listings').select('category').eq('status', 'active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('created_at', sevenDaysAgo.toISOString()),
        supabase.from('listings').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('*, auth_users(email)').order('created_at', { ascending: false }).limit(5)
      ]);

      // Calcul des statistiques
      const totalSellers = allProfiles?.filter(p => p.is_seller).length || 0;

      const categoryCounts = (listingsByCategory || []).reduce((acc, { category }) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setStats({
        totalUsers: totalUsers || 0,
        totalSellers,
        activeListings: activeListings || 0,
        newUsersLast7Days: newUsersLast7Days || 0,
        listingsByCategory: categoryCounts,
        recentListings: recentListings || [],
        recentUsers: recentUsers || []
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erreur lors du chargement des données');
      toast.error('Impossible de charger les données du tableau de bord');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Catégories prédéfinies
  const categories: Category[] = [
    { name: 'Immobilier', icon: <Home className="w-4 h-4" />, key: 'immobilier' },
    { name: 'Auto-Moto', icon: <Tag className="w-4 h-4" />, key: 'auto-moto' },
    { name: 'Services', icon: <Shield className="w-4 h-4" />, key: 'services' },
    { name: 'Déco & Artisanat', icon: <Tag className="w-4 h-4" />, key: 'deco-artisanat' },
  ];

  // Cartes de statistiques principales
  const statCards = [
    {
      name: 'Utilisateurs',
      value: stats.totalUsers,
      icon: Users,
      description: 'Total des comptes',
    },
    {
      name: 'Vendeurs',
      value: stats.totalSellers,
      icon: UserPlus,
      description: 'Vendeurs vérifiés',
    },
    {
      name: 'Annonces actives',
      value: stats.activeListings,
      icon: ShoppingBag,
      description: 'En ligne actuellement',
    },
    {
      name: 'Nouveaux (7j)',
      value: stats.newUsersLast7Days,
      icon: Clock,
      description: 'Nouveaux utilisateurs',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Tableau de bord Admin</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <div className="text-xs sm:text-sm text-gray-500">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
          <button
            onClick={() => fetchDashboardData()}
            className="ml-4 text-sm underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Grille de statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-full bg-blue-50 text-blue-500 flex-shrink-0">
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">{stat.name}</p>
                <p className="text-xl sm:text-2xl font-semibold mt-1">{stat.value}</p>
                <p className="text-xs text-gray-400 hidden sm:block">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Répartition par catégorie */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Annonces par catégorie</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((category) => (
            <div key={category.key} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-2 rounded-full bg-gray-200">
                  {category.icon}
                </div>
                <span className="text-sm sm:text-base font-medium">{category.name}</span>
              </div>
              <span className="font-semibold text-sm sm:text-base">
                {stats.listingsByCategory[category.key] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tableaux en grille responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernières annonces */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Dernières annonces publiées</h2>
          {stats.recentListings.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Catégorie</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 truncate max-w-xs">
                        {listing.title}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                        {categories.find(c => c.key === listing.category)?.name || listing.category}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {listing.price ? `${listing.price} €` : '-'}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                        {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aucune annonce récente</p>
          )}
        </div>

        {/* Derniers utilisateurs */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Derniers utilisateurs inscrits</h2>
          {stats.recentUsers.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Email</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Inscription</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 truncate max-w-xs">
                        {user.username || 'Non renseigné'}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell truncate max-w-xs">
                        {user.auth_users?.email || 'Non renseigné'}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                        {user.is_seller ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Vendeur
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Acheteur
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aucun utilisateur récent</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;