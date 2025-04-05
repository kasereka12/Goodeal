import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Check, X, AlertCircle, ShoppingBag, Trash2, Pause } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { categories } from '../../lib/categories';
import { toast } from 'react-hot-toast';

interface UserData {
  username?: string;
  avatar_url?: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  region: string;
  images: string[];
  status: 'pending' | 'active' | 'rejected' | 'suspended' | 'sold' | 'archived';
  is_approved: boolean;
  views: number;
  created_at: string;
  user_id: string;
  transaction_type: string | null;
  user_data: UserData;
  rejection_reason?: string;
  suspension_reason?: string;
}

const ListingImage = ({ src, alt }: { src: string; alt: string }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError || !src) {
    return (
      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
        <ShoppingBag className="h-5 w-5 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-10 w-10 rounded-lg object-cover"
      onError={() => setImageError(true)}
    />
  );
};

export default function AdminListings() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'suspend' | 'delete'>('approve');
  const [modalReason, setModalReason] = useState('');

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.user_metadata?.role === 'admin';
  };

  const fetchUserData = async (userId: string): Promise<UserData> => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_public_data', { user_id: userId })
        .single();

      if (error) throw error;

      return {
        username: data?.username || 'Anonyme',
        avatar_url: data?.avatar_url
      };
    } catch (err) {
      console.error('Error fetching user data:', err);
      return { username: 'Anonyme' };
    }
  };

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const isAdminUser = await checkAdmin();
      if (!isAdminUser) {
        navigate('/');
        return;
      }

      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      const listingsWithUsers = await Promise.all(
        listingsData.map(async (listing) => {
          const userData = await fetchUserData(listing.user_id);
          return {
            ...listing,
            user_data: userData
          };
        })
      );

      setListings(listingsWithUsers);
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleListingAction = async (action: 'approve' | 'reject' | 'suspend' | 'delete', listing: Listing, reason?: string) => {
    try {
      const isAdminUser = await checkAdmin();
      if (!isAdminUser) return;

      if (action === 'delete') {
        const { error: deleteError } = await supabase
          .from('listings')
          .delete()
          .eq('id', listing.id);

        if (deleteError) throw deleteError;
      } else {
        const { error } = await supabase
          .rpc('admin_update_listing_status', {
            listing_id: listing.id,
            new_status: action === 'approve' ? 'active' :
              action === 'reject' ? 'rejected' :
                listing.status === 'suspended' || listing.status === 'rejected' ? 'active' : 'suspended',
            reason: action === 'reject' ? reason :
              (action === 'suspend' && listing.status !== 'suspended' ? reason : null)
          });

        if (error) throw error;
      }

      // Mise à jour optimiste
      setListings(prev => {
        if (action === 'delete') {
          return prev.filter(l => l.id !== listing.id);
        }

        return prev.map(l => {
          if (l.id !== listing.id) return l;

          return {
            ...l,
            status: action === 'approve' ? 'active' :
              action === 'reject' ? 'rejected' :
                l.status === 'suspended' || l.status === 'rejected' ? 'active' : 'suspended',
            is_approved: action === 'approve',
            rejection_reason: action === 'reject' ? reason : null,
            suspension_reason: action === 'suspend' && l.status !== 'suspended' ? reason : null
          };
        });
      });

      toast.success(
        action === 'approve' ?
          (listing.status === 'rejected' ? 'Annonce réapprouvée' : 'Annonce approuvée') :
          action === 'reject' ? 'Annonce rejetée' :
            action === 'suspend' ?
              (listing.status === 'suspended' ? 'Annonce réactivée' : 'Annonce suspendue') :
              'Annonce supprimée'
      );

    } catch (err: any) {
      console.error(`Error during ${action}:`, err);
      toast.error(err.message || `Erreur lors de l'action`);
      fetchListings();
    } finally {
      setShowModal(false);
      setModalReason('');
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = searchQuery === '' ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.user_data.username?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || listing.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: Listing['status']) => {
    const statusMap = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejetée' },
      suspended: { color: 'bg-orange-100 text-orange-800', label: 'Suspendue' },
      sold: { color: 'bg-blue-100 text-blue-800', label: 'Vendue' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Archivée' }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[status].color}`}>
        {statusMap[status].label}
      </span>
    );
  };

  const getActionButton = (listing: Listing) => {
    const status = listing.status;

    if (status === 'pending') {
      return (
        <>
          <button
            onClick={() => {
              setSelectedListing(listing);
              setModalAction('approve');
              setShowModal(true);
            }}
            className="text-green-400 hover:text-green-500 p-1"
            title="Approuver"
          >
            <Check className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              setSelectedListing(listing);
              setModalAction('reject');
              setShowModal(true);
            }}
            className="text-red-400 hover:text-red-500 p-1"
            title="Rejeter"
          >
            <X className="h-5 w-5" />
          </button>
        </>
      );
    }

    if (['active', 'suspended', 'rejected'].includes(status)) {
      const isReactivate = status === 'suspended' || status === 'rejected';

      return (
        <button
          onClick={() => {
            setSelectedListing(listing);
            setModalAction(
              status === 'active' ? 'suspend' :
                status === 'rejected' ? 'approve' :
                  'approve'
            );
            setShowModal(true);
          }}
          className={`p-1 ${isReactivate ? 'text-green-400 hover:text-green-500' : 'text-orange-400 hover:text-orange-500'
            }`}
          title={isReactivate ?
            (status === 'rejected' ? 'Réapprouver' : 'Réactiver') :
            'Suspendre'}
        >
          <Pause className="h-5 w-5" />
        </button>
      );
    }

    return null;
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
      {/* En-tête et filtres */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des annonces</h1>
        <div className="text-sm text-gray-500">
          {filteredListings.length} annonce{filteredListings.length !== 1 ? 's' : ''} trouvée{filteredListings.length !== 1 ? 's' : ''}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

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
            <option value="suspended">Suspendue</option>
            <option value="sold">Vendue</option>
            <option value="archived">Archivée</option>
          </select>
        </div>
      </div>

      {/* Tableau des annonces */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* En-têtes du tableau */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annonce</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendeur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vues</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            {/* Corps du tableau */}
            <tbody className="divide-y divide-gray-200">
              {filteredListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <ListingImage src={listing.images?.[0]} alt={listing.title} />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">{listing.title}</div>
                        <div className="text-sm text-gray-500">
                          {categories[listing.category]?.label || listing.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {listing.user_data.avatar_url ? (
                        <img src={listing.user_data.avatar_url} alt={listing.user_data.username} className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {listing.user_data.username?.charAt(0).toUpperCase() || 'A'}
                        </div>
                      )}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {listing.user_data.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{listing.city || 'Non spécifié'}</div>
                    <div className="text-sm text-gray-500">{listing.region || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {listing.price?.toLocaleString('fr-FR')} MAD
                    </div>
                    <div className="text-xs text-gray-500">
                      {listing.transaction_type || 'Non spécifié'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(listing.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {listing.views || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/listings/${listing.id}`)}
                        className="text-gray-400 hover:text-gray-500 p-1"
                        title="Voir l'annonce"
                      >
                        <Eye className="h-5 w-5" />
                      </button>

                      {getActionButton(listing)}

                      <button
                        onClick={() => {
                          setSelectedListing(listing);
                          setModalAction('delete');
                          setShowModal(true);
                        }}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Supprimer"
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

        {filteredListings.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            Aucune annonce trouvée
          </div>
        )}
      </div>

      {/* Modal des actions */}
      {showModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${modalAction === 'approve' ? 'bg-green-100' :
                modalAction === 'reject' ? 'bg-red-100' :
                  modalAction === 'suspend' ? 'bg-orange-100' : 'bg-gray-100'
                }`}>
                <AlertCircle className={`h-6 w-6 ${modalAction === 'approve' ? 'text-green-600' :
                  modalAction === 'reject' ? 'text-red-600' :
                    modalAction === 'suspend' ? 'text-orange-600' : 'text-gray-600'
                  }`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalAction === 'approve' ?
                    (selectedListing.status === 'rejected' ? 'Réapprouver l\'annonce' : 'Approuver l\'annonce') :
                    modalAction === 'reject' ? 'Rejeter l\'annonce' :
                      modalAction === 'suspend' ?
                        (selectedListing.status === 'suspended' ? 'Réactiver l\'annonce' : 'Suspendre l\'annonce') :
                        'Supprimer l\'annonce'}
                </h3>
                <p className="text-sm text-gray-500">
                  {modalAction === 'approve' ?
                    (selectedListing.status === 'rejected' ?
                      'Voulez-vous réapprouver cette annonce ?' :
                      'Voulez-vous approuver cette annonce ?') :
                    modalAction === 'reject' ? 'Veuillez indiquer la raison du rejet' :
                      modalAction === 'suspend' ?
                        (selectedListing.status === 'suspended' ?
                          'Voulez-vous réactiver cette annonce ?' :
                          'Veuillez indiquer la raison de la suspension') :
                        'Êtes-vous sûr de vouloir supprimer définitivement cette annonce ?'}
                </p>
              </div>
            </div>

            {(modalAction === 'reject' ||
              (modalAction === 'suspend' && selectedListing.status !== 'suspended')) && (
                <div className="mb-4">
                  <textarea
                    className="w-full p-2 border rounded"
                    placeholder={
                      modalAction === 'reject' ? 'Raison du rejet...' :
                        'Raison de la suspension...'
                    }
                    rows={3}
                    value={modalReason}
                    onChange={(e) => setModalReason(e.target.value)}
                    required
                  />
                </div>
              )}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setModalReason('');
                }}
                className="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={() => handleListingAction(modalAction, selectedListing, modalReason)}
                className={`btn ${modalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  modalAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    modalAction === 'suspend' ?
                      (selectedListing.status === 'suspended' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700') :
                      'bg-red-700 hover:bg-red-800'
                  } text-white`}
                disabled={
                  (modalAction === 'reject' ||
                    (modalAction === 'suspend' && selectedListing.status !== 'suspended')) &&
                  !modalReason.trim()
                }
              >
                {modalAction === 'approve' ?
                  (selectedListing.status === 'rejected' ? 'Réapprouver' : 'Approuver') :
                  modalAction === 'reject' ? 'Confirmer le rejet' :
                    modalAction === 'suspend' ?
                      (selectedListing.status === 'suspended' ? 'Réactiver' : 'Suspendre') :
                      'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}