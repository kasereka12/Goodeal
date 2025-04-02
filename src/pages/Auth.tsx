import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { signUp, signIn } from '../lib/auth';

const authSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'At least 6 characters'),
  username: z.string().min(3, 'At least 3 characters').optional(),
  wantsToSell: z.boolean().default(false),
  sellerType: z.enum(['particular', 'professional']).optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  companyName: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.wantsToSell) {
    if (!data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number is required for sellers",
        path: ["phone"]
      });
    }
    if (data.sellerType === 'professional' && !data.companyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Company name is required for professional sellers",
        path: ["companyName"]
      });
    }
  }
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [status, setStatus] = useState({
    loading: false,
    message: { text: '', type: 'success' as 'success' | 'error' }
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
      wantsToSell: false
    }
  });

  const wantsToSell = watch('wantsToSell');
  const sellerType = watch('sellerType');

  const onSubmit = async (data: AuthFormData) => {
    console.log('Form submitted', data);
    setStatus({ loading: true, message: { text: '', type: 'success' } });

    try {
      if (isSignUp) {
        const result = await signUp({
          email: data.email,
          password: data.password,
          username: data.username || '',
          wantsToSell: data.wantsToSell,
          sellerType: data.sellerType,
          phone: data.phone,
          whatsapp: data.whatsapp,
          companyName: data.companyName
        });

        setStatus({
          loading: false,
          message: {
            text: result.isSeller
              ? 'Registration successful! Your seller account is pending approval. Please verify your email.'
              : 'Registration successful! Please verify your email.'
          }
        });
        
        reset();
        setIsSignUp(false);
      } else {
        await signIn(data.email, data.password);
        navigate('/');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setStatus({
        loading: false,
        message: {
          text: error.message || 'Authentication failed. Please try again.',
          type: 'error'
        }
      });
    }
  };

  const switchAuthMode = () => {
    setIsSignUp(!isSignUp);
    reset();
    setStatus({ loading: false, message: { text: '', type: 'success' } });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
      </div>

      {status.message.text && (
        <div className={`p-4 mb-6 rounded-lg ${
          status.message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {status.message.text}
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
            type="email"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            } focus:outline-none focus:ring-2`}
            disabled={status.loading}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            {...register('password')}
            type="password"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            } focus:outline-none focus:ring-2`}
            disabled={status.loading}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
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
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                } focus:outline-none focus:ring-2`}
                disabled={status.loading}
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="wantsToSell"
                {...register('wantsToSell')}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                disabled={status.loading}
              />
              <label htmlFor="wantsToSell" className="text-sm font-medium text-gray-700">
                I want to register as a seller
              </label>
            </div>

            {wantsToSell && (
              <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seller Type</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('sellerType')}
                        value="particular"
                        className="mr-2"
                        disabled={status.loading}
                      />
                      Particulier
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('sellerType')}
                        value="professional"
                        className="mr-2"
                        disabled={status.loading}
                      />
                      Professionnel
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    id="phone"
                    {...register('phone')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2`}
                    disabled={status.loading}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp (optional)
                  </label>
                  <input
                    id="whatsapp"
                    {...register('whatsapp')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={status.loading}
                  />
                </div>

                {sellerType === 'professional' && (
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      id="companyName"
                      {...register('companyName')}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.companyName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      } focus:outline-none focus:ring-2`}
                      disabled={status.loading}
                    />
                    {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>}
                  </div>
                )}

                <div className="bg-yellow-50 p-3 rounded-lg text-yellow-700 text-sm">
                  Your seller account will need admin approval before you can start selling.
                </div>
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={status.loading}
          className={`w-full py-3 px-4 rounded-xl text-white font-medium ${
            status.loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 transition-colors'
          } flex items-center justify-center`}
        >
          {status.loading ? (
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
          disabled={status.loading}
          className={`text-blue-600 hover:text-blue-800 font-medium ${
            status.loading ? 'text-gray-400 cursor-not-allowed' : ''
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