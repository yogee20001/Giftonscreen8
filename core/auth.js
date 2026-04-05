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
 * Sign in with Google OAuth
 * @returns {Promise<{error: Error|null}>}
 */
export async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/public/index.html'
        }
    });
    return { error };
}

/**
 * Handle OAuth callback and establish session
 * Call this on app initialization to process auth redirects
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export async function handleAuthCallback() {
    // Check if URL contains OAuth callback hash
    const hash = window.location.hash;
    const hasAuthParams = hash.includes('access_token') || hash.includes('error');

    if (hasAuthParams) {
        // Supabase automatically processes the hash when getSession is called
        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 100));

        // Clear the hash from URL without reloading
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    return await getUser();
}

/**
 * Check if user is authenticated, redirect to login if not
 * @param {string} redirectUrl - URL to redirect unauthenticated users
 * @returns {Promise<Object|null>} - User object if authenticated
 */
export async function requireAuth(redirectUrl = '/public/login.html') {
    // First try to handle any OAuth callback
    const { user, error } = await handleAuthCallback();

    if (error || !user) {
        // Try one more time after a short delay (for race conditions)
        await new Promise(resolve => setTimeout(resolve, 200));
        const retry = await getUser();

        if (retry.error || !retry.user) {
            window.location.href = redirectUrl;
            return null;
        }
        return retry.user;
    }

    return user;
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