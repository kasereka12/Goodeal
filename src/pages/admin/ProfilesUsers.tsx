import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
    MessageSquare, Phone, Mail, User, Briefcase, ShieldCheck, Calendar,
    Eye, Loader2, Check, X, Trash2, AlertCircle, Search, Plus
} from 'lucide-react';
import { toast } from 'react-toastify';
import ImageGallery from '../../components/ImageGallery';

interface Profile {
    id: string;
    user_id: string;
    email: string | null;
    banned_until: string | null;
    last_sign_in_at: string | null;
    username: string;
    phone: string | null;
    whatsapp: string | null;
    account_type: string | null;
    created_at: string;
    online: boolean;
    avatar_url: string | null;
    is_seller: boolean;
    seller_approved: boolean;
    show_phone: boolean;
    show_whatsapp: boolean;
    company_name: string | null;
    seller_type: string | null;
}

interface Listing {
    id: string;
    title: string;
    price: number;
    city: string;
    region: string;
    images: string[];
    created_at: string;
    views: number;
    favorites: number;
    status: string;
}

const DeleteConfirmationModal = ({
    username,
    onConfirm,
    onCancel
}: {
    username: string;
    onConfirm: () => void;
    onCancel: () => void;
}) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirmer la suppression</h3>
            <p className="mb-6">
                Êtes-vous sûr de vouloir supprimer {username || 'cet utilisateur'} ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Annuler
                </button>
                <button
                    onClick={onConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                    Supprimer
                </button>
            </div>
        </div>
    </div>
);

