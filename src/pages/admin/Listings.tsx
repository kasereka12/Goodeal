import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Eye, Check, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { categories } from '../../lib/categories';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  images: string[];
  status: 'pending' | 'active' | 'rejected' | 'sold' | 'archived';
  views: number;
  created_at: string;
  user_data: {
    email: string;
    user_metadata?: {
      display_name?: string;
    };
  };
}

export default function Listings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user?.user_metadata?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('listings_with_users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data || []);
      } catch (err: any) {
        console.error('Error fetching listings:', err);
        setError('Erreur lors du chargement des annonces');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.user_metadata?.role === 'admin') {
      fetchListings();
    }
  }, [user]);

  // Filter listings
  const filteredListings = listings.filter(listing => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || listing.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Update listing status
  const updateStatus = async (id: string, status: Listing['status']) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setListings(listings.map(listing =>
        listing.id === id ? { ...listing, status } : listing
      ));

      setShowModal(false);
    } catch (err: any) {
      console.error('Error updating listing status:', err);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des annonces</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher des annonces..."
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Toutes les catégories</option>
            {Object.entries(categories).map(([id, category]) => (
              <option key={id} value={id}>{category.label}</option>
            ))}
          </select>
          <select
            className="input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="active">Active</option>
            <option value="rejected">Rejetée</option>
            <option value="sold">Vendue</option>
            <option value="archived">Archivée</option>
          </select>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annonce
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vues
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredListings.map((listing) => (
                <tr key={listing.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {listing.images?.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {listing.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {categories[listing.category]?.label || 'Non catégorisé'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 line-clamp-1">
                      {listing.user_data?.user_metadata?.display_name ||
                        listing.user_data?.email?.split('@')[0] || 'Anonyme'}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-1">
                      {listing.user_data?.email || 'Email non disponible'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {listing.price?.toLocaleString() || '0'} MAD
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${listing.status === 'active' ? 'bg-green-100 text-green-800' :
                      listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        listing.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {listing.status === 'active' ? 'Active' :
                        listing.status === 'pending' ? 'En attente' :
                          listing.status === 'rejected' ? 'Rejetée' :
                            listing.status === 'sold' ? 'Vendue' : 'Archivée'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {listing.views || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/listings/${listing.id}`)}
                        className="text-gray-400 hover:text-gray-500"
                        title="Voir l'annonce"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {listing.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(listing.id, 'active')}
                            className="text-green-400 hover:text-green-500"
                            title="Approuver"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedListing(listing);
                              setShowModal(true);
                            }}
                            className="text-red-400 hover:text-red-500"
                            title="Rejeter"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucune annonce trouvée
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Rejeter l'annonce
                </h3>
                <p className="text-sm text-gray-500">
                  Êtes-vous sûr de vouloir rejeter cette annonce ? Cette action est irréversible.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={() => updateStatus(selectedListing.id, 'rejected')}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Rejeter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}