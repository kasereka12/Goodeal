import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { signUp, signIn } from '../lib/auth';

const authSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'At least 6 characters'),
  username: z.string().min(3, 'At least 3 characters').optional(),
  isSeller: z.boolean().optional(),
  accountType: z.string().min(3, 'Required').optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.isSeller) {
    if (!data.accountType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Account type is required for sellers",
        path: ["accountType"]
      });
    }
  }
  return data;
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [authState, setAuthState] = useState<{
    loading: boolean;
    message: { text: string; type: 'success' | 'error' };
    shouldRedirect: boolean;
  }>({
    loading: false,
    message: { text: '', type: 'success' },
    shouldRedirect: false
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      isSeller: false
    }
  });

  const isSeller = watch('isSeller');

  useEffect(() => {
    if (authState.shouldRedirect) {
      const timer = setTimeout(() => {
        setIsSignUp(false);
        reset();
        setAuthState({
          loading: false,
          message: { text: '', type: 'success' },
          shouldRedirect: false
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [authState.shouldRedirect, reset]);

  const onSubmit = async (data: AuthFormData) => {
    setAuthState({
      loading: true,
      message: { text: '', type: 'success' },
      shouldRedirect: false
    });

    try {
      if (isSignUp) {
        const { error } = await signUp(
          data.email,
          data.password,
          data.username || '',
          isSeller ? data.accountType || '' : null,
          isSeller ? data.phone || '' : null,
          isSeller ? data.whatsapp || '' : null,
          isSeller
        );

        if (error) throw error;

        setAuthState({
          loading: false,
          message: {
            text: 'Registration successful! Please check your email to confirm your account. Redirecting to login...',
            type: 'success'
          },
          shouldRedirect: true
        });
      } else {
        const { error } = await signIn(data.email, data.password);

        if (error) throw error;

        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setAuthState({
        loading: false,
        message: {
          text: err.message || 'Authentication failed. Please try again.',
          type: 'error'
        },
        shouldRedirect: false
      });
      console.error('Auth error:', err);
    }
  };

  const switchAuthMode = () => {
    setIsSignUp(!isSignUp);
    reset();
    setAuthState({
      loading: false,
      message: { text: '', type: 'success' },
      shouldRedirect: false
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          {isSignUp ? 'Create Your Account' : 'Welcome Back'}
        </h2>
        <p className="text-gray-500 mt-2">
          {isSignUp ? 'Join our community today' : 'Sign in to continue'}
        </p>
      </div>

      {authState.message.text && (
        <div
          className={`p-4 mb-6 rounded-lg ${authState.message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
            }`}
        >
          {authState.message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            {...register('email')}
            placeholder="your@email.com"
            className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
            disabled={authState.loading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
            disabled={authState.loading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {isSignUp && (
          <>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                {...register('username')}
                placeholder="john_doe"
                className={`w-full px-4 py-3 rounded-lg border ${errors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2`}
                disabled={authState.loading}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                {...register('isSeller')}
                id="isSeller"
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                disabled={authState.loading}
              />
              <label htmlFor="isSeller" className="text-sm font-medium text-gray-700">
                I want to register as a seller
              </label>
            </div>

            {isSeller && (
              <>
                <div>
                  <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <select
                    id="accountType"
                    {...register('accountType')}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.accountType ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      } focus:outline-none focus:ring-2 bg-white`}
                    disabled={authState.loading}
                  >
                    <option value="">Select account type</option>
                    <option value="Particulier">Particulier</option>
                    <option value="Professionnel">Professionnel</option>
                  </select>
                  {errors.accountType && (
                    <p className="mt-1 text-sm text-red-600">{errors.accountType.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      {...register('phone')}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={authState.loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      id="whatsapp"
                      {...register('whatsapp')}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={authState.loading}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={authState.loading}
          className={`w-full py-3 px-4 rounded-xl text-white font-medium ${authState.loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 transition-colors'
            } flex items-center justify-center`}
        >
          {authState.loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : isSignUp ? (
            'Create Account'
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={switchAuthMode}
          disabled={authState.loading}
          className={`text-blue-600 hover:text-blue-800 font-medium ${authState.loading ? 'text-gray-400 cursor-not-allowed' : ''
            }`}
        >
          {isSignUp
            ? 'Already have an account? Sign In'
            : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}