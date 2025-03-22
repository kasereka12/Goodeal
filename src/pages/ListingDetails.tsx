import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Heart, Share2, MapPin, Eye, Copy, Check, Facebook, Twitter, Apple as WhatsApp, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ImageGallery from '../components/ImageGallery';

// Interface pour les détails d'une annonce
interface ListingDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  region: string;
  category: string;
  subcategory?: string;
  images: string[];
  filters: Record<string, any>;
  views: number;
  favorites: number;
  transaction_type?: 'achat' | 'location';
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

// Menu de partage
function ShareMenu({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Vérifier si l'API de partage est disponible
  const canShare = () => {
    try {
      return navigator.share && navigator.canShare({ url, title });
    } catch {
      return false;
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: WhatsApp,
      url: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
  ];

  const handleShare = async (e: React.MouseEvent, option: typeof shareOptions[0]) => {
    e.preventDefault();

    // Essayer d'utiliser l'API de partage native si disponible
    if (canShare()) {
      try {
        await navigator.share({
          title,
          url,
        });
        onClose();
        return;
      } catch (error) {
        // Si l'utilisateur annule ou si une erreur se produit, continuer avec le lien de partage
        console.log('Fallback to share link');
      }
    }

    // Ouvrir dans une nouvelle fenêtre
    window.open(
      option.url,
      'share-dialog',
      'width=600,height=400,location=no,menubar=no,toolbar=no'
    );
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50">
      {shareOptions.map((option) => (
        <a
          key={option.name}
          href={option.url}
          onClick={(e) => handleShare(e, option)}
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <option.icon className="h-4 w-4" />
          <span className="text-sm">{option.name}</span>
        </a>
      ))}
      <button
        onClick={copyToClipboard}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        <span className="text-sm">{copied ? 'Copié !' : 'Copier le lien'}</span>
      </button>
    </div>
  );
}

// Composant pour les informations du vendeur
function SellerInfo({ user_data }: { user_data: ListingDetails['user_data'] }) {
  const displayName = user_data.user_metadata?.display_name || user_data.email.split('@')[0];

  const id = user_data?.id;
  const memberSince = new Date(user_data.created_at).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  });
  console.log(id);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-4">
        {user_data.user_metadata?.avatar_url ? (
          <img
            src={user_data.user_metadata.avatar_url}
            alt={displayName}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-2xl font-semibold text-gray-500">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-lg">{displayName}</h3>
          <p className="text-sm text-gray-500">
            Membre depuis {memberSince}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <Link to={`/chat/${user_data.id}`} className="btn btn-primary w-full flex items-center justify-center">
          <MessageSquare className="mr-2 h-4 w-4" />
          Contacter le vendeur
        </Link>

        <button className="btn btn-secondary w-full">
          Voir le profil
        </button>
      </div>
    </div>
  );
}

function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('listings_with_users')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Listing not found');

        setListing(data);

        // Increment view count
        const { error: updateError } = await supabase
          .from('listings')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', id);

        if (updateError) console.error('Error incrementing views:', updateError);

      } catch (err: any) {
        console.error('Error fetching listing:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchListing();
  }, [id]);

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      setIsFavorite(!isFavorite);
      // TODO: Implémenter la logique de sauvegarde dans la base de données
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      setIsFavorite(isFavorite);
    }
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-6 rounded-lg text-center">
          <p className="text-lg font-medium">
            {error || "Cette annonce n'existe pas ou a été supprimée"}
          </p>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* En-tête mobile */}
          <div className="lg:hidden">
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <p className="text-3xl font-bold text-primary mt-2">
              {listing.price.toLocaleString()} MAD
              {listing.transaction_type === 'location' && (
                <span className="text-sm font-normal text-gray-500">
                  {listing.category === 'immobilier' ? '/mois' : '/jour'}
                </span>
              )}
            </p>
            {/* Badge pour le type de transaction */}
            {listing.transaction_type && (
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${listing.transaction_type === 'location'
                  ? 'bg-blue-500 text-white'
                  : 'bg-green-500 text-white'
                  }`}>
                  {listing.transaction_type === 'location' ? 'Location' : 'Vente'}
                </span>
              </div>
            )}
          </div>

          {/* Galerie d'images */}
          <ImageGallery images={listing.images} />

          {/* Actions mobiles */}
          <div className="flex gap-4 lg:hidden">
            <button
              onClick={toggleFavorite}
              className={`btn flex-1 ${isFavorite ? 'btn-primary' : 'btn-secondary'
                }`}
            >
              <Heart
                className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`}
              />
              {isFavorite ? 'Sauvegardé' : 'Sauvegarder'}
            </button>
            <div className="relative">
              <button onClick={handleShare} className="btn btn-secondary">
                <Share2 className="h-4 w-4" />
              </button>
              {showShareMenu && (
                <ShareMenu
                  url={window.location.href}
                  title={listing.title}
                  onClose={() => setShowShareMenu(false)}
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="text-gray-600 whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Caractéristiques */}
          {Object.keys(listing.filters).length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Caractéristiques</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {Object.entries(listing.filters).map(([key, value]) => {
                  // Skip transaction_type as it's displayed elsewhere
                  if (key === 'transaction_type') return null;

                  return (
                    <div key={key}>
                      <dt className="text-sm text-gray-500 capitalize">
                        {key.replace('_', ' ')}
                      </dt>
                      <dd className="text-gray-900 mt-1">
                        {typeof value === 'boolean'
                          ? value
                            ? 'Oui'
                            : 'Non'
                          : value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}

          {/* Localisation */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Localisation</h2>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-5 w-5" />
              <span>{listing.city}, {listing.region}</span>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* En-tête desktop */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <p className="text-3xl font-bold text-primary mt-2">
              {listing.price.toLocaleString()} MAD
              {listing.transaction_type === 'location' && (
                <span className="text-sm font-normal text-gray-500">
                  {listing.category === 'immobilier' ? '/mois' : '/jour'}
                </span>
              )}
            </p>

            {/* Badge pour le type de transaction */}
            {listing.transaction_type && (
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${listing.transaction_type === 'location'
                  ? 'bg-blue-500 text-white'
                  : 'bg-green-500 text-white'
                  }`}>
                  {listing.transaction_type === 'location' ? 'Location' : 'Vente'}
                </span>
              </div>
            )}

            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{listing.views} vues</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{listing.favorites} favoris</span>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={toggleFavorite}
                className={`btn flex-1 ${isFavorite ? 'btn-primary' : 'btn-secondary'
                  }`}
              >
                <Heart
                  className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`}
                />
                {isFavorite ? 'Sauvegardé' : 'Sauvegarder'}
              </button>
              <div className="relative">
                <button onClick={handleShare} className="btn btn-secondary">
                  <Share2 className="h-4 w-4" />
                </button>
                {showShareMenu && (
                  <ShareMenu
                    url={window.location.href}
                    title={listing.title}
                    onClose={() => setShowShareMenu(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Informations vendeur */}
          <SellerInfo user_data={listing.user_data} />

          {/* Sécurité */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Conseils de sécurité</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Ne payez jamais d'avance sans voir l'article</li>
              <li>• Rencontrez le vendeur dans un lieu public</li>
              <li>• Vérifiez le produit avant de l'acheter</li>
              <li>• Méfiez-vous des prix trop bas</li>
            </ul>
            <Link
              to="/safety"
              className="text-primary hover:underline text-sm block mt-4"
            >
              En savoir plus sur la sécurité
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingDetails;