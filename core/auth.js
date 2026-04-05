// Authentication Module
// Handles user login, logout, and session management

import { supabase } from './supabase.js';

// Base URL for redirects - using custom domain
const BASE_URL = 'https://giftonscreen.shop';

/**
 * Send magic link to user's email for authentication
 * @param {string} email - User's email address
 * @returns {Promise<{error: Error|null}>}
 */
export async function login(email) {
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${BASE_URL}/public/callback.html`
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
 * Sign in with Google OAuth
 * @returns {Promise<{error: Error|null}>}
 */
export async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${BASE_URL}/public/callback.html`
        }
    });
    return { error };
}

/**
 * Check if user is authenticated, redirect to login if not
 * @param {string} redirectUrl - URL to redirect unauthenticated users
 * @returns {Promise<Object|null>} - User object if authenticated
 */
export async function requireAuth(redirectUrl = '/public/login.html') {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        window.location.href = redirectUrl;
        return null;
    }

    return session.user;
}

/**
 * Listen for auth state changes
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
    return subscription.unsubscribe;
}