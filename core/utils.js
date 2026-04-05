// Utility Functions
// Helper functions for the application

/**
 * Generate a unique gift ID
 * Format: GIFT-XXXXX (uppercase alphanumeric)
 * @returns {string} - Generated gift ID
 */
export function generateGiftId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'GIFT-';

    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return id;
}

/**
 * Format a date for display
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
