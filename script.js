// View toggle functionality - Based on main branch FLIP animation
const gallery = document.getElementById('gallery');
const galleryContainer = gallery.closest('.gallery-container');
const btnGrid = document.getElementById('btn-grid');
const btnList = document.getElementById('btn-list');
const btnFeed = document.getElementById('btn-feed');

// Load saved view preference or default to grid
const savedView = localStorage.getItem('galleryView') || 'grid';
setView(savedView, true);

/**
 * Update Grid mode captions with P:001 format
 * Called on init and when switching to Grid mode
 */
function updateGridCaptions() {
  const items = Array.from(gallery.querySelectorAll('.item'));
  items.forEach((item, index) => {
    const captionEl = item.querySelector('.photo-caption');
    
    if (!captionEl) return;
    
    // P:001 format (1-based index with leading zeros)
    const indexStr = String(index + 1).padStart(3, '0');
    
    // Update caption content
    captionEl.innerHTML = `<span class="caption-index">P:${indexStr}</span>`;
  });
}

function setView(view, isInitial = false) {
  if (isInitial) {
    // No animation on initial load
    if (view === 'grid') {
      gallery.classList.remove('list', 'feed', 'mode-list', 'mode-feed');
      gallery.classList.add('grid', 'mode-grid');
      btnGrid.classList.add('active');
      btnList.classList.remove('active');
      btnFeed.classList.remove('active');
      // Update Grid captions
      updateGridCaptions();
    } else if (view === 'list') {
      gallery.classList.remove('grid', 'feed', 'mode-grid', 'mode-feed');
      gallery.classList.add('list', 'mode-list');
      btnList.classList.add('active');
      btnGrid.classList.remove('active');
      btnFeed.classList.remove('active');
    } else if (view === 'feed') {
      gallery.classList.remove('grid', 'list', 'mode-grid', 'mode-list');
      gallery.classList.add('feed', 'mode-feed');
      btnFeed.classList.add('active');
      btnGrid.classList.remove('active');
      btnList.classList.remove('active');
    }
    
    // Update container class for feed mode
    if (galleryContainer) {
      if (view === 'feed') {
        galleryContainer.classList.add('feed-mode');
      } else {
        galleryContainer.classList.remove('feed-mode');
      }
    }
    
    localStorage.setItem('galleryView', view);
    return;
  }
  
  // FLIP Animation (First-Last-Invert-Play) - Exact implementation from main branch
  const items = Array.from(gallery.querySelectorAll('.item'));
  const currentScrollY = window.scrollY;
  
  // Prevent user from clicking again during animation
  btnGrid.disabled = true;
  btnList.disabled = true;
  btnFeed.disabled = true;
  
  // Step 1: First - Record initial positions (of images for more accurate tracking)
  const firstRects = items.map(item => {
    const img = item.querySelector('img');
    return img ? img.getBoundingClientRect() : item.getBoundingClientRect();
  });
  
  // Step 2: Last - Switch layout and get new positions
  // Unconditionally remove all mode classes, then add target class
  gallery.classList.remove('grid', 'list', 'feed', 'mode-grid', 'mode-list', 'mode-feed');
  
  if (view === 'grid') {
    gallery.classList.add('grid', 'mode-grid');
    btnGrid.classList.add('active');
    btnList.classList.remove('active');
    btnFeed.classList.remove('active');
    // Update Grid captions after class change
    updateGridCaptions();
  } else if (view === 'list') {
    gallery.classList.add('list', 'mode-list');
    btnList.classList.add('active');
    btnGrid.classList.remove('active');
    btnFeed.classList.remove('active');
  } else if (view === 'feed') {
    gallery.classList.add('feed', 'mode-feed');
    btnFeed.classList.add('active');
    btnGrid.classList.remove('active');
    btnList.classList.remove('active');
  }
  
  // Update container class for feed mode
  if (galleryContainer) {
    if (view === 'feed') {
      galleryContainer.classList.add('feed-mode');
    } else {
      galleryContainer.classList.remove('feed-mode');
    }
  }
  
  // Force layout calculation
  gallery.offsetHeight;
  
  const lastRects = items.map(item => {
    const img = item.querySelector('img');
    return img ? img.getBoundingClientRect() : item.getBoundingClientRect();
  });
  
  // Step 3: Invert - Calculate deltas and apply transforms
  items.forEach((item, index) => {
    const first = firstRects[index];
    const last = lastRects[index];
    if (!first || !last) return;
    
    const deltaX = first.left - last.left;
    const deltaY = first.top - last.top;
    const deltaW = first.width / last.width;
    const deltaH = first.height / last.height;
    
    // Apply inverted transform (no transition yet)
    item.style.transition = 'none';
    item.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
    item.style.transformOrigin = 'top left';
    
    // Handle figcaption fade
    const figcaption = item.querySelector('figcaption');
    if (figcaption) {
      figcaption.style.transition = 'none';
      if (view === 'list') {
        figcaption.style.opacity = '0';
      }
    }
  });
  
  // Force reflow
  gallery.offsetHeight;
  
  // Restore scroll position to prevent jump
  window.scrollTo(0, currentScrollY);
  
  // Step 4: Play - Animate to final position
  requestAnimationFrame(() => {
    items.forEach((item, index) => {
      const delay = index * 30; // Stagger delay: 30ms per item
      item.style.transition = `transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`;
      item.style.transform = 'none';
      
      // Fade in/out figcaption
      const figcaption = item.querySelector('figcaption');
      if (figcaption) {
        figcaption.style.transition = `opacity 0.3s ease ${delay + 100}ms`;
        if (view === 'list') {
          figcaption.style.opacity = '1';
        }
      }
    });
    
    // Cleanup after animation completes
    const maxDelay = (items.length - 1) * 30;
    setTimeout(() => {
      items.forEach(item => {
        item.style.transition = '';
        item.style.transform = '';
        item.style.transformOrigin = '';
        const figcaption = item.querySelector('figcaption');
        if (figcaption) {
          figcaption.style.transition = '';
          figcaption.style.opacity = '';
        }
      });
      
      // Re-enable buttons
      btnGrid.disabled = false;
      btnList.disabled = false;
      btnFeed.disabled = false;
    }, 500 + maxDelay + 100);
  });
  
  localStorage.setItem('galleryView', view);
}

