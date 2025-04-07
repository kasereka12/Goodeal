import React, { useState } from 'react';
import { X, Camera, Clock, Shield, BarChart, MapPin, Share2, ChevronLeft, ChevronRight, Heart, MessageCircle, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { FormDataType } from '../../../types/listingTypes';
import { formatPrice } from '../../../utils/listingUtils';
import { AiSuggestions } from './AiSuggestions';
import { 
  previewContainerStyle, 
  previewHeaderStyle, 
  previewBodyStyle 
} from '../../../styles/listingStyles';

interface ListingPreviewProps {
  formData: FormDataType;
  previewUrls: string[];
  showPreview: boolean;
  handleClosePreview: () => void;
  aiSuggestions: {
    title?: string;
    description?: string;
  };
  applySuggestion: (field: string, value: string) => void;
  isGeneratingAiSuggestions: boolean;
  generatingField: string;
  showAiSuggestions: boolean;
}

export const ListingPreview: React.FC<ListingPreviewProps> = ({
  formData,
  previewUrls,
  showPreview,
  handleClosePreview,
  aiSuggestions,
  applySuggestion,
  isGeneratingAiSuggestions,
  generatingField,
  showAiSuggestions
}) => {
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!showPreview) return null;

  // Fonction pour formater le prix en fonction du type de transaction
  const priceDisplay = () => {
    const price = formData.generalInfo?.price || formData.pricing?.price;
    const transactionType = formData.generalInfo?.transaction_type || 'vente';
    const rentalPeriod = formData.pricing?.rental_period || 'mois';
    
    if (transactionType === 'location' && price) {
      return `${formatPrice(price)}/${rentalPeriod}`;
    }
    return formatPrice(price);
  };

  // Navigation du carrousel
  const nextImage = () => {
    if (previewUrls.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === previewUrls.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (previewUrls.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? previewUrls.length - 1 : prevIndex - 1
      );
    }
  };

  // Fonction pour partager l'annonce
  const shareUrl = window.location.href;
  const shareTitle = formData.generalInfo?.title || t('noTitle') || 'Sans titre';

  const handleShare = (platform: string) => {
    let shareLink = '';
    
    switch(platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank');
    }
    
    setShowShareOptions(false);
  };

  return (
    <div className={previewContainerStyle}>
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={handleClosePreview}
          className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Fermer la prévisualisation"
        >
          <X size={24} className="text-gray-700" />
        </button>
      </div>
      <div className="max-w-3xl mx-auto max-h-[85vh] overflow-y-auto bg-white rounded-lg shadow-xl p-2">
        {/* En-tête de la prévisualisation */}
        <div className={previewHeaderStyle}>
          <h2 className="text-xl font-semibold">
            {t('aperçuAnnonce') || 'Prévisualisation de l\'annonce'}
          </h2>
        </div>
        
        {/* Corps de la prévisualisation */}
        <div className={previewBodyStyle}>
          {/* Images avec carrousel */}
          <div className="mb-6 relative">
            {previewUrls.length > 0 ? (
              <div className="relative rounded-lg overflow-hidden h-64 bg-gray-100">
                <img 
                  src={previewUrls[currentImageIndex]} 
                  alt={`Image ${currentImageIndex + 1}`} 
                  className="w-full h-full object-cover"
                />
                
                {/* Compteur d'images */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {previewUrls.length}
                </div>
                
                {/* Boutons de navigation */}
                {previewUrls.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 text-gray-800 transition-all"
                      aria-label="Image précédente"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 text-gray-800 transition-all"
                      aria-label="Image suivante"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                
                {/* Miniatures */}
                {previewUrls.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {previewUrls.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === index ? 'bg-white scale-125' : 'bg-white bg-opacity-50'}`}
                        aria-label={`Aller à l'image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
                
                {/* Actions rapides */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 transition-all"
                    aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Heart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'} />
                  </button>
                  <button 
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 transition-all"
                    aria-label="Partager"
                  >
                    <Share2 size={20} className="text-gray-700" />
                  </button>
                </div>
                
                {/* Options de partage */}
                {showShareOptions && (
                  <div className="absolute top-16 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleShare('facebook')} className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded">
                        <Facebook size={18} className="text-blue-600" />
                        <span>Facebook</span>
                      </button>
                      <button onClick={() => handleShare('twitter')} className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded">
                        <Twitter size={18} className="text-blue-400" />
                        <span>Twitter</span>
                      </button>
                      <button onClick={() => handleShare('linkedin')} className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded">
                        <Linkedin size={18} className="text-blue-700" />
                        <span>LinkedIn</span>
                      </button>
                      <button onClick={() => handleShare('email')} className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded">
                        <Mail size={18} className="text-gray-600" />
                        <span>Email</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Camera size={48} className="mx-auto mb-2" />
                  <p>{t('noImages') || 'Aucune image disponible'}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Titre et prix */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-4">
            <div>
              <h1 className="text-2xl font-bold">
                {formData.generalInfo?.title || t('noTitle') || 'Sans titre'}
              </h1>
              {formData.generalInfo?.city && (
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin size={16} className="mr-1" />
                  <span>{formData.generalInfo.city}</span>
                </div>
              )}
            </div>
            <div className="text-xl font-semibold text-primary px-4 py-2 bg-primary bg-opacity-10 rounded-lg">
              {priceDisplay()}
            </div>
          </div>
          
          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">
                {t('category') || 'Catégorie'}
              </p>
              <p className="font-medium">
                {typeof formData.category === 'string' 
                  ? formData.category 
                  : typeof formData.generalInfo?.category === 'string' 
                    ? formData.generalInfo.category 
                    : t('notSpecified') || 'Non spécifié'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {t('condition') || 'État'}
              </p>
              <p className="font-medium">
                {formData.generalInfo?.condition || t('notSpecified') || 'Non spécifié'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {t('location') || 'Localisation'}
              </p>
              <p className="font-medium">
                {formData.generalInfo?.city || t('notSpecified') || 'Non spécifié'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {t('transactionType') || 'Type de transaction'}
              </p>
              <p className="font-medium">
                {formData.generalInfo?.transaction_type === 'vente' 
                  ? (t('sale') || 'Vente') 
                  : (t('rental') || 'Location')}
              </p>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              {t('description') || 'Description'}
            </h3>
            <p className="text-gray-700 whitespace-pre-line">
              {formData.generalInfo?.description || t('noDescription') || 'Aucune description fournie'}
            </p>
          </div>
          
          {/* Détails spécifiques */}
          {formData.specificDetails && Object.keys(formData.specificDetails).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Shield size={18} className="mr-2 text-primary" />
                {t('specificDetails') || 'Caractéristiques'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                {Object.entries(formData.specificDetails).map(([key, value]) => {
                  // Skip rendering if value is falsy or if it's already shown in badges
                  if (!value || ['surface', 'rooms', 'condition'].includes(key)) return null;
                  
                  // Handle case where value is an object (like amenities with nested properties)
                  if (typeof value === 'object' && value !== null) {
                    return (
                      <div key={key} className="bg-white p-3 rounded-md shadow-sm">
                        <p className="text-sm font-semibold text-gray-700 border-b pb-1 mb-2">{key}</p>
                        <div className="font-medium">
                          {Object.entries(value).map(([subKey, subValue]) => 
                            subValue ? (
                              <div key={subKey} className="flex items-center mt-1">
                                <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                                <span className="text-sm text-gray-700">{subKey}: </span>
                                <span className="text-sm ml-1">{String(subValue)}</span>
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  // Handle primitive values (string, number, boolean)
                  return (
                    <div key={key} className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-sm font-semibold text-gray-700 border-b pb-1 mb-2">{key}</p>
                      <p className="font-medium text-sm">{String(value)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Contact */}
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <MessageCircle size={18} className="mr-2 text-primary" />
              {t('contactInfo') || 'Contact'}
            </h3>
            <p className="text-gray-700">
              {formData.generalInfo?.contact_info || t('noContactInfo') || 'Aucune information de contact fournie'}
            </p>
            <button className="mt-3 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors w-full sm:w-auto">
              {t('contactSeller') || 'Contacter le vendeur'}
            </button>
          </div>
          
          {/* Badges d'information */}
          <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center text-sm text-gray-600 bg-white px-3 py-2 rounded-md shadow-sm">
              <Clock size={16} className="mr-2 text-blue-500" />
              <span>{t('justNow') || 'À l\'instant'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 bg-white px-3 py-2 rounded-md shadow-sm">
              <Shield size={16} className="mr-2 text-green-500" />
              <span>{t('verifiedUser') || 'Utilisateur vérifié'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 bg-white px-3 py-2 rounded-md shadow-sm">
              <BarChart size={16} className="mr-2 text-purple-500" />
              <span>{t('viewsToday') || '0 vues aujourd\'hui'}</span>
            </div>
          </div>
          
          {/* Carte de localisation (simulée) */}
          {formData.generalInfo?.city && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <MapPin size={18} className="mr-2 text-primary" />
                {t('location') || 'Localisation'}
              </h3>
              <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-300 opacity-50"></div>
                <div className="z-10 text-center">
                  <MapPin size={32} className="mx-auto mb-2 text-primary" />
                  <p className="font-medium">{formData.generalInfo.city}</p>
                  {formData.generalInfo.address && (
                    <p className="text-sm text-gray-700">{formData.generalInfo.address}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">{t('mapPreviewUnavailable') || 'Aperçu de la carte non disponible en prévisualisation'}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Suggestions d'IA */}
          {showAiSuggestions && (
            <AiSuggestions 
              aiSuggestions={aiSuggestions}
              applySuggestion={applySuggestion}
              isGeneratingAiSuggestions={isGeneratingAiSuggestions}
              generatingField={generatingField}
            />
          )}
        </div>
      </div>
    </div>
  );
};
