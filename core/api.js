// API Layer
// Database operations using Supabase client

import { supabase } from './supabase.js';
import { generateGiftId } from './utils.js';

/**
 * Fetch all active templates from the database
 * @returns {Promise<{templates: Array|null, error: Error|null}>}
 */
export async function getTemplates() {
    const { data: templates, error } = await supabase
        .from('templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    return { templates, error };
}

/**
 * Create a new gift in the database
 * @param {Object} data - Gift data
 * @param {string} data.template_id - Template ID
 * @param {string} data.receiver - Receiver name
 * @param {string} data.sender - Sender name
 * @param {string} data.message - Gift message
 * @param {string} data.photoUrl - Optional photo URL
 * @param {string} data.musicUrl - Optional music URL
 * @returns {Promise<{gift: Object|null, error: Error|null}>}
 */
export async function createGift(data) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { gift: null, error: new Error('User not authenticated') };
    }

    const giftId = generateGiftId();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const { data: gift, error } = await supabase
        .from('gifts')
        .insert({
            id: giftId,
            user_id: user.id,
            template_id: data.template_id || 'default',
            status: 'inactive',
            data: {
                receiver: data.receiver,
                sender: data.sender,
                message: data.message,
                photoUrl: data.photoUrl || null,
                musicUrl: data.musicUrl || null
            },
            expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

    return { gift, error };
}

/**
 * Get all gifts for the current authenticated user
 * @returns {Promise<{gifts: Array|null, error: Error|null}>}
 */
export async function getMyGifts() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { gifts: null, error: new Error('User not authenticated') };
    }

    const { data: gifts, error } = await supabase
        .from('gifts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return { gifts, error };
}

/**
 * Get a single gift by ID (must belong to current user)
 * @param {string} giftId - Gift ID
 * @returns {Promise<{gift: Object|null, error: Error|null}>}
 */
export async function getGift(giftId) {
    const { data: gift, error } = await supabase
        .from('gifts')
        .select('*')
        .eq('id', giftId)
        .single();

    return { gift, error };
}

/**
 * Get current user profile
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export async function getUserProfile() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
}

/**
 * Create activation request
 * @param {Object} data - Activation request data
 * @param {string} data.gift_id - Gift ID
 * @param {string} data.user_id - User ID
 * @param {string} data.message - Message
 * @returns {Promise<{error: Error|null}>}
 */
export async function createActivationRequest(data) {
    const { error } = await supabase
        .from('activation_requests')
        .insert([{
            gift_id: data.gift_id,
            user_id: data.user_id,
            message: data.message,
            status: 'pending'
        }]);

    return { error };
}

/**
 * Get all activation requests (for admin)
 * @returns {Promise<{requests: Array|null, error: Error|null}>}
 */
export async function getActivationRequests() {
    const { data: requests, error } = await supabase
        .from('activation_requests')
        .select('*, gifts(*)')
        .order('created_at', { ascending: false });

    return { requests, error };
}

/**
 * Update gift status (for admin)
 * @param {string} giftId - Gift ID
 * @param {string} status - New status ('active' or 'inactive')
 * @returns {Promise<{error: Error|null}>}
 */
export async function updateGiftStatus(giftId, status) {
    const { error } = await supabase
        .from('gifts')
        .update({ status })
        .eq('id', giftId);

    return { error };
}

/**
 * Mark activation request as processed (for admin)
 * @param {string} requestId - Request ID
 * @returns {Promise<{error: Error|null}>}
 */
export async function markRequestProcessed(requestId) {
    const { error } = await supabase
        .from('activation_requests')
        .update({ status: 'processed' })
        .eq('id', requestId);

    return { error };
}

// ============================================
// ADMIN CHECK FUNCTIONS
// ============================================

/**
 * Check if a user is an admin
 * @param {string} userId - User UUID
 * @returns {Promise<{isAdmin: boolean, error: Error|null}>}
 */
export async function checkIsAdmin(userId) {
    const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', userId)
        .single();

    return { isAdmin: !!data, error };
}

/**
 * Check if an email belongs to an admin
 * @param {string} email - Email address
 * @returns {Promise<{isAdmin: boolean, error: Error|null}>}
 */
export async function checkIsAdminEmail(email) {
    const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('email', email)
        .single();

    return { isAdmin: !!data, error };
}

/**
 * Get admin details for a user
 * @param {string} userId - User UUID
 * @returns {Promise<{admin: Object|null, error: Error|null}>}
 */
export async function getAdminDetails(userId) {
    const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .single();

    return { admin, error };
}