btnGrid.addEventListener('click', () => setView('grid'));
btnList.addEventListener('click', () => setView('list'));
btnFeed.addEventListener('click', () => setView('feed'));

// ============================================
// Skeleton Loading with Sequential Reveal
// ============================================
const items = Array.from(gallery.querySelectorAll('.item'));
const images = Array.from(gallery.querySelectorAll('img'));

// Configuration
const CONCURRENT_LOAD_LIMIT = 4; // Pool size for concurrent loading
const FIRST_VIEWPORT_COUNT = 3; // High priority images above fold
const INTERSECTION_THRESHOLD = 0.1; // Start loading when 10% visible

// State
let loadingQueue = [];
let activeLoads = 0;
let loadedCount = 0;
let firstViewportLoaded = false;
let intersectionObserver = null;

/**
 * Check if prefers-reduced-motion is enabled
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Extract dominant color from image and convert to grayscale
 * Returns a grayscale color based on the image's dominant color
 */
function getImageGrayscaleColor(imageElement) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Use small size for performance (20x20 is enough for color analysis)
    canvas.width = 20;
    canvas.height = 20;
    
    ctx.drawImage(imageElement, 0, 0, 20, 20);
    
    // Sample pixels (every 4th pixel for performance)
    const imageData = ctx.getImageData(0, 0, 20, 20);
    const data = imageData.data;
    
    let r = 0, g = 0, b = 0;
    let count = 0;
    
    // Sample pixels
    for (let i = 0; i < data.length; i += 16) { // Every 4th pixel (RGBA = 4 bytes)
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
    
    // Calculate average
    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);
    
    // Convert to grayscale using luminance formula
    const gray = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
    
    // Return as RGB color string
    return `rgb(${gray}, ${gray}, ${gray})`;
  } catch (error) {
    // Fallback to default skeleton color
    return null;
  }
}

/**
 * Update skeleton size to match image (only cover image area, not caption)
 */
