// Cloudinary Configuration
// Handles image uploads for gift photos

const CLOUDINARY_CLOUD_NAME = 'disurt4mx';
const CLOUDINARY_UPLOAD_PRESET = 'gift_photos';
const CLOUDINARY_API_KEY = '384744882434684';

/**
 * Upload an image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} folder - Optional folder path (e.g., 'gifts/user123')
 * @returns {Promise<{url: string|null, error: Error|null}>}
 */
export async function uploadImage(file, folder = 'gifts') {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('api_key', CLOUDINARY_API_KEY);
        formData.append('folder', folder);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Upload failed');
        }

        return { url: data.secure_url, error: null };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return { url: null, error };
    }
}

/**
 * Upload multiple images to Cloudinary
 * @param {File[]} files - Array of image files
 * @param {string} folder - Optional folder path
 * @returns {Promise<{urls: string[], errors: Error[]}>}
 */
export async function uploadMultipleImages(files, folder = 'gifts') {
    const urls = [];
    const errors = [];

    for (const file of files) {
        const { url, error } = await uploadImage(file, folder);
        if (url) {
            urls.push(url);
        } else if (error) {
            errors.push(error);
        }
    }

    return { urls, errors };
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function deleteImage(publicId) {
    try {
        // Note: Delete requires server-side authentication with API secret
        // This is a placeholder for future implementation
        console.warn('Image deletion requires server-side implementation');
        return { success: false, error: new Error('Delete not implemented') };
    } catch (error) {
        return { success: false, error };
    }
}

/**
 * Get optimized image URL
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized URL
 */
export function getOptimizedImageUrl(url, options = {}) {
    if (!url) return null;

    const { width = 800, height = null, quality = 'auto' } = options;

    // Parse the URL to insert transformations
    const urlParts = url.split('/upload/');
    if (urlParts.length !== 2) return url;

    const transformations = [`q_${quality}`, `w_${width}`];
    if (height) transformations.push(`h_${height}`, 'c_fit');

    return `${urlParts[0]}/upload/${transformations.join(',')}/${urlParts[1]}`;
}