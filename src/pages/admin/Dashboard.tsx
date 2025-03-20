import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Users, ShoppingBag, Flag, Settings, BarChart, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalUsers: number;
  activeListings: number;
  totalViews: number;
  conversionRate: number;
}

interface Activity {
  type: 'user' | 'listing' | 'report';
  title: string;
  description: string;
  timestamp: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    /* if (!user?.user_metadata?.role === 'admin') {
       navigate('/');
     }*/
  }, [user, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get total users count
        const { data: { count: totalUsers } } = await supabase
          .rpc('get_total_users_count');

        // Get active listings
        const { count: activeListings } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Get total views
        const { data: viewsData } = await supabase
          .from('listings')
          .select('views');

        const totalViews = viewsData?.reduce((sum, listing) => sum + (listing.views || 0), 0) || 0;

        // Calculate conversion rate (active listings / total users)
        const conversionRate = totalUsers ? ((activeListings || 0) / totalUsers) * 100 : 0;

        setStats({
          totalUsers: totalUsers || 0,
          activeListings: activeListings || 0,
          totalViews,
          conversionRate,
        });

        // Get recent activities
        const { data: recentListings } = await supabase
          .from('listings_with_users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        const activities: Activity[] = (recentListings || []).map(listing => ({
          type: 'listing',
          title: 'Nouvelle annonce',
          description: listing.title,
          timestamp: new Date(listing.created_at).toLocaleString('fr-FR'),
        }));

        setActivities(activities);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      name: 'Utilisateurs',
      value: stats?.totalUsers.toLocaleString('fr-FR'),
      icon: Users,
      change: '+12%',
      changeType: 'increase' as const
    },
    {
      name: 'Annonces actives',
      value: stats?.activeListings.toLocaleString('fr-FR'),
      icon: ShoppingBag,
      change: '+23%',
      changeType: 'increase' as const
    },
    {
      name: 'Vues totales',
      value: stats?.totalViews.toLocaleString('fr-FR'),
      icon: Eye,
      change: '+45%',
      changeType: 'increase' as const
    },
    {
      name: 'Taux de conversion',
      value: `${stats?.conversionRate.toFixed(1)}%`,
      icon: BarChart,
      change: '+2%',
      changeType: 'increase' as const
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <button className="btn btn-secondary">
          <Settings className="w-4 h-4 mr-2" />
          Paramètres
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.changeType === 'increase' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                  <Icon className={`w-6 h-6 ${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                    }`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm ${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Activité récente</h2>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {activity.type === 'user' && <Users className="w-5 h-5 text-primary" />}
                {activity.type === 'listing' && <ShoppingBag className="w-5 h-5 text-primary" />}
                {activity.type === 'report' && <Flag className="w-5 h-5 text-red-500" />}
              </div>
              <div>
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.description}</p>
              </div>
              <span className="ml-auto text-sm text-gray-500">{activity.timestamp}</span>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune activité récente
            </div>
          )}
        </div>
      </div>
    </div>
  );
}