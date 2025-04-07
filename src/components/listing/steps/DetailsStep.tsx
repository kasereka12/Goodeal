import { Control, FieldErrors, UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { City } from '../../../lib/cities';
import { categories } from '../../../lib/categories';
import { Home, Car, Calendar, Settings, Fuel, Briefcase, Scissors, Palette, Clock, Users, Brush, Hammer } from 'lucide-react';
import { useEffect } from 'react';
import CitySelect from '../../../components/CitySelect';

// Définition du type pour les données du formulaire (utilisé comme référence)
// Ce type n'est pas directement utilisé mais sert de documentation
interface DetailFormData {
  // Propriétés spécifiques pour l'immobilier
  property_type?: string;
  surface?: number;
  pieces?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  pets_allowed?: boolean;
  // Propriétés spécifiques pour les véhicules
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  availableModels?: string[];
  // Propriétés spécifiques pour les services
  service_type?: string;
  duration?: number;
  experience_years?: number;
  availability?: string;
  // Propriétés spécifiques pour déco
  style?: string;
  material?: string;
  dimensions?: string;
  // Propriétés spécifiques pour artisanat
  craft_type?: string;
  technique?: string;
  customizable?: boolean;
  // Ajout de propriétés pour les erreurs TypeScript
  [key: string]: any;
}

interface DetailsStepProps {
  formData: any; // Accepte n'importe quel type de formData
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  control: Control<any>;
  t: (key: string, fallback?: string) => string;
}

export const DetailsStep = ({
  register,
  control,
  errors,
  watch,
  setValue,
  formData,
  t,
}: DetailsStepProps) => {

  // Fonction pour obtenir les modèles pour une marque donnée
  const getModelsForBrand = (category: string, brand: string) => {
    if (category === 'vehicules') {
      // Recherche des modèles pour la marque sélectionnée
      const vehiculesFilters = categories.vehicules.filters;
      const brandOptions = vehiculesFilters.marque.options;
      const brandExists = brandOptions.some((option: any) => option.value === brand.toLowerCase());
      
      if (brandExists) {
        // Simuler des modèles pour la marque sélectionnée
        return ['Model S', 'Model 3', 'Model X', 'Model Y'];
      }
    }
    return [];
  };

  const selectedCategory = watch('category');
  const selectedBrand = watch('brand');
  const selectedArtisanatType = watch('artisanat_type');

  // Update models when brand changes
  useEffect(() => {
    if (selectedCategory === 'vehicules' && selectedBrand) {
      // Get models for the selected brand and use them in the UI
      const brandModels = getModelsForBrand('vehicules', selectedBrand);
      // Reset the model selection and store the models for later use
      setValue('model', '');
      setValue('availableModels', brandModels as any);
    }
  }, [selectedCategory, selectedBrand, setValue]);

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Détails spécifiques pour l'immobilier */}
      {selectedCategory === 'immobilier' && (
        <div className="space-y-6 animate-slideInUp" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            {t('propertyDetails') || 'Détails du bien immobilier'}
          </h3>

          <div className="group">
            <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              {t('propertyType') || 'Type de bien'} <span className="text-red-500">*</span>
            </label>
            <select
              id="property_type"
              {...register('property_type')}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              defaultValue={formData?.specificDetails?.property_type || ''}
            >
              <option value="" disabled>
                {t('selectPropertyType') || 'Sélectionnez un type de bien'}
              </option>
              {categories.immobilier.filters.type.options.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.property_type && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.property_type.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="surface" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              {t('surface') || 'Surface (m²)'} <span className="text-red-500">*</span>
            </label>
            <input
              id="surface"
              type="number"
              {...register('surface', { valueAsNumber: true })}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="0"
              min="0"
              defaultValue={formData?.specificDetails?.surface || ''}
            />
            {errors.surface && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.surface.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              {t('rooms') || 'Nombre de pièces'}
            </label>
            <input
              type="number"
              id="rooms"
              {...register('pieces', { valueAsNumber: true })}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="0"
              min="0"
              defaultValue={formData?.specificDetails?.pieces || ''}
            />
            {errors.pieces && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.pieces.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              {t('bedrooms') || 'Nombre de chambres'}
            </label>
            <input
              id="bedrooms"
              type="number"
              {...register('bedrooms', { valueAsNumber: true })}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="0"
              min="0"
              defaultValue={formData?.specificDetails?.bedrooms || ''}
            />
            {errors.bedrooms && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.bedrooms.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              {t('bathrooms') || 'Nombre de salles de bain'}
            </label>
            <input
              id="bathrooms"
              type="number"
              {...register('bathrooms', { valueAsNumber: true })}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="0"
              min="0"
              defaultValue={formData?.specificDetails?.bathrooms || ''}
            />
            {errors.bathrooms && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.bathrooms.message as string}</p>
            )}
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-3 group-focus-within:text-primary transition-colors">
              {t('furnished') || 'Meublé'}
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('furnished')}
                  value="true"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  defaultChecked={formData?.specificDetails?.furnished === 'true'}
                />
                <span className="ml-2 text-sm text-gray-700">Oui</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('furnished')}
                  value="false"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  defaultChecked={formData?.specificDetails?.furnished === 'false'}
                />
                <span className="ml-2 text-sm text-gray-700">Non</span>
              </label>
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-3 group-focus-within:text-primary transition-colors">
              {t('petsAllowed') || 'Animaux autorisés'}
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('pets_allowed')}
                  value="true"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  defaultChecked={formData?.specificDetails?.pets_allowed === true}
                />
                <span className="ml-2 text-sm text-gray-700">Oui</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('pets_allowed')}
                  value="false"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  defaultChecked={formData?.specificDetails?.pets_allowed === false}
                />
                <span className="ml-2 text-sm text-gray-700">Non</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Détails spécifiques pour les véhicules */}
      {selectedCategory === 'vehicules' && (
        <div className="space-y-6 animate-slideInUp" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            {t('vehicleDetails') || 'Détails du véhicule'}
          </h3>

          <div className="group">
            <label htmlFor="marque" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              {t('brand') || 'Marque'} <span className="text-red-500">*</span>
            </label>
            <select
              id="marque"
              {...register('brand')}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              defaultValue={formData?.specificDetails?.brand || ''}
            >
              <option value="" disabled>
                {t('selectBrand') || 'Sélectionnez une marque'}
              </option>
              {categories.vehicules.filters.marque.options.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.brand && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.brand.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="modele" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              {t('model') || 'Modèle'} <span className="text-red-500">*</span>
            </label>
            <select
              id="modele"
              {...register('model')}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              defaultValue={formData?.specificDetails?.model || ''}
              disabled={!selectedBrand}
            >
              <option value="" disabled>
                {t('selectModel') || 'Sélectionnez un modèle'}
              </option>
              {(watch('availableModels') || []).map((model: string) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            {errors.model && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.model.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              {t('year') || 'Année'} <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                id="year"
                type="number"
                {...register('year', { valueAsNumber: true })}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="2023"
                min="1900"
                max={new Date().getFullYear()}
                defaultValue={formData?.specificDetails?.year || ''}
              />
            </div>
            {errors.year && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.year.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              {t('mileage') || 'Kilométrage'} <span className="text-red-500">*</span>
            </label>
            <input
              id="mileage"
              type="number"
              {...register('mileage', { valueAsNumber: true })}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="0"
              min="0"
              defaultValue={formData?.specificDetails?.mileage || ''}
            />
            {errors.mileage && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.mileage.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              {t('fuelType') || 'Type de carburant'}
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Fuel className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <select
                id="fuel_type"
                {...register('fuel_type')}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                defaultValue={formData?.specificDetails?.fuel_type || ''}
              >
                <option value="" disabled>{t('selectFuelType') || 'Sélectionnez un type de carburant'}</option>
                <option value="essence">{t('gasoline') || 'Essence'}</option>
                <option value="diesel">{t('diesel') || 'Diesel'}</option>
                <option value="hybride">{t('hybrid') || 'Hybride'}</option>
                <option value="electrique">{t('electric') || 'Électrique'}</option>
                <option value="gpl">{t('lpg') || 'GPL'}</option>
              </select>
            </div>
            {errors.fuel_type && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.fuel_type.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              {t('transmission') || 'Transmission'}
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Settings className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <select
                id="transmission"
                {...register('transmission')}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                defaultValue={formData?.specificDetails?.transmission || ''}
              >
                <option value="" disabled>{t('selectTransmission') || 'Sélectionnez une transmission'}</option>
                <option value="manuelle">{t('manual') || 'Manuelle'}</option>
                <option value="automatique">{t('automatic') || 'Automatique'}</option>
                <option value="semi-automatique">{t('semiAutomatic') || 'Semi-automatique'}</option>
              </select>
            </div>
            {errors.transmission && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.transmission.message as string}</p>
            )}
          </div>
        </div>
      )}
      {/* Détails spécifiques pour les services */}
      {selectedCategory === 'services' && (
        <div className="space-y-6 animate-slideInUp" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Détails du service
          </h3>

          <div className="group">
            <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              Type de service <span className="text-red-500">*</span>
            </label>
            <select
              id="service_type"
              {...register('service_type')}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              defaultValue={formData?.specificDetails?.service_type || ''}
            >
              <option value="" disabled>
                Sélectionnez un type de service
              </option>
              <option value="coaching">Coaching</option>
              <option value="consultation">Consultation</option>
              <option value="formation">Formation</option>
              <option value="reparation">Réparation</option>
              <option value="menage">Ménage</option>
              <option value="jardinage">Jardinage</option>
              <option value="autre">Autre</option>
            </select>
            {errors.service_type && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.service_type.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              Durée (en heures) <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                id="duration"
                type="number"
                {...register('duration', { valueAsNumber: true })}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="1"
                min="0.5"
                step="0.5"
                defaultValue={formData?.specificDetails?.duration || ''}
              />
            </div>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.duration.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              Années d'expérience
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                id="experience_years"
                type="number"
                {...register('experience_years', { valueAsNumber: true })}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="0"
                min="0"
                defaultValue={formData?.specificDetails?.experience_years || ''}
              />
            </div>
            {errors.experience_years && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.experience_years.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              Disponibilité
            </label>
            <select
              id="availability"
              {...register('availability')}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              defaultValue={formData?.specificDetails?.availability || ''}
            >
              <option value="" disabled>Sélectionnez une disponibilité</option>
              <option value="semaine">En semaine</option>
              <option value="weekend">Le weekend</option>
              <option value="tous_les_jours">Tous les jours</option>
              <option value="sur_rendez_vous">Sur rendez-vous</option>
            </select>
            {errors.availability && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.availability.message as string}</p>
            )}
          </div>
        </div>
      )}

      {/* Détails spécifiques pour la déco */}
      {selectedCategory === 'artisanat' && selectedArtisanatType === 'decoration' && (
        <div className="space-y-6 animate-slideInUp" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Détails de la décoration
          </h3>

          <div className="group">
            <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              Style <span className="text-red-500">*</span>
            </label>
            <select
              id="style"
              {...register('style')}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              defaultValue={formData?.specificDetails?.style || ''}
            >
              <option value="" disabled>
                Sélectionnez un style
              </option>
              <option value="moderne">Moderne</option>
              <option value="scandinave">Scandinave</option>
              <option value="industriel">Industriel</option>
              <option value="boheme">Bohème</option>
              <option value="minimaliste">Minimaliste</option>
              <option value="vintage">Vintage</option>
              <option value="autre">Autre</option>
            </select>
            {errors.style && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.style.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              Matériau principal
            </label>
            <select
              id="material"
              {...register('material')}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              defaultValue={formData?.specificDetails?.material || ''}
            >
              <option value="" disabled>Sélectionnez un matériau</option>
              <option value="bois">Bois</option>
              <option value="metal">Métal</option>
              <option value="verre">Verre</option>
              <option value="ceramique">Céramique</option>
              <option value="textile">Textile</option>
              <option value="plastique">Plastique</option>
              <option value="autre">Autre</option>
            </select>
            {errors.material && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.material.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              Dimensions (LxlxH en cm)
            </label>
            <input
              id="dimensions"
              type="text"
              {...register('dimensions')}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Ex: 120x60x75"
              defaultValue={formData?.specificDetails?.dimensions || ''}
            />
            {errors.dimensions && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.dimensions.message as string}</p>
            )}
          </div>
        </div>
      )}

      {/* Sélection du type d'artisanat ou déco */}
      {selectedCategory === 'artisanat' && (
        <div className="space-y-6 animate-slideInUp" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Type d'artisanat
          </h3>

          <div className="group">
            <label htmlFor="artisanat_type" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              Type d'artisanat <span className="text-red-500">*</span>
            </label>
            <select
              id="artisanat_type"
              {...register('artisanat_type')}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              defaultValue={formData?.specificDetails?.artisanat_type || ''}
            >
              <option value="" disabled>Sélectionnez un type</option>
              <option value="decoration">Décoration</option>
              <option value="artisanat">Artisanat</option>
            </select>
            {errors.artisanat_type && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.artisanat_type.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="origine" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              {t('origin') || 'Origine'}
            </label>
            <select
              id="origine"
              {...register('origine')}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              defaultValue={formData?.specificDetails?.origine || ''}
            >
              <option value="" disabled>{t('selectOrigin') || 'Sélectionnez une origine'}</option>
              {categories.artisanat.filters.origine.options.map((option: any) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.origine && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.origine.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="matiere" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              {t('material') || 'Matière'}
            </label>
            <select
              id="matiere"
              {...register('matiere')}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              defaultValue={formData?.specificDetails?.matiere || ''}
            >
              <option value="" disabled>{t('selectMaterial') || 'Sélectionnez une matière'}</option>
              {categories.artisanat.filters.matiere.options.map((option: any) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.matiere && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.matiere.message as string}</p>
            )}
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-3 group-focus-within:text-primary transition-colors">
              {t('handmade') || 'Fait main'}
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('fait_main')}
                  value="true"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  defaultChecked={formData?.specificDetails?.fait_main === true}
                />
                <span className="ml-2 text-sm text-gray-700">Oui</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('fait_main')}
                  value="false"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  defaultChecked={formData?.specificDetails?.fait_main === false}
                />
                <span className="ml-2 text-sm text-gray-700">Non</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Détails spécifiques pour l'artisanat selon le type sélectionné */}
      {selectedCategory === 'artisanat' && watch('artisanat_type') === 'artisanat' && (
        <div className="space-y-6 animate-slideInUp" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <Hammer className="h-5 w-5 text-primary" />
            {t('craftDetails') || 'Détails de l\'artisanat'}
          </h3>

          <div className="group">
            <label htmlFor="craft_type" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              Type d'artisanat <span className="text-red-500">*</span>
            </label>
            <select
              id="craft_type"
              {...register('craft_type')}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              defaultValue={formData?.specificDetails?.craft_type || ''}
            >
              <option value="" disabled>
                Sélectionnez un type d'artisanat
              </option>
              <option value="poterie">{t('pottery') || 'Poterie'}</option>
              <option value="bijouterie">{t('jewelry') || 'Bijouterie'}</option>
              <option value="textile">{t('textile') || 'Textile'}</option>
              <option value="bois">{t('woodwork') || 'Travail du bois'}</option>
              <option value="cuir">{t('leather') || 'Travail du cuir'}</option>
              <option value="papier">{t('papercraft') || 'Papeterie'}</option>
              <option value="autre">{t('other') || 'Autre'}</option>
            </select>
            {errors.craft_type && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.craft_type.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="technique" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              Technique utilisée
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Brush className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                id="technique"
                type="text"
                {...register('technique')}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Ex: Tissage, Sculpture, etc."
                defaultValue={formData?.specificDetails?.technique || ''}
              />
            </div>
            {errors.technique && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.technique.message as string}</p>
            )}
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-3 group-focus-within:text-primary transition-colors">
              Personnalisable
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('customizable')}
                  value="true"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  defaultChecked={formData?.specificDetails?.customizable === true}
                />
                <span className="ml-2 text-sm text-gray-700">Oui</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('customizable')}
                  value="false"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  defaultChecked={formData?.specificDetails?.customizable === false}
                />
                <span className="ml-2 text-sm text-gray-700">Non</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
