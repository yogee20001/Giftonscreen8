// Create Gift Page Logic
// Handles gift creation with template selection

import { requireAuth, logout } from '../../core/auth.js';
import { getTemplates } from '../../core/api.js';

// Auth guard
await requireAuth('/public/login.html');

// Get template ID from URL
const params = new URLSearchParams(window.location.search);
const templateId = params.get('template');

// Validate template ID
if (!templateId) {
    window.location.href = '/public/index.html';
    throw new Error('Template ID required');
}

// Verify template exists
const { templates, error: templateError } = await getTemplates();
if (templateError || !templates?.find(t => t.id === templateId)) {
    window.location.href = '/public/index.html';
    throw new Error('Invalid template');
}

const createGiftForm = document.getElementById('createGiftForm');
const messageDiv = document.getElementById('message');
const logoutBtn = document.getElementById('logoutBtn');

function showMessage(text, type = 'success') {
    messageDiv.textContent = text;
    messageDiv.className = `message message-${type}`;
    messageDiv.classList.remove('hidden');
}

function hideMessage() {
    messageDiv.classList.add('hidden');
}

createGiftForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideMessage();

    const receiver = document.getElementById('receiver').value.trim();
    const sender = document.getElementById('sender').value.trim();
    const message = document.getElementById('message').value.trim();

    // Validation
    if (!receiver || !sender || !message) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }

    // Store preview data in localStorage (NO backend call for preview)
    localStorage.setItem('previewData', JSON.stringify({
        templateId,
        receiver,
        sender,
        message
    }));

    // Redirect to preview page
    window.location.href = '/public/preview.html';
});

logoutBtn.addEventListener('click', async () => {
    const { error } = await logout();
    if (!error) {
        window.location.href = '/public/login.html';
    }
});
