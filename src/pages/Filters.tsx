import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, CategoryId } from '../lib/categories';
import { Search, ArrowLeft, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
import CitySelect from '../components/CitySelect';
import type { City } from '../lib/cities';

export default function Filters() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [transactionType, setTransactionType] = useState<'achat' | 'location' | ''>('');
  
  // Sorting state
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleApplyFilters = () => {
    const queryParams = new URLSearchParams();
    
    if (selectedCategory) {
      queryParams.set('category', selectedCategory);
    }
    
    if (selectedCity) {
      queryParams.set('city', selectedCity.name);
    }
    
    if (priceRange.min) {
      queryParams.set('minPrice', priceRange.min);
    }
    
    if (priceRange.max) {
      queryParams.set('maxPrice', priceRange.max);
    }
    
    // Add transaction type if selected and category is real estate or vehicles
    if (transactionType && (selectedCategory === 'immobilier' || selectedCategory === 'vehicules')) {
      queryParams.set('transaction_type', transactionType);
    }
    
    // Add sorting parameters
    queryParams.set('sortBy', sortBy);
    queryParams.set('sortOrder', sortOrder);

    // Ajouter les filtres spécifiques à la catégorie
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.set(key, value.toString());
      }
    });

    navigate(`/search?${queryParams.toString()}`);
  };

  // Déterminer si le type de transaction doit être affiché
  const showTransactionType = selectedCategory === 'immobilier' || selectedCategory === 'vehicules';
  
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Filtres avancés</h1>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedCity(null);
                setPriceRange({ min: '', max: '' });
                setFilters({});
                setTransactionType('');
                setSortBy('date');
                setSortOrder('desc');
              }}
              className="text-sm text-primary hover:underline"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Catégories */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Catégories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(categories).map(([id, category]) => {
              const Icon = category.icon;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id as CategoryId)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                    selectedCategory === id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 bg-white hover:border-primary/50'
                  }`}
                >
                  <Icon className="h-6 w-6 mb-2" />
                  <span className="text-sm text-center">{category.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Type de transaction (achat/location) pour immobilier et vehicules */}
        {showTransactionType && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Type de transaction</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTransactionType('achat')}
                className={`flex items-center justify-center p-4 rounded-lg border ${
                  transactionType === 'achat'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 bg-white hover:border-primary/50'
                }`}
              >
                <span className="text-sm font-medium">Achat</span>
              </button>
              <button
                onClick={() => setTransactionType('location')}
                className={`flex items-center justify-center p-4 rounded-lg border ${
                  transactionType === 'location'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 bg-white hover:border-primary/50'
                }`}
              >
                <span className="text-sm font-medium">Location</span>
              </button>
            </div>
          </section>
        )}
        
        {/* Tri */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Trier par</h2>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSortBy('date');
                setSortOrder('desc');
              }}
              className={`flex items-center justify-between w-full p-4 rounded-lg border ${
                sortBy === 'date' && sortOrder === 'desc'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 bg-white hover:border-primary/50'
              }`}
            >
              <span className="text-sm font-medium">Plus récent</span>
              {sortBy === 'date' && sortOrder === 'desc' && <ArrowDown className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => {
                setSortBy('date');
                setSortOrder('asc');
              }}
              className={`flex items-center justify-between w-full p-4 rounded-lg border ${
                sortBy === 'date' && sortOrder === 'asc'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 bg-white hover:border-primary/50'
              }`}
            >
              <span className="text-sm font-medium">Plus ancien</span>
              {sortBy === 'date' && sortOrder === 'asc' && <ArrowUp className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => {
                setSortBy('price');
                setSortOrder('asc');
              }}
              className={`flex items-center justify-between w-full p-4 rounded-lg border ${
                sortBy === 'price' && sortOrder === 'asc'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 bg-white hover:border-primary/50'
              }`}
            >
              <span className="text-sm font-medium">Prix croissant</span>
              {sortBy === 'price' && sortOrder === 'asc' && <ArrowUp className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => {
                setSortBy('price');
                setSortOrder('desc');
              }}
              className={`flex items-center justify-between w-full p-4 rounded-lg border ${
                sortBy === 'price' && sortOrder === 'desc'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 bg-white hover:border-primary/50'
              }`}
            >
              <span className="text-sm font-medium">Prix décroissant</span>
              {sortBy === 'price' && sortOrder === 'desc' && <ArrowDown className="h-4 w-4" />}
            </button>
          </div>
        </section>

        {/* Localisation */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Localisation</h2>
          <CitySelect
            value={selectedCity?.name}
            onChange={setSelectedCity}
            placeholder="Sélectionnez une ville"
          />
        </section>

        {/* Prix */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Prix</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Prix minimum</label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                placeholder="0"
                className="input"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Prix maximum</label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                placeholder="Maximum"
                className="input"
                min="0"
              />
            </div>
          </div>
        </section>

        {/* Filtres spécifiques à la catégorie */}
        {selectedCategory && (
          <section>
            <h2 className="text-lg font-semibold mb-4">
              Filtres pour {categories[selectedCategory].label}
            </h2>
            <div className="space-y-4">
              {Object.entries(categories[selectedCategory].filters).map(([id, filter]) => {
                // Skip transaction_type as it's already handled separately
                if (id === 'transaction_type') return null;
                
                switch (filter.type) {
                  case 'select':
                    return (
                      <div key={id}>
                        <label className="block text-sm text-gray-600 mb-1">
                          {filter.label}
                        </label>
                        <select
                          className="input"
                          value={filters[id] || ''}
                          onChange={(e) => setFilters({ ...filters, [id]: e.target.value })}
                        >
                          <option value="">Tous</option>
                          {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );

                  case 'range':
                    return (
                      <div key={id}>
                        <label className="block text-sm text-gray-600 mb-1">
                          {filter.label}
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={filter.min}
                            max={filter.max}
                            step={filter.step}
                            value={filters[id] || filter.min}
                            onChange={(e) =>
                              setFilters({ ...filters, [id]: e.target.value })
                            }
                            className="w-full"
                          />
                          <span className="text-sm text-gray-600 whitespace-nowrap min-w-[60px]">
                            {filters[id] || filter.min}
                            {filter.unit ? ` ${filter.unit}` : ''}
                          </span>
                        </div>
                      </div>
                    );

                  case 'boolean':
                    return (
                      <div key={id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={id}
                          checked={filters[id] || false}
                          onChange={(e) =>
                            setFilters({ ...filters, [id]: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor={id} className="text-sm text-gray-600">
                          {filter.label}
                        </label>
                      </div>
                    );

                  default:
                    return null;
                }
              })}
            </div>
          </section>
        )}

        {/* Bouton Appliquer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4">
          <div className="container mx-auto">
            <button
              onClick={handleApplyFilters}
              className="btn btn-primary w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}