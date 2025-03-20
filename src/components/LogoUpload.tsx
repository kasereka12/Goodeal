import React, { useState } from 'react';
import { uploadLogo } from '../lib/storage';

export default function LogoUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [logoURL, setLogoURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Vérification du type de fichier
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image');
        return;
      }

      try {
        setIsUploading(true);
        setError(null);
        const url = await uploadLogo(file);
        setLogoURL(url);
      } catch (error) {
        setError('Erreur lors du téléchargement du logo');
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="logo-upload"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
            </p>
            <p className="text-xs text-gray-500">PNG, JPG ou GIF</p>
          </div>
          <input
            id="logo-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleLogoUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {isUploading && (
        <div className="text-center text-gray-500">
          Téléchargement en cours...
        </div>
      )}

      {error && (
        <div className="text-center text-red-500">
          {error}
        </div>
      )}

      {logoURL && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Logo téléchargé :</p>
          <img
            src={logoURL}
            alt="Logo téléchargé"
            className="max-w-xs mx-auto rounded-lg shadow-sm"
          />
        </div>
      )}
    </div>
  );
}