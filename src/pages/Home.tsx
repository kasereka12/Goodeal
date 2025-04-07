import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ArrowRight, MapPin, Car, Building2, Wrench, Palette, SlidersHorizontal, X, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import CitySelect from '../components/CitySelect';
import type { City } from '../lib/cities';

// Configuration des images
const HERO_IMAGE = 'https://eczqxyibzosgaktrmozt.supabase.co/storage/v1/object/public/assets/HOW-TO-CHOOSE-WEBSITE-FOR-CHILDREN-TO-LEARN-QURAN-ONLINE.jpg';
const GYM_HERO = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop';

// Images des villes
const CITY_IMAGES = {
  casablanca: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  rabat: 'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  marrakech: 'https://images.unsplash.com/photo-1518976024611-28bf4b48222e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1985&q=80',
  tanger: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1974&q=80',
  agadir: 'https://images.unsplash.com/photo-1596422846543-75e6b59a259d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80',
  fes: 'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
};

interface Listing {
  id: string;
  title: string;
  price: number;
  city: string;
  images: string[];
  category: string;
  transaction_type?: 'location' | 'achat';
  created_at: string;
}

const Home = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    transactionType: ''
  });

  // Charger les annonces avec filtres
  const fetchListings = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .limit(8);

      if (filters.category) query = query.eq('category', filters.category);
      if (filters.city) query = query.eq('city', filters.city);
      if (filters.minPrice) query = query.gte('price', Number(filters.minPrice));
      if (filters.maxPrice) query = query.lte('price', Number(filters.maxPrice));
      if (filters.transactionType) query = query.eq('transaction_type', filters.transactionType);

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      transactionType: ''
    });
    setSelectedCity(null);
  };

  const handleViewMore = () => {
    if (filters.category) {
      navigate(`/category/${filters.category}`);
    } else if (filters.city) {
      navigate(`/city/${filters.city}`);
    } else {
      navigate('/category/');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${searchQuery}`);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    navigate(`/search?q=${tag}`);
  };

  // Navigation tabs configuration
  const NAVIGATION_TABS = [
    {
      id: 'immobilier',
      icon: Building2,
      label: 'Immobilier'
    },
    {
      id: 'vehicules',
      icon: Car,
      label: 'Véhicules'
    },
    {
      id: 'services',
      icon: Wrench,
      label: 'Services'
    },
    {
      id: 'artisanat',
      icon: Palette,
      label: 'Artisanat'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative text-white">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Hero"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/80" />
        </div>

        <div className="relative container mx-auto px-4 py-32 sm:py-40 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center max-w-3xl leading-tight">
            {t('home.heroTitle', 'Trouvez ce qui vous')} <span className="text-blue-200">{t('home.heroHighlight', 'correspond')}</span>
          </h1>
          <p className="text-xl text-blue-50/90 mb-10 text-center max-w-2xl">
            {t('home.heroSubtitle', 'Des milliers d\'annonces à travers tout le Maroc, prêtes à être découvertes')}
          </p>

          {/* Nouvelle barre de recherche avec onglets */}
          <div className="w-full max-w-5xl">
            <div className="flex justify-center items-center mb-6">
              <div className="flex gap-4 flex-1 justify-center">
                {NAVIGATION_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleFilterChange('category', tab.id)}
                      className={`flex-1 max-w-[180px] flex items-center justify-center gap-2 px-4 py-3 transition-all rounded-lg ${filters.category === tab.id
                        ? 'bg-gradient-to-r from-[#00A5E7] to-[#0095D1] text-white shadow-md transform scale-105'
                        : 'bg-white/20 text-white hover:bg-white/30 hover:shadow-sm'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSearch} className="w-full">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full shadow-lg overflow-hidden p-1.5 border border-white/20">
                <input
                  type="text"
                  placeholder={t('search.placeholder', 'Que recherchez-vous ?')}
                  className="flex-grow py-4 px-6 bg-transparent text-white placeholder-blue-100 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="p-3 mx-1 text-white hover:bg-white/10 rounded-full transition-colors"
                  onClick={() => setShowFilters(true)}
                  aria-label={t('filters.title', 'Filtres')}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 transition-colors"
                  aria-label={t('search.button', 'Rechercher')}
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>

          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            <span className="text-sm text-blue-100">
              {t('home.popularTags', 'Populaires')}:
            </span>
            {[
              { id: 'appartements', fr: 'Appartements', en: 'Apartments' },
              { id: 'voitures', fr: 'Voitures', en: 'Cars' },
              { id: 'cours', fr: 'Cours', en: 'Courses' },
              { id: 'mobilier', fr: 'Mobilier', en: 'Furniture' }
            ].map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.fr)}
                className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
              >
                {language === 'en' ? tag.en : tag.fr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-12">
        {/* Annonces */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center after:content-[''] after:ml-6 after:h-px after:w-12 after:bg-blue-200">
              {filters.category
                ? t(`categories.${filters.category}`, filters.category)
                : t('listing.recent', 'Annonces récentes')}
            </h2>
            <button
              onClick={handleViewMore}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 font-medium transition-colors"
            >
              {t('actions.seeMore', 'Voir plus')} <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                    <div className="h-5 bg-gray-200 rounded-full w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/listings/${listing.id}`}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] flex flex-col h-full border border-gray-100"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={listing.images[0] || 'https://placehold.co/600x400?text=No+Image'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {listing.transaction_type && (
                      <span className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${listing.transaction_type === 'location'
                        ? 'bg-blue-600 text-white'
                        : 'bg-emerald-600 text-white'
                        }`}>
                        {listing.transaction_type === 'location'
                          ? t('listing.forRent', 'À louer')
                          : t('listing.forSale', 'À vendre')}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-800 line-clamp-1 hover:text-blue-600 transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center mb-2">
                        <MapPin className="mr-1 h-3.5 w-3.5" /> {listing.city}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-100 mt-auto">
                      <p className="text-blue-600 font-bold">
                        {listing.price.toLocaleString()} MAD
                        {listing.transaction_type === 'location' && (
                          <span className="text-sm font-normal text-gray-500">
                            /{t('listing.perMonth', 'mois')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-50 rounded-full">
                  <Search className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2">
                {t('listings.noResults', 'Aucune annonce trouvée')}
              </h3>
              <p className="text-gray-500 mb-6">
                {t('listings.tryDifferentFilters', 'Essayez de modifier vos critères de recherche')}
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors"
              >
                {t('actions.resetFilters', 'Réinitialiser les filtres')}
              </button>
            </div>
          )}
        </section>

        {/* Urbain Five - Section modernisée */}
        <section className="mb-16">
          <div className="relative rounded-3xl shadow-xl overflow-hidden">
            <img
              src={GYM_HERO}
              alt="Urbain Five"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            <div className="relative py-20 px-8 md:px-16 max-w-2xl">
              <div className="flex items-center mb-6">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                  <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                </div>
                <span className="ml-3 text-white/80 font-medium text-sm uppercase tracking-wider">
                  {t('listing.sponsored', 'Sponsorisé')}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {t('urbainFive.title', 'Découvrez Urbain')} <span className="text-blue-400">Five</span>
              </h2>
              <p className="text-white/90 text-lg mb-8 leading-relaxed">
                {t('urbainFive.description', 'Votre salle de sport premium en plein cœur de la ville. Equipements de dernière génération et cours exclusifs.')}
              </p>
              <a
                href="https://urbainfive.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-900 px-8 py-3.5 rounded-full font-bold hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
              >
                {t('urbainFive.cta', 'Visiter le site')} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Villes populaires - Design modernisé */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-8 flex items-center after:content-[''] after:ml-6 after:h-px after:flex-grow after:bg-gray-200">
            {t('home.popularCities', 'Villes populaires')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'casablanca', name: 'Casablanca' },
              { id: 'rabat', name: 'Rabat' },
              { id: 'marrakech', name: 'Marrakech' },
              { id: 'tanger', name: 'Tanger' },
              { id: 'agadir', name: 'Agadir' },
              { id: 'fes', name: 'Fès' }
            ].map((city) => (
              <Link
                key={city.id}
                to={`/ville/${city.id}`}
                className="group relative h-64 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              >
                <img
                  src={CITY_IMAGES[city.id as keyof typeof CITY_IMAGES]}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Non+Disponible';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 group-hover:from-black/80 transition-all" />
                <div className="absolute inset-0 flex flex-col items-center justify-end p-6">
                  <h3 className="text-white font-bold text-2xl mb-2 group-hover:text-blue-200 transition-colors">
                    {city.name}
                  </h3>
                  <span className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {t('city.viewListings', 'Voir les annonces')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Modal des filtres - Version améliorée */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center z-10">
              <h2 className="text-xl font-bold">
                {t('filters.title', 'Filtres avancés')}
              </h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={t('actions.close', 'Fermer')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Onglets de catégories */}
              <div>
                <h3 className="font-medium mb-3 text-gray-700">
                  {t('filters.category', 'Catégorie')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {NAVIGATION_TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleFilterChange('category', tab.id === filters.category ? '' : tab.id)}
                        className={`flex items-center p-3 border rounded-xl transition-all ${filters.category === tab.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-200'
                          }`}
                      >
                        <Icon className={`h-5 w-5 mr-2 ${filters.category === tab.id ? 'text-blue-500' : 'text-gray-500'}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sélection de ville */}
              <div>
                <h3 className="font-medium mb-3 text-gray-700">
                  {t('filters.city', 'Ville')}
                </h3>
                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 transition-all hover:border-blue-200 focus-within:border-blue-200 focus-within:ring-2 focus-within:ring-blue-200">
                  <MapPin className="h-5 w-5 text-gray-400 ml-3" />
                  <CitySelect
                    value={selectedCity?.name}
                    onChange={(city) => {
                      setSelectedCity(city);
                      handleFilterChange('city', city?.name || '');
                    }}
                    className="w-full bg-transparent border-none focus:outline-none text-gray-800 pl-2 py-3"
                    placeholder={t('filters.allCities', 'Toutes les villes')}
                  />
                </div>
              </div>

              {/* Fourchette de prix */}
              <div>
                <h3 className="font-medium mb-3 text-gray-700">
                  {t('filters.priceRange', 'Fourchette de prix (MAD)')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder={t('filters.minPrice', 'Minimum')}
                      className="w-full p-3.5 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">MAD</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder={t('filters.maxPrice', 'Maximum')}
                      className="w-full p-3.5 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">MAD</span>
                  </div>
                </div>
              </div>

              {/* Type de transaction */}
              <div>
                <h3 className="font-medium mb-3 text-gray-700">
                  {t('filters.transactionType', 'Type de transaction')}
                </h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleFilterChange('transactionType', filters.transactionType === 'location' ? '' : 'location')}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${filters.transactionType === 'location'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                  >
                    {t('filters.rent', 'Location')}
                  </button>
                  <button
                    onClick={() => handleFilterChange('transactionType', filters.transactionType === 'achat' ? '' : 'achat')}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${filters.transactionType === 'achat'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                  >
                    {t('filters.sale', 'Achat')}
                  </button>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-5 border-t flex justify-between items-center">
              <button
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {t('actions.reset', 'Réinitialiser')}
              </button>
              <button
                onClick={() => {
                  setShowFilters(false);
                  fetchListings();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
              >
                {t('actions.applyFilters', 'Appliquer les filtres')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;