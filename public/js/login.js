// Login Page Logic
// Handles magic link authentication

import { login } from '../../core/auth.js';
import { isValidEmail } from '../../core/utils.js';

const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

function showMessage(text, type = 'success') {
    messageDiv.textContent = text;
    messageDiv.className = `message message-${type}`;
    messageDiv.classList.remove('hidden');
}

function hideMessage() {
    messageDiv.classList.add('hidden');
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();

    const email = document.getElementById('email').value.trim();

    if (!email) {
        showMessage('Please enter your email address', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const { error } = await login(email);

    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Magic Link';

    if (error) {
        showMessage(error.message, 'error');
        return;
    }

    showMessage('Magic link sent! Check your email to log in.');
    loginForm.reset();
});
