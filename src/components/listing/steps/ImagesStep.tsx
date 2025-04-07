import { Image, Info, X, Upload } from 'lucide-react';

interface ImagesStepProps {
  isSubmitting: boolean;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewUrls: string[];
  removeImage: (index: number) => void;
  t: (key: string, fallback?: string) => string;
}

export function ImagesStep({
  isSubmitting,
  handleImageSelect,
  previewUrls,
  removeImage,
  t
}: ImagesStepProps) {

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Note d'information */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md shadow-sm animate-slideInUp">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-blue-700 text-sm">
            {t('imagesNote') || "Ajoutez des photos de qualité pour mettre en valeur votre annonce. Les annonces avec de bonnes photos reçoivent plus de visites."}
          </p>
        </div>
      </div>

      <div className="animate-slideInUp" style={{ animationDelay: '100ms' }}>
        <label className="block text-lg font-medium text-gray-800 mb-2 flex items-center">
          <Image className="h-5 w-5 mr-2 text-primary" />
          {t('images') || "Images"}
        </label>
        <p className="text-sm text-gray-500 mb-4">
          {t('imagesDescription') || "Vous pouvez ajouter jusqu'à 10 images pour votre annonce."}
        </p>

        {/* Image drop zone */}
        <label 
          className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'} 
            ${previewUrls.length === 0 ? 'border-primary/30 bg-primary/5' : 'border-gray-300 bg-gray-50'}`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className={`w-12 h-12 mb-3 transition-all duration-300 ${previewUrls.length === 0 ? 'text-primary animate-bounce' : 'text-gray-400'}`} />
            <p className="mb-2 text-sm text-gray-700">
              <span className="font-semibold text-primary">{t('clickToAdd') || "Cliquez pour ajouter"}</span> {t('orDragAndDrop') || "ou glissez-déposez"}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG ou GIF (max. 5MB par image)
            </p>
          </div>
          <input 
            id="dropzone-file" 
            type="file" 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={handleImageSelect} 
            disabled={isSubmitting}
          />
        </label>

        {/* Image preview grid */}
        {previewUrls.length > 0 && (
          <div className="animate-slideInUp" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
              <Image className="h-5 w-5 mr-2 text-primary" />
              {t('imagePreview') || "Aperçu des images"} ({previewUrls.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group animate-fadeIn">
                  <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Conseils pour de bonnes photos */}
      {previewUrls.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-slideInUp" style={{ animationDelay: '300ms' }}>
          <h3 className="text-md font-medium text-gray-800 mb-2">
            {t('photoTips') || "Conseils pour de bonnes photos"}
          </h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>{t('photoTip1') || "Prenez des photos en pleine lumière pour plus de clarté"}</li>
            <li>{t('photoTip2') || "Montrez votre article sous différents angles"}</li>
            <li>{t('photoTip3') || "Évitez les arrière-plans encombrés"}</li>
            <li>{t('photoTip4') || "La première image sera utilisée comme image principale de l'annonce"}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
