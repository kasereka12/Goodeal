import React from 'react';
import { Lightbulb } from 'lucide-react';
import { AiSuggestionsProps } from '../../../types/listingTypes';
import { 
  aiSuggestionContainerStyle, 
  aiSuggestionHeaderStyle, 
  aiSuggestionContentStyle, 
  aiSuggestionButtonStyle 
} from '../../../styles/listingStyles';
import { useLanguage } from '../../../contexts/LanguageContext';

export const AiSuggestions: React.FC<AiSuggestionsProps> = ({
  aiSuggestions,
  applySuggestion,
  isGeneratingAiSuggestions,
  generatingField
}) => {
  const { t } = useLanguage();

  if (!aiSuggestions.title && !aiSuggestions.description && !isGeneratingAiSuggestions) {
    return null;
  }

  return (
    <div className={aiSuggestionContainerStyle}>
      <div className={aiSuggestionHeaderStyle}>
        <Lightbulb className="mr-2" size={18} />
        <span>{t('createListing.aiSuggestions') || 'Suggestions d\'amélioration'}</span>
      </div>
      
      {isGeneratingAiSuggestions && (
        <div className="flex items-center text-gray-600 mb-2">
          <div className="animate-pulse mr-2">⟳</div>
          <span>
            {t('générationSuggestions') || 'Génération de suggestions pour'} {' '}
            {generatingField === 'title' 
              ? (t('titreListing') || 'le titre') 
              : (t('descriptionListing') || 'la description')}...
          </span>
        </div>
      )}
      
      {aiSuggestions.title && (
        <div className="mb-3">
          <div className="font-medium text-sm text-gray-700 mb-1">
            {t('suggestionTitre') || 'Suggestion de titre'}:
          </div>
          <div className={aiSuggestionContentStyle}>"{aiSuggestions.title}"</div>
          <div>
            <button 
              onClick={() => applySuggestion('title', aiSuggestions.title || '')}
              className={aiSuggestionButtonStyle}
            >
              {t('common.apply') || 'Appliquer'}
            </button>
          </div>
        </div>
      )}
      
      {aiSuggestions.description && (
        <div>
          <div className="font-medium text-sm text-gray-700 mb-1">
            {t('suggestionDescription') || 'Suggestion de description'}:
          </div>
          <div className={aiSuggestionContentStyle}>"{aiSuggestions.description}"</div>
          <div>
            <button 
              onClick={() => applySuggestion('description', aiSuggestions.description || '')}
              className={aiSuggestionButtonStyle}
            >
              {t('common.apply') || 'Appliquer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
