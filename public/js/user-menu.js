// User Menu Component
// Shared utility for user icon dropdown across all pages

import { getUser, logout } from '../../core/auth.js';

/**
 * Get display name initial from user object
 * @param {Object} user - Supabase user object
 * @returns {string} Single letter to display
 */
export function getUserInitial(user) {
    if (!user) return '?';

    // Check for name in user_metadata
    const fullName = user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.display_name;

    if (fullName) {
        return fullName.charAt(0).toUpperCase();
    }

    // Fallback to email
    if (user.email) {
        return user.email.charAt(0).toUpperCase();
    }

    return '?';
}

/**
 * Get full display name from user object
 * @param {Object} user - Supabase user object
 * @returns {string} Full display name
 */
export function getUserDisplayName(user) {
    if (!user) return 'Guest';

    // Check for name in user_metadata
    const fullName = user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.display_name;

    if (fullName) {
        return fullName;
    }

    // Fallback to email
    if (user.email) {
        return user.email.split('@')[0];
    }

    return 'Guest';
}

/**
 * Initialize user menu in the header
 * Call this function on every page that has the user menu
 */
export async function initUserMenu() {
    const menuContainer = document.getElementById('userMenuContainer');

    if (!menuContainer) {
        console.warn('User menu container not found');
        return;
    }

    const { user } = await getUser();

    if (user) {
        // User is logged in - show user icon with dropdown
        const initial = getUserInitial(user);

        menuContainer.innerHTML = `
            <div class="user-menu-container">
                <div class="user-icon" id="userIcon" title="${getUserDisplayName(user)}">
                    ${initial}
                </div>
                <div class="user-dropdown" id="userDropdown">
                    <a href="/public/my-gifts.html" class="user-dropdown-item">
                        <svg class="user-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                        Created Gifts
                    </a>
                    <div class="user-dropdown-divider"></div>
                    <button class="user-dropdown-item logout" id="logoutBtn">
                        <svg class="user-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        const userIcon = document.getElementById('userIcon');
        const userDropdown = document.getElementById('userDropdown');
        const logoutBtn = document.getElementById('logoutBtn');

        // Toggle dropdown on icon click
        userIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userDropdown.classList.remove('active');
        });

        // Prevent dropdown close when clicking inside it
        userDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Logout handler
        logoutBtn.addEventListener('click', async () => {
            const { error } = await logout();
            if (!error) {
                window.location.reload();
            }
        });

    } else {
        // User is not logged in - show login button
        menuContainer.innerHTML = `
            <a href="/public/login.html" class="login-btn">Login</a>
        `;
    }
}
