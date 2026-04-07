// My Gifts Page Logic
// Displays all gifts created by the current user

import { getMyGifts } from '../../core/api.js';
import { requireAuth } from '../../core/auth.js';
import { initUserMenu } from './user-menu.js';

const giftsContainer = document.getElementById('giftsContainer');

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatGiftId(id) {
    // Show first 8 characters of the gift ID
    return id.slice(0, 8).toUpperCase();
}

function renderGifts(gifts) {
    if (!gifts || gifts.length === 0) {
        giftsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎁</div>
                <h2 class="empty-state-title">No Gifts Yet</h2>
                <p class="empty-state-text">You haven't created any gifts yet. Start by choosing a template!</p>
                <a href="/public/index.html" class="btn btn-primary">Create Your First Gift</a>
            </div>
        `;
        return;
    }

    const giftsHtml = gifts.map(gift => {
        const data = gift.data || {};
        const statusClass = gift.status === 'active' ? 'active' : 'inactive';
        const statusText = gift.status === 'active' ? 'Active' : 'Pending';

        return `
            <div class="gift-card">
                <div class="gift-header">
                    <div class="gift-id">Gift #${formatGiftId(gift.id)}</div>
                    <span class="gift-status ${statusClass}">${statusText}</span>
                </div>
                <div class="gift-details">
                    <div class="gift-detail">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span class="label">To:</span>
                        <span>${data.receiver || 'Not specified'}</span>
                    </div>
                    <div class="gift-detail">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span class="label">Created:</span>
                        <span>${formatDate(gift.created_at)}</span>
                    </div>
                    <div class="gift-detail">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span class="label">Expires:</span>
                        <span>${formatDate(gift.expires_at)}</span>
                    </div>
                </div>
                <div class="gift-actions">
                    <a href="/public/gift.html?id=${gift.id}" class="gift-btn primary" target="_blank">View Gift</a>
                    <a href="/public/preview.html?gift=${gift.id}" class="gift-btn secondary">Preview</a>
                </div>
            </div>
        `;
    }).join('');

    giftsContainer.innerHTML = `<div class="gifts-grid">${giftsHtml}</div>`;
}

function showError(message) {
    giftsContainer.innerHTML = `
        <div class="error-state">
            <p>${message}</p>
            <button class="btn btn-secondary mt-3" onclick="window.location.reload()">Try Again</button>
        </div>
    `;
}

async function loadGifts() {
    try {
        const { gifts, error } = await getMyGifts();

        if (error) {
            showError(`Error loading gifts: ${error.message}`);
            return;
        }

        renderGifts(gifts);
    } catch (err) {
        console.error('Error loading gifts:', err);
        showError('An unexpected error occurred. Please try again.');
    }
}

// Initialize page
async function init() {
    // Initialize user menu in header
    await initUserMenu();

    // Check authentication
    const user = await requireAuth('/public/login.html');

    if (user) {
        await loadGifts();
    }
}

init();
