// Admin Panel Logic - Redesigned with Perfect Filtering
// Category-wise gift management with strong backend integration

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

// ============================================
// WORKER CONFIGURATION
// Gift Rendering Worker URL - handles all /g/:giftId routes
// ============================================
const WORKER_URL = 'https://giftonscreen8-worker.giftonscreen.workers.dev';

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    allGifts: [],
    allTemplates: [],
    activationRequests: [],
    currentView: 'gifts', // gifts, pending, active, inactive, requests
    filters: {
        status: 'all',
        template: 'all',
        search: ''
    },
    isLoading: false
};

// ============================================
// AUTHENTICATION
// ============================================
const user = await requireAuth('/public/admin-login.html');
if (!user) {
    throw new Error('Authentication required');
}

const { isAdmin, error: adminError } = await checkIsAdmin();
if (adminError || !isAdmin) {
    renderAccessDenied();
    throw new Error('Access denied - not an admin');
}

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    mainContent: document.getElementById('mainContent'),
    refreshBtn: document.getElementById('refreshBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    toast: document.getElementById('toast'),
    sidebarLinks: document.querySelectorAll('.sidebar-nav a')
};

// ============================================
// INITIALIZATION
// ============================================
async function init() {
    setupEventListeners();
    await loadDashboard();
}

