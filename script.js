// ============================================
// Theme Toggle - Dark Mode Support
// ============================================
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Load saved theme preference or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);

// Theme toggle handler
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

// ============================================
// Global Audio Management
// ============================================
let globalAudio = null;

function initGlobalAudio() {
  if (!globalAudio) {
    globalAudio = new Audio('assets/Audio/A3 - Late afternoon drifting.mp3');
    globalAudio.loop = true;
    globalAudio.volume = 0;
    globalAudio.preload = 'auto';
  }
  return globalAudio;
}

function fadeInAudio(duration = 5000, targetVolume = 0.6) {
  const audio = initGlobalAudio();
  if (audio.paused) {
    audio.play().catch(err => {
      console.warn('Audio play failed:', err);
    });
  }
  
  const startVolume = audio.volume;
  const volumeDiff = targetVolume - startVolume;
  const steps = 50; // 50 steps for smooth fade
  const volumeStep = volumeDiff / steps;
  const stepDuration = duration / steps; // ~100ms per step for 5 seconds
  let currentStep = 0;
  
  const fadeInterval = setInterval(() => {
    currentStep++;
    const newVolume = Math.min(startVolume + volumeStep * currentStep, targetVolume);
    audio.volume = newVolume;
    
    if (currentStep >= steps || audio.volume >= targetVolume) {
      audio.volume = targetVolume;
      clearInterval(fadeInterval);
    }
  }, stepDuration);
}

// ============================================
// Intro Page - Entry page with text animation
// ============================================
const introPage = document.getElementById('intro-page');
const enterBtn = document.getElementById('enter-btn');
const rippleOverlay = document.getElementById('ripple-overlay');
const introParagraphs = document.querySelectorAll('.intro-paragraph');

// Check if intro page should be shown
// For development: add ?skipIntro=true to URL to skip intro page
const urlParams = new URLSearchParams(window.location.search);
const skipIntro = urlParams.get('skipIntro') === 'true';

if (!skipIntro) {
  // Show intro page (always show unless skipIntro=true)
  document.body.classList.add('intro-visible');
  
  // 淡入动画：逐段显示文字，最后显示按钮（丝滑缓动效果）
  function animateFadeIn() {
    const paragraphs = document.querySelectorAll('.fade-in');
    const button = document.querySelector('.fade-in-button');
    
    // 逐段显示文字（每段间隔 1s，使用缓动函数）
    paragraphs.forEach((p, i) => {
      setTimeout(() => {
        // 确保元素可见后再添加动画类
        p.style.transition = 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
        p.classList.add('show');
      }, i * 1000);
    });
    
    // 最后显示按钮（在所有段落显示完成后，延迟 0.5s）
    setTimeout(() => {
      if (button) {
        button.style.transition = 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 1s cubic-bezier(0.4, 0, 0.2, 1), all 0.3s ease';
        button.classList.add('show');
      }
    }, paragraphs.length * 1000 + 500);
  }
  
  // 页面加载完成后开始动画
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateFadeIn);
  } else {
    // DOM 已加载，直接开始动画
    setTimeout(animateFadeIn, 100);
  }
  
  // Handle Enter button click
  enterBtn.addEventListener('click', (e) => {
    // Get button position for circle origin
    const buttonRect = enterBtn.getBoundingClientRect();
    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;
    
    // Calculate maximum radius to cover entire screen
    const maxRadius = Math.sqrt(
      Math.pow(Math.max(centerX, window.innerWidth - centerX), 2) +
      Math.pow(Math.max(centerY, window.innerHeight - centerY), 2)
    );
    
    // Set circle origin point and radius
    rippleOverlay.style.setProperty('--circle-x', `${centerX}px`);
    rippleOverlay.style.setProperty('--circle-y', `${centerY}px`);
    rippleOverlay.style.setProperty('--circle-r', `${maxRadius}px`);
    
    // Play audio with fade in (5 seconds, target volume 0.6)
    fadeInAudio(5000, 0.6);
    
    // Trigger circle reveal animation
    rippleOverlay.classList.add('active', 'circle-animate');
    
    // Hide intro page after animation completes (900ms)
    setTimeout(() => {
      introPage.classList.add('hidden');
      document.body.classList.remove('intro-visible');
      
      // Clean up animation classes
      rippleOverlay.classList.remove('active', 'circle-animate');
      
      // Gallery page will fade in via CSS transition
    }, 900); // Match animation duration
  });
  
  // Also handle Enter key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !introPage.classList.contains('hidden') && enterBtn.classList.contains('show')) {
      enterBtn.click();
    }
  });
}

