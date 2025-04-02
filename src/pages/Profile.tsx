import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Camera, Phone, MessageSquare, Check, AlertCircle, Store, Briefcase, ShieldCheck, ShieldAlert, Loader } from 'lucide-react';

type ProfileData = {
  username: string;
  phone: string;
  whatsapp: string;
  is_seller: boolean;
  seller_type: 'particular' | 'professional';
  company_name: string;
  show_phone: boolean;
  show_whatsapp: boolean;
  seller_approved: boolean;
  avatar_url: string;
};

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Chargement du profil
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
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
      } catch (err) {
        console.error('Erreur de chargement:', err);
        setError("Échec du chargement du profil");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validation pour les vendeurs
      if (profile.is_seller) {
        if (!profile.phone) throw new Error("Un numéro de téléphone est requis pour les vendeurs");
        if (profile.seller_type === 'professional' && !profile.company_name) {
          throw new Error("Le nom de l'entreprise est obligatoire pour les professionnels");
        }
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...profile,
          updated_at: new Date(),
          seller_approved: profile.is_seller ? profile.seller_approved : false
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      setSuccess(
        profile.is_seller && !profile.seller_approved
          ? "Demande de vendeur soumise. En attente d'approbation."
          : "Profil mis à jour avec succès"
      );
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message || "Erreur de mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("La taille maximale est de 5MB");
      return;
    }
    if (!file.type.match(/image\/(jpeg|png|gif)/)) {
      setError("Formats acceptés: JPEG, PNG, GIF");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      setSuccess("Photo de profil mise à jour");
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message || "Erreur d'upload");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleSellerMode = (isSeller: boolean) => {
    if (profile.is_seller && profile.seller_approved) {
      setError("Vous ne pouvez pas désactiver le mode vendeur après approbation");
      return;
    }
    setProfile(prev => ({
      ...prev,
      is_seller: isSeller,
      seller_approved: isSeller ? prev.seller_approved : false
    }));
  };

  const changeSellerType = (type: 'particular' | 'professional') => {
    if (profile.seller_approved) {
      setError("Vous ne pouvez pas modifier le type de vendeur après approbation");
      return;
    }
    setProfile(prev => ({
      ...prev,
      seller_type: type
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Bannière de statut - Visible UNIQUEMENT si is_seller = true */}
      {profile.is_seller && (
        <div className={`p-4 rounded-lg border shadow-sm flex items-start ${profile.seller_approved
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
          <div className="mr-3 mt-0.5">
            {profile.seller_approved ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-yellow-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">
              {profile.seller_approved
                ? '✅ Compte vendeur approuvé'
                : '⏳ En attente d\'approbation'}
            </h3>
            <p className="text-sm mt-1">
              {profile.seller_approved
                ? 'Vous pouvez publier des annonces.'
                : 'Votre demande est en cours de traitement.'}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Mon profil</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Photo de profil */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Photo de profil"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <label className={`absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-50 ${isLoading ? 'opacity-50' : ''}`}>
                <Camera className="w-5 h-5 text-gray-600" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handlePhotoUpload}
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>

          {/* Messages d'état */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-green-50 text-green-700 flex items-center">
              <Check className="w-5 w-5 mr-2" />
              <span>{success}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section Informations */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Informations personnelles</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    value={user?.email || ''}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
                  <input
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Section Statut Vendeur */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Statut Vendeur</h2>

              {/* Switch - Interactif sauf si vendeur approuvé */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Store className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="font-medium">Je souhaite vendre</span>
                </div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.is_seller ? 'bg-blue-600' : 'bg-gray-300'
                    } ${profile.seller_approved ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => toggleSellerMode(!profile.is_seller)}
                  disabled={profile.seller_approved}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.is_seller ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* Section détaillée pour les vendeurs */}
              {profile.is_seller && (
                <div className="space-y-4 pl-4 border-l-2 border-blue-100">
                  {/* Type de vendeur */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Type de vendeur</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => changeSellerType('particular')}
                        disabled={profile.seller_approved}
                        className={`p-3 border rounded-lg text-left ${profile.seller_type === 'particular'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                          } ${profile.seller_approved ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5" />
                          <span>Particulier</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => changeSellerType('professional')}
                        disabled={profile.seller_approved}
                        className={`p-3 border rounded-lg text-left ${profile.seller_type === 'professional'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                          } ${profile.seller_approved ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-5 w-5" />
                          <span>Professionnel</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Champs spécifiques aux professionnels */}
                  {profile.seller_type === 'professional' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise*</label>
                      <input
                        name="company_name"
                        value={profile.company_name}
                        onChange={handleChange}
                        required
                        disabled={profile.seller_approved}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  )}

                  {/* Coordonnées */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone*</label>
                      <input
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        required
                        disabled={profile.seller_approved}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="show_phone"
                        checked={profile.show_phone}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Afficher sur mes annonces</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                      <input
                        name="whatsapp"
                        value={profile.whatsapp}
                        onChange={handleChange}
                        disabled={profile.seller_approved}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="show_whatsapp"
                        checked={profile.show_whatsapp}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Afficher sur mes annonces</label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center min-w-24"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="animate-spin h-5 w-5" />
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}