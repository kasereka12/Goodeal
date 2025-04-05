import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { categories, CategoryId } from '../lib/categories';
import { ArrowLeft, ArrowUpDown, ArrowDown, ArrowUp, Filter, Clock, CreditCard } from 'lucide-react';
import Filters from '../components/Filters';
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
}

export default function CategoryListings() {
  const { category } = useParams<{ category: CategoryId }>();
  const location = useLocation();
  const categoryData = category ? categories[category] : null;
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [transactionType, setTransactionType] = useState<'achat' | 'location' | null>(null);

  // Sorting state
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mobile filter sidebar state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch category listings
  useEffect(() => {
    const fetchCategoryListings = async () => {
      if (!category) return;

      try {
        setIsLoading(true);
        setError(null);


        let query = supabase
          .from('listings')
          .select('*')
          .eq('status', 'active');

        // Vérifier si une catégorie est définie, sinon récupérer toutes les annonces actives
        if (category !== null) {
          query = query.eq('category', category);
        }
        // Apply transaction type filter if set
        if (transactionType) {
          query = query.eq('transaction_type', transactionType);
        }

        // Apply other filters
        if (activeFilters) {
          Object.entries(activeFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
              // For boolean filters
              if (typeof value === 'boolean') {
                query = query.eq(`filters->>${key}`, value);
              }
              // For range filters
              else if (typeof value === 'number') {
                query = query.gte(`filters->>${key}`, value);
              }
              // For select filters
              else {
                query = query.eq(`filters->>${key}`, value);
              }
            }
          });
        }

        // Apply sorting
        if (sortBy === 'price') {
          query = query.order('price', { ascending: sortOrder === 'asc' });
        } else {
          query = query.order('created_at', { ascending: sortOrder === 'asc' });
        }

        const { data, error } = await query;

        if (error) throw error;
        setListings(data || []);
      } catch (err: any) {
        console.error('Error fetching category listings:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryListings();
  }, [category, activeFilters, transactionType, sortBy, sortOrder]);

  // Handle filter changes
  const handleFilterChange = (filters: Record<string, any>) => {
    // Extract transaction_type from filters if present
    if (filters.transaction_type) {
      setTransactionType(filters.transaction_type as 'achat' | 'location');

      // Remove transaction_type from filters object to avoid duplication
      const { transaction_type, ...otherFilters } = filters;
      setActiveFilters(otherFilters);
    } else {
      setActiveFilters(filters);
    }
  };

  // Handle sort change
  const handleSortChange = (newSortBy: 'date' | 'price') => {
    if (sortBy === newSortBy) {
      // Toggle order if clicking the same sort option
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field with default order
      setSortBy(newSortBy);
      setSortOrder(newSortBy === 'price' ? 'asc' : 'desc'); // Default: price ascending, date descending
    }
  };

  if (!categoryData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-800">Catégorie non trouvée</h2>
          <p className="mt-2 text-gray-600">La catégorie que vous recherchez n'existe pas</p>
          <Link to="/" className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const Icon = categoryData.icon;
  const totalActiveFilters = Object.keys(activeFilters).length + (transactionType ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold text-gray-900">{categoryData.label}</h1>
              </div>
            </div>

            {/* Mobile filter button */}
            <button
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Filtres</h3>
                {totalActiveFilters > 0 && (
                  <button
                    onClick={() => {
                      setActiveFilters({});
                      setTransactionType(null);
                    }}
                    className="text-primary text-sm hover:underline transition"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
              <Filters
                category={category}
                onFilterChange={handleFilterChange}
                initialValues={activeFilters}
              />
            </div>
          </div>

          {/* Mobile filter sidebar */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)}></div>
              <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl flex flex-col">
                <div className="px-4 py-5 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Filtres</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <Filters
                    category={category}
                    onFilterChange={handleFilterChange}
                    initialValues={activeFilters}
                  />
                </div>
                <div className="p-4 border-t">
                  <div className="grid grid-cols-2 gap-3">
                    {totalActiveFilters > 0 && (
                      <button
                        onClick={() => {
                          setActiveFilters({});
                          setTransactionType(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Réinitialiser
                      </button>
                    )}
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Appliquer ({listings.length})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Listings */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sort controls */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Trier par :</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSortChange('date')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${sortBy === 'date'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Date
                      {sortBy === 'date' && (
                        sortOrder === 'desc'
                          ? <ArrowDown className="h-3.5 w-3.5 ml-1" />
                          : <ArrowUp className="h-3.5 w-3.5 ml-1" />
                      )}
                    </button>
                    <button
                      onClick={() => handleSortChange('price')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${sortBy === 'price'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      Prix
                      {sortBy === 'price' && (
                        sortOrder === 'asc'
                          ? <ArrowUp className="h-3.5 w-3.5 ml-1" />
                          : <ArrowDown className="h-3.5 w-3.5 ml-1" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  {isLoading ? 'Chargement...' : `${listings.length} résultat${listings.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {isLoading ? (
              // Loading skeletons
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="aspect-[4/3] bg-gray-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                        <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                        <div className="h-6 bg-gray-200 rounded-full w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-500 p-6 rounded-xl shadow-sm">
                <p className="font-medium">Une erreur est survenue</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/listings/${listing.id}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
                          }}
                        />
                        {/* Badge pour le type de transaction */}
                        {listing.transaction_type && (
                          <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-medium shadow-sm ${listing.transaction_type === 'location'
                            ? 'bg-blue-500 text-white'
                            : 'bg-green-500 text-white'
                            }`}>
                            {listing.transaction_type === 'location' ? 'Location' : 'Vente'}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                            {listing.city}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                          {listing.title}
                        </h3>
                        <p className="text-primary font-bold mt-3 flex items-baseline">
                          <span className="text-lg">{listing.price.toLocaleString()} MAD</span>
                          {listing.transaction_type === 'location' && (
                            <span className="text-sm font-normal text-gray-500 ml-1">
                              {category === 'immobilier' ? '/mois' : '/jour'}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}

                {listings.length === 0 && (
                  <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <Icon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">Aucune annonce trouvée</h3>
                    <p className="mt-2 text-gray-500 max-w-md mx-auto">
                      Nous n'avons trouvé aucune annonce correspondant à vos critères de recherche.
                    </p>
                    {totalActiveFilters > 0 && (
                      <button
                        onClick={() => {
                          setActiveFilters({});
                          setTransactionType(null);
                        }}
                        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Réinitialiser les filtres
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}