// View toggle functionality - Based on main branch FLIP animation
const gallery = document.getElementById('gallery');
const galleryContainer = gallery.closest('.gallery-container');
const btnGrid = document.getElementById('btn-grid');
const btnList = document.getElementById('btn-list');
const btnFeed = document.getElementById('btn-feed'); // May be null if not in HTML

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
    if (view === 'grid') {
      gallery.classList.remove('list', 'feed', 'mode-list', 'mode-feed');
      gallery.classList.add('grid', 'mode-grid');
      btnGrid.classList.add('active');
      btnList.classList.remove('active');
      if (btnFeed) btnFeed.classList.remove('active');
      updateGridCaptions();
    } else if (view === 'list') {
      gallery.classList.remove('grid', 'feed', 'mode-grid', 'mode-feed');
      gallery.classList.add('list', 'mode-list');
      btnList.classList.add('active');
      btnGrid.classList.remove('active');
      if (btnFeed) btnFeed.classList.remove('active');
    } else if (view === 'feed') {
      gallery.classList.remove('grid', 'list', 'mode-grid', 'mode-list');
      gallery.classList.add('feed', 'mode-feed');
      if (btnFeed) btnFeed.classList.add('active');
      btnGrid.classList.remove('active');
      btnList.classList.remove('active');
    }

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

  const items = Array.from(gallery.querySelectorAll('.item'));
  const currentScrollY = window.scrollY;

  btnGrid.disabled = true;
  btnList.disabled = true;
  if (btnFeed) btnFeed.disabled = true;

  // 检测是否是 Feed → Grid 切换，预先优化性能
  const isFeedToGrid = (gallery.classList.contains('feed') || gallery.classList.contains('mode-feed')) && view === 'grid';
  if (isFeedToGrid) {
    // 预先设置 will-change 优化性能，减少卡顿
    items.forEach(item => {
      item.style.willChange = 'transform';
    });
    // 强制同步布局计算，避免后续卡顿
    gallery.offsetHeight;
  }

  const firstRects = items.map(item => {
    const img = item.querySelector('img');
    return img ? img.getBoundingClientRect() : item.getBoundingClientRect();
  });

  const currentMode =
    gallery.classList.contains('grid') || gallery.classList.contains('mode-grid')
      ? 'grid'
      : gallery.classList.contains('feed') || gallery.classList.contains('mode-feed')
      ? 'feed'
      : 'list';

  gallery.classList.remove('grid', 'list', 'feed', 'mode-grid', 'mode-list', 'mode-feed');

  if (view === 'grid') {
    gallery.classList.add('grid', 'mode-grid');
    btnGrid.classList.add('active');
    btnList.classList.remove('active');
    if (btnFeed) btnFeed.classList.remove('active');
    updateGridCaptions();
  } else if (view === 'list') {
    gallery.classList.add('list', 'mode-list');
    btnList.classList.add('active');
    btnGrid.classList.remove('active');
    if (btnFeed) btnFeed.classList.remove('active');
  } else if (view === 'feed') {
    gallery.classList.add('feed', 'mode-feed');
    if (btnFeed) btnFeed.classList.add('active');
    btnGrid.classList.remove('active');
    btnList.classList.remove('active');
  }

  if (galleryContainer) {
    if (view === 'feed') {
      galleryContainer.classList.add('feed-mode');
    } else {
      galleryContainer.classList.remove('feed-mode');
    }
  }

  // 强制布局计算，确保新布局已完全应用
  gallery.offsetHeight;
  
  // 对于 List → Feed 切换，需要额外等待一帧确保布局完全计算
  const isListToFeed = currentMode === 'list' && view === 'feed';
  
  if (isListToFeed) {
    // 强制同步布局计算
    gallery.offsetHeight;
    // 等待下一帧，确保 Feed 模式布局完全应用
    requestAnimationFrame(() => {
      // 再次强制布局计算
      gallery.offsetHeight;
      
      const lastRects = items.map(item => {
        const img = item.querySelector('img');
        return img ? img.getBoundingClientRect() : item.getBoundingClientRect();
      });
      
      // 继续执行 FLIP 动画逻辑
      continueFlipAnimation(firstRects, lastRects, currentMode, view, items, currentScrollY);
    });
    return; // 提前返回，后续逻辑在 continueFlipAnimation 中执行
  }

  const lastRects = items.map(item => {
    const img = item.querySelector('img');
    return img ? img.getBoundingClientRect() : item.getBoundingClientRect();
  });

  // 继续执行 FLIP 动画逻辑
  continueFlipAnimation(firstRects, lastRects, currentMode, view, items, currentScrollY);
}

