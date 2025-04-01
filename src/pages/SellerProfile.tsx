import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Phone, Smartphone, Check, Star, Heart, Shield, MapPin, Loader2, Eye } from 'lucide-react';
import ImageGallery from '../components/ImageGallery';

interface Profile {
    id: string;
    user_id: string;
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
    user_metadata?: {
        email?: string;
    };
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

function SellerProfile() {
    const { id } = useParams();
    const location = useLocation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

    // Chargement initial des données
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // 1. Charger le profil
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', id)
                    .single();

                if (profileError || !profileData) {
                    throw new Error('Profil non trouvé');
                }

                // 2. Charger les infos email de l'utilisateur
                const { data: userData } = await supabase
                    .from('users')
                    .select('email')
                    .eq('id', id)
                    .single();

                setProfile({
                    ...profileData,
                    user_metadata: {
                        email: userData?.email
                    }
                });

                // 3. Charger les annonces
                const { data: listingsData, error: listingsError } = await supabase
                    .from('listings')
                    .select('id, title, price, city, region, images, created_at, views, favorites, status')
                    .eq('user_id', id)
                    .eq('status', 'active')
                    .order('created_at', { ascending: false });

                if (listingsError) throw listingsError;
                setListings(listingsData || []);

            } catch (err: any) {
                console.error('Error fetching profile:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleContact = () => {
        if (!user) {
            navigate('/auth');
            return;
        }
        navigate(`/chat/${id}`);
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
                    <p className="text-lg font-medium">
                        {error || "Ce profil n'existe pas ou a été supprimé"}
                    </p>
                    <Link to="/" className="text-primary hover:underline mt-4 inline-block">
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        );
    }

    const displayName = profile.username || profile.user_metadata?.email?.split('@')[0] || 'Utilisateur';
    const memberSince = new Date(profile.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long'
    });

    return (
        <div className="container mx-auto px-4 py-6">
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

                            {profile.seller_approved && (
                                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                                    <Check className="h-4 w-4" />
                                    <span>Vendeur vérifié</span>
                                </div>
                            )}

                            <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span>4.8 (24 avis)</span>
                            </div>

                            <div className="mt-4 text-sm text-gray-500">
                                Membre depuis {memberSince}
                            </div>

                            {profile.online && (
                                <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>En ligne</span>
                                </div>
                            )}

                            <div className="w-full mt-6 space-y-3">
                                <button
                                    onClick={handleContact}
                                    className="btn btn-primary w-full flex items-center justify-center"
                                >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Contacter
                                </button>

                                {(profile.show_phone && profile.phone) && (
                                    <a
                                        href={`tel:${profile.phone}`}
                                        className="btn btn-secondary w-full flex items-center justify-center"
                                    >
                                        <Phone className="mr-2 h-4 w-4" />
                                        {profile.phone}
                                    </a>
                                )}

                                {(profile.show_whatsapp && profile.whatsapp) && (
                                    <a
                                        href={`https://wa.me/${profile.whatsapp}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary w-full flex items-center justify-center"
                                    >
                                        <Smartphone className="mr-2 h-4 w-4" />
                                        WhatsApp
                                    </a>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t w-full">
                                <div className="flex justify-between text-sm">
                                    <div className="text-center">
                                        <div className="font-semibold">{listings.length}</div>
                                        <div className="text-gray-500">Annonces</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold">98%</div>
                                        <div className="text-gray-500">Réponse</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold">&lt; 1h</div>
                                        <div className="text-gray-500">Temps moyen</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                        <h3 className="font-semibold mb-4">À propos</h3>
                        <div className="text-sm text-gray-600 space-y-3">
                            <p>
                                {profile.account_type === 'professional'
                                    ? 'Vendeur professionnel avec des articles de qualité'
                                    : 'Particulier proposant des articles soigneusement sélectionnés'}
                            </p>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>Localisation: {profile.city || 'Non spécifiée'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex border-b">
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
                                Avis (24)
                            </button>
                        </div>

                        {activeTab === 'listings' ? (
                            <div className="mt-6">
                                {listings.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">Ce vendeur n'a pas encore d'annonces actives</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {listings.map((listing) => (
                                            <Link
                                                key={listing.id}
                                                to={`/listings/${listing.id}`}
                                                className="group"
                                            >
                                                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                                    <ImageGallery images={[listing.images[0]]} />
                                                </div>
                                                <div className="mt-3">
                                                    <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                                                        {listing.title}
                                                    </h3>
                                                    <p className="mt-1 text-lg font-semibold text-primary">
                                                        {listing.price.toLocaleString()} MAD
                                                    </p>
                                                    <div className="mt-1 flex items-center justify-between text-sm text-gray-500">
                                                        <span>{listing.city}, {listing.region}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Eye className="h-4 w-4" />
                                                            <span>{listing.views}</span>
                                                            <Heart className="h-4 w-4" />
                                                            <span>{listing.favorites}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
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
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Conseils de sécurité</h3>
                        </div>
                        <ul className="mt-4 text-sm text-gray-600 space-y-2">
                            <li>• Rencontrez le vendeur dans un lieu public</li>
                            <li>• Vérifiez le produit avant de payer</li>
                            <li>• Ne payez jamais d'avance sans garantie</li>
                            <li>• Signalez tout comportement suspect</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SellerProfile;