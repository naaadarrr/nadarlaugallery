// Collect gallery images and setup lightbox
const gallery = document.getElementById('gallery');
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

// Real visitor counter using a simple API
let visitorCount = 0;

// Function to get visitor count from a simple counter service
async function getVisitorCount() {
  try {
    // Using a free counter service - you can replace with your own backend
    const response = await fetch('https://api.countapi.xyz/hit/nadargallery/visits');
    const data = await response.json();
    return data.value || 0;
  } catch (error) {
    // Fallback to localStorage if API fails
    let count = localStorage.getItem('visitorCount');
    if (!count) {
      count = 1;
      localStorage.setItem('visitorCount', count);
    } else {
      count = parseInt(count) + 1;
      localStorage.setItem('visitorCount', count);
    }
    return count;
  }
}

// Live clock and visitor count in separate blocks
const visitorEl = document.getElementById('visitor-count');
const timeEl = document.getElementById('time-display');

async function updateInfo() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  
  // Get visitor count only once when page loads
  if (visitorCount === 0) {
    visitorCount = await getVisitorCount();
  }
  
  visitorEl.textContent = `${visitorCount} visitors`;
  timeEl.textContent = `${hh}:${mm}:${ss}`;
}

// Update time every second, but only get visitor count once
updateInfo();
setInterval(() => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  timeEl.textContent = `${hh}:${mm}:${ss}`;
}, 1000);
