// Admin Login Page Logic
// Handles email/password authentication for admins using Supabase user metadata

import { supabase } from '../../core/supabase.js';
import { checkIsAdmin } from '../../core/api.js';

const adminLoginForm = document.getElementById('adminLoginForm');
const messageDiv = document.getElementById('message');
const loginBtn = document.getElementById('loginBtn');

function showMessage(text, type = 'success') {
    messageDiv.textContent = text;
    messageDiv.className = `message message-${type}`;
    messageDiv.classList.remove('hidden');
}

function hideMessage() {
    messageDiv.classList.add('hidden');
}

// Check if already logged in as admin
async function checkExistingSession() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        // Check if user has admin role in metadata
        const { isAdmin, error } = await checkIsAdmin();

        if (isAdmin && !error) {
            // Already logged in as admin, redirect to admin panel
            window.location.replace('/public/admin.html');
            return true;
        }
    }

    return false;
}

// Handle form submission
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Disable button during login
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';

    try {
        // Sign in with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            showMessage(error.message, 'error');
            loginBtn.disabled = false;
            loginBtn.textContent = 'Sign In';
            return;
        }

        if (data.session) {
            // Check if user has admin role in their metadata
            const { isAdmin, role, error: adminError } = await checkIsAdmin();

            if (adminError) {
                console.error('Admin check error:', adminError);
            }

            if (!isAdmin) {
                // Not an admin - sign them out and show error
                await supabase.auth.signOut();
                showMessage('Access denied. This account does not have admin privileges.', 'error');
                loginBtn.disabled = false;
                loginBtn.textContent = 'Sign In';
                return;
            }

            showMessage(`Login successful! Role: ${role}. Redirecting...`, 'success');

            // Redirect to admin panel after short delay
            setTimeout(() => {
                window.location.replace('/public/admin.html');
            }, 500);
        }
    } catch (err) {
        console.error('Login error:', err);
        showMessage('An unexpected error occurred. Please try again.', 'error');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';
    }
});

// Check session on page load
await checkExistingSession();