import { supabase } from './supabase';
import { CategoryId } from './categories';
import { uploadListingImage } from './storage';

// Types
export interface ListingInput {
  title: string;
  description: string;
  price: number;
  category: CategoryId;
  city: string;
  images: File[];
  filters?: Record<string, any>;
  transaction_type?: 'achat' | 'location';
}

// Get listing by ID
export async function getListing(id: string) {
  try {
    const { data, error } = await supabase
      .from('listings_with_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
      throw new Error('Failed to fetch listing details');
    }

    if (!data) {
      throw new Error('Listing not found');
    }

    return data;
  } catch (error) {
    console.error('Error getting listing:', error);
    throw error;
  }
}

// Create listing function
export async function createListing(
  userId: string,
  data: ListingInput,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Validate input
    if (!userId) throw new Error('User ID is required');
    if (!data.title) throw new Error('Title is required');
    if (!data.description) throw new Error('Description is required');
    if (!data.price || data.price < 0) throw new Error('Valid price is required');
    if (!data.category) throw new Error('Category is required');
    if (!data.city) throw new Error('City is required');
    if (!data.images?.length) throw new Error('At least one image is required');

    // Initialize progress
    if (onProgress) onProgress(0);

    // Get region from city
    const { data: cityData, error: cityError } = await supabase
      .from('cities')
      .select('region')
      .eq('name', data.city)
      .single();

    if (cityError) {
      console.error('Error getting city region:', cityError);
      throw new Error('Failed to get city information');
    }

    if (!cityData?.region) {
      throw new Error('City region not found');
    }

    // Upload images sequentially for better progress tracking
    const imageUrls: string[] = [];
    const totalImages = data.images.length;
    
    for (let i = 0; i < totalImages; i++) {
      try {
        const file = data.images[i];
        const imageUrl = await uploadListingImage(userId, file, (fileProgress) => {
          if (onProgress) {
            // Calculate overall progress (60% allocated for images)
            const imageWeight = 60 / totalImages;
            const overallProgress = Math.floor((i * imageWeight) + (fileProgress * imageWeight / 100));
            onProgress(overallProgress);
          }
        });

        if (!imageUrl) {
          throw new Error('Failed to get image URL');
        }

        imageUrls.push(imageUrl);
      } catch (error) {
        console.error(`Error uploading image ${i + 1}:`, error);
        throw new Error(`Failed to upload image ${i + 1}`);
      }
    }

    // Update progress (70%)
    if (onProgress) onProgress(70);

    // Set transaction_type if category is immobilier or vehicules
    let transaction_type = data.transaction_type;
    if ((data.category === 'immobilier' || data.category === 'vehicules') && !transaction_type) {
      transaction_type = data.filters?.transaction_type as 'achat' | 'location' || 'achat';
    }

    // Create listing record with pending status
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        city: data.city,
        region: cityData.region,
        images: imageUrls,
        filters: data.filters || {},
        views: 0,
        favorites: 0,
        status: 'pending', // Set initial status to pending
        transaction_type
      })
      .select()
      .single();

    if (listingError) {
      console.error('Error creating listing:', listingError);
      throw new Error('Failed to save listing details');
    }

    if (!listing) {
      throw new Error('No listing data returned after creation');
    }

    // Update progress (90%)
    if (onProgress) onProgress(90);

    // Small pause for transition
    await new Promise(resolve => setTimeout(resolve, 500));

    // Final progress (100%)
    if (onProgress) onProgress(100);

    return listing.id;
  } catch (error: any) {
    console.error('Error creating listing:', error);
    throw new Error(error.message || 'Failed to create listing');
  }
}

// Update listing status
export async function updateListingStatus(id: string, status: 'active' | 'pending' | 'rejected' | 'sold' | 'archived') {
  try {
    const { error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating listing status:', error);
    throw new Error('Failed to update listing status');
  }
}

// Search listings function
export async function searchListings(filters: {
  category?: CategoryId;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  transaction_type?: 'achat' | 'location';
  filters?: Record<string, any>;
  sortBy?: 'price' | 'date';
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    let query = supabase
      .from('listings_with_users')
      .select('*')
      .eq('status', 'active'); // Only show active listings in search

    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    
    if (filters.priceMin !== undefined) {
      query = query.gte('price', filters.priceMin);
    }
    
    if (filters.priceMax !== undefined) {
      query = query.lte('price', filters.priceMax);
    }
    
    if (filters.transaction_type && ['achat', 'location'].includes(filters.transaction_type)) {
      query = query.eq('transaction_type', filters.transaction_type);
    }

    // Apply sorting
    if (filters.sortBy === 'price') {
      query = query.order('price', { ascending: filters.sortOrder === 'asc' });
    } else {
      // Default to sorting by date
      query = query.order('created_at', { ascending: filters.sortOrder === 'asc' });
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching listings:', error);
    throw new Error('Failed to search listings');
  }
}