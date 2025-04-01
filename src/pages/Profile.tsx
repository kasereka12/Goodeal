import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Camera, Phone, MessageSquare, Check, AlertCircle, Store, Briefcase, User as UserIcon } from 'lucide-react';

type ProfileData = {
  username: string;
  phone: string;
  whatsapp: string;
  account_type: 'buyer' | 'seller_particular' | 'seller_pro';
  seller_type: 'particular' | 'professional';
  company_name: string;
  siret: string;
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
    account_type: 'buyer',
    seller_type: 'particular',
    company_name: '',
    siret: '',
    show_phone: false,
    show_whatsapp: false,
    seller_approved: false,
    avatar_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Chargement initial du profil
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) setProfile(prev => ({
          ...prev,
          ...data,
          account_type: data.account_type || 'buyer',
          seller_type: data.seller_type || 'particular'
        }));
      } catch (err) {
        console.error('Erreur de chargement:', err);
        setError("Échec du chargement du profil");
      }
    };

    loadProfile();
  }, [user]);

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validation pour les vendeurs professionnels
      if (profile.account_type === 'seller_pro' && (!profile.company_name || !profile.siret)) {
        throw new Error("Les informations professionnelles sont obligatoires");
      }

      const updates = {
        ...profile,
        updated_at: new Date(),
        seller_approved: profile.account_type === 'buyer' ? false : profile.seller_approved
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates)
        .eq('user_id', user?.id);

      if (error) throw error;

      setSuccess(
        profile.account_type !== 'buyer' && !profile.seller_approved
          ? "Demande de vendeur envoyée. En attente d'approbation."
          : "Profil mis à jour avec succès"
      );
    } catch (err) {
      console.error('Erreur de mise à jour:', err);
      setError(err.message || "Échec de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de l'upload de photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validations
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
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload avec suivi de progression
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Récupération de l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Mise à jour du profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      // Rafraîchissement
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      setSuccess("Photo de profil mise à jour");
    } catch (err) {
      console.error('Erreur upload:', err);
      setError(err.message || "Échec de l'upload");
    } finally {
      setUploadProgress(null);
      setIsLoading(false);
    }
  };

  // Gestion des changements
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Basculer entre acheteur/vendeur
  const toggleSellerMode = (isSeller: boolean) => {
    setProfile(prev => ({
      ...prev,
      account_type: isSeller ? 'seller_particular' : 'buyer',
      seller_approved: isSeller ? prev.seller_approved : false
    }));
  };

  // Changer le type de vendeur
  const changeSellerType = (type: 'particular' | 'professional') => {
    setProfile(prev => ({
      ...prev,
      seller_type: type,
      account_type: type === 'professional' ? 'seller_pro' : 'seller_particular'
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* En-tête */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Gestion du profil</h1>
        </div>

        {/* Contenu principal */}
        <div className="p-6 space-y-8">
          {/* Section photo de profil */}
          <ProfilePhotoSection
            avatarUrl={profile.avatar_url}
            isLoading={isLoading}
            onPhotoUpload={handlePhotoUpload}
            uploadProgress={uploadProgress}
          />

          {/* Affichage des messages */}
          {error && <AlertMessage type="error" message={error} />}
          {success && <AlertMessage type="success" message={success} />}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <ProfileSection title="Informations personnelles">
              <InputField
                label="Email"
                value={user?.email || ''}
                readOnly
                icon={<UserIcon className="h-5 w-5 text-gray-400" />}
              />
              <InputField
                name="username"
                label="Nom d'utilisateur"
                value={profile.username}
                onChange={handleChange}
                required
              />
            </ProfileSection>

            {/* Statut vendeur */}
            <ProfileSection title="Statut sur la plateforme">
              <ToggleSwitch
                label="Je souhaite vendre"
                checked={profile.account_type !== 'buyer'}
                onChange={toggleSellerMode}
                icon={<Store className="h-5 w-5" />}
              />

              {profile.account_type !== 'buyer' && (
                <div className="space-y-4 pl-2 mt-4 border-l-2 border-blue-100">
                  {/* Type de vendeur */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Type de vendeur</label>
                    <div className="grid grid-cols-2 gap-3">
                      <SellerTypeCard
                        type="particular"
                        label="Particulier"
                        icon={<UserIcon className="h-5 w-5" />}
                        selected={profile.seller_type === 'particular'}
                        onChange={changeSellerType}
                      />
                      <SellerTypeCard
                        type="professional"
                        label="Professionnel"
                        icon={<Briefcase className="h-5 w-5" />}
                        selected={profile.seller_type === 'professional'}
                        onChange={changeSellerType}
                      />
                    </div>
                  </div>

                  {/* Champs spécifiques aux professionnels */}
                  {profile.seller_type === 'professional' && (
                    <div className="space-y-4">
                      <InputField
                        name="company_name"
                        label="Nom de l'entreprise"
                        value={profile.company_name}
                        onChange={handleChange}
                        required
                      />
                      <InputField
                        name="siret"
                        label="Numéro SIRET"
                        value={profile.siret}
                        onChange={handleChange}
                        required
                        pattern="\d{14}"
                        placeholder="14 chiffres"
                      />
                    </div>
                  )}

                  {/* Coordonnées */}
                  <div className="space-y-4 pt-2">
                    <InputField
                      name="phone"
                      label="Téléphone"
                      value={profile.phone}
                      onChange={handleChange}
                      icon={<Phone className="h-5 w-5 text-gray-400" />}
                      required
                    />
                    <Checkbox
                      name="show_phone"
                      label="Afficher mon numéro de téléphone"
                      checked={profile.show_phone}
                      onChange={handleChange}
                    />

                    <InputField
                      name="whatsapp"
                      label="WhatsApp"
                      value={profile.whatsapp}
                      onChange={handleChange}
                      icon={<MessageSquare className="h-5 w-5 text-gray-400" />}
                    />
                    <Checkbox
                      name="show_whatsapp"
                      label="Afficher mon WhatsApp"
                      checked={profile.show_whatsapp}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </ProfileSection>

            {/* Boutons de soumission */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-secondary"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Composants enfants

const ProfilePhotoSection = ({ avatarUrl, isLoading, onPhotoUpload, uploadProgress }: {
  avatarUrl: string;
  isLoading: boolean;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadProgress: number | null;
}) => (
  <div className="flex flex-col items-center">
    <div className="relative">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Photo de profil"
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
        />
      ) : (
        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow">
          <User className="w-16 h-16 text-gray-400" />
        </div>
      )}
      <label className={`absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-50 ${isLoading ? 'opacity-50' : ''
        }`}>
        <Camera className="w-5 h-5 text-gray-600" />
        <input
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/gif"
          onChange={onPhotoUpload}
          disabled={isLoading}
        />
      </label>
    </div>
    {uploadProgress !== null && (
      <div className="w-full max-w-xs mt-4">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
        <p className="text-xs text-center text-gray-500 mt-1">
          {uploadProgress}% téléchargé
        </p>
      </div>
    )}
    <p className="text-sm text-gray-500 text-center mt-3">
      Formats acceptés: JPEG, PNG, GIF (max 5MB)
    </p>
  </div>
);

const AlertMessage = ({ type, message }: { type: 'error' | 'success'; message: string }) => (
  <div className={`p-3 rounded-lg flex items-center ${type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
    }`}>
    {type === 'error' ? (
      <AlertCircle className="w-5 h-5 mr-2" />
    ) : (
      <Check className="w-5 h-5 mr-2" />
    )}
    <span>{message}</span>
  </div>
);

const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    <div className="space-y-4 pl-2">{children}</div>
  </div>
);

const InputField = ({ name, label, value, onChange, icon, ...props }: {
  name?: string;
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative rounded-md shadow-sm">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        name={name}
        value={value}
        onChange={onChange}
        className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${props.readOnly ? 'bg-gray-100' : 'bg-white'
          }`}
        {...props}
      />
    </div>
  </div>
);

const ToggleSwitch = ({ label, checked, onChange, icon }: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center">
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
          }`}
      />
    </button>
    <label className="ml-3 flex items-center text-sm text-gray-700">
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </label>
  </div>
);

const SellerTypeCard = ({ type, label, icon, selected, onChange }: {
  type: 'particular' | 'professional';
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onChange: (type: 'particular' | 'professional') => void;
}) => (
  <div
    onClick={() => onChange(type)}
    className={`p-4 border rounded-lg cursor-pointer transition-colors ${selected
        ? 'border-blue-500 bg-blue-50 text-blue-700'
        : 'border-gray-200 hover:border-gray-300'
      }`}
  >
    <div className="flex items-center space-x-2">
      <div className={`p-2 rounded-full ${selected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
        }`}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </div>
  </div>
);

const Checkbox = ({ name, label, checked, onChange }: {
  name: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <label htmlFor={name} className="ml-2 block text-sm text-gray-700">
      {label}
    </label>
  </div>
);

// Styles réutilisables
const btnPrimary = "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50";
const btnSecondary = "px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50";