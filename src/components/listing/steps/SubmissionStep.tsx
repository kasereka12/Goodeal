import React from 'react';
import { CheckCircle, AlertTriangle, Eye } from 'lucide-react';
import { FormDataType } from '../../../types/listingTypes';

interface SubmissionStepProps {
  formData: FormDataType;
  isSubmitting: boolean;
  previewUrls: string[];
  errors: any;
  handleShowPreview: () => void;
  t: (key: string, fallback?: string) => string;
}

const SubmissionStep: React.FC<SubmissionStepProps> = ({
  formData,
  isSubmitting,
  previewUrls,
  errors,
  handleShowPreview,
  t
}) => {
  // Vérifier si tous les champs obligatoires sont remplis
  const hasRequiredFields = React.useMemo(() => {
    const requiredSections = [
      formData.category?.category,
      formData.generalInfo?.title,
      formData.generalInfo?.description,
      formData.pricing?.price
    ];
    
    return requiredSections.every(field => field && (typeof field === 'string' ? field.trim() !== '' : true));
  }, [formData]);
  
  // Vérifier s'il y a des images
  const hasImages = previewUrls.length > 0;
  
  // Vérifier s'il y a des erreurs de validation
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          {t('submissionTitle') || 'Soumission et validation'}
        </h2>
        <p className="text-gray-600 text-sm">
          {t('submissionDescription') || 'Vérifiez les informations de votre annonce avant de la publier'}
        </p>
      </div>

      {/* Résumé de l'annonce */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-3">
          {t('listingSummary') || 'Résumé de l\'annonce'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">{t('category') || 'Catégorie'}</p>
            <p className="font-medium">{formData.category?.category || '-'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">{t('title') || 'Titre'}</p>
            <p className="font-medium">{formData.generalInfo?.title || '-'}</p>
          </div>
          
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">{t('description') || 'Description'}</p>
            <p className="font-medium line-clamp-2">{formData.generalInfo?.description || '-'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">{t('price') || 'Prix'}</p>
            <p className="font-medium">{formData.pricing?.price ? `${formData.pricing.price} EUR` : '-'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">{t('images') || 'Images'}</p>
            <p className="font-medium">{previewUrls.length} {t('uploadedImages') || 'image(s) téléchargée(s)'}</p>
          </div>
        </div>
      </div>

      {/* Vérifications */}
      <div className="space-y-3">
        <div className={`flex items-center p-3 rounded-lg ${hasRequiredFields ? 'bg-green-50' : 'bg-yellow-50'}`}>
          {hasRequiredFields ? (
            <CheckCircle size={20} className="text-green-500 mr-3 flex-shrink-0" />
          ) : (
            <AlertTriangle size={20} className="text-yellow-500 mr-3 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm font-medium ${hasRequiredFields ? 'text-green-700' : 'text-yellow-700'}`}>
              {t('requiredFields') || 'Champs obligatoires'}
            </p>
            <p className="text-xs text-gray-600">
              {hasRequiredFields 
                ? (t('allRequiredFieldsCompleted') || 'Tous les champs obligatoires sont remplis')
                : (t('missingRequiredFields') || 'Certains champs obligatoires sont manquants')}
            </p>
          </div>
        </div>

        <div className={`flex items-center p-3 rounded-lg ${hasImages ? 'bg-green-50' : 'bg-yellow-50'}`}>
          {hasImages ? (
            <CheckCircle size={20} className="text-green-500 mr-3 flex-shrink-0" />
          ) : (
            <AlertTriangle size={20} className="text-yellow-500 mr-3 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm font-medium ${hasImages ? 'text-green-700' : 'text-yellow-700'}`}>
              {t('images') || 'Images'}
            </p>
            <p className="text-xs text-gray-600">
              {hasImages 
                ? (t('imagesUploaded') || `${previewUrls.length} image(s) téléchargée(s)`)
                : (t('noImagesUploaded') || 'Aucune image téléchargée')}
            </p>
          </div>
        </div>

        {hasErrors && (
          <div className="flex items-center p-3 rounded-lg bg-red-50">
            <AlertTriangle size={20} className="text-red-500 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700">
                {t('validationErrors') || 'Erreurs de validation'}
              </p>
              <p className="text-xs text-gray-600">
                {t('pleaseFixErrors') || 'Veuillez corriger les erreurs avant de soumettre'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Aperçu */}
      <button
        type="button"
        onClick={handleShowPreview}
        className="flex items-center justify-center w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        <Eye size={18} className="mr-2" />
        {t('fullPreview') || 'Aperçu complet de l\'annonce'}
      </button>

      {/* Informations supplémentaires */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-700 mb-2">
          {t('additionalInfo') || 'Informations supplémentaires'}
        </h3>
        <ul className="text-sm text-blue-600 space-y-1 list-disc pl-5">
          <li>{t('infoPoint1') || 'Votre annonce sera examinée par notre équipe avant publication'}</li>
          <li>{t('infoPoint2') || 'Vous recevrez une notification par email lorsque votre annonce sera publiée'}</li>
          <li>{t('infoPoint3') || 'Vous pourrez modifier votre annonce après publication depuis votre tableau de bord'}</li>
        </ul>
      </div>

      {isSubmitting && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-gray-600">{t('uploading') || 'Téléchargement en cours...'}</p>
        </div>
      )}
    </div>
  );
};

export { SubmissionStep };
