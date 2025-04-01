import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Heart, Loader2, Eye, MapPin } from 'lucide-react';
import ImageGallery from '../components/ImageGallery';

interface FavoriteListing {
    id: string;
    listing_id: string;
    created_at: string;
    listing: {
        id: string;
        title: string;
        price: number;
        city: string;
        region: string;
        images: string[];
        views: number;
        favorites: number;
        status: string;
        user_id: string;
    };
}

export default function FavoritesPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) return;

            try {
                setIsLoading(true);
                setError(null);

                const { data, error: fetchError } = await supabase
                    .from('favorites')
                    .select(`
            id,
            listing_id,
            created_at,
            listing:listings (
              id,
              title,
              price,
              city,
              region,
              images,
              views,
              favorites,
              status,
              user_id
            )
          `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (fetchError) throw fetchError;

                setFavorites(data as FavoriteListing[]);
            } catch (err: any) {
                console.error('Error fetching favorites:', err);
                setError(err.message || t('favorites.fetchError'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavorites();
    }, [user, t]);

    const handleRemoveFavorite = async (favoriteId: string) => {
        try {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('id', favoriteId);

            if (error) throw error;

            setFavorites(favorites.filter(fav => fav.id !== favoriteId));
        } catch (err) {
            console.error('Error removing favorite:', err);
            setError(t('favorites.removeError'));
        }
    };

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">{t('favorites.authRequired')}</h2>
                    <p className="mb-4">{t('favorites.authDescription')}</p>
                    <Link
                        to="/auth"
                        className="btn btn-primary inline-flex items-center"
                    >
                        {t('auth.signIn')}
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">{t('favorites.title')}</h1>
                <p className="text-gray-500 mt-2">
                    {t('favorites.subtitle', { count: favorites.length })}
                </p>
            </div>

            {favorites.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t('favorites.emptyTitle')}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {t('favorites.emptyDescription')}
                    </p>
                    <Link
                        to="/"
                        className="btn btn-primary inline-flex items-center"
                    >
                        {t('favorites.browseListings')}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((favorite) => (
                        <div key={favorite.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <Link
                                to={`/listing/${favorite.listing.id}`}
                                className="block"
                            >
                                <div className="aspect-square overflow-hidden">
                                    <ImageGallery images={[favorite.listing.images[0]]} />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium text-gray-900 line-clamp-2">
                                        {favorite.listing.title}
                                    </h3>
                                    <p className="mt-1 text-lg font-semibold text-primary">
                                        {favorite.listing.price.toLocaleString()} MAD
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                        <MapPin className="h-4 w-4" />
                                        <span>{favorite.listing.city}, {favorite.listing.region}</span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            <span>{favorite.listing.views}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                                            <span>{favorite.listing.favorites}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            <div className="border-t px-4 py-3 bg-gray-50">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleRemoveFavorite(favorite.id);
                                    }}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-2"
                                >
                                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                                    {t('favorites.remove')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}