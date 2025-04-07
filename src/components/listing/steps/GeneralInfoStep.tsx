import React, { useEffect } from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, Control, UseFormSetValue } from 'react-hook-form';
import { MapPin, Info, Pencil, Phone, Sparkles } from 'lucide-react';
import { categories } from '../../../lib/categories';

interface GeneralInfoStepProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors;
  formData: any;
  t: (key: string, fallback?: string) => string;
  onGenerateSuggestions?: () => void;
  setValue: UseFormSetValue<any>;
  control?: Control<any>; // Made optional since it's not currently used
}

export const GeneralInfoStep: React.FC<GeneralInfoStepProps> = ({
  register,
  watch,
  errors,
  formData,
  t,
  onGenerateSuggestions,
  setValue
}) => {

  const selectedCategory = watch('category');
  const selectedBrand = watch('marque');
  
  // Update models when brand changes
  useEffect(() => {
    if (selectedCategory === 'vehicules' && selectedBrand) {
      // Get models for the selected brand and use them in the UI
      // Note: getModelsForBrand has been removed, this will be handled in DetailsStep
      // Reset the model selection
      setValue('modele', '');
    }
  }, [selectedCategory, selectedBrand, setValue]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Note d'information */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md shadow-sm animate-slideInUp">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-blue-700">Fournissez des informations précises pour attirer plus d'acheteurs potentiels.</p>
        </div>
      </div>

      {/* Sélection de sous-catégorie */}
      {selectedCategory && selectedCategory in categories && (
        <div className="space-y-4 animate-slideInUp" style={{ animationDelay: '50ms' }}>
          <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Sous-catégorie
          </h3>
          
          <div className="group">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              Sous-catégorie <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              {...register('type')}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              defaultValue={formData?.type || ''}
            >
              <option value="" disabled>Sélectionnez une sous-catégorie</option>
              {selectedCategory in categories && 
               'filters' in categories[selectedCategory as keyof typeof categories] &&
               Object.entries(categories[selectedCategory as keyof typeof categories].filters).find(([key]) => key === 'type') && 
               (Object.entries(categories[selectedCategory as keyof typeof categories].filters).find(([key]) => key === 'type')?.[1] as any)?.options?.map((option: {value: string, label: string}) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.type.message as string}</p>
            )}
          </div>
        </div>
      )}

      {/* Titre et description */}
      <div className="space-y-6 animate-slideInUp" style={{ animationDelay: '100ms' }}>
        <div className="group">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 group-focus-within:text-primary transition-colors">
              Titre <span className="text-red-500">*</span>
            </label>
            {onGenerateSuggestions && (
              <button
                type="button"
                onClick={onGenerateSuggestions}
                className="text-xs flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Générer des suggestions
              </button>
            )}
          </div>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Pencil className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              id="title"
              type="text"
              {...register('title')}
              placeholder="Titre de votre annonce"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              defaultValue={formData?.title || ''}
            />
          </div>
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.title.message as string}</p>
          )}
        </div>

        <div className="group">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={5}
            placeholder="Décrivez votre annonce en détail..."
            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            defaultValue={formData?.description || ''}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.description.message as string}</p>
          )}
        </div>
      </div>

      {/* Removed price and transaction type fields to avoid redundancy */}

      {/* Localisation */}
      <div className="space-y-6 animate-slideInUp" style={{ animationDelay: '300ms' }}>
        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Localisation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              Ville <span className="text-red-500">*</span>
            </label>
            <select
              id="city"
              {...register('city')}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              defaultValue={formData?.city || ''}
            >
              <option value="" disabled>
                Sélectionnez une ville
              </option>
              <option value="casablanca">Casablanca</option>
              <option value="rabat">Rabat</option>
              <option value="marrakech">Marrakech</option>
              <option value="agadir">Agadir</option>
              <option value="tanger">Tanger</option>
              <option value="fes">Fès</option>
              <option value="meknes">Meknès</option>
            </select>
            {errors.city && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.city.message as string}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
              Adresse
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                id="address"
                type="text"
                {...register('address')}
                placeholder="Adresse complète"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                defaultValue={formData?.address || ''}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-primary">
          <button type="button" className="flex items-center hover:underline focus:outline-none">
            <MapPin className="h-4 w-4 mr-1" />
            {t('useMyLocation') || 'Utiliser ma position actuelle'}
          </button>
          <span className="text-gray-400">ou</span>
          <button type="button" className="flex items-center hover:underline focus:outline-none">
            <Pencil className="h-4 w-4 mr-1" />
            {t('enterManuallyAddress') || 'Saisir manuellement'}
          </button>
        </div>
      </div>

      {/* La partie information sur l'artisanat a été supprimée et déplacée dans DetailsStep */}

      {/* Contact */}
      <div className="space-y-4 animate-slideInUp" style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          {t('contactInfo') || 'Contacter le vendeur'}
        </h3>

        <div className="group">
          <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
            {t('contactInfo') || 'Informations de contact'} <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              id="contact_info"
              type="text"
              {...register('contact_info')}
              placeholder={t('contactInfoPlaceholder') || 'Numéro de téléphone'}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              defaultValue={formData?.contact_info || ''}
            />
          </div>
          {errors.contact_info && (
            <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.contact_info.message as string}</p>
          )}
        </div>
      </div>
    </div>
  );
};
