import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { City, searchCities, regions, citiesByRegion } from '../lib/cities';

interface CitySelectProps {
  value?: string;
  onChange: (city: City | null) => void;
  placeholder?: string;
}

export default function CitySelect({ value, onChange, placeholder = "Sélectionnez une ville" }: CitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrer les villes selon la recherche
  const filteredCities = searchQuery
    ? searchCities(searchQuery)
    : selectedRegion
    ? citiesByRegion[selectedRegion]
    : [];

  const selectedCity = value ? searchCities(value)[0] : null;

  // Handle mobile focus
  const handleFocus = () => {
    setIsOpen(true);
    // On mobile, scroll to make sure the dropdown is visible
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="input flex items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Search className="w-4 h-4 text-gray-400 mr-2" />
        <span className={selectedCity ? 'text-gray-900' : 'text-gray-500'}>
          {selectedCity ? selectedCity.name : placeholder}
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-hidden">
          <div className="p-2 border-b">
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher une ville..."
              className="input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedRegion(null);
              }}
              onClick={(e) => e.stopPropagation()}
              onFocus={handleFocus}
              autoFocus
            />
          </div>

          <div className="overflow-y-auto max-h-80 scrollbar-hide">
            {searchQuery ? (
              // Résultats de recherche
              <div className="p-2">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <button
                      key={city.name}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md"
                      onClick={() => {
                        onChange(city);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="font-medium">{city.name}</div>
                      <div className="text-sm text-gray-500">{city.region}</div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">Aucune ville trouvée</div>
                )}
              </div>
            ) : (
              // Liste des régions et villes
              <div>
                {regions.map((region) => (
                  <div key={region}>
                    <button
                      className="w-full text-left px-4 py-2 font-medium text-gray-900 hover:bg-gray-50 border-b"
                      onClick={() => setSelectedRegion(region)}
                    >
                      {region}
                    </button>
                    
                    {selectedRegion === region && citiesByRegion[region].map((city) => (
                      <button
                        key={city.name}
                        className="w-full text-left px-6 py-2 hover:bg-gray-50 text-gray-600"
                        onClick={() => {
                          onChange(city);
                          setIsOpen(false);
                        }}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}