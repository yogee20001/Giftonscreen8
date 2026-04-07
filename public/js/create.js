// Create Gift Page Logic
// Handles gift creation with template selection and image uploads

import { logout, getUser } from '../../core/auth.js';
import { getTemplates } from '../../core/api.js';
import { uploadMultipleImages } from '../../core/cloudinary.js';

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
const photosInput = document.getElementById('photos');
const photoPreview = document.getElementById('photoPreview');
const uploadProgress = document.getElementById('uploadProgress');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const submitBtn = document.getElementById('submitBtn');

let selectedFiles = [];
let uploadedPhotoUrls = [];

function showMessage(text, type = 'success') {
    messageDiv.textContent = text;
    messageDiv.className = `message message-${type}`;
    messageDiv.classList.remove('hidden');
}

function hideMessage() {
    messageDiv.classList.add('hidden');
}

// Handle photo selection
photosInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);

    // Limit to 5 photos
    if (files.length > 5) {
        showMessage('You can only upload up to 5 photos', 'error');
        photosInput.value = '';
        return;
    }

    selectedFiles = files;
    displayPhotoPreviews(files);
});

// Display photo previews
function displayPhotoPreviews(files) {
    photoPreview.innerHTML = '';

    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewDiv = document.createElement('div');
            previewDiv.style.cssText = 'position: relative; width: 80px; height: 80px;';
            previewDiv.innerHTML = `
                <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                <button type="button" onclick="removePhoto(${index})" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;">×</button>
            `;
            photoPreview.appendChild(previewDiv);
        };
        reader.readAsDataURL(file);
    });
}

// Remove photo from selection
window.removePhoto = (index) => {
    selectedFiles.splice(index, 1);
    displayPhotoPreviews(selectedFiles);

    // Reset input if no files left
    if (selectedFiles.length === 0) {
        photosInput.value = '';
    }
};

// Upload photos to Cloudinary
async function uploadPhotos() {
    if (selectedFiles.length === 0) {
        return { urls: [], errors: [] };
    }

    const { user } = await getUser();
    const folder = `gifts/${user?.id || 'anonymous'}`;

    uploadProgress.style.display = 'block';
    progressBar.value = 0;
    progressText.textContent = 'Uploading photos...';

    const { urls, errors } = await uploadMultipleImages(selectedFiles, folder);

    uploadProgress.style.display = 'none';

    if (errors.length > 0) {
        console.error('Some uploads failed:', errors);
    }

    return { urls, errors };
}

// Handle form submission
createGiftForm.addEventListener('submit', async (e) => {
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

    // Disable submit button during upload
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading photos...';

    // Upload photos if any
    const { urls: photoUrls, errors: uploadErrors } = await uploadPhotos();

    if (uploadErrors.length > 0 && photoUrls.length === 0) {
        showMessage('Failed to upload photos. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Gift';
        return;
    }

    submitBtn.textContent = 'Creating gift...';

    // Store preview data in localStorage (NO backend call for preview)
    localStorage.setItem('previewData', JSON.stringify({
        templateId,
        receiver,
        sender,
        message,
        photos: photoUrls
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