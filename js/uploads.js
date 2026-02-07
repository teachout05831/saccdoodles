/* ============================================
   SACC Doodles - Bunny CDN Upload System
   Handles photo/video uploads to Bunny.net
   ============================================ */

// Upload configuration
const UPLOAD_CONFIG = {
    maxImageSize: 5 * 1024 * 1024,  // 5MB
    maxVideoSize: 350 * 1024 * 1024, // 350MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
    allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    imageQuality: 0.85,
    maxImageDimension: 1600,
    thumbnailSize: 400
};

/**
 * Check if a file is an allowed image (by MIME type or extension)
 * Handles iPhone HEIC files where MIME type may be empty
 */
function isAllowedImage(file) {
    if (UPLOAD_CONFIG.allowedImageTypes.includes(file.type)) return true;
    // Fallback: check extension (iOS sometimes reports empty MIME type for HEIC)
    if (file.name) {
        const ext = file.name.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'].includes(ext);
    }
    return false;
}

/**
 * Check if a file is an allowed video (by MIME type or extension)
 * Handles iPhone where MIME type may be empty or unexpected
 */
function isAllowedVideo(file) {
    if (UPLOAD_CONFIG.allowedVideoTypes.includes(file.type)) return true;
    // Fallback: check extension (iOS sometimes reports empty MIME type)
    if (file.name) {
        const ext = file.name.split('.').pop().toLowerCase();
        return ['mp4', 'mov', 'webm', 'm4v'].includes(ext);
    }
    return false;
}

// ============================================
// Bunny CDN Upload Functions
// ============================================

/**
 * Upload a file to Bunny CDN Storage via Supabase Edge Function
 * This keeps the API key secure on the server side
 * @param {Blob|File} file - The file to upload
 * @param {string} folder - Folder path (e.g., 'puppies', 'dogs')
 * @param {string} filename - Optional custom filename
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<{url: string, path: string}>}
 */
async function uploadToBunny(file, folder, filename = null, onProgress = null) {
    console.log('uploadToBunny called:', { fileType: file?.type, fileSize: file?.size, folder, filename });

    // Check if Supabase is configured
    if (!CONFIG.SUPABASE_URL) {
        console.error('Supabase URL not configured');
        throw new Error('Supabase URL not configured');
    }

    // Generate filename if not provided
    if (!filename) {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ext = getFileExtension(file);
        filename = `${timestamp}-${randomStr}.${ext}`;
        console.log('Generated filename:', filename);
    }

    // Edge Function URL
    const edgeFunctionUrl = `${CONFIG.SUPABASE_URL}/functions/v1/bunny-upload`;
    console.log('Uploading to Edge Function:', edgeFunctionUrl);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        if (onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    console.log('Upload progress:', percent + '%');
                    onProgress(percent);
                }
            });
        }

        xhr.addEventListener('load', () => {
            console.log('XHR load event:', xhr.status, xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const result = JSON.parse(xhr.responseText);
                    if (result.success) {
                        console.log('Upload succeeded:', result);
                        resolve({
                            url: result.url,
                            path: result.path
                        });
                    } else {
                        console.error('Upload failed (server):', result.error);
                        reject(new Error(result.error || 'Upload failed'));
                    }
                } catch (e) {
                    console.error('Failed to parse response:', e);
                    reject(new Error('Invalid response from server'));
                }
            } else {
                console.error('Upload failed:', xhr.status, xhr.responseText);
                reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
            }
        });

        xhr.addEventListener('error', () => {
            console.error('Upload network error');
            reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
            console.log('Upload aborted');
            reject(new Error('Upload cancelled'));
        });

        xhr.addEventListener('timeout', () => {
            console.error('Upload timed out');
            reject(new Error('Upload timed out. Try a shorter video or a stronger connection.'));
        });

        // Open connection to Edge Function
        xhr.open('POST', edgeFunctionUrl);
        xhr.timeout = 5 * 60 * 1000; // 5 minute timeout for large uploads
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.setRequestHeader('x-file-name', filename);
        xhr.setRequestHeader('x-folder', folder || '');
        xhr.setRequestHeader('Authorization', `Bearer ${CONFIG.SUPABASE_ANON_KEY}`);

        console.log('Sending file to Edge Function...');
        // Send the file
        xhr.send(file);
    });
}

