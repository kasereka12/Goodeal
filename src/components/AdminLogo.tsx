import React, { useState } from 'react';
import { uploadProfilePhoto } from '../lib/storage';

export default function AdminLogo() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);
    setProgress(0);

    try {
      const file = event.target.files[0];
      const url = await uploadProfilePhoto('admin', file, (progress) => {
        setProgress(progress);
      });
      
      setSuccess('Logo téléchargé avec succès !');
      
      // Recharger la page après 1 seconde pour afficher le nouveau logo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Gestion du Logo</h2>
      
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center w-full">
          <label
            htmlFor="logo-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
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
                <span className="font-semibold">Cliquez pour télécharger</span>
              </p>
              <p className="text-xs text-gray-500">PNG, JPG ou GIF (max. 5MB)</p>
            </div>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={isUploading}
            />
          </label>
        </div>
        
        {progress !== null && (
          <div className="w-full">
            <div className="bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">
              {progress === 100 ? 'Téléchargement terminé' : `${progress}%`}
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-500 text-sm rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-600 text-sm rounded">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}