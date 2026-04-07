// OAuth Callback Handler
// Processes authentication callback and establishes session

import { supabase } from '../../core/supabase.js';

const statusEl = document.getElementById('status');
const errorContainer = document.getElementById('error-container');

function showError(message, showRetry = true) {
    statusEl.textContent = 'Authentication failed';
    errorContainer.innerHTML = `
        <div class="error">
            <p>${message}</p>
            ${showRetry ? '<button class="retry-btn" onclick="window.location.href=\'/public/login.html\'">Back to Login</button>' : ''}
        </div>
    `;
}

function showSuccess() {
    statusEl.textContent = 'Success! Redirecting...';
}

// Get redirect URL from sessionStorage
function getRedirectUrl() {
    const redirect = sessionStorage.getItem('redirectAfterLogin');
    const template = sessionStorage.getItem('selectedTemplate');
    sessionStorage.removeItem('redirectAfterLogin');
    sessionStorage.removeItem('selectedTemplate');

    if (redirect === 'create' && template) {
        return `/public/create.html?template=${template}`;
    }
    if (redirect === 'preview') {
        return '/public/preview.html';
    }
    return '/public/index.html';
}

async function handleCallback() {
    try {
        // Check for error in URL
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
            showError(errorDescription || `Authentication error: ${error}`);
            return;
        }

        // Check for hash fragment (OAuth tokens)
        const hash = window.location.hash;
        const hasAuthParams = hash.includes('access_token') ||
            hash.includes('refresh_token');

        if (!hasAuthParams) {
            // No auth params - check if already logged in
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                showSuccess();
                setTimeout(() => {
                    window.location.replace(getRedirectUrl());
                }, 500);
                return;
            }

            showError('No authentication data found. Please try logging in again.');
            return;
        }

        // Process OAuth callback
        statusEl.textContent = 'Establishing session...';

        // Supabase automatically extracts tokens from URL hash
        // We just need to wait for the session to be established
        let retries = 0;
        const maxRetries = 10;

        while (retries < maxRetries) {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                showError(`Session error: ${sessionError.message}`);
                return;
            }

            if (session) {
                // Session established successfully
                showSuccess();

                // Clear the hash from URL without reloading
                history.replaceState(null, '', '/public/callback.html');

                // Redirect to intended page
                setTimeout(() => {
                    window.location.replace(getRedirectUrl());
                }, 500);
                return;
            }

            // Wait and retry
            await new Promise(resolve => setTimeout(resolve, 200));
            retries++;
        }

        // If we get here, session wasn't established
        showError('Unable to establish session. Please try logging in again.');

    } catch (err) {
        console.error('Callback error:', err);
        showError(`Unexpected error: ${err.message}`);
    }
}

// Handle the callback when page loads
handleCallback();
