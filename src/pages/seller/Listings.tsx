import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import {
  Eye,
  Edit,
  Trash2,
  PauseCircle,
  PlayCircle,
  CheckCircle,
  Filter,
  Search,
  Plus,
  AlertCircle,
  Home
} from 'lucide-react';

export default function SellerListings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Add mock data for demonstration if needed
        const listingsWithMockData = data.map(listing => ({
          ...listing,
          views: listing.views || Math.floor(Math.random() * 100),
          messages: listing.messages || Math.floor(Math.random() * 10),
          status: listing.status || (Math.random() > 0.7 ? 'sold' : (Math.random() > 0.5 ? 'paused' : 'active'))
        }));

        setListings(listingsWithMockData);
        setFilteredListings(listingsWithMockData);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [user]);

  // Apply filters and search
  useEffect(() => {
    let result = [...listings];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(listing => listing.status === statusFilter);
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(listing =>
        listing.title.toLowerCase().includes(term) ||
        listing.description.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'views':
        result.sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }

    setFilteredListings(result);
  }, [listings, statusFilter, searchTerm, sortOption]);

  const handleDeleteListing = async () => {
    if (!listingToDelete) return;

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingToDelete.id);

      if (error) throw error;

      // Update listings state
      setListings(listings.filter(listing => listing.id !== listingToDelete.id));
      setShowDeleteModal(false);
      setListingToDelete(null);
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const handleUpdateStatus = async (listingId, newStatus) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: newStatus })
        .eq('id', listingId);

      if (error) throw error;

      // Update listings state
      setListings(listings.map(listing => 
        listing.id === listingId ? { ...listing, status: newStatus } : listing
      ));
    } catch (error) {
      console.error('Error updating listing status:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Actif</span>;
      case 'paused':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">En pause</span>;
      case 'sold':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Vendu</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Inconnu</span>;
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
          {t('sellerDashboard.myListings') || 'Mes annonces'}
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
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('nav.postListing') || 'Déposer une annonce'}
          </Link>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder={t('common.search') || 'Rechercher...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t('common.allStatuses') || 'Tous les statuts'}</option>
              <option value="active">{t('common.active') || 'Actif'}</option>
              <option value="paused">{t('common.paused') || 'En pause'}</option>
              <option value="sold">{t('common.sold') || 'Vendu'}</option>
            </select>
          </div>

          {/* Sort options */}
          <div className="relative">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">{t('common.sortNewest') || 'Plus récent'}</option>
              <option value="oldest">{t('common.sortOldest') || 'Plus ancien'}</option>
              <option value="price_high">{t('common.sortPriceHigh') || 'Prix décroissant'}</option>
              <option value="price_low">{t('common.sortPriceLow') || 'Prix croissant'}</option>
              <option value="views">{t('common.sortViews') || 'Plus de vues'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredListings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.listing') || 'Annonce'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.price') || 'Prix'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.status') || 'Statut'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.views') || 'Vues'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.messages') || 'Messages'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.date') || 'Date'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions') || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                          {getCategoryIcon(listing.category)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {listing.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {listing.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatPrice(listing.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(listing.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Eye className="h-4 w-4 text-gray-400 mr-1" />
                        {listing.views}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {listing.messages}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(listing.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link 
                          to={`/listing/${listing.id}`} 
                          className="text-gray-400 hover:text-gray-500" 
                          title={t('common.view') || 'Voir'}
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link 
                          to={`/edit-listing/${listing.id}`} 
                          className="text-blue-400 hover:text-blue-500" 
                          title={t('common.edit') || 'Modifier'}
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        {listing.status === 'active' ? (
                          <button 
                            onClick={() => handleUpdateStatus(listing.id, 'paused')} 
                            className="text-amber-400 hover:text-amber-500" 
                            title={t('common.pause') || 'Mettre en pause'}
                          >
                            <PauseCircle className="h-5 w-5" />
                          </button>
                        ) : listing.status === 'paused' ? (
                          <button 
                            onClick={() => handleUpdateStatus(listing.id, 'active')} 
                            className="text-green-400 hover:text-green-500" 
                            title={t('common.activate') || 'Activer'}
                          >
                            <PlayCircle className="h-5 w-5" />
                          </button>
                        ) : null}
                        {listing.status !== 'sold' && (
                          <button 
                            onClick={() => handleUpdateStatus(listing.id, 'sold')} 
                            className="text-blue-400 hover:text-blue-500" 
                            title={t('common.markAsSold') || 'Marquer comme vendu'}
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setListingToDelete(listing);
                            setShowDeleteModal(true);
                          }} 
                          className="text-red-400 hover:text-red-500" 
                          title={t('common.delete') || 'Supprimer'}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('sellerDashboard.noListings') || 'Aucune annonce trouvée'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? (t('sellerDashboard.noListingsWithFilters') || 'Aucune annonce ne correspond à vos critères de recherche')
                : (t('sellerDashboard.createYourFirstListing') || 'Commencez par créer votre première annonce')}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <div className="mt-6">
                <Link to="/create-listing" className="btn btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('nav.postListing') || 'Déposer une annonce'}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {t('common.deleteConfirmation') || 'Confirmer la suppression'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {t('sellerDashboard.deleteConfirmationText') || 'Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteListing}
                >
                  {t('common.delete') || 'Supprimer'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setListingToDelete(null);
                  }}
                >
                  {t('common.cancel') || 'Annuler'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0
  }).format(price);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

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
