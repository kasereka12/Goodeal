import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { StepNavigationProps } from '../../types/listingTypes';
import { primaryButtonStyle, secondaryButtonStyle, disabledButtonStyle } from '../../styles/listingStyles';

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStepIndex,
  goBack,
  isSubmitting,
  progress,
  step
}) => {
  const { t } = useLanguage();

  return (
    <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
      {/* Bouton retour (sauf pour la première étape) */}
      {currentStepIndex > 0 ? (
        <button
          type="button"
          onClick={goBack}
          className={secondaryButtonStyle}
        >
          {t('common.back') || 'Retour'}
        </button>
      ) : (
        <div></div>
      )}
      
      {/* Afficher la progression pendant le téléchargement des images */}
      {isSubmitting && progress !== null && step === 'images' && (
        <div className="flex-1 mx-4">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-primary">
                  {t('createListing.uploading') || 'Téléchargement'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div 
                style={{ width: `${progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
              ></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Espace vide si pas de progression à afficher */}
      {(!isSubmitting || progress === null || step !== 'images') && <div></div>}
      
      {/* Bouton suivant/soumettre */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`${primaryButtonStyle} ${isSubmitting ? disabledButtonStyle : ''}`}
      >
        {step === 'images' ? t('common.submit') || 'Publier l\'annonce' : t('common.next') || 'Suivant'}
        {isSubmitting && (
          <span className="ml-2 inline-block animate-spin">⟳</span>
        )}
      </button>
    </div>
  );
};