/**
 * Delete a file from Bunny CDN Storage via Supabase Edge Function
 * @param {string} path - File path in storage
 * @returns {Promise<void>}
 */
async function deleteFromBunny(path) {
    if (!CONFIG.SUPABASE_URL) {
        throw new Error('Supabase URL not configured');
    }

    const edgeFunctionUrl = `${CONFIG.SUPABASE_URL}/functions/v1/bunny-upload`;

    const response = await fetch(edgeFunctionUrl, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ path })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Delete failed: ${response.status}`);
    }
}

// ============================================
// Image Upload with Compression
// ============================================

/**
 * Upload an image to Bunny CDN with compression
 * @param {File} file - Image file
 * @param {string} folder - Storage folder
 * @param {Object} options - Upload options
 * @returns {Promise<{url: string, path: string}>}
 */
async function uploadImage(file, folder, options = {}) {
    const {
        compress = true,
        maxWidth = UPLOAD_CONFIG.maxImageDimension,
        quality = UPLOAD_CONFIG.imageQuality,
        onProgress = null
    } = options;

    // Validate file
    if (!isAllowedImage(file)) {
        throw new Error('Invalid file type. Allowed: JPG, PNG, WebP, GIF, HEIC');
    }
    if (file.size > UPLOAD_CONFIG.maxImageSize) {
        throw new Error('File too large. Maximum size is 5MB');
    }

    // Compress if needed
    let processedFile = file;
    if (compress && file.type !== 'image/gif') {
        processedFile = await compressImage(file, maxWidth, quality);
    }

    // Upload to Bunny CDN
    return await uploadToBunny(processedFile, folder, null, onProgress);
}

/**
 * Upload a video to Bunny CDN
 * @param {File} file - Video file
 * @param {string} folder - Storage folder
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<{url: string, path: string}>}
 */
async function uploadVideo(file, folder, onProgress = null) {
    // Validate file
    if (!isAllowedVideo(file)) {
        throw new Error('Invalid file type. Allowed: MP4, WebM, MOV');
    }
    if (file.size > UPLOAD_CONFIG.maxVideoSize) {
        throw new Error('Video too large. Maximum size is 350MB');
    }

    // Upload directly to Bunny
    return await uploadToBunny(file, folder, null, onProgress);
}

// ============================================
// Image Processing
// ============================================

/**
 * Compress an image
 * @param {File|Blob} file - Image file
 * @param {number} maxWidth - Maximum width
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<Blob>}
 */
function compressImage(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > maxWidth) {
                    height = Math.round(height * maxWidth / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Compression failed'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Get file extension from a File or Blob
 */
function getFileExtension(file) {
    if (file.name) {
        const parts = file.name.split('.');
        if (parts.length > 1) {
            return parts.pop().toLowerCase();
        }
    }
    // Fallback based on MIME type
    const mimeToExt = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/heic': 'heic',
        'image/heif': 'heif',
        'video/mp4': 'mp4',
        'video/webm': 'webm',
        'video/quicktime': 'mov'
    };
    return mimeToExt[file.type] || 'bin';
}

/**
 * Convert data URL to Blob
 */
function dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const base64 = atob(parts[1]);
    const array = new Uint8Array(base64.length);

    for (let i = 0; i < base64.length; i++) {
        array[i] = base64.charCodeAt(i);
    }

    return new Blob([array], { type: mime });
}

// ============================================
// Puppy Photo/Video Management
// ============================================

/**
 * Upload puppy photos with Bunny CDN integration
 * Updates the photo grid and returns uploaded URLs
 * @param {string} puppyId - Puppy ID for folder organization
 * @param {FileList|File[]} files - Files to upload
 * @param {HTMLElement} grid - Photo preview grid element
 * @returns {Promise<string[]>} - Array of uploaded URLs
 */
async function uploadPuppyPhotos(puppyId, files, grid) {
    console.log('uploadPuppyPhotos called:', { puppyId, fileCount: files?.length, grid });

    const folder = `puppies/${puppyId || 'new'}`;
    const uploadedUrls = [];

    for (const file of Array.from(files)) {
        console.log('Processing file:', file.name, file.type, file.size);

        // Validate
        if (!isAllowedImage(file)) {
            console.log('Invalid file type:', file.type, 'Allowed:', UPLOAD_CONFIG.allowedImageTypes);
            showToast(`${file.name} is not a supported format`, 'error');
            continue;
        }
        if (file.size > UPLOAD_CONFIG.maxImageSize) {
            console.log('File too large:', file.size, 'Max:', UPLOAD_CONFIG.maxImageSize);
            showToast(`${file.name} is too large (max 5MB)`, 'error');
            continue;
        }

        // Create loading placeholder
        const loadingItem = document.createElement('div');
        loadingItem.className = 'photo-preview-item loading';
        loadingItem.innerHTML = '<div class="upload-spinner"></div><span class="upload-percent">0%</span>';
        grid.appendChild(loadingItem);
        console.log('Loading placeholder added to grid');

        try {
            console.log('Starting upload to folder:', folder);
            // Upload to Bunny CDN
            const result = await uploadImage(file, folder, {
                onProgress: (percent) => {
                    const percentEl = loadingItem.querySelector('.upload-percent');
                    if (percentEl) percentEl.textContent = `${percent}%`;
                }
            });

            console.log('Upload successful:', result);

            // Replace loading with actual preview
            loadingItem.className = 'photo-preview-item';
            loadingItem.dataset.url = result.url;
            loadingItem.dataset.path = result.path;
            loadingItem.innerHTML = `
                <img src="${result.url}" alt="Puppy photo">
                <button type="button" class="photo-remove-btn" onclick="removePuppyPhoto(this)" title="Remove photo">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
                <button type="button" class="photo-primary-btn" onclick="setPrimaryPhoto(this)" title="Set as primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                </button>
            `;

            uploadedUrls.push(result.url);
            updatePrimaryPhotoStatus(grid);
            showToast('Photo uploaded', 'success');

        } catch (error) {
            loadingItem.remove();
            console.error('Upload error:', error);
            showToast(`Upload failed: ${error.message}`, 'error');
        }
    }

    console.log('All uploads complete. URLs:', uploadedUrls);
    return uploadedUrls;
}

/**
 * Upload puppy video
 * @param {string} puppyId - Puppy ID
 * @param {File} file - Video file
 * @param {HTMLElement} container - Video container element
 * @returns {Promise<string>} - Uploaded video URL
 */
async function uploadPuppyVideo(puppyId, file, container) {
    const folder = `puppies/${puppyId || 'new'}/videos`;

    // Show progress UI
    container.innerHTML = `
        <div class="video-upload-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <p class="progress-text">Uploading... 0%</p>
        </div>
    `;

    const progressFill = container.querySelector('.progress-fill');
    const progressText = container.querySelector('.progress-text');

    try {
        const result = await uploadVideo(file, folder, (percent) => {
            progressFill.style.width = percent + '%';
            progressText.textContent = `Uploading... ${percent}%`;
        });

        // Show success state with video preview
        container.innerHTML = `
            <div class="video-preview">
                <video src="${result.url}" controls style="max-width: 100%; border-radius: 8px;"></video>
                <input type="hidden" class="video-url-input" value="${result.url}">
                <input type="hidden" class="video-path-input" value="${result.path}">
                <div style="margin-top: 12px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; background: rgba(186, 155, 121, 0.1); padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(186, 155, 121, 0.3);">
                        <input type="checkbox" class="video-featured-checkbox" onchange="updateVideoFeatured(this)" style="accent-color: rgb(186, 155, 121);">
                        <span style="font-size: 0.875rem; color: #d1d5db;">Feature video as main display</span>
                    </label>
                    <button type="button" class="btn btn-small btn-outline" onclick="removePuppyVideo(this)">
                        Remove
                    </button>
                </div>
            </div>
        `;

        showToast('Video uploaded', 'success');
        return result.url;

    } catch (error) {
        container.innerHTML = `
            <p style="color: var(--danger-color);">Upload failed: ${error.message}</p>
            <button type="button" class="btn btn-small btn-outline" onclick="resetVideoUpload(this.parentElement)">
                Try Again
            </button>
        `;
        showToast(`Video upload failed: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * Remove a puppy photo from the grid
 */
