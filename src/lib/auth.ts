import { supabase } from './supabase';

// Types pour plus de clarté
type AccountType = 'Particulier' | 'Professionnel' | string | null;
type SignUpParams = {
  email: string;
  password: string;
  username: string;
  accountType?: AccountType;
  phone?: string | null;
  whatsapp?: string | null;
  isSeller?: boolean;
};

export async function signUp(email: string, password: string, username: string, accountType: 'Particulier' | 'Professionnel' | null, phone: string | null, whatsapp: string | null, isSeller: boolean) {
  try {
    console.log('Starting signUp with:', { email, username, isSeller });

    if (!email || !password || !username) {
      const missing = [];
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      if (!username) missing.push('username');
      throw new Error(`Missing fields: ${missing.join(', ')}`);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          account_type: isSeller ? accountType : null,
          phone: isSeller ? phone : null,
          whatsapp: isSeller ? whatsapp : null,
          is_seller: isSeller
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        code: error.code,
        status: error.status
      });
      throw error;
    }

    if (!data.user) {
      throw new Error('No user returned from signup');
    }

    return data.user;
  } catch (error: any) {
    console.error('Full signup error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      originalError: error.originalError
    });
    throw new Error(error.message || 'Signup failed. Please try again.');
  }
}
export async function signIn(email: string, password: string) {
  try {
    // Validation simple
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase signin error:', error);

      // Gestion des erreurs spécifiques
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please verify your email first');
      }

      throw error;
    }

    if (!data.user) {
      throw new Error('No user data returned from signin');
    }

    return data.user;
  } catch (error: any) {
    console.error('Signin error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

// ... (les autres fonctions restent similaires)

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error(error.message || 'An error occurred during logout. Please try again.');
  }
}

export async function updateUserProfile(displayName?: string, phoneNumber?: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        display_name: displayName,
        phone_number: phoneNumber
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('User not found');

    return data.user;
  } catch (error: any) {
    console.error('Profile update error:', error);
    throw new Error(error.message || 'An error occurred while updating your profile. Please try again.');
  }
}


