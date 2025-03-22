import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

// Hero images
const HERO_IMAGE = {
  desktop: 'https://eczqxyibzosgaktrmozt.supabase.co/storage/v1/object/public/assets//HOW-TO-CHOOSE-WEBSITE-FOR-CHILDREN-TO-LEARN-QURAN-ONLINE.jpg',
  mobile: 'https://eczqxyibzosgaktrmozt.supabase.co/storage/v1/object/public/assets//HOW-TO-CHOOSE-WEBSITE-FOR-CHILDREN-TO-LEARN-QURAN-ONLINE.jpg'
};

// Gym hero image
const GYM_HERO = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop';

// Interface for listings
interface Listing {
  id: string;
  title: string;
  price: number;
  city: string;
  images: string[];
  category: string;
  transaction_type?: 'achat' | 'location';
}

interface ListingCarouselProps {
  title: string;
  listings: Listing[];
  category?: string;
  isLoading?: boolean;
}

function ListingCarousel({ title, listings, category, isLoading = false }: ListingCarouselProps) {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const scrollAmount = 300;
    const newScrollLeft = direction === 'left'
      ? scrollRef.current.scrollLeft - scrollAmount
      : scrollRef.current.scrollLeft + scrollAmount;

    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const checkScrollButtons = () => {
    if (!scrollRef.current) return;

    setShowLeftArrow(scrollRef.current.scrollLeft > 0);
    setShowRightArrow(
      scrollRef.current.scrollLeft <
      scrollRef.current.scrollWidth - scrollRef.current.clientWidth
    );
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('load', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', checkScrollButtons);
      }
      window.removeEventListener('load', checkScrollButtons);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, []);

  return (
    <section className="py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
          {category && (
            <Link
              to={`/category/${category}`}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              {t('common.seeMore')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="relative group">
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg text-gray-600 hover:text-gray-900 transition-opacity opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg text-gray-600 hover:text-gray-900 transition-opacity opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          >
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex-none w-[calc(100vw-2rem)] sm:w-[300px] animate-pulse"
                >
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-6 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))
            ) : listings.length > 0 ? (
              listings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/listings/${listing.id}`}
                  className="flex-none w-[calc(100vw-2rem)] sm:w-[300px]"
                >
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-[4/3] relative">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      {listing.transaction_type && (
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium ${listing.transaction_type === 'location'
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
                            {listing.category === 'immobilier' ? '/mois' : '/jour'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex items-center justify-center w-full py-12 text-gray-500">
                Aucune annonce disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  const { t } = useLanguage();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Listing[]>([]);
  const [latestListings, setLatestListings] = useState<Listing[]>([]);
  const [categoryListings, setCategoryListings] = useState<Record<string, Listing[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch latest listings
  useEffect(() => {
    const fetchLatestListings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setLatestListings(data || []);

        // Fetch listings by category
        const categories = ['immobilier', 'vehicules', 'services', 'artisanat'];
        const categoryData: Record<string, Listing[]> = {};

        await Promise.all(
          categories.map(async (category) => {
            const { data: categoryListings, error: categoryError } = await supabase
              .from('listings')
              .select('*')
              .eq('status', 'active')
              .eq('category', category)
              .order('created_at', { ascending: false })
              .limit(5);

            if (!categoryError && categoryListings) {
              categoryData[category] = categoryListings;
            }
          })
        );

        setCategoryListings(categoryData);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestListings();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .ilike('title', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching listings:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      {/* Hero section */}
      <section className="relative bg-gray-900 text-white rounded-3xl overflow-hidden mx-4 mt-4">
        {/* Hero background */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE.desktop}
            alt="Goodeaal Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Trouvez ce que vous cherchez sur Goodeaal<span className="text-primary">.com</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              Des propriétaires, pas d'intermédiaires !
            </p>

            {/* Search bar */}
            <div className="relative" ref={searchContainerRef}>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('common.searchPlaceholder')}
                  className="w-full py-4 px-6 pr-12 rounded-full bg-white text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                  onClick={handleSearch}
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {/* Advanced filters button */}
              <Link
                to="/filters"
                className="mt-4 inline-flex items-center gap-2 text-sm text-white hover:text-primary transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t('common.advancedFilters')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search results dropdown */}
      {isSearchFocused && searchContainerRef.current && (
        <div
          ref={searchResultsRef}
          className="fixed left-0 right-0 mx-auto max-w-3xl px-4 z-[100]"
          style={{
            top: searchContainerRef.current.getBoundingClientRect().bottom + window.scrollY + 8,
            width: searchContainerRef.current.offsetWidth
          }}
        >
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="divide-y">
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      to={`/listings/${result.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsSearchFocused(false)}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={result.images[0]}
                          alt={result.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900">{result.title}</h3>
                        <p className="text-sm text-gray-500">{result.city}</p>
                        <p className="text-primary font-medium">
                          {result.price.toLocaleString()} MAD
                          {result.transaction_type === 'location' && (
                            <span className="text-sm font-normal text-gray-500">
                              {result.category === 'immobilier' ? '/mois' : '/jour'}
                            </span>
                          )}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="p-4 text-center text-gray-500">
                  {t('common.noResults').replace('{query}', searchQuery)}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Carousel sections */}
      <div className="bg-page-background">
        <ListingCarousel
          title={t('home.sections.latestListings')}
          listings={latestListings}
          isLoading={isLoading}
        />

        <ListingCarousel
          title={t('home.sections.realEstate')}
          listings={categoryListings.immobilier || []}
          category="immobilier"
          isLoading={isLoading}
        />

        {/* Urbain Five ad section */}
        <section className="py-4 sm:py-8">
          <div className="container mx-auto px-4">
            <div className="relative h-[300px] sm:h-[400px] overflow-hidden rounded-3xl">
              {/* Background image */}
              <img
                src={GYM_HERO}
                alt="Urbain Five Gym"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-center px-4 sm:px-8 md:px-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-2xl">
                  {t('home.urbanFive.title')}
                </h2>
                <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-200 max-w-xl">
                  {t('home.urbanFive.subtitle')}
                </p>
                <a
                  href="https://urbainfive.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 sm:mt-8 inline-flex items-center gap-2 bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors w-fit text-sm sm:text-base"
                >
                  {t('home.urbanFive.cta')}
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <ListingCarousel
          title={t('home.sections.vehicles')}
          listings={categoryListings.vehicules || []}
          category="vehicules"
          isLoading={isLoading}
        />

        <ListingCarousel
          title={t('home.sections.services')}
          listings={categoryListings.services || []}
          category="services"
          isLoading={isLoading}
        />

        <ListingCarousel
          title={t('home.sections.crafts')}
          listings={categoryListings.artisanat || []}
          category="artisanat"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default Home;