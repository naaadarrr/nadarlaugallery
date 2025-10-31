// View toggle functionality
const gallery = document.getElementById('gallery');
const btnGrid = document.getElementById('btn-grid');
const btnList = document.getElementById('btn-list');

// Load saved view preference or default to grid
const savedView = localStorage.getItem('galleryView') || 'grid';
setView(savedView, true);

function setView(view, isInitial = false) {
  if (isInitial) {
    // No animation on initial load
    if (view === 'grid') {
      gallery.classList.remove('list');
      gallery.classList.add('grid');
      btnGrid.classList.add('active');
      btnList.classList.remove('active');
    } else {
      gallery.classList.remove('grid');
      gallery.classList.add('list');
      btnList.classList.add('active');
      btnGrid.classList.remove('active');
    }
    localStorage.setItem('galleryView', view);
    return;
  }
  
  // FLIP Animation (First-Last-Invert-Play)
  const items = Array.from(gallery.querySelectorAll('.item'));
  const currentScrollY = window.scrollY;
  
  // Prevent user from clicking again during animation
  btnGrid.disabled = true;
  btnList.disabled = true;
  
  // Step 1: First - Record initial positions (of images for more accurate tracking)
  const firstRects = items.map(item => {
    const img = item.querySelector('img');
    return img ? img.getBoundingClientRect() : item.getBoundingClientRect();
  });
  
  // Step 2: Last - Switch layout and get new positions
  if (view === 'grid') {
    gallery.classList.remove('list');
    gallery.classList.add('grid');
    btnGrid.classList.add('active');
    btnList.classList.remove('active');
  } else {
    gallery.classList.remove('grid');
    gallery.classList.add('list');
    btnList.classList.add('active');
    btnGrid.classList.remove('active');
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
    }, 500 + maxDelay + 100);
  });
  
  localStorage.setItem('galleryView', view);
}

btnGrid.addEventListener('click', () => setView('grid'));
btnList.addEventListener('click', () => setView('list'));

// Collect gallery images and setup lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.getElementById('close-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

let currentIndex = 0;
const images = Array.from(gallery.querySelectorAll('img'));

function openLightbox(index) {
  currentIndex = index;
  lightboxImg.src = images[index].src;
  lightbox.classList.remove('hidden');
}
function closeLightbox() {
  lightbox.classList.add('hidden');
}
function showPrev() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  lightboxImg.src = images[currentIndex].src;
}
function showNext() {
  currentIndex = (currentIndex + 1) % images.length;
  lightboxImg.src = images[currentIndex].src;
}

// Attach click handlers
images.forEach((img, idx) => img.addEventListener('click', () => openLightbox(idx)));
closeBtn.addEventListener('click', closeLightbox);
prevBtn.addEventListener('click', showPrev);
nextBtn.addEventListener('click', showNext);

// Close on Escape key
window.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('hidden')) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  }
});

// Touch swipe support
let touchStartX = 0;
lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].pageX;
});
lightbox.addEventListener('touchend', (e) => {
  const diff = e.changedTouches[0].pageX - touchStartX;
  if (Math.abs(diff) > 50) {
    diff > 0 ? showPrev() : showNext();
  }
});
