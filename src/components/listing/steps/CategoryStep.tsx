import { useEffect } from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { categories, CategoryId } from '../../../lib/categories';
import { AlertTriangle } from 'lucide-react';

interface CategoryStepProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  t: (key: string, fallback?: string) => string;
}

export const CategoryStep = ({
  register,
  errors,
  watch,
  setValue,
  t
}: CategoryStepProps) => {

  const selectedCategory = watch('category') as CategoryId | undefined;
  
  // Réinitialiser le type si la catégorie change
  useEffect(() => {
    if (selectedCategory) {
      setValue('type', '');
    }
  }, [selectedCategory, setValue]);

  // Définir le type de transaction en fonction de la catégorie
  useEffect(() => {
    if (selectedCategory === 'immobilier' || selectedCategory === 'vehicules') {
      setValue('showTransactionType', true);
    } else {
      setValue('showTransactionType', false);
    }
  }, [selectedCategory, setValue]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Message d'alerte */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Veuillez créer une annonce distincte pour chaque bien ou service.
          </p>
        </div>
      </div>
      
      {/* Sélection de catégorie */}
      <div>
        <label className="block text-lg font-medium text-gray-800 mb-4 flex items-center">
          Catégorie
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(categories).map(([id, category]) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === id;
            return (
              <label
                key={id}
                className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 h-36 ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary shadow-lg'
                    : 'border-gray-200 hover:border-primary/30 hover:shadow-lg'
                }`}
              >
                <input
                  type="radio"
                  {...register('category')}
                  value={id}
                  className="sr-only"
                />
                <div className={`p-3 rounded-full mb-3 ${isSelected ? 'bg-primary/10' : 'bg-gray-100'} transition-all duration-300`}>
                  <Icon className={`h-8 w-8 transition-transform duration-300 ${isSelected ? 'scale-110 text-primary' : 'text-gray-600'}`} />
                </div>
                <span className="text-base text-center font-medium">{category.label}</span>
              </label>
            );
          })}
        </div>
        {errors.category && (
          <p className="mt-2 text-sm text-red-600 animate-fadeIn">{errors.category.message as string}</p>
        )}
      </div>

      {/* Sélection de type de transaction pour immobilier et vehicules */}
      {selectedCategory && (selectedCategory === 'immobilier' || selectedCategory === 'vehicules') && (
        <div className="mt-8 animate-fadeIn">
          <label className="block text-lg font-medium text-gray-800 mb-4">
            {t('transactionType') || 'Type de transaction'}
          </label>
          <div className="grid grid-cols-2 gap-6">
            {selectedCategory && categories[selectedCategory]?.filters?.transaction_type?.options.map((option: {value: string, label: string}) => {
              const isSelected = watch('transaction_type') === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex items-center justify-center p-5 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary shadow-md'
                      : 'border-gray-200 hover:border-primary/30 hover:shadow-md'
                  }`}
                >
                  <input
                    type="radio"
                    {...register('transaction_type')}
                    value={option.value}
                    className="sr-only"
                  />
                  <span className="text-base font-medium">{option.label}</span>
                </label>
              );
            })}
          </div>
          {errors.transaction_type && (
            <p className="mt-2 text-sm text-red-600 animate-fadeIn">{errors.transaction_type.message as string}</p>
          )}
        </div>
      )}


    </div>
  );
};
