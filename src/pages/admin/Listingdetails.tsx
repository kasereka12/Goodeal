import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Check, X, Archive, Tag, Trash2, ArrowLeft, Phone, User, Mail, MessageSquare } from 'lucide-react';

interface Listing {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    city: string;
    region: string;
    images: string[];
    status: 'pending' | 'active' | 'rejected' | 'sold' | 'archived';
    is_approved: boolean;
    views: number;
    created_at: string;
    updated_at: string;
    user_id: string;
    transaction_type: string;
}

interface Profile {
    username: string;
    email: string;
    phone: string;
    whatsapp: string;
    avatar_url: string;
    company_name: string;
    seller_type: string;
    show_phone: boolean;
    show_whatsapp: boolean;
}

interface ListingWithProfile {
    listing: Listing;
    profile: Profile;
}

export default function ListingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<ListingWithProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState(0);

    const fetchListing = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data: result, error } = await supabase
                .rpc('get_listing_with_profile', { listing_id: id })
                .single();

            if (error) throw error;

            setData(result as unknown as ListingWithProfile);

            // Incrémenter les vues
            await supabase
                .from('listings')
                .update({ views: (result.listing.views || 0) + 1 })
                .eq('id', id);

        } catch (err: any) {
            console.error('Error:', err);
            setError(err.message || 'Erreur lors du chargement');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: Listing['status']) => {
        try {
            setIsLoading(true);

            const updates = {
                status: newStatus,
                is_approved: newStatus === 'active',
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('listings')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            // Mise à jour optimiste de l'état local
            setData(prev => prev ? {
                ...prev,
                listing: {
                    ...prev.listing,
                    ...updates
                }
            } : null);

            toast.success(`Annonce ${getStatusText(newStatus)} avec succès`);

            // Recharger les données pour être sûr
            await fetchListing();

        } catch (err: any) {
            console.error('Erreur de mise à jour:', err);
            toast.error(`Échec de la mise à jour: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteListing = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cette annonce ?')) {
            try {
                setIsLoading(true);
                const { error } = await supabase
                    .from('listings')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                toast.success('Annonce supprimée avec succès');
                navigate('/admin/listings');
            } catch (err: any) {
                console.error('Error deleting listing:', err);
                toast.error('Erreur lors de la suppression');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'approuvée';
            case 'pending': return 'en attente';
            case 'rejected': return 'rejetée';
            case 'sold': return 'marquée comme vendue';
            case 'archived': return 'archivée';
            default: return 'mise à jour';
        }
    };

    useEffect(() => {
        fetchListing();
    }, [id]);

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

    if (!data) {
        return <div className="p-4 text-center">Annonce non trouvée</div>;
    }

    const { listing, profile } = data;

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="mr-2" /> Retour aux annonces
            </button>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Galerie d'images */}
                <div className="relative">
                    <div className="h-96 bg-gray-100 flex items-center justify-center">
                        {listing.images?.length > 0 ? (
                            <img
                                src={listing.images[activeImage]}
                                alt={listing.title}
                                className="h-full w-full object-contain"
                            />
                        ) : (
                            <div className="text-gray-400">Aucune image disponible</div>
                        )}
                    </div>
                    {listing.images?.length > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                            {listing.images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(index)}
                                    className={`w-3 h-3 rounded-full ${activeImage === index ? 'bg-primary' : 'bg-gray-300'}`}
                                    aria-label={`Image ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Contenu principal */}
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                            <div className="flex items-center mt-2 space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${listing.status === 'active' ? 'bg-green-100 text-green-800' :
                                    listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        listing.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {getStatusText(listing.status).charAt(0).toUpperCase() + getStatusText(listing.status).slice(1)}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {listing.views} vues
                                </span>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-primary">
                            {listing.price.toLocaleString('fr-FR')} MAD
                        </div>
                    </div>

                    {/* Détails de l'annonce */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                            <p className="mt-2 text-gray-600 whitespace-pre-line">{listing.description}</p>

                            <h2 className="text-lg font-semibold text-gray-900 mt-6">Détails</h2>
                            <div className="mt-2 space-y-2">
                                <p className="text-gray-600">
                                    <span className="font-medium">Catégorie:</span> {listing.category}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Type de transaction:</span> {listing.transaction_type || 'Non spécifié'}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Localisation:</span> {listing.city}, {listing.region}
                                </p>
                            </div>
                        </div>

                        {/* Vendeur */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Vendeur</h2>
                            <div className="mt-4 flex items-center">
                                {profile.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt={profile.username}
                                        className="h-12 w-12 rounded-full"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="h-6 w-6 text-gray-400" />
                                    </div>
                                )}
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900">
                                        {profile.company_name || profile.username}
                                    </p>
                                    {profile.seller_type && (
                                        <p className="text-sm text-gray-500">{profile.seller_type}</p>
                                    )}
                                </div>
                            </div>

                            {/* Coordonnées */}
                            <div className="mt-4 space-y-2">
                                {profile.email && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="h-4 w-4 mr-2" />
                                        <a href={`mailto:${profile.email}`} className="hover:text-primary">
                                            {profile.email}
                                        </a>
                                    </div>
                                )}
                                {profile.show_phone && profile.phone && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Phone className="h-4 w-4 mr-2" />
                                        <a href={`tel:${profile.phone}`} className="hover:text-primary">
                                            {profile.phone}
                                        </a>
                                    </div>
                                )}
                                {profile.show_whatsapp && profile.whatsapp && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        <a
                                            href={`https://wa.me/${profile.whatsapp}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-primary"
                                        >
                                            WhatsApp: {profile.whatsapp}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions administrateur */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions administrateur</h2>
                        <div className="flex flex-wrap gap-3">
                            {listing.status !== 'active' && (
                                <button
                                    onClick={() => handleStatusUpdate('active')}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    <Check className="mr-2" /> Approuver
                                </button>
                            )}
                            {listing.status !== 'rejected' && (
                                <button
                                    onClick={() => handleStatusUpdate('rejected')}
                                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    <X className="mr-2" /> Rejeter
                                </button>
                            )}
                            {listing.status !== 'sold' && (
                                <button
                                    onClick={() => handleStatusUpdate('sold')}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    <Tag className="mr-2" /> Marquer comme vendu
                                </button>
                            )}
                            {listing.status !== 'archived' && (
                                <button
                                    onClick={() => handleStatusUpdate('archived')}
                                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                >
                                    <Archive className="mr-2" /> Archiver
                                </button>
                            )}
                            <button
                                onClick={deleteListing}
                                className="flex items-center px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900"
                            >
                                <Trash2 className="mr-2" /> Supprimer définitivement
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}