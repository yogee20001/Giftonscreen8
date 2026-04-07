// Admin Panel Logic - Redesigned with Category-wise Gift Management
// Manages all gifts with easy activate/deactivate controls

import { requireAuth, logout } from '../../core/auth.js';
import {
    getAllGiftsAdmin,
    updateGiftStatus,
    getActivationRequests,
    markRequestProcessed,
    checkIsAdmin,
    getTemplates
} from '../../core/api.js';
import { formatDate } from '../../core/utils.js';

// State
let allGifts = [];
let allTemplates = [];
let activationRequests = [];
let currentView = 'gifts';
let filteredGifts = [];

// Auth guard
const user = await requireAuth('/public/admin-login.html');
if (!user) {
    throw new Error('Authentication required');
}

// Check admin access
const { isAdmin, error: adminError } = await checkIsAdmin();
if (adminError || !isAdmin) {
    renderAccessDenied();
    throw new Error('Access denied - not an admin');
}

// DOM Elements
const mainContent = document.getElementById('mainContent');
const refreshBtn = document.getElementById('refreshBtn');
const logoutBtn = document.getElementById('logoutBtn');
const toast = document.getElementById('toast');
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');

// Initialize
await loadDashboard();

// Event Listeners
refreshBtn?.addEventListener('click', loadDashboard);
logoutBtn?.addEventListener('click', handleLogout);

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        setActiveView(view);
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

async function handleLogout() {
    const { error } = await logout();
    if (!error) {
        window.location.href = '/public/admin-login.html';
    }
}

function setActiveView(view) {
    currentView = view;
    renderDashboard();
}

async function loadDashboard() {
    showLoading();

    try {
        // Load all data in parallel
        const [giftsResult, templatesResult, requestsResult] = await Promise.all([
            getAllGiftsAdmin(),
            getTemplates(),
            getActivationRequests()
        ]);

        if (giftsResult.error) throw giftsResult.error;
        if (templatesResult.error) throw templatesResult.error;

        allGifts = giftsResult.gifts || [];
        allTemplates = templatesResult.templates || [];
        activationRequests = requestsResult.requests || [];

        renderDashboard();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard: ' + error.message);
    }
}