function updateSkeletonSize(item, img) {
  const skeleton = item.querySelector('.skeleton');
  if (!skeleton) return;
  
  // Check if we're in List mode
  const isListMode = item.closest('.gallery')?.classList.contains('list') || 
                     item.closest('.gallery')?.classList.contains('mode-list');
  
  // Use ResizeObserver or load event to match image height
  const updateSize = () => {
    // Get image's rendered height
    const imgRect = img.getBoundingClientRect();
    if (imgRect.height > 0) {
      skeleton.style.height = `${imgRect.height}px`;
      
      // In List mode, also set width to match image
      if (isListMode) {
        const imgWidth = imgRect.width || img.offsetWidth;
        if (imgWidth > 0) {
          skeleton.style.width = `${imgWidth}px`;
        }
      }
    } else if (img.naturalHeight > 0 && img.offsetWidth > 0) {
      // Fallback: calculate height based on natural dimensions and current width
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      const currentWidth = img.offsetWidth || imgRect.width;
      if (currentWidth > 0) {
        skeleton.style.height = `${currentWidth * aspectRatio}px`;
        
        // In List mode, also set width
        if (isListMode) {
          skeleton.style.width = `${currentWidth}px`;
        }
      }
    }
  };
  
  // Try immediately if image is already loaded
  if (img.complete && img.naturalHeight !== 0) {
    // Wait for next frame to ensure layout is calculated
    requestAnimationFrame(updateSize);
  } else {
    // Wait for image to load
    img.addEventListener('load', () => {
      requestAnimationFrame(updateSize);
    }, { once: true });
  }
  
  // Also use ResizeObserver for dynamic updates
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(img);
    
    // Clean up when image is loaded and skeleton is hidden
    const cleanup = () => {
      setTimeout(() => resizeObserver.disconnect(), 100);
    };
    img.addEventListener('load', cleanup, { once: true });
  }
}

/**
 * Update skeleton color based on image's grayscale
 */
function updateSkeletonColor(item, img) {
  const skeleton = item.querySelector('.skeleton');
  if (!skeleton) return;
  
  // Create a temporary image to analyze
  const tempImg = new Image();
  
  // Try with crossOrigin for CORS, but fallback if it fails
  tempImg.crossOrigin = 'anonymous';
  
  tempImg.onload = () => {
    try {
      const grayscaleColor = getImageGrayscaleColor(tempImg);
      if (grayscaleColor) {
        skeleton.style.background = grayscaleColor;
      }
    } catch (error) {
      // CORS or canvas error - keep default color
      console.debug('Could not analyze image color:', error.message);
    }
  };
  
  tempImg.onerror = () => {
    // If CORS fails, try without crossOrigin (for same-origin images)
    if (tempImg.crossOrigin === 'anonymous') {
      const retryImg = new Image();
      retryImg.onload = () => {
        try {
          const grayscaleColor = getImageGrayscaleColor(retryImg);
          if (grayscaleColor) {
            skeleton.style.background = grayscaleColor;
          }
        } catch (error) {
          // Keep default color
        }
      };
      retryImg.src = img.getAttribute('src');
    }
  };
  
  // Start loading the image for color analysis
  tempImg.src = img.getAttribute('src');
}

/**
 * Load a single image with error handling
 */
async function loadImage(item, img, index) {
  return new Promise((resolve, reject) => {
    // Set fetchpriority for first viewport images
    if (index < FIRST_VIEWPORT_COUNT) {
      img.fetchPriority = 'high';
    }
    
    // Update skeleton color and size based on image (before loading)
    updateSkeletonColor(item, img);
    updateSkeletonSize(item, img);
    
    // Set src to trigger loading
    const originalSrc = img.getAttribute('src');
    if (!originalSrc) {
      reject(new Error('No src attribute'));
      return;
    }
    
    // Handle already loaded images
    if (img.complete && img.naturalHeight !== 0) {
      resolve();
      return;
    }
    
    // Create new Image object for decoding
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      // Decode image if supported
      if (imageLoader.decode) {
        imageLoader.decode().then(() => {
          resolve();
        }).catch(() => {
          // Decode failed but image loaded, still resolve
          resolve();
        });
      } else {
        resolve();
      }
    };
    
    imageLoader.onerror = () => {
      reject(new Error('Image load failed'));
    };
    
    imageLoader.src = originalSrc;
  });
}

/**
 * Reveal image after loading
 */
function revealImage(item, img) {
  // Add loaded class to image first
  img.classList.add('loaded');
  
  // Mark card as loaded (this triggers caption display and skeleton hiding)
  // item already has both 'item' and 'photo-card' classes
  item.classList.add('loaded');
  
  // Hide skeleton completely
  const skeleton = item.querySelector('.skeleton');
  if (skeleton) {
    skeleton.style.opacity = '0';
    skeleton.style.visibility = 'hidden';
    skeleton.style.zIndex = '-1';
  }
  
  loadedCount++;
  
  // Remove aria-busy after first viewport is loaded
  if (!firstViewportLoaded && loadedCount >= FIRST_VIEWPORT_COUNT) {
    firstViewportLoaded = true;
    gallery.removeAttribute('aria-busy');
  }
}

/**
 * Handle image load error with retry
 */
function handleImageError(item, img, index) {
  const skeleton = item.querySelector('.skeleton');
  if (skeleton) {
    skeleton.style.background = '#f0f0f0';
    skeleton.style.backgroundImage = 'none';
  }
  
  // Log error for diagnosis
  console.warn(`Image ${index + 1} failed to load:`, img.src);
  
  // Still reveal to avoid blocking UI
  revealImage(item, img);
}

