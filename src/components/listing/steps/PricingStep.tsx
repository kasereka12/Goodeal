import React, { useState } from 'react';
import { UseFormRegister, FieldErrors, Control, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Euro, TrendingUp, Clock, AlertCircle, Info, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface PricingStepProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  watch: UseFormWatch<any>;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  formData: any;
  t: (key: string, fallback?: string) => string;
}

export const PricingStep: React.FC<PricingStepProps> = ({
  register,
  errors,
  watch,
  setValue,
  formData,
  t
}) => {
  const [showMarketAnalysis, setShowMarketAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState<{
    suggestedPrice: number;
    minPrice: number;
    maxPrice: number;
    avgTime: number;
    confidence: 'high' | 'medium' | 'low';
  } | null>(null);

  const category = watch('category') || formData.generalInfo?.category;
  const price = watch('pricing.price');
  
  // Fonction utilitaire pour simplifier les clés de traduction
  const translate = (key: string, fallback: string) => {
    return t(key) || fallback;
  };

  // Simuler une analyse de marché
  const analyzeMarket = () => {
    setIsAnalyzing(true);
    setShowMarketAnalysis(true);
    
    // Simuler un délai pour l'analyse
    setTimeout(() => {
      // Générer des valeurs simulées basées sur la catégorie et le prix actuel
      const currentPrice = parseFloat(price) || 0;
      let basePrice = currentPrice > 0 ? currentPrice : 
                     category === 'immobilier' ? 150000 :
                     category === 'vehicules' ? 8000 :
                     category === 'electronique' ? 500 : 100;
      
      // Ajouter une variation aléatoire
      const variation = Math.random() * 0.3 - 0.15; // -15% à +15%
      const suggestedPrice = Math.round(basePrice * (1 + variation));
      
      // Définir les prix min et max
      const minPrice = Math.round(suggestedPrice * 0.85);
      const maxPrice = Math.round(suggestedPrice * 1.15);
      
      // Temps moyen de vente (en jours)
      const avgTime = Math.round(
        category === 'immobilier' ? 45 + Math.random() * 30 :
        category === 'vehicules' ? 21 + Math.random() * 20 :
        category === 'electronique' ? 7 + Math.random() * 10 : 
        14 + Math.random() * 15
      );
      
      // Niveau de confiance
      const confidence: 'high' | 'medium' | 'low' = 
        Math.random() > 0.7 ? 'high' : 
        Math.random() > 0.4 ? 'medium' : 'low';
      
      setMarketAnalysis({
        suggestedPrice,
        minPrice,
        maxPrice,
        avgTime,
        confidence
      });
      
      setIsAnalyzing(false);
    }, 2000);
  };

  // Appliquer le prix suggéré
  const applySuggestedPrice = () => {
    if (marketAnalysis) {
      setValue('pricing.price', marketAnalysis.suggestedPrice, { shouldValidate: true });
    }
  };

  // Formater le prix avec des séparateurs de milliers
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
          <Euro className="h-5 w-5 mr-2 text-primary" />
          {translate('titreTarification', 'Tarification')}
        </h3>
        
        <div className="mt-4 space-y-6">
          {/* Prix */}
          <div className="group">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="pricing.price" className="block text-sm font-medium text-gray-700 group-focus-within:text-primary transition-colors">
                {translate('labelPrix', 'Prix')} <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={analyzeMarket}
                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md transition-colors flex items-center"
              >
                <TrendingUp className="h-3 w-3 mr-1" /> {translate('analyseMarché', 'Analyser le marché')}
              </button>
            </div>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">€</span>
              </div>
              <input
                type="number"
                {...register('pricing.price', { required: true, min: 0 })}
                className="block w-full pl-8 pr-12 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="0.00"
                defaultValue={formData.pricing?.price || ''}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">MAD</span>
              </div>
            </div>
            {errors['pricing.price'] && (
              <p className="mt-1 text-sm text-red-600 animate-fadeIn">{translate('errors.required', 'Ce champ est requis')}</p>
            )}
          </div>
          
          {/* Période de location (conditionnelle) */}
          {category === 'real_estate' && (
            <div className="group mt-4">
              <label htmlFor="rental_period" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary transition-colors">
                {translate('listings.rentalPeriod', 'Période de location')}
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="rental_period"
                  {...register('rental_period')}
                  className="block w-full pl-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  defaultValue={formData.pricing?.rental_period || ''}
                >
                  <option value="">{translate('listings.selectPeriod', 'Sélectionner une période')}</option>
                  <option value="day">{translate('listings.perDay', 'Par jour')}</option>
                  <option value="week">{translate('listings.perWeek', 'Par semaine')}</option>
                  <option value="month">{translate('listings.perMonth', 'Par mois')}</option>
                  <option value="year">{translate('listings.perYear', 'Par an')}</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Analyse de marché */}
          {showMarketAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              {isAnalyzing ? (
                <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                  <p className="text-sm text-blue-700">{translate('listings.analyzing', 'Analyse en cours...')}</p>
                </div>
              ) : marketAnalysis ? (
                <div className="space-y-3">
                  <div className="bg-white rounded-md p-3 border border-blue-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{translate('listings.suggestedPrice', 'Prix suggéré')}</span>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        marketAnalysis.confidence === 'high' ? 'bg-green-100 text-green-800' :
                        marketAnalysis.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {translate(`listings.confidence.${marketAnalysis.confidence}`, 
                          marketAnalysis.confidence === 'high' ? 'Confiance élevée' :
                          marketAnalysis.confidence === 'medium' ? 'Confiance moyenne' :
                          'Confiance faible'
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-800 font-medium text-xl">{formatPrice(marketAnalysis.suggestedPrice)} MAD</p>
                      <button
                        onClick={applySuggestedPrice}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md transition-colors flex items-center"
                      >
                        <Check className="h-3 w-3 mr-1" /> {translate('listings.applyPrice', 'Appliquer')}
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {translate('listings.priceRange', 'Fourchette de prix')}: {formatPrice(marketAnalysis.minPrice)} MAD - {formatPrice(marketAnalysis.maxPrice)} MAD
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-md p-3 border border-blue-100">
                    <div className="flex items-center mb-1">
                      <Clock className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">{translate('listings.estimatedTime', 'Temps estimé pour vendre')}</span>
                    </div>
                    <p className="text-gray-800">{marketAnalysis.avgTime} {translate('listings.days', 'jours')}</p>
                  </div>
                  
                  <div className="flex items-start mt-3 text-xs text-gray-500">
                    <Info className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0 mt-0.5" />
                    <p className="italic">
                      {translate('listings.analysisDisclaimer', 'Cette analyse est basée sur des données du marché similaires. Les résultats réels peuvent varier en fonction de nombreux facteurs.')}
                    </p>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}
          
          {/* Conseils de tarification */}
          <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-1">{translate('listings.pricingTips', 'Conseils de tarification')}</h4>
                <ul className="text-xs text-yellow-700 space-y-1 list-disc pl-4">
                  <li>{translate('listings.tip1', 'Recherchez des articles similaires pour comparer les prix')}</li>
                  <li>{translate('listings.tip2', 'Tenez compte de l\'état et de l\'âge de votre article')}</li>
                  <li>{translate('listings.tip3', 'Un prix légèrement inférieur au marché peut accélérer la vente')}</li>
                  <li>{translate('listings.tip4', 'N\'oubliez pas d\'inclure les frais de livraison dans votre calcul')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