// 提取 FLIP 动画逻辑到独立函数，便于 List → Feed 异步调用
function continueFlipAnimation(firstRects, lastRects, currentMode, view, items, currentScrollY) {
  let animationOrder = [];

  // === 动画顺序优化逻辑 ===
  if (currentMode === 'grid' && view === 'feed') {
    // Grid → Feed: 保持Grid模式下的原始顺序，每张图移动到Feed模式下对应的位置
    // 不需要排序，直接使用原始顺序，确保第一张图移动到第一个位置，第二张图移动到第二个位置...
    animationOrder = items.map((item, index) => ({
      originalIndex: index,
      orderIndex: index // 保持原始顺序
    }));
  } else if (currentMode === 'list' && view === 'feed') {
    // List → Feed: 保持List模式下的原始顺序，每张图从左边移动到Feed模式下对应的位置
    // 不需要排序，直接使用原始顺序，确保第一张图移动到第一个位置，第二张图移动到第二个位置...
    animationOrder = items.map((item, index) => ({
      originalIndex: index,
      orderIndex: index // 保持原始顺序
    }));
  } else if (currentMode === 'feed' && view === 'grid') {
    const itemsWithPositions = items.map((item, index) => ({
      item,
      index,
      rect: firstRects[index]
    }));

    itemsWithPositions.sort((a, b) => {
      const rowDiff = b.rect.bottom - a.rect.bottom;
      if (Math.abs(rowDiff) > 10) return rowDiff;
      return b.rect.right - a.rect.right;
    });

    animationOrder = itemsWithPositions.map((item, orderIndex) => ({
      originalIndex: item.index,
      orderIndex
    }));
  } else {
    animationOrder = items.map((item, index) => ({
      originalIndex: index,
      orderIndex: index
    }));
  }

  // Step 4: Invert
  const isListToFeed = currentMode === 'list' && view === 'feed';
  const isGridToFeed = currentMode === 'grid' && view === 'feed';
  
  items.forEach((item, index) => {
    const first = firstRects[index];
    const last = lastRects[index];
    if (!first || !last) return;

    const deltaX = first.left - last.left;
    const deltaY = first.top - last.top;
    const deltaW = first.width / last.width;
    const deltaH = first.height / last.height;

    item.style.transition = 'none';
    
    if (isListToFeed) {
      // List → Feed: 使用图片中心点作为缩放原点，让图片从左侧移动到中间
      const img = item.querySelector('img');
      if (img) {
        // 获取图片在 List 模式下的位置（firstRects 已经是图片位置）
        const imgFirstRect = firstRects[index];
        const imgCenterX = imgFirstRect.left + imgFirstRect.width / 2;
        const imgCenterY = imgFirstRect.top + imgFirstRect.height / 2;
        
        // 获取图片在 Feed 模式下的目标位置
        const imgLastRect = lastRects[index];
        const targetCenterX = imgLastRect.left + imgLastRect.width / 2;
        const targetCenterY = imgLastRect.top + imgLastRect.height / 2;
        
        // 计算中心点偏移
        const centerDeltaX = imgCenterX - targetCenterX;
        const centerDeltaY = imgCenterY - targetCenterY;
        
        item.style.transformOrigin = 'center center';
        item.style.transform = `translate(${centerDeltaX}px, ${centerDeltaY}px) scale(${deltaW}, ${deltaH})`;
      } else {
        item.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
        item.style.transformOrigin = 'center center';
      }
    } else if (isGridToFeed) {
      // Grid → Feed: 使用中心点作为缩放原点，让动画更自然
      item.style.transformOrigin = 'center center';
      item.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
    } else {
      item.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
      item.style.transformOrigin = 'top left';
    }
    
    // Handle figcaption fade
    const figcaption = item.querySelector('figcaption');
    if (figcaption) {
      figcaption.style.transition = 'none';
      if (isListToFeed) {
        // List → Feed: 立即隐藏编号
        figcaption.style.opacity = '0';
      } else if (currentMode === 'list' && view !== 'list') {
        // 从List切换到其他模式：隐藏编号
        figcaption.style.opacity = '0';
      } else if (view === 'list' && currentMode !== 'list') {
        // 切换到List模式：显示编号（在动画中处理）
        figcaption.style.opacity = '0'; // 初始隐藏，动画中显示
      }
    }
  });

  gallery.offsetHeight;

  window.scrollTo(0, currentScrollY);

  // Step 5: Play
  requestAnimationFrame(() => {
    const isGridToFeed = currentMode === 'grid' && view === 'feed';
    const isListToFeed = currentMode === 'list' && view === 'feed';

    items.forEach((item, index) => {
      const orderInfo = animationOrder.find(o => o.originalIndex === index);
      const animationIndex = orderInfo ? orderInfo.orderIndex : index;

      let delay = animationIndex * 30;

      if (isGridToFeed) {
        // Grid → Feed: 优化为更丝滑的动画
        delay = animationIndex * 30; // 减少延迟间隔，让动画更连贯
        item.style.transition = `transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms, opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`;
        item.style.transformOrigin = 'center center';
        // 保持 FLIP 计算好的初始 transform，直接动画到最终状态
        // 不要覆盖 transform，让它从原来的位置开始动画
        item.style.opacity = '0';
        requestAnimationFrame(() => {
          // 动画到最终位置（FLIP 已经计算好了）
          item.style.transform = 'none';
          item.style.opacity = '1';
        });
      } else if (isListToFeed) {
        // List → Feed: 从左侧移动到中间，同时放大，无淡入效果
        delay = animationIndex * 20; // 更快的连续动画
        item.style.transition = `transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`;
        item.style.transformOrigin = 'center center';
        // 直接移动到最终位置（FLIP 已经计算好了）
        item.style.transform = 'none';
        
        // 确保 figcaption 保持隐藏
        const figcaption = item.querySelector('figcaption');
        if (figcaption) {
          figcaption.style.transition = `opacity 0.3s ease ${delay}ms`;
          figcaption.style.opacity = '0';
        }
      } else {
        // 其他切换（包括切换到List）
        item.style.transition = `transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`;
        item.style.transform = 'none';
        
        // 切换到List模式时，显示figcaption
        if (view === 'list') {
          const figcaption = item.querySelector('figcaption');
          if (figcaption) {
            figcaption.style.transition = `opacity 0.3s ease ${delay + 100}ms`;
            figcaption.style.opacity = '1';
          }
        }
      }
    });

    // 根据不同的切换类型计算最大延迟
    let maxDelay;
    if (isGridToFeed) {
      maxDelay = (items.length - 1) * 30; // Grid → Feed 使用 30ms 间隔
    } else if (isListToFeed) {
      maxDelay = (items.length - 1) * 20; // List → Feed 使用 20ms 间隔
    } else {
      maxDelay = (items.length - 1) * 30; // 其他切换使用 30ms 间隔
    }
    
    // 根据动画时长计算清理时间
    const animationDuration = isGridToFeed ? 650 : isListToFeed ? 600 : 500;

    setTimeout(() => {
      items.forEach(item => {
        item.style.transition = '';
        item.style.transform = '';
        item.style.transformOrigin = '';
        item.style.opacity = '';
        item.style.willChange = ''; // 清理 will-change
        const figcaption = item.querySelector('figcaption');
        if (figcaption) {
          figcaption.style.transition = '';
          figcaption.style.opacity = '';
        }
      });

      btnGrid.disabled = false;
      btnList.disabled = false;
      if (btnFeed) btnFeed.disabled = false;
    }, animationDuration + maxDelay + 100);
  });

  localStorage.setItem('galleryView', view);
}

/**
 * Attach click handlers to list mode items using event delegation
 */
function attachListModeHandlers() {
  // Use event delegation on the gallery container
  gallery.addEventListener('click', (e) => {
    // Only handle clicks in list mode
    if (!gallery.classList.contains('list') && !gallery.classList.contains('mode-list')) {
      return;
    }
    
    // Find the clicked item
    const item = e.target.closest('.gallery.list .item, .gallery.mode-list .item');
    if (!item) return;
    
    // Find the image in this item
    const img = item.querySelector('img');
    if (img) {
      const imgIndex = images.indexOf(img);
      if (imgIndex !== -1) {
        // Only trigger if clicking on the item itself, not on nested interactive elements
        if (e.target === item || e.target === img || e.target.closest('figcaption')) {
          openLightbox(imgIndex);
        }
      }
    }
  });
}

btnGrid.addEventListener('click', () => setView('grid'));
btnList.addEventListener('click', () => setView('list'));
if (btnFeed) btnFeed.addEventListener('click', () => setView('feed'));

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
 * Reveal image after loading - 从上到下渐进显示
 */
