import { supabase } from './supabase';

export async function signUp(email: string, password: string) {
  try {
    // Validate inputs
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');
    if (password.length < 6) throw new Error('Password must be at least 6 characters long');

    // Attempt signup with increased timeout and retries
    const { data, error } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            email_confirm_required: false
          }
        }
      }
    );

    if (error) {
      // Handle specific error cases
      if (error.message?.includes('User already registered')) {
        throw new Error('This email is already registered. Please sign in instead.');
      }
      if (error.message?.includes('Password should be')) {
        throw new Error('Password must be at least 6 characters long.');
      }
      if (error.message?.includes('Invalid email')) {
        throw new Error('Please enter a valid email address.');
      }
      // Throw the original error if no specific case matches
      throw error;
    }

    if (!data.user) {
      throw new Error('No user data returned from signup');
    }

    return data.user;
  } catch (error: any) {
    // Log the full error for debugging
    console.error('Signup error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      status: error.status,
      statusText: error.statusText
    });

    // Handle timeout error specifically
    if (error.status === 504 || error.message?.includes('timeout')) {
      throw new Error('The signup request timed out. Please try again.');
    }

    // Throw a user-friendly error message
    throw new Error(error.message || 'An error occurred during signup. Please try again.');
  }
}

export async function signIn(email: string, password: string) {
  try {
    // Validate inputs
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    },);

    if (error) {
      // Handle specific error cases
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please try again.');
      }
      if (error.message?.includes('Email not confirmed')) {
        throw new Error('Please verify your email before signing in.');
      }
      // Throw the original error if no specific case matches
      throw error;
    }

    if (!data.user) {
      throw new Error('No user data returned from signin');
    }

    return data.user;
  } catch (error: any) {
    // Log the full error for debugging
    console.error('Login error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });

    // Throw a user-friendly error message
    throw new Error(error.message || 'An error occurred during login. Please try again.');
  }
}

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