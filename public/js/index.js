// Homepage Logic
// Fetches and displays template feed

import { requireAuth } from '../../core/auth.js';
import { getTemplates } from '../../core/api.js';

// Auth guard
await requireAuth('/public/login.html');

const templateList = document.getElementById('template-list');

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
            window.location.href = `/public/create.html?template=${templateId}`;
        });
    });
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

await loadTemplates();
