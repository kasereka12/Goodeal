import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { categories } from '../lib/categories';
import CitySelect from '../components/CitySelect';
import type { City } from '../lib/cities';
import { createRequest } from '../lib/requests';

// Schéma de validation
const requestSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  category: z.string().min(1, 'Veuillez sélectionner une catégorie'),
  urgency: z.enum(['low', 'medium', 'high']),
  budget: z.number().optional(),
  city: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function CreateRequest() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  React.useEffect(() => {
    if (!user) {
      sessionStorage.setItem('redirectAfterAuth', window.location.pathname);
      navigate('/auth');
    }
  }, [user, navigate]);

  // Si l'utilisateur n'est pas connecté, ne pas rendre le formulaire
  if (!user) return null;

  const { register, handleSubmit, control, formState: { errors } } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      urgency: 'medium'
    }
  });

  const onSubmit = async (data: RequestFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      await createRequest(user.id, {
        title: data.title,
        description: data.description,
        category: data.category,
        urgency: data.urgency,
        budget: data.budget,
        city: data.city,
        filters: {}
      });

      // Rediriger vers la page des demandes
      navigate('/requests');
    } catch (err: any) {
      console.error('Error creating request:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6">{t('requests.create')}</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Titre */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              {t('listings.title')}
            </label>
            <input
              {...register('title')}
              type="text"
              id="title"
              className="input"
              placeholder="Ex: Recherche appartement 2 pièces"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              {t('listings.description')}
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              className="input"
              placeholder="Décrivez ce que vous recherchez..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Catégorie */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              {t('listings.category')}
            </label>
            <select
              {...register('category')}
              id="category"
              className="input"
            >
              <option value="">{t('common.all')}</option>
              {Object.entries(categories).map(([id, category]) => (
                <option key={id} value={id}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Urgence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('requests.urgency.label')}
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['low', 'medium', 'high'].map((urgency) => (
                <label
                  key={urgency}
                  className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    urgency === 'high' ? 'hover:bg-red-50' :
                    urgency === 'medium' ? 'hover:bg-yellow-50' :
                    'hover:bg-green-50'
                  }`}
                >
                  <input
                    type="radio"
                    {...register('urgency')}
                    value={urgency}
                    className="sr-only"
                  />
                  <span className={`text-sm font-medium ${
                    urgency === 'high' ? 'text-red-600' :
                    urgency === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {t(`requests.urgency.${urgency}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Budget (MAD) - {t('common.optional')}
            </label>
            <input
              {...register('budget', { valueAsNumber: true })}
              type="number"
              id="budget"
              className="input"
              placeholder="0"
              min="0"
            />
            {errors.budget && (
              <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
            )}
          </div>

          {/* Ville */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('listings.location')} - {t('common.optional')}
            </label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <CitySelect
                  value={field.value}
                  onChange={(city: City | null) => field.onChange(city?.name || '')}
                  placeholder={t('common.searchPlaceholder')}
                />
              )}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-sm rounded">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.loading') : t('requests.create')}
          </button>
        </form>
      </div>
    </div>
  );
}