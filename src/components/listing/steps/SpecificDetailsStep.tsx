import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { Home, Car, Briefcase, Bed, Bath, CheckSquare } from 'lucide-react';
import { categories } from '../../../lib/categories';

interface SpecificDetailsStepProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
  formData: any;
  t: (key: string) => string;
  onNextStep?: () => void; // Fonction pour passer à l'étape suivante
}

export const SpecificDetailsStep: React.FC<SpecificDetailsStepProps> = ({
  register,
  errors,
  watch,
  setValue,
  getValues,
  formData,
  t,
  onNextStep
}) => {
  
  // Get the selected category
  const category = watch('category') || formData?.generalInfo?.category;
  
  // Utility function to simplify translation keys
  const translate = (key: string, fallback: string) => {
    return t(key) || fallback;
  };

  // Render category-specific fields based on the selected category
  const renderCategoryFields = () => {
    switch (category) {
      case 'immobilier':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
              <Home className="h-5 w-5 mr-2 text-primary" />
              {translate('propertyDetails', 'Détails du bien immobilier')}
            </h3>
            
            {/* Type de propriété */}
            <div className="group">
              <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
                {translate('propertyType', 'Type de bien')} <span className="text-red-500">*</span>
              </label>
              <select
                id="property_type"
                {...register('specificDetails.property_type', { required: true })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                defaultValue={formData.specificDetails?.property_type || ''}
              >
                <option value="">{translate('selectPropertyType', 'Sélectionner un type')}</option>
                {categories.immobilier.filters.type.options.map((option: {value: string, label: string}) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors['specificDetails.property_type'] && (
                <p className="mt-1 text-sm text-red-600 animate-fadeIn">{translate('required', 'Ce champ est requis')}</p>
              )}
            </div>
            
            {/* Surface */}
            <div className="group">
              <label htmlFor="surface" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
                {translate('surface', 'Surface (m²)')} <span className="text-red-500">*</span>
              </label>
              <input
                id="surface"
                type="number"
                {...register('specificDetails.surface', { required: true, min: 1 })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="0"
                min="1"
                defaultValue={formData.specificDetails?.surface || ''}
              />
              {errors['specificDetails.surface'] && (
                <p className="mt-1 text-sm text-red-600 animate-fadeIn">{translate('required', 'Ce champ est requis')}</p>
              )}
            </div>
            
            {/* Nombre de pièces */}
            <div className="group">
              <label htmlFor="pieces" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
                {translate('rooms', 'Nombre de pièces')} <span className="text-red-500">*</span>
              </label>
              <select
                id="pieces"
                {...register('specificDetails.pieces', { required: true })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                defaultValue={formData.specificDetails?.pieces || ''}
              >
                <option value="">{translate('selectRooms', 'Sélectionner')}</option>
                {categories.immobilier.filters.pieces.options.map((option: {value: string, label: string}) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors['specificDetails.pieces'] && (
                <p className="mt-1 text-sm text-red-600 animate-fadeIn">{translate('required', 'Ce champ est requis')}</p>
              )}
            </div>

            {/* Chambres */}
            <div className="group">
              <label htmlFor="bedrooms" className="flex items-center text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
                <Bed className="h-4 w-4 mr-2 text-primary" />
                {translate('bedrooms', 'Chambres')}
              </label>
              <select
                id="bedrooms"
                {...register('specificDetails.bedrooms')}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                defaultValue={formData.specificDetails?.bedrooms || ''}
              >
                <option value="">{translate('select', 'Sélectionner')}</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5+">5+</option>
              </select>
            </div>

            {/* Salles de bain */}
            <div className="group">
              <label htmlFor="bathrooms" className="flex items-center text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
                <Bath className="h-4 w-4 mr-2 text-primary" />
                {translate('bathrooms', 'Salles de bain')}
              </label>
              <select
                id="bathrooms"
                {...register('specificDetails.bathrooms')}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                defaultValue={formData.specificDetails?.bathrooms || ''}
              >
                <option value="">{translate('select', 'Sélectionner')}</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4+">4+</option>
              </select>
            </div>

            {/* Équipements - Liste de cases à cocher */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-3 group-focus-within:text-primary transition-colors">
                <CheckSquare className="h-4 w-4 mr-2 inline text-primary" />
                {translate('amenities', 'Équipements')}
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('amenities.garage')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.amenities?.garage}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('garage', 'Garage')}</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('amenities.parking')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.amenities?.parking}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('parking', 'Parking')}</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('amenities.jardin')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.amenities?.jardin}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('garden', 'Jardin')}</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('amenities.piscine')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.amenities?.piscine}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('pool', 'Piscine')}</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('specificDetails.amenities.ascenseur')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.amenities?.ascenseur}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('elevator', 'Ascenseur')}</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('specificDetails.amenities.climatisation')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.amenities?.climatisation}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('airConditioning', 'Climatisation')}</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('specificDetails.amenities.chauffage')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.amenities?.chauffage}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('heating', 'Chauffage')}</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('specificDetails.amenities.securite')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.amenities?.securite}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('security', 'Sécurité')}</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'vehicules':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
              <Car className="h-5 w-5 mr-2 text-primary" />
              {translate('vehicleDetails', 'Détails du véhicule')}
            </h3>
            
            {/* Type de véhicule */}
            <div className="group">
              <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
                {translate('vehicleType', 'Type de véhicule')} <span className="text-red-500">*</span>
              </label>
              <select
                id="vehicle_type"
                {...register('specificDetails.vehicle_type', { required: true })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                defaultValue={formData.specificDetails?.vehicle_type || ''}
              >
                <option value="">{translate('selectType', 'Sélectionner un type')}</option>
                <option value="voiture">{translate('car', 'Voiture')}</option>
                <option value="moto">{translate('motorcycle', 'Moto')}</option>
                <option value="camion">{translate('truck', 'Camion')}</option>
                <option value="utilitaire">{translate('utility', 'Utilitaire')}</option>
                <option value="autre">{translate('other', 'Autre')}</option>
              </select>
              {errors['specificDetails.vehicle_type'] && (
                <p className="mt-1 text-sm text-red-600 animate-fadeIn">{translate('required', 'Ce champ est requis')}</p>
              )}
            </div>
            
            {/* Marque */}
            <div className="group">
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
                {translate('brand', 'Marque')} <span className="text-red-500">*</span>
              </label>
              <select
                id="brand"
                {...register('specificDetails.brand', { required: true })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                defaultValue={formData.specificDetails?.brand || ''}
                onChange={() => {
                  // Reset model when brand changes
                  setValue('specificDetails.model', '');
                }}
              >
                <option value="">{translate('selectBrand', 'Sélectionner une marque')}</option>
                {categories.vehicules.filters.marque.options.map((option: {value: string, label: string}) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors['specificDetails.brand'] && (
                <p className="mt-1 text-sm text-red-600 animate-fadeIn">{translate('required', 'Ce champ est requis')}</p>
              )}
            </div>
            
            {/* Modèle - dépend de la marque sélectionnée */}
            <div className="group">
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
                {translate('model', 'Modèle')} <span className="text-red-500">*</span>
              </label>
              <input
                id="model"
                type="text"
                {...register('specificDetails.model', { required: true })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder={translate('modelPlaceholder', 'Ex: Golf, Clio...')}
                defaultValue={formData.specificDetails?.model || ''}
              />
              {errors['specificDetails.model'] && (
                <p className="mt-1 text-sm text-red-600 animate-fadeIn">{translate('required', 'Ce champ est requis')}</p>
              )}
            </div>
            
            {/* Année */}
            <div className="group">
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
                {translate('year', 'Année')} <span className="text-red-500">*</span>
              </label>
              <select
                id="year"
                {...register('specificDetails.year', { required: true })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                defaultValue={formData.specificDetails?.year || ''}
              >
                <option value="">{translate('selectYear', 'Sélectionner une année')}</option>
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
              {errors['specificDetails.year'] && (
                <p className="mt-1 text-sm text-red-600 animate-fadeIn">{translate('required', 'Ce champ est requis')}</p>
              )}
            </div>
            
            {/* Kilométrage */}
            <div className="group">
              <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
                {translate('mileage', 'Kilométrage')} <span className="text-red-500">*</span>
              </label>
              <input
                id="mileage"
                type="number"
                {...register('specificDetails.mileage', { required: true, min: 0 })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="0"
                min="0"
                defaultValue={formData.specificDetails?.mileage || ''}
              />
              {errors['specificDetails.mileage'] && (
                <p className="mt-1 text-sm text-red-600 animate-fadeIn">{translate('required', 'Ce champ est requis')}</p>
              )}
            </div>
            
            {/* Carburant */}
            <div className="group">
              <label htmlFor="fuel" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
                {translate('fuel', 'Carburant')} <span className="text-red-500">*</span>
              </label>
              <select
                id="fuel"
                {...register('specificDetails.fuel', { required: true })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                defaultValue={formData.specificDetails?.fuel || ''}
              >
                <option value="">{translate('selectFuel', 'Sélectionner un carburant')}</option>
                {categories.vehicules.filters.carburant.options.map((option: {value: string, label: string}) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors['specificDetails.fuel'] && (
                <p className="mt-1 text-sm text-red-600 animate-fadeIn">{translate('required', 'Ce champ est requis')}</p>
              )}
            </div>
            
            {/* Boîte de vitesse */}
            <div className="group">
              <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
                {translate('transmission', 'Boîte de vitesse')} <span className="text-red-500">*</span>
              </label>
              <select
                id="transmission"
                {...register('specificDetails.transmission', { required: true })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                defaultValue={formData.specificDetails?.transmission || ''}
              >
                <option value="">{translate('selectTransmission', 'Sélectionner une boîte')}</option>
                {categories.vehicules.filters.boite.options.map((option: {value: string, label: string}) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors['specificDetails.transmission'] && (
                <p className="mt-1 text-sm text-red-600 animate-fadeIn">{translate('required', 'Ce champ est requis')}</p>
              )}
            </div>
            
            {/* Équipements et options */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-3 group-focus-within:text-primary transition-colors">
                <CheckSquare className="h-4 w-4 mr-2 inline text-primary" />
                {translate('equipment', 'Équipements et options')}
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('specificDetails.equipment.climatisation')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.equipment?.climatisation}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('airConditioning', 'Climatisation')}</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('specificDetails.equipment.gps')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.equipment?.gps}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('gps', 'GPS')}</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('specificDetails.equipment.bluetooth')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.equipment?.bluetooth}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('bluetooth', 'Bluetooth')}</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('specificDetails.equipment.parking_sensors')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.equipment?.parking_sensors}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('parkingSensors', 'Capteurs de stationnement')}</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('specificDetails.equipment.camera')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.equipment?.camera}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('camera', 'Caméra de recul')}</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('specificDetails.equipment.leather')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.equipment?.leather}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('leather', 'Intérieur cuir')}</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('specificDetails.equipment.sunroof')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.equipment?.sunroof}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('sunroof', 'Toit ouvrant')}</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('specificDetails.equipment.alloy_wheels')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    defaultChecked={formData.specificDetails?.equipment?.alloy_wheels}
                  />
                  <span className="ml-2 text-sm text-gray-700">{translate('alloyWheels', 'Jantes alliage')}</span>
                </label>
              </div>
            </div>
          </div>
        );
        
      case 'services':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-primary" />
              {translate('détailsService', 'Détails du service')}
            </h3>
            
            {/* Type de service */}
            <div className="group">
              <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
                {translate('typeService', 'Type de service')} <span className="text-red-500">*</span>
              </label>
              <input
                id="service_type"
                type="text"
                {...register('specificDetails.service_type', { required: true })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder={translate('placeholderTypeService', 'Ex: Plomberie, Cours particuliers...')}
                defaultValue={formData.specificDetails?.service_type || ''}
              />
              {errors['specificDetails.service_type'] && (
                <p className="mt-1 text-sm text-red-600 animate-fadeIn">{translate('champRequis', 'Ce champ est requis')}</p>
              )}
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            {translate('sélectionnerCatégorie', 'Veuillez d\'abord sélectionner une catégorie')}
          </div>
        );
    }
  };

  // Si le formulaire est valide, la navigation vers l'étape suivante est gérée par le composant parent

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {renderCategoryFields()}
      </div>
    </div>
  );
};