function showLoading() {
    mainContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading dashboard...</p>
        </div>
    `;
}

function renderDashboard() {
    const stats = calculateStats();

    let html = renderStats(stats);

    if (currentView === 'requests') {
        html += renderActivationRequests();
    } else {
        html += renderFilters();
        html += renderGiftsByCategory();
    }

    mainContent.innerHTML = html;
    attachEventListeners();
}

function calculateStats() {
    const total = allGifts.length;
    const active = allGifts.filter(g => g.status === 'active').length;
    const inactive = allGifts.filter(g => g.status === 'inactive').length;
    const pending = allGifts.filter(g => g.status === 'pending').length;
    const pendingRequests = activationRequests.filter(r => r.status === 'pending').length;

    return { total, active, inactive, pending, pendingRequests };
}

function renderStats(stats) {
    const statCards = [
        { icon: '🎁', label: 'Total Gifts', value: stats.total, color: 'blue' },
        { icon: '✅', label: 'Active', value: stats.active, color: 'green' },
        { icon: '⏸️', label: 'Inactive', value: stats.inactive, color: 'yellow' },
        { icon: '⏳', label: 'Pending', value: stats.pending, color: 'red' }
    ];

    return `
        <div class="stats-grid">
            ${statCards.map(stat => `
                <div class="stat-card">
                    <div class="stat-header">
                        <div>
                            <div class="stat-value">${stat.value}</div>
                            <div class="stat-label">${stat.label}</div>
                        </div>
                        <div class="stat-icon ${stat.color}">${stat.icon}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderFilters() {
    const templates = [...new Set(allGifts.map(g => g.template_id))];

    return `
        <div class="filters-bar">
            <div class="filter-group">
                <label>Status:</label>
                <select id="filterStatus">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Template:</label>
                <select id="filterTemplate">
                    <option value="all">All Templates</option>
                    ${templates.map(t => `<option value="${t}">${getTemplateName(t)}</option>`).join('')}
                </select>
            </div>
            <div class="filter-group">
                <label>Search:</label>
                <input type="text" id="searchInput" placeholder="Search recipient, sender, ID...">
            </div>
        </div>
    `;
}

function getTemplateName(templateId) {
    const template = allTemplates.find(t => t.id === templateId);
    return template ? template.name : templateId;
}

function getFilteredGifts() {
    let gifts = [...allGifts];

    // Filter by view
    if (currentView === 'pending') {
        gifts = gifts.filter(g => g.status === 'pending');
    } else if (currentView === 'active') {
        gifts = gifts.filter(g => g.status === 'active');
    } else if (currentView === 'inactive') {
        gifts = gifts.filter(g => g.status === 'inactive');
    }

    // Apply dropdown filters
    const statusFilter = document.getElementById('filterStatus')?.value;
    const templateFilter = document.getElementById('filterTemplate')?.value;
    const searchQuery = document.getElementById('searchInput')?.value?.toLowerCase();

    if (statusFilter && statusFilter !== 'all') {
        gifts = gifts.filter(g => g.status === statusFilter);
    }

    if (templateFilter && templateFilter !== 'all') {
        gifts = gifts.filter(g => g.template_id === templateFilter);
    }

    if (searchQuery) {
        gifts = gifts.filter(g => {
            const data = g.data || {};
            return (
                (data.receiver?.toLowerCase().includes(searchQuery)) ||
                (data.sender?.toLowerCase().includes(searchQuery)) ||
                g.id.toLowerCase().includes(searchQuery)
            );
        });
    }

    return gifts;
}

function groupGiftsByCategory(gifts) {
    const groups = {};

    gifts.forEach(gift => {
        const templateId = gift.template_id || 'unknown';
        const templateName = getTemplateName(templateId);
        const category = getTemplateCategory(templateId);

        if (!groups[category]) {
            groups[category] = {
                name: category,
                templateName,
                gifts: []
            };
        }

        groups[category].gifts.push(gift);
    });

    return Object.values(groups).sort((a, b) => b.gifts.length - a.gifts.length);
}

function getTemplateCategory(templateId) {
    const template = allTemplates.find(t => t.id === templateId);
    return template ? `${template.category} - ${template.name}` : `Other - ${templateId}`;
}

function renderGiftsByCategory() {
    const gifts = getFilteredGifts();

    if (gifts.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>No Gifts Found</h3>
                <p>No gifts match your current filters.</p>
            </div>
        `;
    }

    const categories = groupGiftsByCategory(gifts);

    return categories.map((category, index) => `
        <div class="category-section ${index > 0 ? 'collapsed' : ''}" data-category="${category.name}">
            <div class="category-header" onclick="toggleCategory(this)">
                <div class="category-title">
                    <span>📁</span>
                    <span>${category.name}</span>
                    <span class="category-count">${category.gifts.length}</span>
                </div>
                <span class="category-toggle">▼</span>
            </div>
            <div class="category-content">
                <div class="gifts-grid">
                    ${category.gifts.map(gift => renderGiftCard(gift)).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function renderGiftCard(gift) {
    const data = gift.data || {};
    const template = allTemplates.find(t => t.id === gift.template_id);

    return `
        <div class="gift-card ${gift.status}" data-gift-id="${gift.id}">
            <div class="gift-header">
                <span class="gift-id">${gift.id}</span>
                <span class="gift-status ${gift.status}">${gift.status}</span>
            </div>
            <div class="gift-info">
                <div class="gift-recipient">👤 ${data.receiver || 'Unknown'}</div>
                <div class="gift-sender">From: ${data.sender || 'Unknown'}</div>
            </div>
            <div class="gift-message">${data.message || 'No message'}</div>
            <div class="gift-meta">
                <span>📅 ${formatDate(gift.created_at)}</span>
                <span>🎨 ${template?.name || gift.template_id}</span>
            </div>
            <div class="gift-actions">
                ${renderToggleButton(gift)}
                <a href="/g/${gift.id}" target="_blank" class="btn btn-sm btn-secondary">View</a>
            </div>
        </div>
    `;
}

function renderToggleButton(gift) {
    const isActive = gift.status === 'active';
    const nextStatus = isActive ? 'inactive' : 'active';
    const buttonClass = isActive ? 'btn-danger' : 'btn-success';
    const buttonText = isActive ? 'Deactivate' : 'Activate';

    return `
        <button class="btn btn-sm ${buttonClass} toggle-status-btn" 
                data-gift-id="${gift.id}" 
                data-next-status="${nextStatus}">
            ${buttonText}
        </button>
    `;
}

function renderActivationRequests() {
    const pending = activationRequests.filter(r => r.status === 'pending');
    const processed = activationRequests.filter(r => r.status === 'processed');

    return `
        <div class="category-section">
            <div class="category-header">
                <div class="category-title">
                    <span>⏳</span>
                    <span>Pending Requests</span>
                    <span class="category-count">${pending.length}</span>
                </div>
            </div>
            <div class="category-content">
                ${pending.length === 0 ? '<p style="padding: 2rem; text-align: center; color: var(--gray-400);">No pending requests</p>' :
            pending.map(request => renderRequestCard(request)).join('')}
            </div>
        </div>

        <div class="category-section collapsed">
            <div class="category-header" onclick="toggleCategory(this)">
                <div class="category-title">
                    <span>✅</span>
                    <span>Processed Requests</span>
                    <span class="category-count">${processed.length}</span>
                </div>
                <span class="category-toggle">▼</span>
            </div>
            <div class="category-content">
                ${processed.length === 0 ? '<p style="padding: 2rem; text-align: center; color: var(--gray-400);">No processed requests</p>' :
            processed.map(request => renderRequestCard(request)).join('')}
            </div>
        </div>
    `;
}

function renderRequestCard(request) {
    return `
        <div class="gift-card ${request.status}" style="margin-bottom: 1rem;">
            <div class="gift-header">
                <span class="gift-id">${request.gift_id}</span>
                <span class="gift-status ${request.status}">${request.status}</span>
            </div>
            <div class="gift-message">${request.message || 'No message'}</div>
            <div class="gift-meta">
                <span>📅 ${formatDate(request.created_at)}</span>
            </div>
            ${request.status === 'pending' ? `
                <div class="gift-actions">
                    <button class="btn btn-sm btn-success activate-request-btn" 
                            data-gift-id="${request.gift_id}" 
                            data-request-id="${request.id}">
                        ✅ Activate
                    </button>
                    <button class="btn btn-sm btn-secondary mark-processed-btn" 
                            data-request-id="${request.id}">
                        Mark Processed
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

function attachEventListeners() {
    // Filter change listeners
    document.getElementById('filterStatus')?.addEventListener('change', renderDashboard);
    document.getElementById('filterTemplate')?.addEventListener('change', renderDashboard);
    document.getElementById('searchInput')?.addEventListener('input', debounce(renderDashboard, 300));

    // Toggle status buttons
    document.querySelectorAll('.toggle-status-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const giftId = e.target.dataset.giftId;
            const nextStatus = e.target.dataset.nextStatus;

            e.target.disabled = true;
            e.target.textContent = nextStatus === 'active' ? 'Activating...' : 'Deactivating...';

            const { error } = await updateGiftStatus(giftId, nextStatus);

            if (error) {
                showToast('Error: ' + error.message, 'error');
                e.target.disabled = false;
            } else {
                showToast(`Gift ${nextStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success');
                // Update local state
                const gift = allGifts.find(g => g.id === giftId);
                if (gift) gift.status = nextStatus;
                renderDashboard();
            }
        });
    });

    // Activate request buttons
    document.querySelectorAll('.activate-request-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const giftId = e.target.dataset.giftId;
            const requestId = e.target.dataset.requestId;

            e.target.disabled = true;
            e.target.textContent = 'Activating...';

            const { error } = await updateGiftStatus(giftId, 'active');

            if (error) {
                showToast('Error: ' + error.message, 'error');
                e.target.disabled = false;
            } else {
                await markRequestProcessed(requestId);
                showToast('Gift activated and request marked as processed!', 'success');
                await loadDashboard();
            }
        });
    });

    // Mark processed buttons
    document.querySelectorAll('.mark-processed-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const requestId = e.target.dataset.requestId;

            e.target.disabled = true;
            e.target.textContent = 'Processing...';

            const { error } = await markRequestProcessed(requestId);

            if (error) {
                showToast('Error: ' + error.message, 'error');
                e.target.disabled = false;
            } else {
                showToast('Request marked as processed!', 'success');
                await loadDashboard();
            }
        });
    });
}

// Global function for category toggle
window.toggleCategory = function (header) {
    const section = header.closest('.category-section');
    section.classList.toggle('collapsed');
};

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showError(message) {
    mainContent.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <h3>Error</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 1rem;">
                Retry
            </button>
        </div>
    `;
}

function renderAccessDenied() {
    document.body.innerHTML = `
        <div class="access-denied">
            <h2>⛔ Access Denied</h2>
            <p>You do not have permission to access the admin panel.</p>
            <a href="./index.html" class="btn btn-primary" style="margin-top: 1rem; display: inline-block;">Go Home</a>
        </div>
    `;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
