import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import { categories, CategoryId } from '../../../lib/categories';
import { StepData } from '../../../types/listing.types';

interface FiltersStepProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  formData: Partial<StepData>;
  t: (key: string) => string;
}

export function FiltersStep({
  register,
  watch,
  formData,
  t
}: FiltersStepProps) {
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
                >
                  <option value="">{t('common.all')}</option>
                  {filter.options.map((option: { value: string; label: string }) => (
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
                    />
                    <span className="text-sm text-gray-600 min-w-[80px]">
                      {value}
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
}