/**
 * Process next item in queue
 */
async function processQueue() {
  if (activeLoads >= CONCURRENT_LOAD_LIMIT || loadingQueue.length === 0) {
    return;
  }
  
  const { item, img, index } = loadingQueue.shift();
  activeLoads++;
  
  try {
    await loadImage(item, img, index);
    revealImage(item, img);
  } catch (error) {
    handleImageError(item, img, index);
  } finally {
    activeLoads--;
    // Process next item
    processQueue();
  }
}

/**
 * Initialize IntersectionObserver for lazy loading
 */
function initImageLoader() {
  // Set aria-busy initially
  gallery.setAttribute('aria-busy', 'true');
  
  // Create observer
  intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const item = entry.target.closest('.item');
        const img = item.querySelector('img');
        const index = items.indexOf(item);
        
        if (img && !img.classList.contains('loaded')) {
          // Add to queue
          loadingQueue.push({ item, img, index });
          
          // Unobserve to reduce overhead
          intersectionObserver.unobserve(entry.target);
          
          // Process queue
          processQueue();
        }
      }
    });
  }, {
    threshold: INTERSECTION_THRESHOLD,
    rootMargin: '50px' // Start loading slightly before viewport
  });
  
  // Observe all items
  items.forEach(item => {
    const img = item.querySelector('img');
    if (img) {
      intersectionObserver.observe(item);
    }
  });
  
  // Load first viewport images immediately
  items.slice(0, FIRST_VIEWPORT_COUNT).forEach((item, index) => {
    const img = item.querySelector('img');
    if (img) {
      loadingQueue.push({ item, img, index });
    }
  });
  
  // Start processing
  processQueue();
}

// Initialize image loader when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initImageLoader);
} else {
  initImageLoader();
}

// ============================================
// Lightbox functionality with centered thumbnail strip
// ============================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.getElementById('close-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const thumbnailsContainer = lightbox.querySelector('.lb-thumbs');

let currentIndex = 0;
let thumbnailButtons = [];
let preloadedImages = {}; // Cache for preloaded images

/**
 * Load thumbnail image with skeleton
 */
async function loadThumbnail(thumbBtn, imgSrc) {
  return new Promise((resolve, reject) => {
    const thumbImg = thumbBtn.querySelector('img');
    if (!thumbImg) {
      reject(new Error('No img element'));
      return;
    }
    
    // Show skeleton
    let skeleton = thumbBtn.querySelector('.skeleton');
    if (!skeleton) {
      skeleton = document.createElement('div');
      skeleton.className = 'skeleton';
      thumbBtn.insertBefore(skeleton, thumbImg);
    }
    
    const imageLoader = new Image();
    imageLoader.onload = () => {
      thumbImg.src = imgSrc;
      thumbImg.classList.add('loaded');
      skeleton.style.opacity = '0';
      resolve();
    };
    imageLoader.onerror = () => {
      skeleton.style.opacity = '0';
      resolve(); // Still resolve to avoid blocking
    };
    imageLoader.src = imgSrc;
  });
}

/**
 * Build thumbnail strip from gallery images
 * Creates clickable thumbnail buttons for each image
 */
function buildThumbnailStrip() {
  // Clear existing thumbnails
  thumbnailsContainer.innerHTML = '';
  thumbnailButtons = [];
  
  images.forEach((img, index) => {
    const thumbBtn = document.createElement('button');
    thumbBtn.className = 'lb-thumb';
    thumbBtn.setAttribute('role', 'tab');
    thumbBtn.setAttribute('aria-selected', 'false');
    thumbBtn.setAttribute('aria-label', `View image ${index + 1} of ${images.length}: ${img.alt || 'Gallery photo'}`);
    thumbBtn.setAttribute('tabindex', index === currentIndex ? '0' : '-1');
    
    // Create skeleton
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton';
    thumbBtn.appendChild(skeleton);
    
    // Create thumbnail image
    const thumbImg = document.createElement('img');
    thumbImg.alt = '';
    thumbImg.loading = 'lazy';
    thumbImg.decoding = 'async';
    
    thumbBtn.appendChild(thumbImg);
    
    // Load thumbnail asynchronously
    loadThumbnail(thumbBtn, img.src).catch(() => {
      // Error handled in loadThumbnail
    });
    
    thumbBtn.addEventListener('click', () => switchToImage(index));
    
    // Keyboard navigation within thumbnail strip
    thumbBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        switchToImage(index);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = (index - 1 + images.length) % images.length;
        thumbnailButtons[prevIndex].focus();
        switchToImage(prevIndex);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (index + 1) % images.length;
        thumbnailButtons[nextIndex].focus();
        switchToImage(nextIndex);
      }
    });
    
    thumbnailsContainer.appendChild(thumbBtn);
    thumbnailButtons.push(thumbBtn);
  });
  
  // Update active state (opacity: 1 for selected, 0.2 for others)
  updateThumbnailStates();
}

