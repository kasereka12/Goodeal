import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Phone, Smartphone, Check, Star, Heart, Shield, MapPin, Loader2, Eye, Calendar, Clock, Award, User, Package, ChevronRight, AlertTriangle } from 'lucide-react';
import ImageGallery from '../components/ImageGallery';
import { motion } from 'framer-motion';

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
    city?: string;
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
    const [showContactOptions, setShowContactOptions] = useState(false);

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

    const toggleContactOptions = () => {
        setShowContactOptions(prev => !prev);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-r from-blue-50 to-indigo-50">
                <Loader2 className="animate-spin h-12 w-12 text-primary mb-4" />
                <p className="text-gray-600 font-medium animate-pulse">Chargement du profil...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 text-red-600 p-8 rounded-xl text-center shadow-sm">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-xl font-medium">
                        {error || "Ce profil n'existe pas ou a été supprimé"}
                    </p>
                    <Link to="/" className="mt-6 inline-block px-6 py-3 bg-white text-primary font-medium rounded-lg shadow-sm hover:shadow-md transition-all">
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

    // Les faux avis pour la démo
    const reviews = [
        {
            id: 1,
            buyer: 'Sophie M.',
            rating: 5,
            date: '15/03/2023',
            comment: 'Excellent vendeur, très réactif et produit conforme à la description. Je recommande vivement!',
            product: 'iPhone 13 Pro'
        },
        {
            id: 2,
            buyer: 'Thomas L.',
            rating: 4.5,
            date: '02/02/2023',
            comment: 'Bonne transaction, livraison rapide. Le produit était en bon état comme décrit.',
            product: 'MacBook Air M1'
        },
        {
            id: 3,
            buyer: 'Marie K.',
            rating: 5,
            date: '18/01/2023',
            comment: 'Super vendeur, communication claire et rapide. Article impeccable et bien emballé!',
            product: 'AirPods Pro'
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-primary/10 to-indigo-100 py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-6 md:mb-0">
                            {profile.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={displayName}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-indigo-600 flex items-center justify-center border-4 border-white shadow-md">
                                    <span className="text-3xl font-bold text-white">
                                        {displayName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="ml-6">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{displayName}</h1>
                                <div className="flex items-center mt-2">
                                    {profile.seller_approved && (
                                        <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                            <Check className="h-4 w-4" />
                                            <span>Vendeur vérifié</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 ml-3 text-sm bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span>4.8 (24 avis)</span>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <Calendar className="h-4 w-4" />
                                        <span>Membre depuis {memberSince}</span>
                                    </div>
                                    {profile.online && (
                                        <div className="flex items-center gap-1 text-green-600">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span>En ligne</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleContactOptions}
                                className="btn bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center"
                            >
                                <MessageSquare className="mr-2 h-5 w-5" />
                                Contacter
                            </motion.button>

                            {showContactOptions && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute mt-2 w-64 bg-white rounded-xl shadow-xl p-4 z-10 right-0"
                                >
                                    <button
                                        onClick={handleContact}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center text-gray-700 hover:text-primary transition-colors"
                                    >
                                        <MessageSquare className="mr-3 h-5 w-5" />
                                        Message privé
                                    </button>

                                    {(profile.show_phone && profile.phone) && (
                                        <a
                                            href={`tel:${profile.phone}`}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center text-gray-700 hover:text-primary transition-colors"
                                        >
                                            <Phone className="mr-3 h-5 w-5" />
                                            {profile.phone}
                                        </a>
                                    )}

                                    {(profile.show_whatsapp && profile.whatsapp) && (
                                        <a
                                            href={`https://wa.me/${profile.whatsapp}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center text-gray-700 hover:text-green-600 transition-colors"
                                        >
                                            <Smartphone className="mr-3 h-5 w-5" />
                                            WhatsApp
                                        </a>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                            <h3 className="font-semibold text-gray-800 border-b pb-4 mb-4">Statistiques du vendeur</h3>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-blue-50 rounded-lg p-4 text-center">
                                    <div className="text-xl font-bold text-primary">{listings.length}</div>
                                    <div className="text-xs text-gray-600 mt-1">Annonces</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <div className="text-xl font-bold text-green-600">98%</div>
                                    <div className="text-xs text-gray-600 mt-1">Réponse</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4 text-center">
                                    <div className="text-xl font-bold text-purple-600">&lt; 1h</div>
                                    <div className="text-xs text-gray-600 mt-1">Temps</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-primary">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Type de compte</div>
                                        <div className="text-sm text-gray-600">
                                            {profile.account_type === 'professional' ? 'Professionnel' : 'Particulier'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Localisation</div>
                                        <div className="text-sm text-gray-600">{profile.city || 'Non spécifiée'}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Membre depuis</div>
                                        <div className="text-sm text-gray-600">{memberSince}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                        <Award className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Statut</div>
                                        <div className="text-sm text-gray-600">
                                            {profile.seller_approved ? 'Vendeur vérifié' : 'Standard'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-gray-800">Conseils de sécurité</h3>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700 space-y-3">
                                <div className="flex items-start gap-2">
                                    <div className="min-w-4 mt-1 w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 text-xs">1</div>
                                    <p>Rencontrez le vendeur dans un lieu public</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="min-w-4 mt-1 w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 text-xs">2</div>
                                    <p>Vérifiez le produit avant de payer</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="min-w-4 mt-1 w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 text-xs">3</div>
                                    <p>Ne payez jamais d'avance sans garantie</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="min-w-4 mt-1 w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 text-xs">4</div>
                                    <p>Signalez tout comportement suspect</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="flex border-b">
                                <button
                                    onClick={() => setActiveTab('listings')}
                                    className={`flex-1 px-4 py-4 font-medium text-center ${activeTab === 'listings'
                                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                                            : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    <Package className="h-5 w-5 mx-auto mb-1" />
                                    Annonces ({listings.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`flex-1 px-4 py-4 font-medium text-center ${activeTab === 'reviews'
                                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                                            : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    <Star className="h-5 w-5 mx-auto mb-1" />
                                    Avis (24)
                                </button>
                            </div>

                            {activeTab === 'listings' ? (
                                <div className="p-6">
                                    {listings.length === 0 ? (
                                        <div className="text-center py-16 bg-gray-50 rounded-lg">
                                            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-500 font-medium">Ce vendeur n'a pas encore d'annonces actives</p>
                                            <Link to="/" className="mt-4 inline-block text-primary hover:underline">
                                                Découvrir d'autres annonces
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {listings.map((listing) => (
                                                <motion.div
                                                    key={listing.id}
                                                    whileHover={{ y: -5 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                >
                                                    <Link
                                                        to={`/listings/${listing.id}`}
                                                        className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                                                    >
                                                        <div className="aspect-square overflow-hidden relative">
                                                            <ImageGallery images={[listing.images[0]]} />
                                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-primary">
                                                                {listing.price.toLocaleString()} MAD
                                                            </div>
                                                        </div>
                                                        <div className="p-4">
                                                            <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                                                                {listing.title}
                                                            </h3>

                                                            <div className="mt-3 flex items-center justify-between text-sm">
                                                                <div className="flex items-center gap-1 text-gray-600">
                                                                    <MapPin className="h-4 w-4" />
                                                                    <span>{listing.city}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-gray-500">
                                                                    <div className="flex items-center gap-1">
                                                                        <Eye className="h-4 w-4" />
                                                                        <span>{listing.views}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Heart className="h-4 w-4" />
                                                                        <span>{listing.favorites}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="mt-4 pt-3 border-t flex justify-between items-center">
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                                                                </span>
                                                                <span className="text-primary text-sm flex items-center">
                                                                    Voir l'annonce
                                                                    <ChevronRight className="h-4 w-4 ml-1" />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                                <h4 className="font-semibold text-gray-800">Note moyenne</h4>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="text-2xl font-bold text-yellow-500">4.8</div>
                                                <div className="text-sm text-gray-500">/5</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="bg-yellow-500 h-2 rounded-full flex-grow" style={{ width: '96%' }}></div>
                                            <div className="text-sm text-gray-600 flex-shrink-0">24 avis</div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {reviews.map((review) => (
                                            <motion.div
                                                key={review.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                        {review.buyer.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium text-gray-800">{review.buyer}</h4>
                                                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                                <span className="font-semibold text-yellow-700">{review.rating}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                            <span>Achat: {review.product}</span>
                                                            <span>•</span>
                                                            <span>{review.date}</span>
                                                        </div>
                                                        <p className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-lg border-l-4 border-primary">
                                                            {review.comment}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        <div className="text-center pt-4">
                                            <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                                                Voir tous les avis
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SellerProfile;