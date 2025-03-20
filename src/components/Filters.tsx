import React, { useState, useEffect } from 'react';
import { categories, CategoryId, brands, getModelsForBrand } from '../lib/categories';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

interface FiltersProps {
  category: CategoryId;
  onFilterChange: (filters: Record<string, any>) => void;
  initialValues?: Record<string, any>;
}

export default function Filters({ category, onFilterChange, initialValues = {} }: FiltersProps) {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<Record<string, any>>(initialValues);
  const [modelOptions, setModelOptions] = useState<{ value: string; label: string }[]>([]);
  const categoryData = categories[category];

  // Réinitialiser les filtres quand la catégorie change
  useEffect(() => {
    setFilters(initialValues);
    setModelOptions([]);
  }, [category, initialValues]);

  // Mettre à jour les options de modèle quand la marque change
  useEffect(() => {
    if ((category === 'vehicules' || category === 'electronique') && filters.marque) {
      const options = getModelsForBrand(category, filters.marque);
      setModelOptions(options);
    } else {
      setModelOptions([]);
    }
  }, [filters.marque, category]);

  const handleFilterChange = (id: string, value: any) => {
    const newFilters = { ...filters };

    if (value === undefined || value === '') {
      delete newFilters[id];
      // Réinitialiser le modèle quand la marque est effacée
      if (id === 'marque') {
        delete newFilters.modele;
        setModelOptions([]);
      }
    } else {
      newFilters[id] = value;
      // Réinitialiser le modèle quand la marque change
      if (id === 'marque') {
        delete newFilters.modele;
      }
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const renderFilter = (id: string, filter: any) => {
    switch (filter.type) {
      case 'select':
        // Gestion spéciale pour le filtre de modèle
        if (id === 'modele') {
          const brandSelected = !!filters.marque;
          return (
            <div key={id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {filter.label}
              </label>
              <select
                className={cn("input w-full", {
                  "opacity-50 cursor-not-allowed": !brandSelected
                })}
                value={filters[id] || ''}
                onChange={(e) => handleFilterChange(id, e.target.value)}
                disabled={!brandSelected}
              >
                <option value="">
                  {!brandSelected 
                    ? "Sélectionnez d'abord une marque"
                    : "Tous les modèles"
                  }
                </option>
                {modelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        // Filtre select standard
        return (
          <div key={id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <select
              className="input w-full"
              value={filters[id] || ''}
              onChange={(e) => handleFilterChange(id, e.target.value)}
            >
              <option value="">{t('common.all')}</option>
              {filter.options.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'range':
        const value = filters[id] || filter.min;
        return (
          <div key={id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={filter.min}
                  max={filter.max}
                  step={filter.step}
                  value={value}
                  onChange={(e) => handleFilterChange(id, Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap min-w-[80px]">
                  {value.toLocaleString()}{filter.unit ? ` ${filter.unit}` : ''}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{filter.min.toLocaleString()}{filter.unit}</span>
                <span>{filter.max.toLocaleString()}{filter.unit}</span>
              </div>
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
              onChange={(e) => handleFilterChange(id, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor={id} className="text-sm font-medium text-gray-700">
              {filter.label}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  // Grouper les filtres par type
  const filterGroups = Object.entries(categoryData.filters).reduce((acc, [id, filter]) => {
    const group = (() => {
      if (id === 'transaction_type') return 'principal';
      if (id === 'type') return 'principal';
      if (id === 'marque' || id === 'modele') return 'identification';
      if (filter.type === 'boolean') return 'options';
      return 'specifications';
    })();

    if (!acc[group]) acc[group] = [];
    acc[group].push([id, filter]);
    return acc;
  }, {} as Record<string, [string, any][]>);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
      <div className="flex items-center gap-2">
        {React.createElement(categoryData.icon, { className: "h-5 w-5" })}
        <h2 className="text-lg font-semibold">{categoryData.label}</h2>
      </div>

      {/* Filtres groupés */}
      {Object.entries(filterGroups).map(([group, groupFilters]) => (
        <div key={group} className="space-y-4">
          {group !== 'principal' && (
            <h3 className="text-sm font-medium text-gray-900 border-b pb-2">
              {group === 'identification' && 'Marque et modèle'}
              {group === 'specifications' && 'Spécifications'}
              {group === 'options' && 'Options'}
            </h3>
          )}
          <div className="space-y-4">
            {groupFilters.map(([filterId, filter]) => renderFilter(filterId, filter))}
          </div>
        </div>
      ))}

      {Object.keys(filters).length > 0 && (
        <button
          onClick={() => {
            setFilters({});
            setModelOptions([]);
            onFilterChange({});
          }}
          className="text-sm text-primary hover:underline"
        >
          {t('filters.reset')}
        </button>
      )}
    </div>
  );
}