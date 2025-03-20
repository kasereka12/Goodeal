import { supabase } from './supabase';

export async function getUsers() {
  try {
    const { data: users, error } = await supabase
      .from('auth.users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: { role } }
    );

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended') {
  try {
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: { status } }
    );

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error('Failed to update user status');
  }
}