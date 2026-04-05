// Authentication Module
// Handles user login, logout, and session management

import { supabase } from './supabase.js';

/**
 * Send magic link to user's email for authentication
 * @param {string} email - User's email address
 * @returns {Promise<{error: Error|null}>}
 */
export async function login(email) {
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: window.location.origin + '/public/index.html'
        }
    });
    return { error };
}

/**
 * Get current authenticated user
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export async function getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
}

/**
 * Get current session
 * @returns {Promise<{session: Object|null, error: Error|null}>}
 */
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
}

/**
 * Sign out current user
 * @returns {Promise<{error: Error|null}>}
 */
export async function logout() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

/**
 * Check if user is authenticated, redirect to login if not
 * @param {string} redirectUrl - URL to redirect unauthenticated users
 * @returns {Promise<Object|null>} - User object if authenticated
 */
export async function requireAuth(redirectUrl = '/public/login.html') {
    const { user, error } = await getUser();

    if (error || !user) {
        window.location.href = redirectUrl;
        return null;
    }

    return user;
}
