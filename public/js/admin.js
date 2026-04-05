// Admin Panel Logic
// Manages activation requests and gift activation

import { requireAuth, logout } from '../../core/auth.js';
import {
    getActivationRequests,
    updateGiftStatus,
    markRequestProcessed,
    getUserProfile
} from '../../core/api.js';
import { formatDate } from '../../core/utils.js';

// Admin email (hardcoded for now)
const ADMIN_EMAIL = 'admin@giftonscreen.com'; // Change this to your admin email

// Auth guard
const user = await requireAuth('/public/login.html');
if (!user) {
    throw new Error('Authentication required');
}

// Check admin access
const { user: currentUser } = await getUserProfile();
if (currentUser.email !== ADMIN_EMAIL) {
    renderAccessDenied();
    throw new Error('Access denied');
}

const container = document.getElementById('admin-container');
const refreshBtn = document.getElementById('refreshBtn');
const logoutBtn = document.getElementById('logoutBtn');

function renderAccessDenied() {
    container.innerHTML = `
        <div class="access-denied card">
            <h2>⛔ Access Denied</h2>
            <p>You do not have permission to access the admin panel.</p>
            <a href="index.html" class="btn btn-primary mt-3">Go Home</a>
        </div>
    `;
}

function renderStats(requests) {
    const pending = requests.filter(r => r.status === 'pending').length;
    const processed = requests.filter(r => r.status === 'processed').length;
    const total = requests.length;

    return `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>${total}</h3>
                <p>Total Requests</p>
            </div>
            <div class="stat-card">
                <h3 style="color: #f59e0b;">${pending}</h3>
                <p>Pending</p>
            </div>
            <div class="stat-card">
                <h3 style="color: #10b981;">${processed}</h3>
                <p>Processed</p>
            </div>
        </div>
    `;
}

function renderRequests(requests) {
    if (!requests || requests.length === 0) {
        return `
            <div class="empty-state card">
                <p style="font-size: 3rem; margin-bottom: 1rem;">📭</p>
                <h3>No Activation Requests</h3>
                <p>When users request activation, they will appear here.</p>
            </div>
        `;
    }

    const requestsHtml = requests.map(request => `
        <div class="request-item ${request.status}" data-id="${request.id}">
            <div class="request-header">
                <div class="request-info">
                    <h4>Gift ID: ${request.gift_id}</h4>
                    <p>Requested: ${formatDate(request.created_at)}</p>
                    <p>User: ${request.user_id}</p>
                </div>
                <span class="status-badge ${request.status}">${request.status}</span>
            </div>

            <div class="request-message">${request.message || 'No message'}</div>

            <div class="request-actions">
                <button
                    class="btn btn-success activate-btn"
                    data-gift-id="${request.gift_id}"
                    data-request-id="${request.id}"
                    ${request.status === 'processed' ? 'disabled' : ''}
                >
                    ${request.status === 'processed' ? '✓ Activated' : '✓ Activate Gift'}
                </button>
                <button
                    class="btn btn-secondary mark-processed-btn"
                    data-request-id="${request.id}"
                    ${request.status === 'processed' ? 'disabled' : ''}
                >
                    Mark Processed
                </button>
            </div>
        </div>
    `).join('');

    return `
        <div class="card">
            <h2 style="margin-bottom: 1.5rem;">Activation Requests</h2>
            <div class="request-list">
                ${requestsHtml}
            </div>
        </div>
    `;
}

async function loadDashboard() {
    container.innerHTML = '<p style="text-align: center; color: #6b7280;">Loading...</p>';

    const { requests, error } = await getActivationRequests();

    if (error) {
        container.innerHTML = `<p style="color: #ef4444; text-align: center;">Error loading requests: ${error.message}</p>`;
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
refreshBtn.addEventListener('click', loadDashboard);

logoutBtn.addEventListener('click', async () => {
    const { error } = await logout();
    if (!error) {
        window.location.href = '/public/login.html';
    }
});

// Initial load
await loadDashboard();