/**
 * Preload next and previous images for smoother switching
 * Uses Image() objects to preload without displaying
 */
function preloadAdjacentImages() {
  const prevIndex = (currentIndex - 1 + images.length) % images.length;
  const nextIndex = (currentIndex + 1) % images.length;
  
  [prevIndex, nextIndex].forEach(index => {
    if (!preloadedImages[index]) {
      const img = new Image();
      img.src = images[index].src;
      preloadedImages[index] = img;
    }
  });
}

/**
 * Switch to a specific image with smooth transition
 * Updates main image, thumbnail states (opacity), and scrolls to active thumbnail
 */
function switchToImage(index) {
  if (index === currentIndex) return;
  
  currentIndex = index;
  
  // Soft crossfade transition with slight scale (180-300ms)
  lightboxImg.style.opacity = '0';
  lightboxImg.style.transform = 'scale(0.98)';
  
  // Update image source
  lightboxImg.src = images[currentIndex].src;
  
  // Fade in new image
  requestAnimationFrame(() => {
    lightboxImg.style.transition = 'opacity 250ms ease, transform 250ms ease';
    lightboxImg.style.opacity = '1';
    lightboxImg.style.transform = 'scale(1)';
  });
  
  // Update thumbnail states (opacity: 1 for selected, 0.2 for others)
  updateThumbnailStates();
  
  // Scroll active thumbnail into view (centered)
  if (thumbnailButtons[currentIndex]) {
    thumbnailButtons[currentIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }
  
  // Preload adjacent images for next switch
  preloadAdjacentImages();
}

/**
 * Update thumbnail active states and ARIA attributes
 * Selected thumbnail: opacity 1, aria-selected="true"
 * Non-selected thumbnails: opacity 0.2, aria-selected="false"
 */
function updateThumbnailStates() {
  thumbnailButtons.forEach((btn, index) => {
    const isActive = index === currentIndex;
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.setAttribute('tabindex', isActive ? '0' : '-1');
    // Opacity controlled by CSS based on aria-selected attribute
    // Selected: opacity 1 (via [aria-selected="true"])
    // Non-selected: opacity 0.2 (default)
  });
}

function openLightbox(index) {
  currentIndex = index;
  lightboxImg.src = images[index].src;
  lightboxImg.style.opacity = '1';
  lightboxImg.style.transform = 'scale(1)';
  lightboxImg.style.transition = '';
  lightbox.classList.remove('hidden');
  // Prevent body scroll when lightbox is open
  document.body.style.overflow = 'hidden';
  
  // Build thumbnail strip when opening
  buildThumbnailStrip();
  
  // Preload adjacent images
  preloadAdjacentImages();
}

function closeLightbox() {
  lightbox.classList.add('hidden');
  document.body.style.overflow = '';
  // Reset image transition
  lightboxImg.style.transition = '';
  lightboxImg.style.opacity = '';
  lightboxImg.style.transform = '';
}

function showPrev() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  switchToImage(currentIndex);
}

function showNext() {
  currentIndex = (currentIndex + 1) % images.length;
  switchToImage(currentIndex);
}

// Attach click handlers
images.forEach((img, idx) => img.addEventListener('click', () => openLightbox(idx)));
closeBtn.addEventListener('click', closeLightbox);
prevBtn.addEventListener('click', showPrev);
nextBtn.addEventListener('click', showNext);

// Close on Escape key
window.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('hidden')) {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showPrev();
    } else if (e.key === 'ArrowRight') {
      showNext();
    }
  }
});

// Touch swipe support
let touchStartX = 0;
let touchStartY = 0;
lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].pageX;
  touchStartY = e.changedTouches[0].pageY;
});
lightbox.addEventListener('touchend', (e) => {
  const diffX = e.changedTouches[0].pageX - touchStartX;
  const diffY = e.changedTouches[0].pageY - touchStartY;
  // Only trigger swipe if horizontal movement is greater than vertical (avoid conflict with scrolling)
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
    diffX > 0 ? showPrev() : showNext();
  }
});