function setupEventListeners() {
    // Refresh and logout
    elements.refreshBtn?.addEventListener('click', loadDashboard);
    elements.logoutBtn?.addEventListener('click', handleLogout);

    // Sidebar navigation
    elements.sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.dataset.view;
            switchView(view);

            // Update active state in sidebar
            elements.sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

async function handleLogout() {
    const { error } = await logout();
    if (!error) {
        window.location.href = '/public/admin-login.html';
    }
}

// ============================================
// DATA LOADING
// ============================================
async function loadDashboard() {
    showLoading();
    state.isLoading = true;

    try {
        // Load all data in parallel
        const [giftsResult, templatesResult, requestsResult] = await Promise.all([
            getAllGiftsAdmin(),
            getTemplates(),
            getActivationRequests()
        ]);

        if (giftsResult.error) throw giftsResult.error;
        if (templatesResult.error) throw templatesResult.error;

        state.allGifts = giftsResult.gifts || [];
        state.allTemplates = templatesResult.templates || [];
        state.activationRequests = requestsResult.requests || [];

        renderDashboard();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard: ' + error.message);
    } finally {
        state.isLoading = false;
    }
}

// ============================================
// VIEW MANAGEMENT
// ============================================
function switchView(view) {
    state.currentView = view;

    // Reset filters when switching views (except for requests view)
    if (view !== 'requests') {
        state.filters.status = 'all';
        state.filters.template = 'all';
        state.filters.search = '';
    }

    renderDashboard();
}

// ============================================
// FILTERING LOGIC
// ============================================
function getFilteredGifts() {
    let gifts = [...state.allGifts];

    // STEP 1: Filter by VIEW (sidebar selection)
    if (state.currentView === 'pending') {
        gifts = gifts.filter(g => g.status === 'pending');
    } else if (state.currentView === 'active') {
        gifts = gifts.filter(g => g.status === 'active');
    } else if (state.currentView === 'inactive') {
        gifts = gifts.filter(g => g.status === 'inactive');
    }
    // 'gifts' view shows all (no filter)

    // STEP 2: Filter by STATUS dropdown (only if not already filtered by view)
    if (state.filters.status !== 'all') {
        gifts = gifts.filter(g => g.status === state.filters.status);
    }

    // STEP 3: Filter by TEMPLATE
    if (state.filters.template !== 'all') {
        gifts = gifts.filter(g => g.template_id === state.filters.template);
    }

    // STEP 4: Filter by SEARCH
    if (state.filters.search.trim()) {
        const query = state.filters.search.toLowerCase().trim();
        gifts = gifts.filter(g => {
            const data = g.data || {};
            const receiver = (data.receiver || '').toLowerCase();
            const sender = (data.sender || '').toLowerCase();
            const giftId = (g.id || '').toLowerCase();
            const message = (data.message || '').toLowerCase();

            return receiver.includes(query) ||
                sender.includes(query) ||
                giftId.includes(query) ||
                message.includes(query);
        });
    }

    return gifts;
}

function getFilteredRequests() {
    let requests = [...state.activationRequests];

    // Filter by search if provided
    if (state.filters.search.trim()) {
        const query = state.filters.search.toLowerCase().trim();
        requests = requests.filter(r => {
            const giftId = (r.gift_id || '').toLowerCase();
            const message = (r.message || '').toLowerCase();
            return giftId.includes(query) || message.includes(query);
        });
    }

    return requests;
}

// ============================================
// RENDERING
// ============================================
function renderDashboard() {
    const stats = calculateStats();
    let html = renderStats(stats);

    if (state.currentView === 'requests') {
        html += renderRequestsView();
    } else {
        html += renderFilters();
        html += renderGiftsView();
    }

    elements.mainContent.innerHTML = html;
    attachDynamicEventListeners();
}

function calculateStats() {
    const total = state.allGifts.length;
    const active = state.allGifts.filter(g => g.status === 'active').length;
    const inactive = state.allGifts.filter(g => g.status === 'inactive').length;
    const pending = state.allGifts.filter(g => g.status === 'pending').length;
    const pendingRequests = state.activationRequests.filter(r => r.status === 'pending').length;

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
    // Use ALL templates from Supabase (not just ones with gifts)
    const allTemplates = state.allTemplates || [];

    return `
        <div class="filters-bar">
            <div class="filter-group">
                <label>Status:</label>
                <select id="filterStatus" class="filter-select">
                    <option value="all" ${state.filters.status === 'all' ? 'selected' : ''}>All Status</option>
                    <option value="active" ${state.filters.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${state.filters.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    <option value="pending" ${state.filters.status === 'pending' ? 'selected' : ''}>Pending</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Template:</label>
                <select id="filterTemplate" class="filter-select">
                    <option value="all" ${state.filters.template === 'all' ? 'selected' : ''}>All Templates</option>
                    ${allTemplates.map(t => `
                        <option value="${t.id}" ${state.filters.template === t.id ? 'selected' : ''}>
                            ${t.name}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="filter-group" style="flex: 1; max-width: 300px;">
                <label>Search:</label>
                <input type="text" 
                       id="searchInput" 
                       class="filter-input" 
                       placeholder="Search by recipient, sender, ID..."
                       value="${state.filters.search}">
            </div>
            <button id="clearFilters" class="btn btn-secondary btn-sm" style="margin-top: 24px;">
                Clear Filters
            </button>
        </div>
    `;
}

function renderGiftsView() {
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
        <div class="category-section" data-category="${escapeHtml(category.name)}">
            <div class="category-header" onclick="toggleCategory(this)">
                <div class="category-title">
                    <span>📁</span>
                    <span>${escapeHtml(category.name)}</span>
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

function renderRequestsView() {
    const requests = getFilteredRequests();
    const pending = requests.filter(r => r.status === 'pending');
    const processed = requests.filter(r => r.status === 'processed');

    return `
        <div class="filters-bar" style="margin-bottom: 1rem;">
            <div class="filter-group" style="flex: 1; max-width: 400px;">
                <label>Search Requests:</label>
                <input type="text" 
                       id="searchInput" 
                       class="filter-input" 
                       placeholder="Search by gift ID or message..."
                       value="${state.filters.search}">
            </div>
        </div>

        <div class="category-section">
            <div class="category-header">
                <div class="category-title">
                    <span>⏳</span>
                    <span>Pending Requests</span>
                    <span class="category-count">${pending.length}</span>
                </div>
            </div>
            <div class="category-content">
                ${pending.length === 0
            ? '<p style="padding: 2rem; text-align: center; color: var(--gray-400);">No pending requests</p>'
            : `<div class="gifts-grid">${pending.map(r => renderRequestCard(r)).join('')}</div>`
        }
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
                ${processed.length === 0
            ? '<p style="padding: 2rem; text-align: center; color: var(--gray-400);">No processed requests</p>'
            : `<div class="gifts-grid">${processed.map(r => renderRequestCard(r)).join('')}</div>`
        }
            </div>
        </div>
    `;
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function groupGiftsByCategory(gifts) {
    const groups = {};

    gifts.forEach(gift => {
        const templateId = gift.template_id || 'unknown';
        const category = getTemplateCategory(templateId);

        if (!groups[category]) {
            groups[category] = {
                name: category,
                gifts: []
            };
        }

        groups[category].gifts.push(gift);
    });

    // Sort by number of gifts (descending)
    return Object.values(groups).sort((a, b) => b.gifts.length - a.gifts.length);
}

function getTemplateCategory(templateId) {
    const template = state.allTemplates.find(t => t.id === templateId);
    if (template) {
        return `${template.category} - ${template.name}`;
    }
    return `Other - ${templateId}`;
}

function getTemplateName(templateId) {
    const template = state.allTemplates.find(t => t.id === templateId);
    return template ? template.name : templateId;
}

function renderGiftCard(gift) {
    const data = gift.data || {};
    const template = state.allTemplates.find(t => t.id === gift.template_id);

    return `
        <div class="gift-card ${gift.status}" data-gift-id="${gift.id}">
            <div class="gift-header">
                <span class="gift-id">${gift.id}</span>
                <span class="gift-status ${gift.status}">${gift.status}</span>
            </div>
            <div class="gift-info">
                <div class="gift-recipient">👤 ${escapeHtml(data.receiver || 'Unknown')}</div>
                <div class="gift-sender">From: ${escapeHtml(data.sender || 'Unknown')}</div>
            </div>
            <div class="gift-message">${escapeHtml(data.message || 'No message')}</div>
            <div class="gift-meta">
                <span>📅 ${formatDate(gift.created_at)}</span>
                <span>🎨 ${escapeHtml(template?.name || gift.template_id)}</span>
            </div>
            <div class="gift-actions">
                ${renderToggleButton(gift)}
                <a href="${WORKER_URL}/g/${gift.id}" target="_blank" class="btn btn-sm btn-secondary">View</a>
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
            <div class="gift-message">${escapeHtml(request.message || 'No message')}</div>
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

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// EVENT HANDLERS
// ============================================
function attachDynamicEventListeners() {
    // Filter change listeners - use 'change' for select, 'input' for text
    const statusFilter = document.getElementById('filterStatus');
    const templateFilter = document.getElementById('filterTemplate');
    const searchInput = document.getElementById('searchInput');
    const clearFiltersBtn = document.getElementById('clearFilters');

    statusFilter?.addEventListener('change', (e) => {
        state.filters.status = e.target.value;
        renderDashboard();
    });

    templateFilter?.addEventListener('change', (e) => {
        state.filters.template = e.target.value;
        renderDashboard();
    });

    searchInput?.addEventListener('input', debounce((e) => {
        state.filters.search = e.target.value;
        renderDashboard();
    }, 300));

    clearFiltersBtn?.addEventListener('click', () => {
        state.filters.status = 'all';
        state.filters.template = 'all';
        state.filters.search = '';
        renderDashboard();
    });

    // Toggle status buttons
    document.querySelectorAll('.toggle-status-btn').forEach(btn => {
        btn.addEventListener('click', handleToggleStatus);
    });

    // Request action buttons
    document.querySelectorAll('.activate-request-btn').forEach(btn => {
        btn.addEventListener('click', handleActivateRequest);
    });

    document.querySelectorAll('.mark-processed-btn').forEach(btn => {
        btn.addEventListener('click', handleMarkProcessed);
    });
}

async function handleToggleStatus(e) {
    const giftId = e.target.dataset.giftId;
    const nextStatus = e.target.dataset.nextStatus;

    e.target.disabled = true;
    e.target.textContent = nextStatus === 'active' ? 'Activating...' : 'Deactivating...';

    const { error } = await updateGiftStatus(giftId, nextStatus);

    if (error) {
        showToast('Error: ' + error.message, 'error');
        e.target.disabled = false;
        e.target.textContent = nextStatus === 'active' ? 'Activate' : 'Deactivate';
    } else {
        showToast(`Gift ${nextStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success');
        // Update local state
        const gift = state.allGifts.find(g => g.id === giftId);
        if (gift) gift.status = nextStatus;
        renderDashboard();
    }
}

async function handleActivateRequest(e) {
    const giftId = e.target.dataset.giftId;
    const requestId = e.target.dataset.requestId;

    e.target.disabled = true;
    e.target.textContent = 'Activating...';

    const { error } = await updateGiftStatus(giftId, 'active');

    if (error) {
        showToast('Error: ' + error.message, 'error');
        e.target.disabled = false;
        e.target.textContent = '✅ Activate';
    } else {
        await markRequestProcessed(requestId);
        showToast('Gift activated and request processed!', 'success');
        await loadDashboard();
    }
}

async function handleMarkProcessed(e) {
    const requestId = e.target.dataset.requestId;

    e.target.disabled = true;
    e.target.textContent = 'Processing...';

    const { error } = await markRequestProcessed(requestId);

    if (error) {
        showToast('Error: ' + error.message, 'error');
        e.target.disabled = false;
        e.target.textContent = 'Mark Processed';
    } else {
        showToast('Request marked as processed!', 'success');
        await loadDashboard();
    }
}

// ============================================
// UI HELPERS
// ============================================
function showLoading() {
    elements.mainContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading dashboard...</p>
        </div>
    `;
}

function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type} show`;

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function showError(message) {
    elements.mainContent.innerHTML = `
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

// Global function for category toggle
window.toggleCategory = function (header) {
    const section = header.closest('.category-section');
    section.classList.toggle('collapsed');
};

// ============================================
// START
// ============================================
await init();
