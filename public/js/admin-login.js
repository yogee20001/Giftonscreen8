// Admin Login Page Logic
// Handles email/password authentication for admins

import { supabase } from '../../core/supabase.js';

// Admin email (must match the one in admin.js)
const ADMIN_EMAIL = 'admin@giftonscreen.com';

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

    if (session && session.user.email === ADMIN_EMAIL) {
        // Already logged in as admin, redirect to admin panel
        window.location.replace('/public/admin.html');
        return true;
    }

    return false;
}

// Handle form submission
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validate admin email
    if (email !== ADMIN_EMAIL) {
        showMessage('Invalid admin credentials', 'error');
        return;
    }

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
            showMessage('Login successful! Redirecting...', 'success');

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