function revealImage(item, img) {
  // 🔥 从上到下显示动画
  
  // 确保初始状态
  img.style.clipPath = 'inset(0 0 100% 0)';
  img.style.transition = 'none';
  
  // 强制重绘
  item.offsetHeight;
  
  // 添加 loaded 类
  img.classList.add('loaded');
  
  // Mark card as loaded (this triggers caption display and skeleton hiding)
  // item already has both 'item' and 'photo-card' classes
  item.classList.add('loaded');
  
  // 下一帧开始动画
  requestAnimationFrame(() => {
    img.style.transition = 'opacity 300ms ease, filter 300ms ease, clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    img.style.clipPath = 'inset(0 0 0 0)';
  });
  
  // 隐藏 skeleton(同步动画)
  const skeleton = item.querySelector('.skeleton');
  if (skeleton) {
    skeleton.style.transition = 'clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease';
    skeleton.style.clipPath = 'inset(0 0 100% 0)'; // 从下往上隐藏
    skeleton.style.opacity = '0';
    
    // 动画结束后完全隐藏
    setTimeout(() => {
      skeleton.style.visibility = 'hidden';
      skeleton.style.zIndex = '-1';
    }, 800);
  }
  
  loadedCount++;
  
  // Remove aria-busy after first viewport is loaded
  if (!firstViewportLoaded && loadedCount >= FIRST_VIEWPORT_COUNT) {
    firstViewportLoaded = true;
    gallery.removeAttribute('aria-busy');
  }
  
  // 动画结束后清理内联样式
  setTimeout(() => {
    img.style.transition = '';
    img.style.clipPath = '';
  }, 850);
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

// 🔥 新增:创建图片编号显示元素
let captionElement = lightbox.querySelector('.lb-caption');
if (!captionElement) {
  captionElement = document.createElement('div');
  captionElement.className = 'lb-caption';
  captionElement.innerHTML = '<span class="lb-index">P:001</span>';
  
  // 插入到图片后面,缩略图前面
  const lbThumbsWrapper = lightbox.querySelector('.lb-thumbs-wrapper');
  if (lbThumbsWrapper) {
    lightbox.insertBefore(captionElement, lbThumbsWrapper);
  } else if (thumbnailsContainer) {
    lightbox.insertBefore(captionElement, thumbnailsContainer);
  } else {
    lightbox.appendChild(captionElement);
  }
}
const captionIndex = captionElement.querySelector('.lb-index');

let currentIndex = 0;
let thumbnailButtons = [];
let preloadedImages = {}; // Cache for preloaded images
// === 新增:保存打开 lightbox 时点击图片的原始位置 ===
let originalImageRect = null; // 保存点击图片的位置和尺寸
let originalImageIndex = null; // 保存点击时的图片索引

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
    
    // Function to hide skeleton and mark as loaded
    const hideSkeleton = () => {
      if (thumbImg.classList.contains('loaded')) return; // Already processed
      thumbImg.classList.add('loaded');
      // Hide skeleton completely - remove from DOM to avoid overlay issues
      if (skeleton && skeleton.parentNode) {
        skeleton.style.opacity = '0';
        skeleton.style.visibility = 'hidden';
        // Remove skeleton after transition
        setTimeout(() => {
          if (skeleton && skeleton.parentNode) {
            skeleton.remove();
          }
        }, 200);
      }
      resolve();
    };
    
    // Error handler
    const handleError = () => {
      if (thumbImg.classList.contains('loaded')) return; // Already processed
      // Hide skeleton even on error
      if (skeleton && skeleton.parentNode) {
        skeleton.style.opacity = '0';
        skeleton.style.visibility = 'hidden';
        // Remove skeleton after transition
        setTimeout(() => {
          if (skeleton && skeleton.parentNode) {
            skeleton.remove();
          }
        }, 200);
      }
      // Still mark as loaded to show the broken image icon
      thumbImg.classList.add('loaded');
      resolve(); // Still resolve to avoid blocking
    };
    
    // Wait for thumbnail image to actually load
    thumbImg.addEventListener('load', hideSkeleton, { once: true });
    thumbImg.addEventListener('error', handleError, { once: true });
    
    // Set src to trigger loading
    thumbImg.src = imgSrc;
    
    // Check if image is already loaded (cached) AFTER setting src
    // Use requestAnimationFrame to ensure src is set and browser has processed it
    requestAnimationFrame(() => {
      // Double-check after browser processes the src change
      requestAnimationFrame(() => {
        if (thumbImg.complete && thumbImg.naturalHeight !== 0 && !thumbImg.classList.contains('loaded')) {
          // Image was cached and loaded immediately - hide skeleton
          hideSkeleton();
        }
      });
    });
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
    
    thumbBtn.addEventListener('click', () => {
      // 🔥 根据点击的缩略图位置决定滑动方向
      const direction = index > currentIndex ? 'right' : (index < currentIndex ? 'left' : 'none');
      switchToImage(index, direction);
    });
    
    // Keyboard navigation within thumbnail strip
    thumbBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const direction = index > currentIndex ? 'right' : (index < currentIndex ? 'left' : 'none');
        switchToImage(index, direction);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = (index - 1 + images.length) % images.length;
        thumbnailButtons[prevIndex].focus();
        switchToImage(prevIndex, 'left');  // 🔥 添加方向
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (index + 1) % images.length;
        thumbnailButtons[nextIndex].focus();
        switchToImage(nextIndex, 'right');  // 🔥 添加方向
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
function switchToImage(index, direction = 'none') {
  if (index < 0 || index >= images.length) return;
  const newSrc = images[index].src;
  if (index === currentIndex && lightboxImg.src === newSrc && lightboxImg.style.opacity !== '0') {
    return;
  }
  // 保存原始位置
  if (images[index]) {
    const rect = images[index].getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (isInViewport) {
      originalImageRect = {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      };
      originalImageIndex = index;
    } else {
      originalImageRect = null;
      originalImageIndex = null;
    }
  }
  currentIndex = index;
  if (captionIndex) {
    const indexStr = String(index + 1).padStart(3, '0');
    captionIndex.textContent = `P:${indexStr}`;
  }
  // 🔥 优化:先预加载新图片，确保加载完成后再切换，避免闪烁
  const newImage = new Image();
  newImage.onload = () => {
    const currentRect = lightboxImg.getBoundingClientRect();
    if (direction === 'left' || direction === 'right') {
      // 🔥 优化:创建旧图副本用于滑出，添加硬件加速
      const oldImg = document.createElement('img');
      oldImg.src = lightboxImg.src;
      oldImg.style.cssText = `
        position: absolute;
        top: ${currentRect.top}px;
        left: ${currentRect.left}px;
        width: ${currentRect.width}px;
        height: ${currentRect.height}px;
        max-width: calc(100vw - 200px);
        max-height: calc(95vh - var(--thumb-size) - var(--thumb-gap) * 2 - 20px);
        object-fit: contain;
        z-index: 2000;
        pointer-events: none;
        will-change: transform, opacity;
        transform: translateZ(0);
        backface-visibility: hidden;
      `;
      lightbox.appendChild(oldImg);
      
      // 🔥 优化:切换 src，确保新图已加载，避免闪烁
      lightboxImg.src = newSrc;
      lightboxImg.style.transition = 'none';
      lightboxImg.style.opacity = '0';
      lightboxImg.style.position = 'absolute';
      lightboxImg.style.willChange = 'transform, opacity';
      
      requestAnimationFrame(() => {
        const newRect = lightboxImg.getBoundingClientRect();
        const slideDistance = window.innerWidth * 0.3;
        const initialOffset = direction === 'right' ? slideDistance : -slideDistance;
        lightboxImg.style.top = `${newRect.top}px`;
        lightboxImg.style.left = `${newRect.left + initialOffset}px`;
        lightboxImg.style.width = `${newRect.width}px`;
        lightboxImg.style.height = `${newRect.height}px`;
        
        requestAnimationFrame(() => {
          const oldOffset = direction === 'right' ? -slideDistance : slideDistance;
          // 🔥 优化:使用更平滑的缓动函数
          oldImg.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          oldImg.style.transform = `translateX(${oldOffset}px)`;
          oldImg.style.opacity = '0';
          
          lightboxImg.style.transition = 'left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          lightboxImg.style.left = `${newRect.left}px`;
          lightboxImg.style.opacity = '1';
          
          setTimeout(() => {
            oldImg.remove();
            lightboxImg.style.transition = '';
            lightboxImg.style.position = '';
            lightboxImg.style.top = '';
            lightboxImg.style.left = '';
            lightboxImg.style.width = '';
            lightboxImg.style.height = '';
            lightboxImg.style.willChange = '';
          }, 400);
        });
      });
    } else {
      // 🔥 优化:淡入淡出动画，使用更平滑的缓动和缩放
      lightboxImg.style.opacity = '0';
      lightboxImg.style.transform = 'scale(0.96)';
      lightboxImg.style.willChange = 'transform, opacity';
      lightboxImg.src = newSrc;
      
      requestAnimationFrame(() => {
        const newRect = lightboxImg.getBoundingClientRect();
        lightboxImg.style.width = `${newRect.width}px`;
        lightboxImg.style.height = `${newRect.height}px`;
        
        requestAnimationFrame(() => {
          // 🔥 优化:使用更平滑的缓动函数
          lightboxImg.style.transition = 'opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          lightboxImg.style.opacity = '1';
          lightboxImg.style.transform = 'scale(1)';
          
          setTimeout(() => {
            lightboxImg.style.willChange = '';
          }, 300);
        });
      });
    }
  };
  newImage.onerror = () => {
    // 即使加载失败也继续，避免卡住
    lightboxImg.src = newSrc;
  };
  newImage.src = newSrc;
  updateThumbnailStates();
  if (thumbnailButtons?.[currentIndex]) {
    thumbnailButtons[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
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
    // Update active class for CSS styling
    if (isActive) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function openLightbox(index) {
  // 🔥 添加 lightbox-opening 类，触发背景渐隐
  document.body.classList.add('lightbox-opening');
  
  // Check for reduced motion preference
  if (prefersReducedMotion()) {
    // Simplified version: direct display, no animation
    currentIndex = index;
    lightboxImg.src = images[index].src;
    lightboxImg.style.opacity = '1';
    lightboxImg.style.transform = 'scale(1)';
    lightboxImg.style.transition = '';
    lightbox.classList.remove('hidden');
    // 🔥 移除 overflow 内联样式（已由 CSS body.lightbox-opening 控制）
    // document.body.style.overflow = 'hidden'; // 已由 CSS 类控制
    buildThumbnailStrip();
    preloadAdjacentImages();
    // 🔥 新增:确保缩略图和按钮可见
    if (thumbnailsContainer) {
      thumbnailsContainer.style.opacity = '1';
      thumbnailsContainer.style.transition = '';
    }
    if (prevBtn) prevBtn.style.opacity = '1';
    if (nextBtn) nextBtn.style.opacity = '1';
    if (closeBtn) closeBtn.style.opacity = '1';
    if (captionElement) {
      captionElement.style.opacity = '1';
      captionElement.style.transition = '';
    }
    // 保存原始位置(即使无动画也保存,以便关闭时使用)
    const clickedImg = images[index];
    const firstRect = clickedImg.getBoundingClientRect();
    // === 🔥 保存绝对位置(加上滚动偏移) ===
    originalImageRect = {
      left: firstRect.left + window.scrollX,  // 加上水平滚动
      top: firstRect.top + window.scrollY,    // 加上垂直滚动
      width: firstRect.width,
      height: firstRect.height
    };
    originalImageIndex = index;
    
    // 🔥 新增:更新图片编号显示
    if (captionIndex) {
      const indexStr = String(index + 1).padStart(3, '0');
      captionIndex.textContent = `P:${indexStr}`;
    }
    
    return;
  }

  currentIndex = index;
  const clickedImg = images[index];
  
  // 🔥 新增:确保按钮和缩略图初始为隐藏状态
  if (closeBtn) closeBtn.style.opacity = '0';
  if (prevBtn) prevBtn.style.opacity = '0';
  if (nextBtn) nextBtn.style.opacity = '0';
  if (thumbnailsContainer) thumbnailsContainer.style.opacity = '0';
  
  // 🔥 新增:更新图片编号显示
  if (captionIndex) {
    const indexStr = String(index + 1).padStart(3, '0');
    captionIndex.textContent = `P:${indexStr}`;
  }
  
  // === FLIP Step 1: First - 记录原始图片位置和尺寸 ===
  const firstRect = clickedImg.getBoundingClientRect();
  
  // === 🔥 新增:保存原始位置(加上滚动偏移,得到绝对位置) ===
  originalImageRect = {
    left: firstRect.left + window.scrollX,  // 加上水平滚动
    top: firstRect.top + window.scrollY,    // 加上垂直滚动
    width: firstRect.width,
    height: firstRect.height
  };
  originalImageIndex = index; // 保存打开时的图片索引
  
  // 🔥 优化:确保图片完全加载后再开始动画
  const preloadImg = new Image();
  preloadImg.onload = () => {
    // 先显示 lightbox 容器(但图片设为不可见)
    lightbox.classList.remove('hidden');
    lightboxImg.src = clickedImg.src;
    lightboxImg.style.opacity = '0'; // 先隐藏,避免闪烁
    lightboxImg.style.willChange = 'transform, opacity'; // 性能优化
    
    // 强制浏览器计算布局
    lightbox.offsetHeight;
    
    // === FLIP Step 2: Last - 获取 lightbox 中图片的最终位置 ===
    const lastRect = lightboxImg.getBoundingClientRect();
    
    // === FLIP Step 3: Invert - 计算位移和缩放差异 ===
    const deltaX = firstRect.left - lastRect.left;
    const deltaY = firstRect.top - lastRect.top;
    const scaleX = firstRect.width / lastRect.width;
    const scaleY = firstRect.height / lastRect.height;
    
    // 将 lightbox 图片瞬间移动到原始位置(无动画)
    lightboxImg.style.transition = 'none';
    lightboxImg.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
    lightboxImg.style.transformOrigin = 'top left';
    lightboxImg.style.opacity = '1'; // 现在显示出来
    
    // 背景遮罩同时淡入
    const backdrop = lightbox; // lightbox 本身就是背景
    backdrop.style.transition = 'none';
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    
    // 强制重绘,确保初始状态被应用
    lightbox.offsetHeight;
    
    // === FLIP Step 4: Play - 动画到最终位置 ===
    requestAnimationFrame(() => {
      // 🔥 优化:使用更平滑的缓动函数
      lightboxImg.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      lightboxImg.style.transform = 'none'; // 移除偏移,回到中心
    
    // 背景同时淡入
    backdrop.style.transition = 'background-color 0.3s ease';
    backdrop.style.backgroundColor = ''; // 恢复 CSS 中定义的背景色
    
    // 🔥 新增:按钮和缩略图淡入(稍微延迟)
    setTimeout(() => {
      if (closeBtn) closeBtn.style.opacity = '';
      if (prevBtn) prevBtn.style.opacity = '';
      if (nextBtn) nextBtn.style.opacity = '';
      if (thumbnailsContainer) thumbnailsContainer.style.opacity = '';
    }, 150); // 图片动画开始后 150ms 再显示按钮
    
    // 动画结束后清理内联样式
    setTimeout(() => {
      lightboxImg.style.transition = '';
      lightboxImg.style.transform = '';
      lightboxImg.style.transformOrigin = '';
      lightboxImg.style.willChange = '';
      backdrop.style.transition = '';
      backdrop.style.backgroundColor = '';
    }, 450);
    });
  };
  
  // 如果图片已缓存，直接触发onload
  if (clickedImg.complete && clickedImg.naturalHeight !== 0) {
    preloadImg.src = clickedImg.src;
  } else {
    // 等待图片加载完成
    preloadImg.onerror = () => {
      // 即使加载失败也继续，避免卡住
      preloadImg.onload();
    };
    preloadImg.src = clickedImg.src;
  }
  
  // 🔥 阻止页面滚动（通过 CSS 类控制，不需要内联样式）
  // document.body.style.overflow = 'hidden'; // 已由 CSS body.lightbox-opening 控制
  
  // 构建缩略图条
  buildThumbnailStrip();
  
  // 🔥 新增:确保图片编号可见
  if (captionElement) {
    captionElement.style.opacity = '1';
    captionElement.style.transition = '';
  }
  
  // 预加载相邻图片
  preloadAdjacentImages();
}

function closeLightbox() {
  // 🔥 移除 lightbox-opening 类，触发背景渐显
  document.body.classList.remove('lightbox-opening');
  
  if (thumbnailsContainer) thumbnailsContainer.style.opacity = '0';
  if (prevBtn) prevBtn.style.opacity = '0';
  if (nextBtn) nextBtn.style.opacity = '0';
  if (closeBtn) closeBtn.style.opacity = '0';
  if (captionElement) captionElement.style.opacity = '0';

  if (prefersReducedMotion()) {
    lightbox.classList.add('hidden');
    // 🔥 移除 overflow 内联样式（已由 CSS 类控制）
    // document.body.style.overflow = ''; // 已由 CSS body.lightbox-opening 控制
    lightboxImg.style = '';
    lightbox.style = '';
    if (thumbnailsContainer) thumbnailsContainer.style.opacity = '';
    if (prevBtn) prevBtn.style.opacity = '';
    if (nextBtn) nextBtn.style.opacity = '';
    if (closeBtn) closeBtn.style.opacity = '';
    if (captionElement) captionElement.style.opacity = '';
    originalImageRect = null;
    originalImageIndex = null;
    return;
  }

  if (originalImageRect && originalImageIndex !== null) {
    const originalImg = images[originalImageIndex];
    
    // 🔥 优化:先隐藏原始图片,使用opacity而不是visibility以便后续平滑过渡
    // 同时禁用所有可能的transition，避免尺寸矫正的视觉问题
    if (originalImg) {
      originalImg.style.opacity = '0';
      originalImg.style.transition = 'none';
      originalImg.style.pointerEvents = 'none'; // 防止点击干扰
      // 🔥 关键:禁用clip-path动画，避免图片恢复时的视觉变化
      originalImg.style.clipPath = 'none';
      // 确保图片尺寸稳定
      originalImg.style.width = '';
      originalImg.style.height = '';
      originalImg.style.transform = '';
    }

    const currentRect = lightboxImg.getBoundingClientRect();
    const targetLeft = originalImageRect.left - window.scrollX;
    const targetTop = originalImageRect.top - window.scrollY;
    const deltaX = targetLeft - currentRect.left;
    const deltaY = targetTop - currentRect.top;
    const scaleX = originalImageRect.width / currentRect.width;
    const scaleY = originalImageRect.height / currentRect.height;

    // 🔥 优化:清除可能残留的样式,设置初始状态
    lightboxImg.style.transition = 'none';
    lightboxImg.style.transform = 'none';
    lightboxImg.style.transformOrigin = 'top left';
    lightboxImg.style.opacity = '1';
    lightboxImg.style.willChange = 'transform, opacity'; // 性能优化
    
    // 强制重绘
    lightbox.offsetHeight;

    // 🔥 优化:使用更平滑的缓动函数和精确的时机控制
    requestAnimationFrame(() => {
      lightbox.offsetHeight;
      
      requestAnimationFrame(() => {
        // 🔥 优化:只动画transform，opacity在动画完成时立即切换，避免两个图片同时可见
        lightboxImg.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        lightboxImg.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
        lightbox.style.transition = 'background-color 0.35s ease';
        lightbox.style.backgroundColor = 'rgba(0,0,0,0)';
        
        // 🔥 关键优化:监听transform动画完成事件，在动画完成的瞬间无缝切换
        // 策略：等待transform动画完全完成，然后立即（无过渡）切换，避免两个图片同时可见
        const handleTransitionEnd = (e) => {
          // 只处理transform动画完成
          if (e.target === lightboxImg && e.propertyName === 'transform') {
            lightboxImg.removeEventListener('transitionend', handleTransitionEnd);
            
            if (originalImg) {
              // 🔥 在动画完成的瞬间，立即切换（无过渡），避免闪烁和抖动
              // 策略：先准备好原始图片，然后同步切换，确保无缝
              
              // 第一步：准备原始图片（但不显示）
              originalImg.style.transition = 'none';
              originalImg.style.clipPath = 'none';
              originalImg.style.transform = '';
              originalImg.style.width = '';
              originalImg.style.height = '';
              originalImg.style.pointerEvents = '';
              // 先设置为不可见，但准备好所有样式
              originalImg.style.opacity = '0';
              originalImg.style.visibility = 'visible';
              
              // 强制浏览器计算原始图片的布局，确保尺寸正确
              originalImg.offsetHeight;
              
              // 第二步：在下一帧同步切换（确保浏览器已经计算好布局）
              requestAnimationFrame(() => {
                // 再次强制重绘，确保原始图片完全准备好
                originalImg.offsetHeight;
                
                // 第三步：在同一帧内同步切换，避免视觉上的间隙
                requestAnimationFrame(() => {
                  // 先隐藏lightbox图片（无过渡）
                  lightboxImg.style.transition = 'none';
                  lightboxImg.style.opacity = '0';
                  
                  // 立即显示原始图片（无过渡）
                  originalImg.style.opacity = '1';
                  
                  // 强制浏览器重绘，确保切换完成
                  originalImg.offsetHeight;
                  
                  // 在下一帧清理样式和隐藏lightbox
                  requestAnimationFrame(() => {
                    if (originalImg) {
                      // 清理所有内联样式，恢复CSS默认值
                      originalImg.style.opacity = '';
                      originalImg.style.transition = '';
                      originalImg.style.visibility = '';
                      originalImg.style.pointerEvents = '';
                      originalImg.style.clipPath = '';
                      originalImg.style.transform = '';
                      originalImg.style.width = '';
                      originalImg.style.height = '';
                    }
                    
                    lightbox.classList.add('hidden');
                    lightboxImg.style = '';
                    lightboxImg.style.willChange = '';
                    lightbox.style = '';
                    if (thumbnailsContainer) thumbnailsContainer.style.opacity = '';
                    if (prevBtn) prevBtn.style.opacity = '';
                    if (nextBtn) nextBtn.style.opacity = '';
                    if (closeBtn) closeBtn.style.opacity = '';
                    if (captionElement) captionElement.style.opacity = '';
                    originalImageRect = null;
                    originalImageIndex = null;
                  });
                });
              });
            }
          }
        };
        
        // 监听transform动画完成
        lightboxImg.addEventListener('transitionend', handleTransitionEnd);
        
        // 备用：如果transitionend事件没有触发（某些情况下），使用setTimeout作为fallback
        setTimeout(() => {
          if (lightboxImg.style.opacity !== '0') {
            lightboxImg.removeEventListener('transitionend', handleTransitionEnd);
            handleTransitionEnd({ target: lightboxImg, propertyName: 'transform' });
          }
        }, 400); // 稍长于动画时间，作为安全网
      });
    });

  } else {
    lightboxImg.style.transition = 'opacity 0.2s ease';
    lightboxImg.style.opacity = '0';
    lightbox.style.transition = 'background-color 0.2s ease';
    lightbox.style.backgroundColor = 'rgba(0,0,0,0)';

    setTimeout(() => {
      lightbox.classList.add('hidden');
      // 🔥 移除 overflow 内联样式（已由 CSS body.lightbox-opening 控制）
      // document.body.style.overflow = ''; // 已由 CSS 类控制
      lightboxImg.style = '';
      lightbox.style = '';
      if (thumbnailsContainer) thumbnailsContainer.style.opacity = '';
      if (prevBtn) prevBtn.style.opacity = '';
      if (nextBtn) nextBtn.style.opacity = '';
      if (closeBtn) closeBtn.style.opacity = '';
      if (captionElement) captionElement.style.opacity = '';
      originalImageRect = null;
      originalImageIndex = null;
    }, 250);
  }
}

function showPrev() {
  if (!images || images.length === 0) return;
  const newIndex = (currentIndex - 1 + images.length) % images.length;
  switchToImage(newIndex, 'left');  // 🔥 添加方向参数
}

function showNext() {
  if (!images || images.length === 0) return;
  const newIndex = (currentIndex + 1) % images.length;
  switchToImage(newIndex, 'right');  // 🔥 添加方向参数
}

// Attach click handlers - ensure DOM is ready
function attachLightboxHandlers() {
  // Attach click handlers to gallery images
  images.forEach((img, idx) => {
    img.addEventListener('click', () => openLightbox(idx));
  });
  
  // Attach list mode handlers using event delegation
  attachListModeHandlers();
  
  // Attach lightbox control handlers
  if (closeBtn) {
closeBtn.addEventListener('click', closeLightbox);
  }
  
  if (prevBtn) {
prevBtn.addEventListener('click', showPrev);
  }
  
  if (nextBtn) {
nextBtn.addEventListener('click', showNext);
  }
}

// Initialize handlers when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachLightboxHandlers);
} else {
  // Small delay to ensure all elements are ready
  setTimeout(attachLightboxHandlers, 0);
}

// Close on Escape key
window.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('hidden')) {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showPrev();  // 已经包含方向参数
    } else if (e.key === 'ArrowRight') {
      showNext();  // 已经包含方向参数
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

// ============================================
// List Mode Parallax Scroll Effect - 滑动落差效果
// ============================================
let lastScrollY = window.scrollY;
let scrollVelocity = 0;
let isScrolling = false;
let scrollTimeout = null;

function handleListScroll() {
  // Only apply effect in list mode
  if (!gallery.classList.contains('list') && !gallery.classList.contains('mode-list')) {
    return;
  }
  
  const currentScrollY = window.scrollY;
  const scrollDelta = currentScrollY - lastScrollY;
  scrollVelocity = scrollDelta;
  
  const listItems = Array.from(gallery.querySelectorAll('.gallery.list .item, .gallery.mode-list .item'));
  if (listItems.length === 0) return;
  
  listItems.forEach((item, index) => {
    // Calculate delay factor based on item index (later items have more delay)
    const itemIndexRatio = index / Math.max(listItems.length - 1, 1);
    const delayFactor = itemIndexRatio * 0.8;
    
    // Apply parallax effect based on scroll direction (only vertical transform)
    let translateY = 0;
    if (scrollDelta > 0) {
      // Scrolling down - items below lag behind
      translateY = delayFactor * scrollDelta * 0.6;
    } else if (scrollDelta < 0) {
      // Scrolling up - last items follow slower (关键效果)
      const reverseDelayFactor = (1 - itemIndexRatio) * 0.9;
      translateY = -reverseDelayFactor * Math.abs(scrollDelta) * 0.7;
      
      // Extra delay for last 3 items when scrolling up
      if (index >= listItems.length - 3) {
        const bottomDelay = (listItems.length - index) / 3;
        translateY -= bottomDelay * Math.abs(scrollDelta) * 0.5;
      }
    }
    
    // Apply transform (only Y axis, no X axis movement)
    item.style.transform = `translateY(${translateY}px)`;
  });
  
  lastScrollY = currentScrollY;
  isScrolling = true;
  
  // Reset transforms when scrolling stops
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    isScrolling = false;
    const listItems = gallery.querySelectorAll('.gallery.list .item, .gallery.mode-list .item');
    listItems.forEach(item => {
      item.style.transform = '';
    });
  }, 150);
}

// Throttled scroll handler using requestAnimationFrame
let rafId = null;
function onScroll() {
  if (rafId) return;
  
  rafId = requestAnimationFrame(() => {
    handleListScroll();
    rafId = null;
  });
}

// Initialize scroll effect
window.addEventListener('scroll', onScroll, { passive: true });

// ============================================
// Header Scroll Effect - 方案6：组合效果
// ============================================
let lastHeaderScrollY = window.scrollY;
let headerScrollDirection = 0;
const siteHeader = document.querySelector('.site-header');

function handleHeaderScroll() {
  const currentScrollY = window.scrollY;
  const scrollDelta = currentScrollY - lastHeaderScrollY;
  
  // Determine scroll direction
  if (scrollDelta > 5) {
    // Scrolling down
    headerScrollDirection = 1;
    if (currentScrollY > 100) { // Only hide after scrolling 100px
      siteHeader.classList.remove('scrolled-up');
      siteHeader.classList.add('scrolled-down');
    }
  } else if (scrollDelta < -5) {
    // Scrolling up
    headerScrollDirection = -1;
    siteHeader.classList.remove('scrolled-down');
    siteHeader.classList.add('scrolled-up');
  }
  
  // Show header at top of page
  if (currentScrollY < 50) {
    siteHeader.classList.remove('scrolled-down', 'scrolled-up');
  }
  
  lastHeaderScrollY = currentScrollY;
}

// Throttled header scroll handler
let headerRafId = null;
function onHeaderScroll() {
  if (headerRafId) return;
  
  headerRafId = requestAnimationFrame(() => {
    handleHeaderScroll();
    headerRafId = null;
  });
}

// Initialize header scroll effect
window.addEventListener('scroll', onHeaderScroll, { passive: true });

// Reset transforms when switching away from list mode
// Wrap the original setView function to reset transforms
(function() {
  const originalSetView = setView;
  setView = function(view, isInitial) {
    originalSetView.call(this, view, isInitial);
    
    // Reset transforms when leaving list mode
    if (view !== 'list') {
      const listItems = gallery.querySelectorAll('.gallery.list .item, .gallery.mode-list .item');
      listItems.forEach(item => {
        item.style.transform = '';
        item.style.opacity = '';
      });
    }
  };
})();
