// Homepage Logic
// Fetches and displays template feed - accessible to all users

import { getUser } from '../../core/auth.js';
import { getTemplates } from '../../core/api.js';

const templateList = document.getElementById('template-list');
const logoutBtn = document.getElementById('logoutBtn');

// Check auth status and update UI
let currentUser = null;

async function checkAuth() {
    const { user } = await getUser();
    currentUser = user;
    updateAuthUI();
}

function updateAuthUI() {
    if (logoutBtn) {
        if (currentUser) {
            logoutBtn.textContent = 'Logout';
            logoutBtn.onclick = handleLogout;
        } else {
            logoutBtn.textContent = 'Login';
            logoutBtn.onclick = () => {
                window.location.href = '/public/login.html';
            };
        }
    }
}

async function handleLogout() {
    const { logout } = await import('../../core/auth.js');
    const { error } = await logout();
    if (!error) {
        window.location.reload();
    }
}

function renderTemplates(templates) {
    if (!templates || templates.length === 0) {
        templateList.innerHTML = '<p style="color: #666; text-align: center;">No templates available.</p>';
        return;
    }

    templateList.innerHTML = templates.map(template => `
        <div class="template-card" data-id="${template.id}">
            ${template.thumbnail_url ? `
                <img src="${template.thumbnail_url}" alt="${template.name}" class="template-thumbnail">
            ` : '<div class="template-thumbnail" style="background: #e5e7eb; display: flex; align-items: center; justify-content: center; color: #9ca3af;">No Image</div>'}
            <div class="template-info">
                <h3>${template.name}</h3>
                <p>${template.description || ''}</p>
                ${template.is_premium ? '<span class="premium-badge">Premium</span>' : ''}
            </div>
        </div>
    `).join('');

    // Add click handlers
    templateList.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            const templateId = card.dataset.id;
            handleTemplateClick(templateId);
        });
    });
}

async function handleTemplateClick(templateId) {
    // Go directly to create page - login will be required only when creating gift
    window.location.href = `/public/create.html?template=${templateId}`;
}

async function loadTemplates() {
    templateList.innerHTML = '<p style="color: #666; text-align: center;">Loading templates...</p>';

    const { templates, error } = await getTemplates();

    if (error) {
        templateList.innerHTML = `<p style="color: #ef4444; text-align: center;">Error loading templates: ${error.message}</p>`;
        return;
    }

    renderTemplates(templates);
}

// Initialize
await checkAuth();
await loadTemplates();