const AdminUserProfile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'listings' | 'reviews'>('details');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (currentUser?.user_metadata?.role !== 'admin') {
            navigate('/unauthorized');
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch profile data
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', id)
                    .single();

                if (profileError || !profileData) throw new Error('Profil non trouvé');

                // Fetch user data
                const { data: userData } = await supabase
                    .from('users')
                    .select('email, last_sign_in_at, banned_until')
                    .eq('id', id)
                    .single();

                setProfile({
                    ...profileData,
                    email: userData?.email || null,
                    last_sign_in_at: userData?.last_sign_in_at || null,
                    banned_until: userData?.banned_until || null
                });

                // Fetch listings
                const { data: listingsData, error: listingsError } = await supabase
                    .from('listings')
                    .select('id, title, price, city, region, images, created_at, views, favorites, status')
                    .eq('user_id', id)
                    .order('created_at', { ascending: false });

                if (listingsError) throw listingsError;
                setListings(listingsData || []);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, currentUser, navigate]);

    const handleContact = () => navigate(`/admin/chat/${id}`);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Inconnu';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleBan = async (ban: boolean) => {
        if (!profile) return;

        try {
            await supabase.rpc('update_user_ban_status', {
                user_id: profile.user_id,
                is_banned: ban
            });

            setProfile({
                ...profile,
                banned_until: ban ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
            });

            toast.success(ban ? 'Compte suspendu' : 'Compte réactivé');
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleApprove = async (approve: boolean) => {
        if (!profile) return;

        try {
            await supabase.rpc('update_seller_status', {
                p_user_id: profile.user_id,
                p_is_approved: approve
            });

            setProfile({
                ...profile,
                seller_approved: approve
            });

            toast.success(approve ? 'Vendeur approuvé' : 'Approval révoqué');
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleDelete = async () => {
        if (!profile) return;

        try {
            const { error } = await supabase.rpc('delete_user_account', {
                p_user_id: profile.user_id
            });

            if (error) throw error;

            toast.success('Utilisateur supprimé');
            navigate('/admin/users');
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 text-red-500 p-6 rounded-lg text-center">
                    <div className="flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <p className="text-lg font-medium">
                            {error || "Ce profil n'existe pas ou a été supprimé"}
                        </p>
                    </div>
                    <Link
                        to="/admin/users"
                        className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                    >
                        Retour à la liste
                    </Link>
                </div>
            </div>
        );
    }

    const displayName = profile.username || profile.email?.split('@')[0] || 'Utilisateur';
    const isBanned = !!profile.banned_until;
    const memberSince = formatDate(profile.created_at);
    const lastLogin = formatDate(profile.last_sign_in_at);

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Profil Utilisateur</h1>
                <Link
                    to="/admin/users"
                    className="flex items-center text-primary hover:underline"
                >
                    <span className="mr-1">←</span> Retour à la liste
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                        <div className="flex flex-col items-center">
                            {profile.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={displayName}
                                    className="w-24 h-24 rounded-full object-cover mb-4"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <span className="text-3xl font-semibold text-gray-500">
                                        {displayName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}

                            <h2 className="text-xl font-bold text-center">{displayName}</h2>
                            <p className="text-sm text-gray-500 mt-1">{profile.email}</p>

                            <div className="flex flex-wrap gap-2 mt-4">
                                {profile.is_seller && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        <Briefcase className="h-3 w-3 mr-1" />
                                        Vendeur
                                    </span>
                                )}
                                {profile.seller_approved && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <ShieldCheck className="h-3 w-3 mr-1" />
                                        Vérifié
                                    </span>
                                )}
                                {profile.online && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                                        En ligne
                                    </span>
                                )}
                                {isBanned && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        <X className="h-3 w-3 mr-1" />
                                        Suspendu
                                    </span>
                                )}
                            </div>

                            <div className="w-full mt-6 space-y-3">
                                <button
                                    onClick={handleContact}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Contacter
                                </button>

                                <a
                                    href={`mailto:${profile.email}`}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Envoyer un email
                                </a>
                            </div>

                            <div className="mt-6 pt-6 border-t w-full">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-gray-500">
                                            <User className="h-4 w-4 mr-2" />
                                            <span>Type de compte:</span>
                                        </div>
                                        <div className="font-medium">
                                            {profile.account_type === 'professional' ? 'Professionnel' : 'Particulier'}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-gray-500">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span>Membre depuis:</span>
                                        </div>
                                        <div className="font-medium">{memberSince}</div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-gray-500">
                                            <Eye className="h-4 w-4 mr-2" />
                                            <span>Dernière connexion:</span>
                                        </div>
                                        <div className="font-medium">{lastLogin}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex border-b">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`px-4 py-2 font-medium ${activeTab === 'details' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                            >
                                Détails
                            </button>
                            <button
                                onClick={() => setActiveTab('listings')}
                                className={`px-4 py-2 font-medium ${activeTab === 'listings' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                            >
                                Annonces ({listings.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`px-4 py-2 font-medium ${activeTab === 'reviews' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                            >
                                Avis
                            </button>
                        </div>

                        {activeTab === 'details' && (
                            <div className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg flex items-center">
                                            <User className="h-5 w-5 mr-2" />
                                            Informations personnelles
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Nom d'utilisateur</p>
                                                <p className="font-medium">{profile.username || 'Non défini'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-medium">{profile.email || 'Non défini'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Téléphone</p>
                                                <p className="font-medium">{profile.phone || 'Non défini'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">WhatsApp</p>
                                                <p className="font-medium">{profile.whatsapp || 'Non défini'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {profile.is_seller && (
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg flex items-center">
                                                <Briefcase className="h-5 w-5 mr-2" />
                                                Informations vendeur
                                            </h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-500">Type de vendeur</p>
                                                    <p className="font-medium">
                                                        {profile.seller_type === 'private' ? 'Particulier' :
                                                            profile.seller_type === 'professional' ? 'Professionnel' :
                                                                profile.seller_type === 'dealer' ? 'Revendeur' : 'Non spécifié'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Nom de l'entreprise</p>
                                                    <p className="font-medium">{profile.company_name || 'Non spécifié'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Statut de vérification</p>
                                                    <p className="font-medium">
                                                        {profile.seller_approved ? (
                                                            <span className="text-green-600">Vérifié</span>
                                                        ) : (
                                                            <span className="text-yellow-600">Non vérifié</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Préférences de contact</p>
                                                    <p className="font-medium">
                                                        {profile.show_phone ? 'Afficher téléphone' : 'Cacher téléphone'}, {' '}
                                                        {profile.show_whatsapp ? 'Afficher WhatsApp' : 'Cacher WhatsApp'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8">
                                    <h3 className="font-semibold text-lg flex items-center">
                                        <ShieldCheck className="h-5 w-5 mr-2" />
                                        Actions administratives
                                    </h3>
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {profile.is_seller && (
                                            <button
                                                onClick={() => handleApprove(!profile.seller_approved)}
                                                className={`px-4 py-2 rounded-md font-medium text-white ${profile.seller_approved ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                                            >
                                                {profile.seller_approved ? 'Révoquer la vérification' : 'Approuver le vendeur'}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleBan(!isBanned)}
                                            className={`px-4 py-2 rounded-md font-medium text-white ${isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                        >
                                            {isBanned ? 'Réactiver le compte' : 'Suspendre le compte'}
                                        </button>

                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className="px-4 py-2 rounded-md font-medium text-white bg-red-600 hover:bg-red-700 flex items-center"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'listings' && (
                            <div className="mt-6">
                                {listings.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">Cet utilisateur n'a pas encore d'annonces</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annonce</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localisation</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vues</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {listings.map((listing) => (
                                                    <tr key={listing.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <Link to={`/admin/listings/${listing.id}`} className="flex items-center">
                                                                <div className="flex-shrink-0 h-10 w-10">
                                                                    {listing.images.length > 0 ? (
                                                                        <img className="h-10 w-10 rounded-md object-cover" src={listing.images[0]} alt={listing.title} />
                                                                    ) : (
                                                                        <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                                                                            <span className="text-xs text-gray-500">Pas d'image</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900 hover:text-primary">{listing.title}</div>
                                                                </div>
                                                            </Link>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium">
                                                            {listing.price.toLocaleString()} MAD
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {listing.city}, {listing.region}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${listing.status === 'active' ? 'bg-green-100 text-green-800' :
                                                                    listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-red-100 text-red-800'}`}>
                                                                {listing.status === 'active' ? 'Active' :
                                                                    listing.status === 'pending' ? 'En attente' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {listing.views}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="mt-6">
                                <div className="space-y-6">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="border-b pb-6 last:border-0">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-gray-500">
                                                        {['A', 'B', 'C'][i]}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">Acheteur {i + 1}</h4>
                                                        <div className="flex items-center gap-1 text-sm text-yellow-500">
                                                            <Star className="h-4 w-4 fill-yellow-500" />
                                                            <span>5.0</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Acheté le {new Date().toLocaleDateString('fr-FR')}
                                                    </p>
                                                    <p className="mt-2 text-gray-700">
                                                        Très bon vendeur, produit exactement comme décrit. Livraison rapide et soignée. Je recommande !
                                                    </p>
                                                    <div className="mt-3 flex justify-end">
                                                        <button className="text-sm text-red-500 hover:underline">
                                                            Supprimer cet avis
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <DeleteConfirmationModal
                    username={displayName}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </div>
    );
};

export default AdminUserProfile;