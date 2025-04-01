import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Bell,
    Lock,
    Trash2,
    LogOut,
    Check,
    AlertCircle,
    Loader2
} from 'lucide-react';

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [preferences, setPreferences] = useState({
        email_notifications: true,
        push_notifications: true
    });

    const [activeTab, setActiveTab] = useState('account');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Charger les préférences utilisateur
    useEffect(() => {
        const loadPreferences = async () => {
            if (!user) return;

            setIsLoading(true);
            setError(null);

            try {
                const { data, error } = await supabase
                    .from('user_preferences')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;

                const defaultPrefs = {
                    email_notifications: true,
                    push_notifications: true
                };

                if (data) {
                    setPreferences({ ...defaultPrefs, ...data });
                } else {
                    setPreferences(defaultPrefs);
                }
            } catch (err) {
                console.error('Error loading preferences:', err);
                setError(t('settings.loadError'));
            } finally {
                setIsLoading(false);
            }
        };

        loadPreferences();
    }, [user, t]);

    // Sauvegarder les préférences
    const handleSavePreferences = async () => {
        if (!user) return;

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const { error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: user.id,
                    ...preferences,
                    updated_at: new Date()
                });

            if (error) throw error;

            setSuccess(t('settings.saveSuccess'));
        } catch (err) {
            console.error('Error saving preferences:', err);
            setError(t('settings.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    // Gestion suppression de compte
    const handleDeleteAccount = async () => {
        if (!user || !window.confirm(t('settings.confirmDelete'))) return;

        setIsSaving(true);
        setError(null);

        try {
            await supabase.from('user_preferences').delete().eq('user_id', user.id);
            await supabase.from('profiles').delete().eq('user_id', user.id);
            const { error } = await supabase.auth.admin.deleteUser(user.id);
            if (error) throw error;
            await signOut();
            navigate('/');
        } catch (err) {
            console.error('Error deleting account:', err);
            setError(t('settings.deleteError'));
        } finally {
            setIsSaving(false);
        }
    };

    // Réinitialisation mot de passe
    const handlePasswordReset = async () => {
        if (!user?.email) return;

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) throw error;
            setSuccess(t('settings.resetEmailSent'));
        } catch (err) {
            console.error('Error sending reset email:', err);
            setError(t('settings.resetError'));
        }
    };

    // Nettoyer les messages après 5s
    useEffect(() => {
        const timer = setTimeout(() => {
            setSuccess(null);
            setError(null);
        }, 5000);
        return () => clearTimeout(timer);
    }, [success, error]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-6">{t('settings.title')}</h1>

            {/* Messages d'état */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg flex items-center">
                    <Check className="w-5 h-5 mr-2" />
                    {success}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                {/* Menu latéral */}
                <div className="w-full md:w-64">
                    <div className="space-y-1">
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${activeTab === 'account'
                                    ? 'bg-gray-100 font-medium'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            <User className="w-5 h-5 mr-3" />
                            {t('settings.account')}
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${activeTab === 'notifications'
                                    ? 'bg-gray-100 font-medium'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            <Bell className="w-5 h-5 mr-3" />
                            {t('settings.notifications')}
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${activeTab === 'security'
                                    ? 'bg-gray-100 font-medium'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            <Lock className="w-5 h-5 mr-3" />
                            {t('settings.security')}
                        </button>
                    </div>

                    <div className="mt-6 border-t pt-4">
                        <button
                            onClick={handleDeleteAccount}
                            disabled={isSaving}
                            className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${isSaving ? 'text-red-400' : 'text-red-600 hover:bg-red-50'
                                }`}
                        >
                            <Trash2 className="w-5 h-5 mr-3" />
                            {isSaving ? t('settings.deleting') : t('settings.deleteAccount')}
                        </button>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="flex-1">
                    {activeTab === 'account' && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-4">{t('settings.account')}</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {t('settings.email')}
                                    </label>
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <Mail className="w-5 h-5 mr-3 text-gray-400" />
                                        <span>{user?.email}</span>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={signOut}
                                        className="flex items-center text-red-600 hover:text-red-700"
                                    >
                                        <LogOut className="w-5 h-5 mr-2" />
                                        {t('settings.signOut')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-4">{t('settings.notifications')}</h2>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">{t('settings.emailNotifications')}</h3>
                                        <p className="text-sm text-gray-500">
                                            {t('settings.emailNotificationsDesc')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('email_notifications', !preferences.email_notifications)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.email_notifications ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.email_notifications ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">{t('settings.pushNotifications')}</h3>
                                        <p className="text-sm text-gray-500">
                                            {t('settings.pushNotificationsDesc')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('push_notifications', !preferences.push_notifications)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.push_notifications ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.push_notifications ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-4">{t('settings.security')}</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-medium mb-2">{t('settings.changePassword')}</h3>
                                    <button
                                        onClick={handlePasswordReset}
                                        className="btn btn-primary"
                                    >
                                        {t('settings.sendResetLink')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {(activeTab !== 'account') && (
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleSavePreferences}
                                disabled={isSaving}
                                className="btn btn-primary flex items-center"
                            >
                                {isSaving && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                                {t('settings.saveChanges')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}