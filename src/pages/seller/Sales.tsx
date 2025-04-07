import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ArrowUpRight,
  Home
} from 'lucide-react';

export default function SellerSales() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    averagePrice: 0
  });

  useEffect(() => {
    const fetchSales = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch listings data
        const { data: listings, error: listingsError } = await supabase
          .from('listings')
          .select('id, title, price, status, created_at')
          .eq('user_id', user.id);

        if (listingsError) throw listingsError;

        // Generate mock sales data for demonstration
        const mockSales = generateMockSales(listings || []);
        setSales(mockSales);
        setFilteredSales(mockSales);

        // Calculate sales statistics
        const totalSales = mockSales.length;
        const totalRevenue = mockSales.reduce((sum, sale) => sum + sale.price, 0);
        const pendingPayments = mockSales
          .filter(sale => sale.paymentStatus === 'pending')
          .reduce((sum, sale) => sum + sale.price, 0);
        const averagePrice = totalSales > 0 ? totalRevenue / totalSales : 0;

        setSalesStats({
          totalSales,
          totalRevenue,
          pendingPayments,
          averagePrice
        });
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSales();
  }, [user]);

  useEffect(() => {
    // Filter and sort sales when filters or search term changes
    let result = [...sales];

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(sale => sale.status === filterStatus);
    }

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        sale => 
          sale.title.toLowerCase().includes(lowerSearchTerm) ||
          sale.buyerName.toLowerCase().includes(lowerSearchTerm) ||
          sale.orderId.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredSales(result);
  }, [sales, searchTerm, filterStatus, sortConfig]);

  // Generate mock sales data
  const generateMockSales = (listings) => {
    const statuses = ['completed', 'processing', 'cancelled'];
    const paymentStatuses = ['paid', 'pending', 'refunded'];
    const buyerNames = [
      'Thomas Dubois', 'Marie Laurent', 'Jean Petit', 
      'Sophie Martin', 'Pierre Leroy', 'Emma Blanc',
      'Lucas Bernard', 'Camille Durand', 'Nicolas Moreau'
    ];
    
    return listings.map((listing, index) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 60));
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentStatus = status === 'cancelled' 
        ? 'refunded' 
        : paymentStatuses[Math.floor(Math.random() * (paymentStatuses.length - 1))];
      
      return {
        id: index + 1,
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        listingId: listing.id,
        title: listing.title || `Produit ${index + 1}`,
        price: listing.price || Math.floor(50 + Math.random() * 950),
        date: date.toISOString(),
        buyerName: buyerNames[Math.floor(Math.random() * buyerNames.length)],
        status,
        paymentStatus,
        shippingMethod: Math.random() > 0.5 ? 'pickup' : 'delivery'
      };
    });
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t('sellerDashboard.completed') || 'Terminée'}
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            {t('sellerDashboard.processing') || 'En cours'}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            {t('sellerDashboard.cancelled') || 'Annulée'}
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {t('sellerDashboard.paid') || 'Payé'}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {t('sellerDashboard.pending') || 'En attente'}
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {t('sellerDashboard.refunded') || 'Remboursé'}
          </span>
        );
      default:
        return null;
    }
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
          {t('sellerDashboard.sales') || 'Ventes'}
        </h1>
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="flex items-center text-sm font-medium text-primary hover:text-primary-dark"
          >
            <Home className="h-4 w-4 mr-1" />
            {t('common.backToHome') || 'Retour à l\'accueil'}
          </Link>
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Download className="h-4 w-4 mr-2" />
            {t('common.export') || 'Exporter'}
          </button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">{t('sellerDashboard.totalSales') || 'Ventes totales'}</h2>
              <p className="text-2xl font-bold text-gray-900">{salesStats.totalSales}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">{t('sellerDashboard.totalRevenue') || 'Chiffre d\'affaires'}</h2>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(salesStats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">{t('sellerDashboard.pendingPayments') || 'Paiements en attente'}</h2>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(salesStats.pendingPayments)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <ArrowUpRight className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">{t('sellerDashboard.averagePrice') || 'Prix moyen'}</h2>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(salesStats.averagePrice)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder={t('common.search') || 'Rechercher...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">{t('sellerDashboard.allStatuses') || 'Tous les statuts'}</option>
                <option value="completed">{t('sellerDashboard.completed') || 'Terminée'}</option>
                <option value="processing">{t('sellerDashboard.processing') || 'En cours'}</option>
                <option value="cancelled">{t('sellerDashboard.cancelled') || 'Annulée'}</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {t('sellerDashboard.showing') || 'Affichage de'} {filteredSales.length} {t('sellerDashboard.outOf') || 'sur'} {sales.length} {t('sellerDashboard.sales') || 'ventes'}
          </div>
        </div>
      </div>

      {/* Sales table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('orderId')}
                >
                  <div className="flex items-center">
                    {t('sellerDashboard.orderId') || 'N° de commande'}
                    {sortConfig.key === 'orderId' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('title')}
                >
                  <div className="flex items-center">
                    {t('sellerDashboard.product') || 'Produit'}
                    {sortConfig.key === 'title' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('date')}
                >
                  <div className="flex items-center">
                    {t('sellerDashboard.date') || 'Date'}
                    {sortConfig.key === 'date' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('buyerName')}
                >
                  <div className="flex items-center">
                    {t('sellerDashboard.buyer') || 'Acheteur'}
                    {sortConfig.key === 'buyerName' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('price')}
                >
                  <div className="flex items-center">
                    {t('sellerDashboard.amount') || 'Montant'}
                    {sortConfig.key === 'price' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center">
                    {t('sellerDashboard.status') || 'Statut'}
                    {sortConfig.key === 'status' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('paymentStatus')}
                >
                  <div className="flex items-center">
                    {t('sellerDashboard.payment') || 'Paiement'}
                    {sortConfig.key === 'paymentStatus' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">{t('common.actions') || 'Actions'}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md"></div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {sale.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(sale.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.buyerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatPrice(sale.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusBadge(sale.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getPaymentStatusBadge(sale.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary hover:text-primary-dark">
                        {t('common.details') || 'Détails'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                    {t('sellerDashboard.noSalesFound') || 'Aucune vente trouvée'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
