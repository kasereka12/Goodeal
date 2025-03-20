import { supabase } from './supabase';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Add watermark to image
 */
async function addWatermark(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Calculate font size based on image dimensions (smaller)
      const fontSize = Math.max(16, Math.min(img.width * 0.02, img.height * 0.03));
      
      // Configure watermark text
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // More transparent white
      
      // Add subtle text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = Math.max(2, fontSize * 0.1);
      ctx.shadowOffsetX = Math.max(1, fontSize * 0.05);
      ctx.shadowOffsetY = Math.max(1, fontSize * 0.05);

      // Add watermark text
      const text = 'goodeaal.com';
      const metrics = ctx.measureText(text);
      const padding = Math.max(12, fontSize * 0.5);
      
      // Position in top right corner
      ctx.fillText(
        text,
        canvas.width - metrics.width - padding,
        padding + fontSize * 0.5
      );

      // Convert back to file
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create watermarked image'));
          return;
        }

        // Create new file with watermark
        const watermarkedFile = new File(
          [blob],
          file.name,
          { type: file.type }
        );

        resolve(watermarkedFile);
      }, file.type, 0.95); // High quality to preserve image details
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image from file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Retry wrapper for uploads
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Validate file
 */
function validateFile(file: File, options: { maxSize?: number; allowedTypes?: string[] } = {}) {
  const maxSize = options.maxSize || MAX_FILE_SIZE;
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif'];

  if (file.size > maxSize) {
    throw new Error(`File size must not exceed ${maxSize / 1024 / 1024}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Unsupported file format. Allowed formats: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`);
  }
}

/**
 * Generate a unique filename that's safe for storage
 */
function generateUniqueFilename(file: File): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = file.type.split('/')[1] || 'jpg';
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Sanitize file path to prevent directory traversal
 */
function sanitizePath(path: string): string {
  return path
    .replace(/[^a-zA-Z0-9-_./]/g, '') // Remove special characters
    .replace(/\.{2,}/g, '.') // Remove consecutive dots
    .replace(/\/+/g, '/') // Remove consecutive slashes
    .replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes
}

/**
 * Upload a listing image with watermark
 */
export async function uploadListingImage(
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Validate file
    validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
    });

    // Add watermark to image
    if (onProgress) onProgress(10);
    const watermarkedFile = await addWatermark(file);
    if (onProgress) onProgress(30);

    // Generate unique filename and sanitize path
    const filename = generateUniqueFilename(watermarkedFile);
    const filePath = sanitizePath(`${userId}/listings/${filename}`);

    // Get session to ensure we're authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error('Authentication required for upload');
    }

    return await withRetry(async () => {
      let attempt = 0;
      let lastError: Error | null = null;

      while (attempt < MAX_RETRIES) {
        try {
          if (onProgress) {
            onProgress(Math.round(40 + (attempt * 20))); // Progress: 40%, 60%, 80%, 100%
          }

          const { data, error } = await supabase.storage
            .from('listings')
            .upload(filePath, watermarkedFile, {
              cacheControl: '3600',
              upsert: true
            });

          if (error) {
            if (error.statusCode === 404) {
              throw new Error('Storage bucket not found. Please ensure the listings bucket exists.');
            }
            if (error.statusCode === 400) {
              throw new Error('Permission denied. Please check storage policies.');
            }
            throw error;
          }

          if (!data) {
            throw new Error('Upload failed - no data returned');
          }

          const { data: { publicUrl } } = supabase.storage
            .from('listings')
            .getPublicUrl(data.path);

          if (onProgress) {
            onProgress(100);
          }

          return publicUrl;
        } catch (error) {
          console.error(`Upload attempt ${attempt + 1} failed:`, error);
          lastError = error as Error;
          attempt++;
          
          if (attempt < MAX_RETRIES) {
            const delay = RETRY_DELAY * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      throw lastError || new Error('Upload failed after retries');
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Upload a profile photo
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Validate file
    validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
    });

    // Generate unique filename and sanitize path
    const filename = generateUniqueFilename(file);
    const filePath = sanitizePath(`${userId}/profile/${filename}`);

    // Get session to ensure we're authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error('Authentication required for upload');
    }

    return await withRetry(async () => {
      let attempt = 0;
      let lastError: Error | null = null;

      while (attempt < MAX_RETRIES) {
        try {
          if (onProgress) {
            onProgress(Math.round((attempt * 25) + 25));
          }

          const { data, error } = await supabase.storage
            .from('listings')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });

          if (error) {
            if (error.statusCode === 404) {
              throw new Error('Storage bucket not found');
            }
            if (error.statusCode === 400) {
              throw new Error('Permission denied');
            }
            throw error;
          }

          if (!data) {
            throw new Error('Upload failed - no data returned');
          }

          const { data: { publicUrl } } = supabase.storage
            .from('listings')
            .getPublicUrl(data.path);

          if (onProgress) {
            onProgress(100);
          }

          return publicUrl;
        } catch (error) {
          console.error(`Upload attempt ${attempt + 1} failed:`, error);
          lastError = error as Error;
          attempt++;
          
          if (attempt < MAX_RETRIES) {
            const delay = RETRY_DELAY * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      throw lastError || new Error('Upload failed after retries');
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Delete a file
 */
export async function deleteFile(bucket: 'listings', path: string): Promise<void> {
  try {
    const sanitizedPath = sanitizePath(path);
    const { error } = await supabase.storage
      .from(bucket)
      .remove([sanitizedPath]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error('Failed to delete file. Please try again.');
    }
  } catch (error: any) {
    console.error('Delete error:', error);
    throw error;
  }
}