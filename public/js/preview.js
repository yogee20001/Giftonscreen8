// Preview Page Logic
// Renders gift preview in iframe using localStorage data

import { getUser, logout } from '../../core/auth.js';

// Check auth and update UI
async function checkAuth() {
    const { user } = await getUser();
    updateAuthUI(user);
}

function updateAuthUI(user) {
    if (logoutBtn) {
        if (user) {
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
    const { error } = await logout();
    if (!error) {
        window.location.reload();
    }
}

// Load preview data from localStorage
const data = JSON.parse(localStorage.getItem('previewData'));

// Validate data
if (!data || !data.templateId) {
    window.location.href = '/public/index.html';
    throw new Error('Preview data not found');
}

const container = document.getElementById('preview-frame-container');
const continueBtn = document.getElementById('continue-btn');
const logoutBtn = document.getElementById('logoutBtn');
const giftData = document.getElementById('gift-data');

// Display gift data summary
giftData.innerHTML = `
    <p><strong>Template:</strong> ${data.templateId}</p>
    <p><strong>To:</strong> ${data.receiver}</p>
    <p><strong>From:</strong> ${data.sender}</p>
    <p><strong>Message:</strong> ${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}</p>
`;

// Create iframe for preview
const iframe = document.createElement('iframe');
iframe.style.width = '100%';
iframe.style.height = '500px';
iframe.style.border = 'none';
iframe.style.borderRadius = '8px';
iframe.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';

container.appendChild(iframe);

// Get iframe document
const doc = iframe.contentDocument || iframe.contentWindow.document;

// Add base styles
doc.open();
doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        </style>
    </head>
    <body></body>
    </html>
`);
doc.close();

// Load template script
const script = doc.createElement('script');
script.type = 'module';
script.src = `/templates/${data.templateId}/preview.js`;

script.onload = () => {
    // Check if TEMPLATE exists
    if (!iframe.contentWindow.TEMPLATE) {
        container.innerHTML = '<p style="color: #ef4444; text-align: center;">Error: Template not found</p>';
        return;
    }

    // Check if renderPreview exists
    if (typeof iframe.contentWindow.TEMPLATE.renderPreview !== 'function') {
        container.innerHTML = '<p style="color: #ef4444; text-align: center;">Error: Template preview not available</p>';
        return;
    }

    // Create container for template content
    const templateContainer = doc.createElement('div');
    templateContainer.id = 'template-content';
    doc.body.appendChild(templateContainer);

    // Render preview
    try {
        iframe.contentWindow.TEMPLATE.renderPreview(data, templateContainer);
    } catch (err) {
        container.innerHTML = `<p style="color: #ef4444; text-align: center;">Error rendering preview: ${err.message}</p>`;
    }
};

script.onerror = () => {
    container.innerHTML = '<p style="color: #ef4444; text-align: center;">Error: Failed to load template</p>';
};

doc.body.appendChild(script);

let giftId = null;

// Continue button - create actual gift in database and activation request immediately
continueBtn.addEventListener('click', async () => {
    continueBtn.disabled = true;
    continueBtn.textContent = 'Checking login...';

    // Check if user is logged in first
    const { user: currentUser } = await getUser();

    if (!currentUser) {
        // User not logged in - save current state and redirect to login
        sessionStorage.setItem('redirectAfterLogin', 'preview');
        window.location.href = `/public/login.html?redirect=preview`;
        return;
    }

    continueBtn.textContent = 'Creating gift...';

    // Import API functions
    const { createGift, createActivationRequest, getUserProfile } = await import('../../core/api.js');

    // Step 1: Create the gift
    const { gift, error } = await createGift({
        template_id: data.templateId,
        receiver: data.receiver,
        sender: data.sender,
        message: data.message,
        photoUrl: null,
        musicUrl: null
    });

    if (error) {
        alert('Error creating gift: ' + error.message);
        continueBtn.disabled = false;
        continueBtn.textContent = 'Create Gift';
        return;
    }

    giftId = gift.id;

    // Step 2: IMMEDIATELY create activation request (before showing WhatsApp button)
    // This ensures admin sees the pending gift right away
    try {
        const { user: currentUser } = await getUserProfile();

        if (currentUser) {
            const activationMessage = `GiftOnScreen Activation Request
Gift ID: ${giftId}
User Email: ${currentUser.email}
Template: ${data.templateId}
Amount: ₹59
Status: Pending payment`;

            await createActivationRequest({
                gift_id: giftId,
                user_id: currentUser.id,
                message: activationMessage
            });

            console.log('✅ Activation request created for admin:', giftId);
        }
    } catch (err) {
        console.error('❌ Error creating activation request:', err);
        // Continue even if this fails - gift is already created
    }

    // Step 3: Show admin notified banner FIRST, then activation section
    document.getElementById('admin-notified-banner').style.display = 'block';
    continueBtn.parentElement.style.display = 'none';
    document.getElementById('activation-section').style.display = 'block';

    // Update gift data display
    giftData.innerHTML += `<p><strong>Gift ID:</strong> ${giftId}</p>`;
    giftData.innerHTML += `<p><strong>Status:</strong> <span style="color: #f59e0b;">Pending Activation</span></p>`;

    // Alert for immediate feedback (remove after testing)
    alert('✅ Gift created! Admin has been automatically notified. You can now complete payment via WhatsApp.');
});

// Activate on WhatsApp button
const activateBtn = document.getElementById('activate-btn');
const statusMsg = document.getElementById('status-msg');

activateBtn.addEventListener('click', async () => {
    if (!giftId) {
        statusMsg.textContent = 'Error: Gift not created yet';
        statusMsg.style.color = '#ef4444';
        return;
    }

    // Prevent duplicate clicks
    if (activateBtn.disabled) return;
    activateBtn.disabled = true;
    statusMsg.textContent = 'Opening WhatsApp...';

    try {
        // Import API function
        const { getUserProfile } = await import('../../core/api.js');
        const { user: currentUser } = await getUserProfile();

        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        // Create WhatsApp message (activation request already created when gift was created)
        const whatsappMessage = `
GiftOnScreen Activation Request

Gift ID: ${giftId}
User Email: ${currentUser.email}
Template: ${data.templateId}
Amount: ₹59

Please confirm payment to activate this gift.`;

        // Admin WhatsApp number (replace with actual number)
        const ADMIN_WHATSAPP = '919999999999'; // Replace with actual admin number

        // Open WhatsApp
        const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');

        // Show feedback
        statusMsg.textContent = 'After payment, your gift will be activated shortly. You can check the status in My Gifts.';
        statusMsg.style.color = '#059669';

    } catch (error) {
        console.error('Activation error:', error);
        statusMsg.textContent = 'Error: ' + error.message;
        statusMsg.style.color = '#ef4444';
        activateBtn.disabled = false;
    }
});

// Initialize auth check
checkAuth();
