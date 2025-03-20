import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../lib/auth';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Handle navigation when user is logged in
  useEffect(() => {
    if (user) {
      const redirectPath = sessionStorage.getItem('redirectAfterAuth') || '/';
      sessionStorage.removeItem('redirectAfterAuth');
      navigate(redirectPath);
    }
  }, [user, navigate]);

  const onSubmit = async (data: AuthFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      if (isSignUp) {
        await signUp(data.email, data.password);
        reset();
        setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setIsSignUp(false);
      } else {
        await signIn(data.email, data.password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);  // Affichage plus détaillé de l'erreur dans la console
      setError(err.message);  // Vous pourriez également vouloir afficher plus de détails sur l'erreur
    } finally {
      setIsLoading(false);
    }
  };


  // If user is already logged in, don't render the form
  if (user) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? t('auth.signUp') : t('auth.signIn')}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email')}
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className="input"
              placeholder="your@email.com"
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.password')}
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className="input"
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

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

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? t('common.loading') : (isSignUp ? t('auth.signUp') : t('auth.signIn'))}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.noAccount')}{' '}
            <button
              className="text-primary hover:underline"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
                reset();
              }}
              disabled={isLoading}
            >
              {isSignUp ? t('auth.signIn') : t('auth.signUp')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}