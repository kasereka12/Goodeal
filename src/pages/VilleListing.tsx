import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowDown, ArrowUp, Filter, Clock, CreditCard, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Listing {
    id: string;
    title: string;
    price: number;
    city: string;
    images: string[];
    category: string;
    transaction_type?: 'achat' | 'location';
    created_at: string;
    filters?: Record<string, any>;
}

export default function VilleListings() {
    const { ville } = useParams<{ ville: string }>();
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        transaction_type: '',
        price_max: '',
        category: ''
    });
    const [sortBy, setSortBy] = useState<'created_at' | 'price'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        const fetchListings = async () => {
            if (!ville) return;
            
            try {
                setIsLoading(true);
                setError(null);

                let query = supabase
                    .from('listings')
                    .select('*')
                    .eq('status', 'active')
                    .ilike('city', `%${ville}%`);

                // Apply transaction type filter
                if (filters.transaction_type) {
                    query = query.eq('transaction_type', filters.transaction_type);
                }

                // Apply price filter
                if (filters.price_max) {
                    const price = Number(filters.price_max);
                    if (!isNaN(price)) {
                        query = query.lte('price', price);
                    }
                }

                // Apply category filter
                if (filters.category) {
                    query = query.eq('category', filters.category);
                }

                // Apply sorting
                query = query.order(sortBy, { ascending: sortOrder === 'asc' });

                const { data, error } = await query;

                if (error) throw error;
                setListings(data || []);
            } catch (err: any) {
                console.error('Error fetching listings:', err);
                setError(err.message);
                setListings([]);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchListings();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [ville, filters, sortBy, sortOrder]);

    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSortChange = (newSortBy: 'created_at' | 'price') => {
        if (sortBy === newSortBy) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder(newSortBy === 'price' ? 'asc' : 'desc');
        }
    };

    const resetFilters = () => {
        setFilters({
            transaction_type: '',
            price_max: '',
            category: ''
        });
    };

    const totalActiveFilters = Object.values(filters).filter(v => v !== '').length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4">
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                <h1 className="text-lg font-semibold text-gray-900">Annonces à {ville}</h1>
                            </div>
                        </div>

                        <button
                            className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 transition-colors"
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                        >
                            <Filter className="h-4 w-4" />
                            Filtres
                            {totalActiveFilters > 0 && (
                                <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {totalActiveFilters}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Desktop Filters */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-5 sticky top-20">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-800">Filtres</h3>
                                {totalActiveFilters > 0 && (
                                    <button
                                        onClick={resetFilters}
                                        className="text-primary text-sm hover:underline"
                                    >
                                        Réinitialiser
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Transaction Type Filter */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Type de transaction
                                    </label>
                                    <select
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                                        value={filters.transaction_type}
                                        onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
                                    >
                                        <option value="">Tous</option>
                                        <option value="achat">Achat</option>
                                        <option value="location">Location</option>
                                    </select>
                                </div>

                                {/* Price Filter */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Prix maximum
                                    </label>
                                    <input
                                        type="number"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        placeholder="Prix max (MAD)"
                                        value={filters.price_max}
                                        onChange={(e) => handleFilterChange('price_max', e.target.value)}
                                        min="0"
                                    />
                                </div>

                                {/* Category Filter */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Catégorie
                                    </label>
                                    <select
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                    >
                                        <option value="">Toutes catégories</option>
                                        <option value="immobilier">Immobilier</option>
                                        <option value="vehicules">Véhicules</option>
                                        <option value="emploi">Emploi</option>
                                        <option value="services">Services</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Listings */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Sort Controls */}
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Trier par :</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSortChange('created_at')}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${sortBy === 'created_at'
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <Clock className="h-3.5 w-3.5" />
                                            Date
                                            {sortBy === 'created_at' && (
                                                sortOrder === 'desc' ? (
                                                    <ArrowDown className="h-3.5 w-3.5 ml-1" />
                                                ) : (
                                                    <ArrowUp className="h-3.5 w-3.5 ml-1" />
                                                )
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleSortChange('price')}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${sortBy === 'price'
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <CreditCard className="h-3.5 w-3.5" />
                                            Prix
                                            {sortBy === 'price' && (
                                                sortOrder === 'asc' ? (
                                                    <ArrowUp className="h-3.5 w-3.5 ml-1" />
                                                ) : (
                                                    <ArrowDown className="h-3.5 w-3.5 ml-1" />
                                                )
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {isLoading ? 'Chargement...' : `${listings.length} résultat${listings.length !== 1 ? 's' : ''}`}
                                </p>
                            </div>
                        </div>

                        {/* Results */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm overflow-hidden">
                                        <div className="aspect-[4/3] bg-gray-200" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                                            <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                                            <div className="h-6 bg-gray-200 rounded-full w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-500 p-6 rounded-xl shadow-sm">
                                <p className="font-medium">Erreur</p>
                                <p className="mt-1 text-sm">{error}</p>
                            </div>
                        ) : listings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {listings.map((listing) => (
                                    <Link
                                        key={listing.id}
                                        to={`/listings/${listing.id}`}
                                        className="block group"
                                    >
                                        <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                                            <div className="aspect-[4/3] relative overflow-hidden">
                                                <img
                                                    src={listing.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
                                                    alt={listing.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {listing.transaction_type && (
                                                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-medium shadow-sm ${listing.transaction_type === 'location' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                                                        }`}>
                                                        {listing.transaction_type === 'location' ? 'Location' : 'Vente'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm text-gray-500 flex items-center">
                                                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                                        {listing.city}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                                <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                                                    {listing.title}
                                                </h3>
                                                <p className="text-primary font-bold mt-3 flex items-baseline">
                                                    <span className="text-lg">{listing.price.toLocaleString()} MAD</span>
                                                    {listing.transaction_type === 'location' && (
                                                        <span className="text-sm font-normal text-gray-500 ml-1">
                                                            {listing.category === 'immobilier' ? '/mois' : '/jour'}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <MapPin className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-800">Aucune annonce trouvée</h3>
                                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                                    Aucune annonce ne correspond à vos critères à {ville}.
                                </p>
                                {totalActiveFilters > 0 && (
                                    <button
                                        onClick={resetFilters}
                                        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}