function removePuppyPhoto(btn) {
    const item = btn.closest('.photo-preview-item');
    const grid = item.parentElement;

    // Optionally delete from Bunny (commented out to keep files for history)
    // const path = item.dataset.path;
    // if (path) deleteFromBunny(path).catch(console.error);

    item.remove();
    updatePrimaryPhotoStatus(grid);
    showToast('Photo removed', 'success');
}

/**
 * Set a photo as the primary (first) photo
 */
function setPrimaryPhoto(btn) {
    const item = btn.closest('.photo-preview-item');
    const grid = item.parentElement;

    // Move to beginning
    grid.insertBefore(item, grid.firstChild);
    updatePrimaryPhotoStatus(grid);
    showToast('Primary photo updated', 'success');
}

/**
 * Update primary status indicators on all photos
 */
function updatePrimaryPhotoStatus(grid) {
    if (!grid) return;

    const items = grid.querySelectorAll('.photo-preview-item:not(.loading)');
    items.forEach((item, index) => {
        if (index === 0) {
            item.classList.add('is-primary');
        } else {
            item.classList.remove('is-primary');
        }
    });
}

/**
 * Remove puppy video
 */
function removePuppyVideo(btn) {
    const container = btn.closest('.video-preview').parentElement;
    resetVideoUpload(container);
    showToast('Video removed', 'success');
}

