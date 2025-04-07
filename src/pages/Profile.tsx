import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  User, Camera, Phone, MessageSquare,
  Check, AlertCircle, Store, Briefcase,
  ShieldCheck, ShieldAlert, Loader
} from 'lucide-react';

type SellerType = 'particular' | 'professional';

interface ProfileState {
  username: string;
  phone: string;
  whatsapp: string;
  is_seller: boolean;
  seller_type: SellerType;
  company_name: string;
  show_phone: boolean;
  show_whatsapp: boolean;
  seller_approved: boolean;
  avatar_url: string;
}

interface UIState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

const AVATAR_BUCKET = 'avatars';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileState>({
    username: '',
    phone: '',
    whatsapp: '',
    is_seller: false,
    seller_type: 'particular',
    company_name: '',
    show_phone: false,
    show_whatsapp: false,
    seller_approved: false,
    avatar_url: ''
  });
  const [ui, setUi] = useState<UIState>({
    isLoading: false,
    error: null,
    success: null
  });

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id) return;

      setUi(prev => ({ ...prev, isLoading: true }));

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile({
            username: data.username || '',
            phone: data.phone || '',
            whatsapp: data.whatsapp || '',
            is_seller: data.is_seller || false,
            seller_type: data.seller_type || 'particular',
            company_name: data.company_name || '',
            show_phone: data.show_phone || false,
            show_whatsapp: data.show_whatsapp || false,
            seller_approved: data.seller_approved || false,
            avatar_url: data.avatar_url || ''
          });
        }
      } catch (error) {
        handleError(error, "Échec du chargement du profil");
      } finally {
        setUi(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadProfileData();
  }, [user]);

  const handleError = (error: unknown, defaultMessage: string) => {
    console.error('Profile Error:', error);
    const message = error instanceof Error ? error.message : defaultMessage;
    setUi(prev => ({ ...prev, error: message, success: null }));
  };

  const handleSuccess = (message: string) => {
    setUi(prev => ({ ...prev, success: message, error: null }));
  };

  const validateSellerData = (): boolean => {
    if (!profile.is_seller) return true;

    if (!profile.phone) {
      handleError("Un numéro de téléphone est requis pour les vendeurs", "");
      return false;
    }

    if (profile.seller_type === 'professional' && !profile.company_name) {
      handleError("Le nom de l'entreprise est obligatoire pour les professionnels", "");
      return false;
    }

    return true;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSellerData()) return;

    setUi(prev => ({ ...prev, isLoading: true, error: null, success: null }));

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          updated_at: new Date(),
          seller_approved: profile.is_seller ? profile.seller_approved : false
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      handleSuccess(
        profile.is_seller && !profile.seller_approved
          ? "Demande de vendeur soumise. En attente d'approbation."
          : "Profil mis à jour avec succès"
      );
    } catch (error) {
      handleError(error, "Erreur lors de la mise à jour du profil");
    } finally {
      setUi(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validation du fichier
    if (file.size > MAX_FILE_SIZE) {
      return;
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return;
    }




    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName; // Pas besoin du prefixe 'avatars/' ici

      // 1. Upload avec le bon scope
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // 2. Récupération de l'URL
      const { data: { publicUrl } } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(filePath);

      // 3. Mise à jour du profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));

    } catch (err) {
      console.error('Erreur complète:', err);
    } finally {
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleSellerStatus = (enable: boolean) => {
    if (profile.is_seller && profile.seller_approved) {
      handleError("Impossible de désactiver le mode vendeur après approbation", "");
      return;
    }
    setProfile(prev => ({
      ...prev,
      is_seller: enable,
      seller_approved: enable ? prev.seller_approved : false
    }));
  };

  const updateSellerType = (type: SellerType) => {
    if (profile.seller_approved) {
      handleError("Impossible de modifier le type de vendeur après approbation", "");
      return;
    }
    setProfile(prev => ({ ...prev, seller_type: type }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="white" d="M41.6,-67.9C53.3,-59.4,62,-47.4,69.8,-34.4C77.7,-21.4,84.5,-7.3,83.5,6.1C82.6,19.5,73.9,32.2,63.8,42.9C53.7,53.5,42.2,62,29.8,68.2C17.4,74.4,3.9,78.2,-10.4,77.9C-24.7,77.5,-49.3,73,-63.6,60.7C-77.9,48.3,-81.8,28.1,-81.3,8.8C-80.7,-10.5,-75.7,-29.9,-65.4,-44.5C-55.1,-59.1,-39.5,-68.9,-24.4,-75.5C-9.3,-82.1,5.3,-85.5,18.8,-81.3C32.3,-77.1,64.7,-65.3,82.5,-53.4C100.4,-41.5,103.7,-29.3,107.2,-16.1C110.7,-2.9,114.5,11.3,112.4,24.1C110.4,36.9,102.6,48.2,90.6,53.7C78.6,59.3,62.6,59,48.3,60.9C34,62.7,21.6,66.7,6.8,72.9C-8,79.1,-25.1,87.5,-39.5,85.6C-54,83.6,-65.8,71.3,-74.7,57.6C-83.7,43.9,-89.8,28.9,-89.8,14C-89.8,-1,-83.8,-15.9,-78.4,-31.2C-73,-46.6,-68.3,-62.4,-57.3,-71.6C-46.4,-80.8,-29.2,-83.4,-12.9,-80.9C3.4,-78.4,29.9,-76.4,41.6,-67.9Z" transform="translate(100 100)" />
            </svg>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/20 backdrop-blur-sm p-1 shadow-xl">
                {profile.avatar_url ? (
                  <img
                    src={`${profile.avatar_url}?${new Date().getTime()}`} // Cache busting
                    alt="Photo de profil"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      // Fallback si l'image ne charge pas
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '';
                      e.currentTarget.parentElement!.querySelector('.avatar-fallback')?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/30 flex items-center justify-center">
                    <User className="w-12 h-12 md:w-16 md:h-16 text-white/70" />
                  </div>
                )}

                {/* Fallback caché par défaut */}
                <div className="avatar-fallback hidden w-full h-full rounded-full bg-white/30 flex items-center justify-center">
                  <User className="w-12 h-12 md:w-16 md:h-16 text-white/70" />
                </div>
              </div>
              <label className="absolute -bottom-2 -right-2 bg-white text-blue-600 p-2 rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-xl hover:bg-gray-50">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleAvatarUpload}
                  disabled={ui.isLoading}
                />
              </label>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{profile.username || 'Mon Profil'}</h1>
              <p className="text-blue-100 mt-1">{user?.email}</p>

              {profile.is_seller && (
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                  {profile.seller_approved ? (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-1" />
                      <span>Vendeur approuvé</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 mr-1" />
                      <span>En attente d'approbation</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {ui.error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-center animate-appear shadow-sm">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{ui.error}</span>
          </div>
        )}

        {ui.success && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 flex items-center animate-appear shadow-sm">
            <Check className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{ui.success}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleProfileSubmit}>
          <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Informations personnelles</h2>
              {ui.isLoading && (
                <div className="flex items-center text-sm text-blue-600">
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  <span>Chargement...</span>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-gray-500">
                      <MessageSquare className="h-4 w-4" />
                    </span>
                    <input
                      value={user?.email || ''}
                      readOnly
                      className="flex-1 min-w-0 block w-full px-3 py-2.5 rounded-none rounded-r-md border border-gray-200 bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Nom d'utilisateur</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-gray-500">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      name="username"
                      value={profile.username}
                      onChange={handleInputChange}
                      required
                      className="flex-1 min-w-0 block w-full px-3 py-2.5 rounded-none rounded-r-md border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Section */}
          <div className="mt-6 bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">Mode Vendeur</h2>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Store className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-800">Je souhaite vendre des articles</h3>
                    <p className="text-sm text-gray-500">Activez cette option pour mettre en vente vos articles</p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${profile.is_seller ? 'bg-blue-600' : 'bg-gray-200'
                    } ${profile.seller_approved ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={() => toggleSellerStatus(!profile.is_seller)}
                  disabled={profile.seller_approved}
                >
                  <span className="sr-only">Activer le mode vendeur</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${profile.is_seller ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {profile.is_seller && (
                <div className="mt-6 space-y-6 bg-blue-50 p-5 rounded-xl border border-blue-100 animate-appear">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Type de vendeur</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => updateSellerType('particular')}
                        disabled={profile.seller_approved}
                        className={`group relative p-4 border rounded-xl text-left transition-all duration-200 ${profile.seller_type === 'particular'
                          ? 'border-blue-500 bg-white shadow-md'
                          : 'border-gray-200 bg-white/60 hover:bg-white hover:shadow-sm'
                          } ${profile.seller_approved ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${profile.seller_type === 'particular' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500'
                            }`}>
                            <User className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium text-gray-800">Particulier</h3>
                            <p className="text-sm text-gray-500">Pour les ventes occasionnelles</p>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateSellerType('professional')}
                        disabled={profile.seller_approved}
                        className={`group relative p-4 border rounded-xl text-left transition-all duration-200 ${profile.seller_type === 'professional'
                          ? 'border-blue-500 bg-white shadow-md'
                          : 'border-gray-200 bg-white/60 hover:bg-white hover:shadow-sm'
                          } ${profile.seller_approved ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${profile.seller_type === 'professional' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500'
                            }`}>
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium text-gray-800">Professionnel</h3>
                            <p className="text-sm text-gray-500">Pour les entreprises</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {profile.seller_type === 'professional' && (
                    <div className="animate-appear">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'entreprise*</label>
                      <input
                        name="company_name"
                        value={profile.company_name}
                        onChange={handleInputChange}
                        required
                        disabled={profile.seller_approved}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Votre entreprise"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone*</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          name="phone"
                          value={profile.phone}
                          onChange={handleInputChange}
                          required
                          disabled={profile.seller_approved}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+33 6 12 34 56 78"
                        />
                      </div>
                      <div className="mt-2 flex items-center">
                        <input
                          type="checkbox"
                          id="show_phone"
                          name="show_phone"
                          checked={profile.show_phone}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="show_phone" className="ml-2 text-sm text-gray-600">
                          Afficher sur mes annonces
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          name="whatsapp"
                          value={profile.whatsapp}
                          onChange={handleInputChange}
                          disabled={profile.seller_approved}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+33 6 12 34 56 78"
                        />
                      </div>
                      <div className="mt-2 flex items-center">
                        <input
                          type="checkbox"
                          id="show_whatsapp"
                          name="show_whatsapp"
                          checked={profile.show_whatsapp}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="show_whatsapp" className="ml-2 text-sm text-gray-600">
                          Afficher sur mes annonces
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 font-medium"
              disabled={ui.isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-medium flex items-center justify-center min-w-32 ${ui.isLoading ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              disabled={ui.isLoading}
            >
              {ui.isLoading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  <span>Traitement...</span>
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;