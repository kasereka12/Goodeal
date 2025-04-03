import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  MessageSquare, Heart, Share2, MapPin, Eye, Copy, Check,
  Facebook, Twitter, Phone, Camera, Calendar, ArrowLeft, Link as LinkIcon,
  ChevronRight, Star, Mail, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ImageGallery from '../components/ImageGallery';
import { useLanguage } from '../contexts/LanguageContext';

interface ListingDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  region: string;
  category: string;
  images: string[];
  filters: Record<string, any>;
  views: number;
  favorites: number;
  transaction_type?: 'location' | 'achat';
  user_data: {
    id: string;
    email: string;
    created_at: string;
    user_metadata: {
      display_name?: string;
      avatar_url?: string;
    };
  };
  created_at: string;
}

const ListingDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const fetchListing = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('listings_with_users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Listing not found');

      setListing(data);

      if (user) {
        const { data: favoriteData } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .eq('listing_id', id)
          .single();

        setIsFavorite(!!favoriteData);
      }

      await supabase
        .from('listings')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', id);

    } catch (err: any) {
      console.error('Error fetching listing:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const toggleFavorite = useCallback(async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', id);
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, listing_id: id });
      }

      setIsFavorite(!isFavorite);
      setListing(prev => prev ? {
        ...prev,
        favorites: isFavorite ? prev.favorites - 1 : prev.favorites + 1
      } : null);

    } catch (error) {
      console.error('Error managing favorites:', error);
    }
  }, [user, id, isFavorite, navigate]);

  const formatDate = useCallback((dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(dateString));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 text-red-600 p-8 rounded-xl text-center border border-red-100 shadow-sm">
          <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-xl font-semibold mb-4">
            {error || t('listing.notFound', "Cette annonce n'existe pas ou a été supprimée")}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('actions.backToHome', "Retour à l'accueil")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center text-sm text-gray-500">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          {t('breadcrumb.home', 'Accueil')}
        </Link>
        <ChevronRight className="mx-1 h-4 w-4" />
        <Link
          to={`/category/${listing.category}`}
          className="hover:text-blue-600 transition-colors capitalize"
        >
          {t(`categories.${listing.category}`, listing.category)}
        </Link>
        <ChevronRight className="mx-1 h-4 w-4" />
        <span className="text-gray-700 font-medium truncate max-w-xs">
          {listing.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              {listing.transaction_type && (
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${listing.transaction_type === 'location'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-emerald-100 text-emerald-700'
                  }`}>
                  {listing.transaction_type === 'location'
                    ? t('listing.forRent', 'Location')
                    : t('listing.forSale', 'Vente')}
                </span>
              )}
            </div>

            <p className="text-3xl font-bold text-blue-600">
              {listing.price.toLocaleString()} MAD
              {listing.transaction_type === 'location' && (
                <span className="text-sm font-normal text-gray-500">
                  {t('listing.perMonth', '/mois')}
                </span>
              )}
            </p>

            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{listing.city}, {listing.region}</span>
            </div>

            <div className="flex items-center gap-6 mt-6 text-sm text-gray-500 px-4 py-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{listing.views} {t('listing.views', 'vues')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                <span>{listing.favorites} {t('listing.favorites', 'favoris')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Camera className="h-4 w-4" />
                <span>{listing.images.length} {t('listing.photos', 'photos')}</span>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <ImageGallery images={listing.images} />
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex gap-4">
            <button
              onClick={toggleFavorite}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center ${isFavorite
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
            >
              <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? t('actions.saved', 'Sauvegardé') : t('actions.save', 'Sauvegarder')}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-colors flex items-center"
              >
                <Share2 className="h-4 w-4" />
              </button>
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg overflow-hidden z-50 border border-gray-100 animate-fadeIn">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${listing.title}\n${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-1.5 rounded-full bg-green-100">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">WhatsApp</span>
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-1.5 rounded-full bg-blue-100">
                      <Facebook className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">Facebook</span>
                  </a>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                        alert(t('share.copied', 'Lien copié !'));
                      } catch (error) {
                        console.error('Error copying:', error);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-1.5 rounded-full bg-gray-100">
                      <Copy className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium">
                      {t('share.copyLink', 'Copier le lien')}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-full">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              {t('listing.description', 'Description')}
            </h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {listing.description}
            </p>

            <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('listing.published', 'Publié le')} {formatDate(listing.created_at)}
            </div>
          </div>

          {/* Characteristics */}
          {Object.keys(listing.filters).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-full">
                  <LinkIcon className="h-4 w-4 text-blue-600" />
                </div>
                {t('listing.characteristics', 'Caractéristiques')}
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {Object.entries(listing.filters)
                  .filter(([key]) => key !== 'transaction_type')
                  .map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                      <dt className="text-sm text-gray-500 capitalize">
                        {key.replace('_', ' ')}
                      </dt>
                      <dd className="text-gray-900 font-medium mt-1">
                        {typeof value === 'boolean'
                          ? value
                            ? t('general.yes', 'Oui')
                            : t('general.no', 'Non')
                          : value}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
          )}

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-full">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              {t('listing.location', 'Localisation')}
            </h2>
            <div className="flex items-center gap-2 text-gray-700">
              <div className="bg-gray-100 w-full h-56 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p>{listing.city}, {listing.region}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              {listing.transaction_type && (
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${listing.transaction_type === 'location'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-emerald-100 text-emerald-700'
                  }`}>
                  {listing.transaction_type === 'location'
                    ? t('listing.forRent', 'Location')
                    : t('listing.forSale', 'Vente')}
                </span>
              )}
            </div>

            <p className="text-3xl font-bold text-blue-600">
              {listing.price.toLocaleString()} MAD
              {listing.transaction_type === 'location' && (
                <span className="text-sm font-normal text-gray-500">
                  {t('listing.perMonth', '/mois')}
                </span>
              )}
            </p>

            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{listing.city}, {listing.region}</span>
            </div>

            <div className="flex items-center gap-6 mt-6 text-sm text-gray-500 px-4 py-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{listing.views} {t('listing.views', 'vues')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                <span>{listing.favorites} {t('listing.favorites', 'favoris')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Camera className="h-4 w-4" />
                <span>{listing.images.length} {t('listing.photos', 'photos')}</span>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={toggleFavorite}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center ${isFavorite
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
              >
                <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? t('actions.saved', 'Sauvegardé') : t('actions.save', 'Sauvegarder')}
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-colors flex items-center"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg overflow-hidden z-50 border border-gray-100 animate-fadeIn">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`${listing.title}\n${window.location.href}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-1.5 rounded-full bg-green-100">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">WhatsApp</span>
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-1.5 rounded-full bg-blue-100">
                        <Facebook className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">Facebook</span>
                    </a>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(window.location.href);
                          alert(t('share.copied', 'Lien copié !'));
                        } catch (error) {
                          console.error('Error copying:', error);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-1.5 rounded-full bg-gray-100">
                        <Copy className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium">
                        {t('share.copyLink', 'Copier le lien')}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seller Info */}
          {listing.user_data && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                {listing.user_data.user_metadata?.avatar_url ? (
                  <img
                    src={listing.user_data.user_metadata.avatar_url}
                    alt={listing.user_data.user_metadata.display_name || listing.user_data.email}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="text-2xl font-semibold">
                      {(listing.user_data.user_metadata?.display_name || listing.user_data.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-lg">
                    {listing.user_data.user_metadata?.display_name || listing.user_data.email.split('@')[0]}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {t('seller.memberSince', 'Membre depuis')}{' '}
                    {new Date(listing.user_data.created_at).toLocaleDateString('fr-FR', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  to={`/chat/${listing.user_data.id}?listingId=${listing.id}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t('seller.contact', 'Contacter le vendeur')}
                </Link>

                <Link
                  to={`/profile/${listing.user_data.id}`}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
                >
                  {t('seller.viewProfile', 'Voir le profil')}
                </Link>
              </div>
            </div>
          )}

          {/* Safety Tips */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-full">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              {t('safety.title', 'Conseils de sécurité')}
            </h2>
            <ul className="space-y-3 mt-5">
              {[1, 2, 3, 4].map((tipNum) => (
                <li key={tipNum} className="flex items-start gap-2 text-gray-700">
                  <div className="mt-1 flex-shrink-0 h-4 w-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs">•</div>
                  <span>{t(`safety.tip${tipNum}`, [
                    "Ne payez jamais d'avance sans voir l'article",
                    "Rencontrez le vendeur dans un lieu public",
                    "Vérifiez le produit avant de l'acheter",
                    "Méfiez-vous des prix trop bas"
                  ][tipNum - 1])}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/safety"
              className="mt-5 flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {t('safety.learnMore', 'En savoir plus sur la sécurité')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;