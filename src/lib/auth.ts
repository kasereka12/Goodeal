import { supabase } from './supabase';

type SellerType = 'particular' | 'professional';
// auth.ts
export async function createUserAsAdmin(userData: {
  email: string;
  password: string;
  username: string;
  phone?: string;
  is_seller?: boolean;
  seller_type?: 'particular' | 'professional';
  company_name?: string;
}) {
  try {
    if (userData.is_seller) {
      if (!userData.seller_type) {
        throw new Error('Seller type is required when creating a seller');
      }
      if (userData.seller_type === 'professional' && !userData.company_name) {
        throw new Error('Company name is required for professional sellers');
      }
    }

    const { data, error } = await supabase.rpc('admin_create_user', {
      email: userData.email,
      password: userData.password,
      username: userData.username,
      phone: userData.phone || null,
      is_seller: userData.is_seller || false,
      seller_type: userData.is_seller ? userData.seller_type : null,
      company_name: userData.is_seller ? userData.company_name : null,
      email_confirm: false // Important pour ne pas confirmer automatiquement
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
export interface SignUpParams {
  email: string;
  password: string;
  username: string;
  wantsToSell?: boolean;
  sellerType?: SellerType;
  phone?: string;
  whatsapp?: string;
  companyName?: string;
}

export async function signUp({
  email,
  password,
  username,
  wantsToSell = false,
  sellerType = 'particular',
  phone = '',
  whatsapp = '',
  companyName = ''
}: SignUpParams) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          is_seller: wantsToSell,
          seller_type: wantsToSell ? sellerType : null,
          phone: wantsToSell ? phone : null,
          whatsapp: wantsToSell ? whatsapp : null,
          company_name: wantsToSell && sellerType === 'professional' ? companyName : null,
          seller_approved: false
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return {
      user: data.user,
      session: data.session,
      isSeller: wantsToSell,
      needsApproval: wantsToSell
    };
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed');
  }
}

export async function signIn(email: string, password: string) {
  console.log('Attempting to sign in with email:', email);
  try {
    // Validation simple
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    console.log('Attempting to sign in with email:', email);
    console.log('Attempting to sign in with password:', password);
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


export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed');
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