/**
 * Reset video upload container to initial state
 */
function resetVideoUpload(container) {
    container.innerHTML = `
        <label class="video-drop-zone">
            <input type="file" accept="video/*" onchange="handlePuppyVideoSelect(this)" style="display: none;">
            <svg class="drop-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <p class="drop-text">Tap to upload video</p>
            <p class="drop-hint">MP4, WebM, or MOV (max 350MB)</p>
        </label>
    `;
}

/**
 * Handle video file selection
 */
function handlePuppyVideoSelect(input) {
    const file = input.files[0];
    if (!file) return;

    const container = input.closest('.video-drop-zone').parentElement;
    const puppyId = document.getElementById('puppyId')?.value || 'new';

    uploadPuppyVideo(puppyId, file, container);
}

/**
 * Update video featured status
 */
function updateVideoFeatured(checkbox) {
    // Store the preference - will be saved when puppy is saved
    window.puppyVideoFeatured = checkbox.checked;
}

/**
 * Get all photo URLs from the puppy photo grid
 * @returns {string[]} Array of photo URLs
 */
function getPuppyPhotoUrls() {
    const grid = document.getElementById('puppyPhotoPreviewGrid');
    if (!grid) return [];

    const items = grid.querySelectorAll('.photo-preview-item:not(.loading)');
    return Array.from(items).map(item => item.dataset.url).filter(Boolean);
}

/**
 * Get the puppy video URL
 * @returns {string|null}
 */
function getPuppyVideoUrl() {
    const input = document.querySelector('.video-url-input');
    return input ? input.value : null;
}

/**
 * Check if video should be featured
 * @returns {boolean}
 */
function isPuppyVideoFeatured() {
    const checkbox = document.querySelector('.video-featured-checkbox');
    return checkbox ? checkbox.checked : false;
}

// ============================================
// Export functions for global use
// ============================================

window.isAllowedImage = isAllowedImage;
window.isAllowedVideo = isAllowedVideo;
window.uploadToBunny = uploadToBunny;
window.deleteFromBunny = deleteFromBunny;
window.uploadImage = uploadImage;
window.uploadVideo = uploadVideo;
window.compressImage = compressImage;
window.dataUrlToBlob = dataUrlToBlob;

// Puppy-specific functions
window.uploadPuppyPhotos = uploadPuppyPhotos;
window.uploadPuppyVideo = uploadPuppyVideo;
window.removePuppyPhoto = removePuppyPhoto;
window.removePuppyVideo = removePuppyVideo;
window.setPrimaryPhoto = setPrimaryPhoto;
window.updatePrimaryPhotoStatus = updatePrimaryPhotoStatus;
window.resetVideoUpload = resetVideoUpload;
window.handlePuppyVideoSelect = handlePuppyVideoSelect;
window.updateVideoFeatured = updateVideoFeatured;
window.getPuppyPhotoUrls = getPuppyPhotoUrls;
window.getPuppyVideoUrl = getPuppyVideoUrl;
window.isPuppyVideoFeatured = isPuppyVideoFeatured;

window.UPLOAD_CONFIG = UPLOAD_CONFIG;
