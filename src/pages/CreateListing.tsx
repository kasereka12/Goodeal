import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CitySelect from '../components/CitySelect';
import type { City } from '../lib/cities';
import { categories, CategoryId } from '../lib/categories';
import { PlusCircle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadListingImage } from '../lib/storage';

// Clé pour le stockage local
const FORM_CACHE_KEY = 'createListing_formData';

// Validation schemas pour chaque étape
const stepSchemas = {
  category: z.object({
    category: z.string().min(1, 'Please select a category'),
  }),
  details: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0, 'Price must be positive'),
    city: z.string().min(1, 'City is required'),
    transaction_type: z.string().optional(),
  }),
  filters: z.object({}).passthrough(),
  images: z.object({
    images: z.array(z.instanceof(File)).min(1, 'At least one image is required'),
  }),
};

type StepData = {
  category: z.infer<typeof stepSchemas.category>;
  details: z.infer<typeof stepSchemas.details>;
  filters: Record<string, any>;
  images: z.infer<typeof stepSchemas.images>;
};

// Fonction pour sauvegarder les données du formulaire dans localStorage
const saveFormData = (formData: Partial<StepData>) => {
  try {
    // Ne pas sauvegarder les images car ce sont des objets File
    const { images, ...dataToSave } = formData;
    localStorage.setItem(FORM_CACHE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error saving form data:', error);
  }
};

// Fonction pour récupérer les données du formulaire depuis localStorage
const loadFormData = (): Partial<StepData> => {
  try {
    const savedData = localStorage.getItem(FORM_CACHE_KEY);
    return savedData ? JSON.parse(savedData) : {};
  } catch (error) {
    console.error('Error loading form data:', error);
    return {};
  }
};

// Fonction pour nettoyer les données du formulaire
const clearFormData = () => {
  localStorage.removeItem(FORM_CACHE_KEY);
};

export default function CreateListing() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<'category' | 'details' | 'filters' | 'images'>('category');
  const [formData, setFormData] = useState<Partial<StepData>>(() => loadFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showTransactionType, setShowTransactionType] = useState(false);

  // Form pour l'étape actuelle
  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(stepSchemas[step]),
    defaultValues: formData[step] || {},
  });

  // Cleanup function to revoke object URLs and reset image state
  const cleanupImages = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setSelectedImages([]);
    setValue('images', []);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupImages();
    };
  }, []);

  // Reset images when reaching the images step
  useEffect(() => {
    if (step === 'images') {
      cleanupImages();
    }
  }, [step]);

  // Vérifier l'authentification
  useEffect(() => {
    if (!user) {
      sessionStorage.setItem('redirectAfterAuth', window.location.pathname);
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  // Si l'utilisateur n'est pas connecté, ne pas rendre le formulaire
  if (!user) {
    return null;
  }

  // Observer la catégorie sélectionnée
  const selectedCategory = watch('category');
  
  // Mettre à jour l'affichage du type de transaction quand la catégorie change
  useEffect(() => {
    if (selectedCategory) {
      setShowTransactionType(selectedCategory === 'immobilier' || selectedCategory === 'vehicules');
    }
  }, [selectedCategory]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Vérifier la taille et le type des fichiers
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must not exceed 5MB');
        return false;
      }
      if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
        setError('Supported formats: JPG, PNG or GIF');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setError(null);
      const newImages = [...selectedImages, ...validFiles];
      setSelectedImages(newImages);
      setValue('images', newImages);

      // Créer les URLs de prévisualisation
      const newUrls = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
    setValue('images', newImages);

    // Nettoyer l'URL de prévisualisation
    URL.revokeObjectURL(previewUrls[index]);
    const newPreviews = [...previewUrls];
    newPreviews.splice(index, 1);
    setPreviewUrls(newPreviews);
  };

  const onStepSubmit = async (data: any) => {
    setError(null);

    // Mettre à jour les données du formulaire
    const newFormData = { ...formData, [step]: data };
    setFormData(newFormData);
    saveFormData(newFormData);

    // Passer à l'étape suivante ou soumettre
    if (step === 'category') setStep('details');
    else if (step === 'details') setStep('filters');
    else if (step === 'filters') setStep('images');
    else if (step === 'images') {
      try {
        setIsSubmitting(true);
        setProgress(0);

        if (!user) {
          throw new Error('You must be logged in to create a listing');
        }

        // Upload images first
        const imageUrls = await Promise.all(
          data.images.map((file: File) => 
            uploadListingImage(user.id, file, (progress) => {
              setProgress(Math.round(progress));
            })
          )
        );

        // Get region from city
        const { data: cityData, error: cityError } = await supabase
          .from('cities')
          .select('region')
          .eq('name', newFormData.details!.city)
          .single();

        if (cityError) throw new Error('Failed to get city information');
        if (!cityData?.region) throw new Error('City region not found');

        // Create listing in database
        const { error: listingError } = await supabase
          .from('listings')
          .insert({
            user_id: user.id,
            title: newFormData.details!.title,
            description: newFormData.details!.description,
            price: newFormData.details!.price,
            category: newFormData.category!.category,
            city: newFormData.details!.city,
            region: cityData.region,
            images: imageUrls,
            filters: newFormData.filters || {},
            transaction_type: newFormData.details!.transaction_type
          });

        if (listingError) throw listingError;

        // Clean up
        cleanupImages();
        clearFormData();
        
        // Navigate to listings page
        navigate('/');
      } catch (error: any) {
        console.error('Error creating listing:', error);
        setError(error.message || 'An error occurred while creating the listing');
      } finally {
        setIsSubmitting(false);
        setProgress(null);
      }
    }
  };

  const goBack = () => {
    if (step === 'details') setStep('category');
    else if (step === 'filters') setStep('details');
    else if (step === 'images') setStep('filters');
  };

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 'category':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {t('listings.category')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Object.entries(categories).map(([id, category]) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === id;
                  return (
                    <label
                      key={id}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('category')}
                        value={id}
                        className="sr-only"
                        onChange={(e) => {
                          register('category').onChange(e);
                          setFormData(prev => ({
                            ...prev,
                            category: { category: e.target.value }
                          }));
                          
                          // Mettre à jour l'affichage du type de transaction
                          setShowTransactionType(id === 'immobilier' || id === 'vehicules');
                        }}
                      />
                      <Icon className="h-6 w-6 mb-2" />
                      <span className="text-sm text-center">{category.label}</span>
                    </label>
                  );
                })}
              </div>
              {errors.category && (
                <p className="text-red-500 text-sm mt-2">{errors.category.message as string}</p>
              )}
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            {/* Type de transaction (achat/location) pour immobilier et vehicules */}
            {showTransactionType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de transaction
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      watch('transaction_type') === 'achat' || !watch('transaction_type')
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('transaction_type')}
                      value="achat"
                      className="sr-only"
                      defaultChecked={!watch('transaction_type') || watch('transaction_type') === 'achat'}
                      onChange={(e) => {
                        register('transaction_type').onChange(e);
                        const updatedDetails = { 
                          ...formData.details, 
                          transaction_type: e.target.value 
                        };
                        setFormData({ ...formData, details: updatedDetails });
                        saveFormData({ ...formData, details: updatedDetails });
                      }}
                    />
                    <span className="text-sm font-medium">Vente</span>
                  </label>
                  <label
                    className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      watch('transaction_type') === 'location'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('transaction_type')}
                      value="location"
                      className="sr-only"
                      onChange={(e) => {
                        register('transaction_type').onChange(e);
                        const updatedDetails = { 
                          ...formData.details, 
                          transaction_type: e.target.value 
                        };
                        setFormData({ ...formData, details: updatedDetails });
                        saveFormData({ ...formData, details: updatedDetails });
                      }}
                    />
                    <span className="text-sm font-medium">Location</span>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                {t('listings.title')}
              </label>
              <input
                {...register('title')}
                type="text"
                id="title"
                className="input"
                placeholder="Ex: iPhone 13 Pro Max - 256GB"
                onChange={(e) => {
                  register('title').onChange(e);
                  const updatedDetails = { ...formData.details, title: e.target.value };
                  setFormData({ ...formData, details: updatedDetails });
                  saveFormData({ ...formData, details: updatedDetails });
                }}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('listings.description')}
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={4}
                className="input"
                placeholder="Describe your item in detail..."
                onChange={(e) => {
                  register('description').onChange(e);
                  const updatedDetails = { ...formData.details, description: e.target.value };
                  setFormData({ ...formData, details: updatedDetails });
                  saveFormData({ ...formData, details: updatedDetails });
                }}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                {watch('transaction_type') === 'location' 
                  ? `${t('listings.price')} (MAD/${formData.category?.category === 'immobilier' ? 'mois' : 'jour'})` 
                  : `${t('listings.price')} (MAD)`}
              </label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                id="price"
                className="input"
                placeholder="0"
                min="0"
                step="0.01"
                onChange={(e) => {
                  register('price').onChange(e);
                  const updatedDetails = { ...formData.details, price: Number(e.target.value) };
                  setFormData({ ...formData, details: updatedDetails });
                  saveFormData({ ...formData, details: updatedDetails });
                }}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('listings.location')}
              </label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <CitySelect
                    value={field.value}
                    onChange={(city: City | null) => {
                      field.onChange(city?.name || '');
                      const updatedDetails = { ...formData.details, city: city?.name || '' };
                      setFormData({ ...formData, details: updatedDetails });
                      saveFormData({ ...formData, details: updatedDetails });
                    }}
                    placeholder={t('common.searchPlaceholder')}
                  />
                )}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message as string}</p>
              )}
            </div>
          </div>
        );

      case 'filters':
        if (!formData.category?.category) return null;
        const categoryData = categories[formData.category.category as CategoryId];
        return (
          <div className="space-y-6">
            {Object.entries(categoryData.filters).map(([id, filter]) => {
              // Skip transaction_type as it's already handled in the details step
              if (id === 'transaction_type') return null;
              
              switch (filter.type) {
                case 'select':
                  return (
                    <div key={id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {filter.label}
                      </label>
                      <select
                        {...register(id)}
                        className="input"
                        onChange={(e) => {
                          register(id).onChange(e);
                          const updatedFilters = { ...formData.filters, [id]: e.target.value };
                          setFormData({ ...formData, filters: updatedFilters });
                          saveFormData({ ...formData, filters: updatedFilters });
                        }}
                      >
                        <option value="">{t('common.all')}</option>
                        {filter.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );

                case 'range':
                  const value = watch(id) || filter.min;
                  return (
                    <div key={id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {filter.label}
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            {...register(id, { valueAsNumber: true })}
                            min={filter.min}
                            max={filter.max}
                            step={filter.step}
                            className="w-full"
                            onChange={(e) => {
                              register(id).onChange(e);
                              const updatedFilters = { ...formData.filters, [id]: Number(e.target.value) };
                              setFormData({ ...formData, filters: updatedFilters });
                              saveFormData({ ...formData, filters: updatedFilters });
                            }}
                          />
                          <span className="text-sm text-gray-600 min-w-[80px]">
                            {watch(id) || filter.min}
                            {filter.unit ? ` ${filter.unit}` : ''}
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
                        {...register(id)}
                        id={id}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        onChange={(e) => {
                          register(id).onChange(e);
                          const updatedFilters = { ...formData.filters, [id]: e.target.checked };
                          setFormData({ ...formData, filters: updatedFilters });
                          saveFormData({ ...formData, filters: updatedFilters });
                        }}
                      />
                      <label htmlFor={id} className="text-sm font-medium text-gray-700">
                        {filter.label}
                      </label>
                    </div>
                  );

                default:
                  return null;
              }
            })}
          </div>
        );

      case 'images':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {t('listings.images')}
              </label>

              {/* Image drop zone */}
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <PlusCircle className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Cliquez pour ajouter</span> ou glissez-déposez
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG ou GIF (max. 5MB par image)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  disabled={isSubmitting}
                />
              </label>

              {/* Image previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.images && (
                <p className="text-red-500 text-sm mt-2">{errors.images.message as string}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="bg-white p-4 sm:p-8 rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {step !== 'category' && (
            <button
              type="button"
              onClick={goBack}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold">
            {step === 'category' && t('listings.category')}
            {step === 'details' && t('listings.title')}
            {step === 'filters' && t('filters.title')}
            {step === 'images' && t('listings.images')}
          </h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {['category', 'details', 'filters', 'images'].map((s, index) => (
            <React.Fragment key={s}>
              <div
                className={`w-2 h-2 rounded-full ${
                  s === step
                    ? 'bg-primary scale-125'
                    : index < ['category', 'details', 'filters', 'images'].indexOf(step)
                    ? 'bg-primary'
                    : 'bg-gray-200'
                }`}
              />
              {index < 3 && (
                <div
                  className={`flex-1 h-0.5 ${
                    index < ['category', 'details', 'filters'].indexOf(step)
                      ? 'bg-primary'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onStepSubmit)}>
          {renderStep()}

          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-sm rounded mt-6">
              {error}
            </div>
          )}

          {progress !== null && (
            <div className="mt-6">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">
                {progress === 100 ? t('common.finish') : `${t('common.loading')} ${progress}%`}
              </p>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="btn btn-primary w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                t('common.loading')
              ) : step === 'images' ? (
                t('common.finish')
              ) : (
                <>
                  {t('common.next')}
                  <ChevronRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}