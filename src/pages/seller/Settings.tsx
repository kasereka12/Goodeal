import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { User, Bell, Shield, HelpCircle, Save, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SellerSettings() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('nav.settings') || 'Paramètres'}
        </h1>
        <Link to="/" className="flex items-center text-sm font-medium text-primary hover:text-primary-dark">
          <Home className="h-4 w-4 mr-1" />
          {t('common.backToHome') || 'Retour à l\'accueil'}
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button className="px-6 py-4 text-sm font-medium text-primary border-b-2 border-primary">
              <User className="inline-block h-4 w-4 mr-2" />
              {t('profile.title') || 'Profil'}
            </button>
            <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
              <Bell className="inline-block h-4 w-4 mr-2" />
              {t('notifications.title') || 'Notifications'}
            </button>
            <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
              <Shield className="inline-block h-4 w-4 mr-2" />
              {t('privacy.title') || 'Confidentialité'}
            </button>
            <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
              <HelpCircle className="inline-block h-4 w-4 mr-2" />
              {t('help.title') || 'Aide'}
            </button>
          </nav>
        </div>

        <div className="p-6">
          <form className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                {t('profile.displayName') || 'Nom d\'affichage'}
              </label>
              <input
                type="text"
                id="displayName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                defaultValue={user?.user_metadata?.display_name || user?.email?.split('@')[0]}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('profile.email') || 'Adresse e-mail'}
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50"
                value={user?.email}
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('profile.emailChangeInfo') || 'Contactez le support pour modifier votre adresse e-mail.'}
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {t('profile.phone') || 'Numéro de téléphone'}
              </label>
              <input
                type="tel"
                id="phone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                defaultValue={user?.user_metadata?.phone || ''}
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                {t('profile.bio') || 'Bio du vendeur'}
              </label>
              <textarea
                id="bio"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                defaultValue={user?.user_metadata?.bio || ''}
                placeholder={t('profile.bioPlaceholder') || 'Parlez un peu de vous en tant que vendeur...'}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {t('common.save') || 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
