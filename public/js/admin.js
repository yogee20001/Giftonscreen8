// Admin Panel Logic
// Manages activation requests and gift activation

import { requireAuth, logout, getUser } from '../../core/auth.js';
import {
    getActivationRequests,
    updateGiftStatus,
    markRequestProcessed,
    checkIsAdmin
} from '../../core/api.js';
import { formatDate } from '../../core/utils.js';

// DOM Elements - initialize first
const container = document.getElementById('admin-container');
const refreshBtn = document.getElementById('refreshBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Render access denied message
function renderAccessDenied() {
    if (container) {
        container.innerHTML = `
            <div class="access-denied card">
                <h2>⛔ Access Denied</h2>
                <p>You do not have permission to access the admin panel.</p>
                <a href="./index.html" class="btn btn-primary" style="margin-top: 1rem; display: inline-block;">Go Home</a>
            </div>
        `;
    }
}

// Auth guard - redirect to admin login page
const user = await requireAuth('/public/admin-login.html');
if (!user) {
    throw new Error('Authentication required');
}

// Check admin access via Supabase user metadata
const { isAdmin, error: adminError } = await checkIsAdmin();
if (adminError || !isAdmin) {
    renderAccessDenied();
    throw new Error('Access denied - not an admin');
}

function renderStats(requests) {
    const pending = requests.filter(r => r.status === 'pending').length;
    const processed = requests.filter(r => r.status === 'processed').length;
    const total = requests.length;

    return `
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
            <div class="stat-card" style="background: #f9fafb; padding: 1.5rem; border-radius: 8px; text-align: center;">
                <h3 style="font-size: 2rem; color: #6366f1;">${total}</h3>
                <p style="color: #666;">Total Requests</p>
            </div>
            <div class="stat-card" style="background: #f9fafb; padding: 1.5rem; border-radius: 8px; text-align: center;">
                <h3 style="font-size: 2rem; color: #f59e0b;">${pending}</h3>
                <p style="color: #666;">Pending</p>
            </div>
            <div class="stat-card" style="background: #f9fafb; padding: 1.5rem; border-radius: 8px; text-align: center;">
                <h3 style="font-size: 2rem; color: #10b981;">${processed}</h3>
                <p style="color: #666;">Processed</p>
            </div>
        </div>
    `;
}

function renderRequests(requests) {
    if (!requests || requests.length === 0) {
        return `
            <div class="empty-state card" style="text-align: center; padding: 3rem;">
                <p style="font-size: 3rem; margin-bottom: 1rem;">📭</p>
                <h3>No Activation Requests</h3>
                <p style="color: #666;">When users request activation, they will appear here.</p>
            </div>
        `;
    }

    const requestsHtml = requests.map(request => `
        <div class="request-item ${request.status}" data-id="${request.id}" style="background: #f9fafb; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
            <div class="request-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div class="request-info">
                    <h4>Gift ID: ${request.gift_id}</h4>
                    <p style="color: #666; font-size: 0.9rem;">Requested: ${formatDate(request.created_at)}</p>
                    <p style="color: #666; font-size: 0.9rem;">User: ${request.user_id}</p>
                </div>
                <span class="status-badge ${request.status}" style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; background: ${request.status === 'pending' ? '#fef3c7' : '#d1fae5'}; color: ${request.status === 'pending' ? '#92400e' : '#065f46'};">${request.status}</span>
            </div>

            <div class="request-message" style="background: #fff; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">${request.message || 'No message'}</div>

            <div class="request-actions" style="display: flex; gap: 0.5rem;">
                <button
                    class="btn btn-success activate-btn"
                    data-gift-id="${request.gift_id}"
                    data-request-id="${request.id}"
                    ${request.status === 'processed' ? 'disabled' : ''}
                    style="background: #10b981; color: #fff; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;"
                >
                    ${request.status === 'processed' ? '✓ Activated' : '✓ Activate Gift'}
                </button>
                <button
                    class="btn btn-secondary mark-processed-btn"
                    data-request-id="${request.id}"
                    ${request.status === 'processed' ? 'disabled' : ''}
                    style="background: #6b7280; color: #fff; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;"
                >
                    Mark Processed
                </button>
            </div>
        </div>
    `).join('');

    return `
        <div class="card" style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="margin-bottom: 1.5rem;">Activation Requests</h2>
            <div class="request-list">
                ${requestsHtml}
            </div>
        </div>
    `;
}

async function loadDashboard() {
    if (!container) return;

    container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Loading...</p>';

    const { requests, error } = await getActivationRequests();

    if (error) {
        container.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 2rem;">Error loading requests: ${error.message}</p>`;
        return;
    }

    container.innerHTML = renderStats(requests) + renderRequests(requests);

    // Add event listeners for action buttons
    container.querySelectorAll('.activate-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const giftId = e.target.dataset.giftId;
            const requestId = e.target.dataset.requestId;

            e.target.disabled = true;
            e.target.textContent = 'Activating...';

            const { error } = await updateGiftStatus(giftId, 'active');

            if (error) {
                alert('Error activating gift: ' + error.message);
                e.target.disabled = false;
                e.target.textContent = '✓ Activate Gift';
                return;
            }

            // Also mark request as processed
            await markRequestProcessed(requestId);

            e.target.textContent = '✓ Activated';

            // Refresh dashboard
            await loadDashboard();
        });
    });

    container.querySelectorAll('.mark-processed-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const requestId = e.target.dataset.requestId;

            e.target.disabled = true;
            e.target.textContent = 'Processing...';

            const { error } = await markRequestProcessed(requestId);

            if (error) {
                alert('Error marking request: ' + error.message);
                e.target.disabled = false;
                e.target.textContent = 'Mark Processed';
                return;
            }

            // Refresh dashboard
            await loadDashboard();
        });
    });
}

// Event listeners
if (refreshBtn) {
    refreshBtn.addEventListener('click', loadDashboard);
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        const { error } = await logout();
        if (!error) {
            window.location.href = '/public/admin-login.html';
        }
    });
}

// Initial load
await loadDashboard();