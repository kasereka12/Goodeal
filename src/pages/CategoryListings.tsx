import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { categories, CategoryId } from '../lib/categories';
import { ArrowLeft, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
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

  // Fetch category listings
  useEffect(() => {
    const fetchCategoryListings = async () => {
      if (!category) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Build query
        let query = supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .eq('category', category);
        
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
    return <div>Catégorie non trouvée</div>;
  }

  const Icon = categoryData.icon;

  return (
    <div className="min-h-screen bg-page-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center gap-4">
            <Link
              to="/"
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              <h1 className="text-lg font-semibold">{categoryData.label}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtres */}
          <div className="lg:col-span-1">
            <Filters
              category={category}
              onFilterChange={handleFilterChange}
              initialValues={activeFilters}
            />
          </div>

          {/* Listings */}
          <div className="lg:col-span-3">
            {/* Sorting options */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Trier par :</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSortChange('date')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm ${
                      sortBy === 'date' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Date
                    {sortBy === 'date' && (
                      sortOrder === 'desc' 
                        ? <ArrowDown className="h-3.5 w-3.5 ml-1" /> 
                        : <ArrowUp className="h-3.5 w-3.5 ml-1" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSortChange('price')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm ${
                      sortBy === 'price' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Prix
                    {sortBy === 'price' && (
                      sortOrder === 'asc' 
                        ? <ArrowUp className="h-3.5 w-3.5 ml-1" /> 
                        : <ArrowDown className="h-3.5 w-3.5 ml-1" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              // Loading skeletons
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="aspect-[4/3] bg-gray-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-500 p-4 rounded-lg">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/listings/${listing.id}`}
                    className="block"
                  >
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-[4/3] relative">
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
                          }}
                        />
                        {/* Badge pour le type de transaction */}
                        {listing.transaction_type && (
                          <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium ${
                            listing.transaction_type === 'location' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-green-500 text-white'
                          }`}>
                            {listing.transaction_type === 'location' ? 'Location' : 'Vente'}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 line-clamp-1">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {listing.city}
                        </p>
                        <p className="text-primary font-bold mt-2">
                          {listing.price.toLocaleString()} MAD
                          {listing.transaction_type === 'location' && (
                            <span className="text-sm font-normal text-gray-500">
                              {category === 'immobilier' ? '/mois' : '/jour'}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}

                {listings.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">
                      Aucune annonce trouvée dans cette catégorie
                    </p>
                    {Object.keys(activeFilters).length > 0 && (
                      <button
                        onClick={() => {
                          setActiveFilters({});
                          setTransactionType(null);
                        }}
                        className="text-primary hover:underline mt-2"
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