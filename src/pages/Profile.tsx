import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../lib/auth';
import { uploadProfilePhoto } from '../lib/storage';
import { User, Camera } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await updateUserProfile(displayName);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    // Verify file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('profile.errors.fileSize'));
      return;
    }

    // Verify file type
    if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
      setError(t('profile.errors.fileType'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Check if user is logged in
      if (!user) {
        throw new Error(t('auth.errors.notAuthenticated'));
      }

      // Upload profile photo
      const photoURL = await uploadProfilePhoto(user.id, file, (progress) => {
        setUploadProgress(Math.round(progress));
      });
      
      // Update profile with new photo
      await updateUserProfile(undefined, photoURL);
      
      // Reload page after 1 second to show new photo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || t('profile.errors.uploadFailed'));
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>

        <div className="space-y-6">
          {/* Profile photo */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={t('profile.photo')}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <label
                htmlFor="photo-upload"
                className={`absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Camera className="w-5 h-5 text-gray-600" />
                <input
                  type="file"
                  id="photo-upload"
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handlePhotoUpload}
                  disabled={isLoading}
                />
              </label>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {t('profile.photoUploadHint')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t('profile.photoUploadFormats')}
              </p>
            </div>

            {uploadProgress !== null && (
              <div className="w-full max-w-xs">
                <div className="bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {uploadProgress === 100 ? t('common.finish') : `${uploadProgress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded max-w-md text-center">
                {error}
              </div>
            )}
          </div>

          {/* Profile information */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">{t('auth.email')}</p>
              <p className="font-medium">{user?.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">{t('profile.displayName')}</p>
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input"
                    placeholder={t('profile.displayNamePlaceholder')}
                    disabled={isLoading}
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? t('common.loading') : t('common.save')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setDisplayName(user?.user_metadata?.display_name || '');
                      }}
                      disabled={isLoading}
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center space-x-2">
                  <p className="font-medium">
                    {user?.user_metadata?.display_name || t('profile.noDisplayName')}
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary hover:underline text-sm"
                  >
                    {t('common.edit')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}