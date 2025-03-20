import { supabase } from './supabase';

export interface RequestInput {
  title: string;
  description: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  budget?: number;
  city?: string;
  filters: Record<string, any>;
}

export async function createRequest(userId: string, data: RequestInput) {
  try {
    const { data: request, error } = await supabase
      .from('requests')
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description,
        category: data.category,
        urgency: data.urgency,
        budget: data.budget,
        city: data.city,
        filters: data.filters,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return request;
  } catch (error) {
    console.error('Error creating request:', error);
    throw new Error('Failed to create request. Please try again.');
  }
}

export async function getRequests() {
  try {
    const { data: requests, error } = await supabase
      .from('requests_with_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return requests;
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw new Error('Failed to fetch requests. Please try again.');
  }
}