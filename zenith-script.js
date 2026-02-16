/* ===== OPTIMIZED JAVASCRIPT - SMOOTH PERFORMANCE ===== */

// DOM Elements
const listWrap = document.getElementById('listWrap');
const loadingEl = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('search');
const pageLoader = document.querySelector('.page-loader');

// State
let HEROES = [];
let selectedRole = 'all';
let searchTimeout;
let isRendering = false;

// ===== UTILITY FUNCTIONS =====

/**
 * Debounce function untuk optimize search input
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function untuk optimize scroll events
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Lazy load images untuk performance
 */
function imageEl(src, alt) {
  const img = document.createElement('img');
  img.loading = 'lazy'; // Native lazy loading
  img.alt = alt;
  
  // Placeholder sementara gambar loading
  img.style.opacity = '0';
  img.style.transition = 'opacity 0.4s ease-in-out';
  
  img.onload = () => {
    requestAnimationFrame(() => {
      img.style.opacity = '1';
    });
  };
  
  img.onerror = () => {
    img.src = 'https://placehold.co/100x100/1a1a1a/fff?text=' + encodeURIComponent(alt.charAt(0));
    img.style.objectFit = 'contain';
    img.style.padding = '8px';
  };
  
  img.src = src;
  return img;
}

/**
 * Smooth height animation menggunakan requestAnimationFrame
 */
function smoothHeightTransition(element, targetHeight, callback) {
  const startHeight = element.offsetHeight;
  const distance = targetHeight - startHeight;
  const duration = 500; // ms
  const startTime = performance.now();
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function: easeInOutCubic
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    const currentHeight = startHeight + (distance * eased);
    element.style.height = `${currentHeight}px`;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      if (callback) callback();
    }
  }
  
  requestAnimationFrame(animate);
}

// ===== RENDER FUNCTIONS =====

/**
 * Render single hero card dengan optimasi
 */
function renderItem(h, index) {
  const tpl = document.getElementById('itemTpl');
  const node = tpl.content.cloneNode(true);
  const card = node.querySelector('.hero-card');
  
  // Stagger animation delay untuk smooth appearance
  card.style.animationDelay = `${index * 0.05}s`;
  
  // Image
  const imgWrap = card.querySelector('.hero-img');
  imgWrap.appendChild(imageEl(h.image, h.name));
  
  // Text content
  card.querySelector('.hero-name').textContent = h.name;
  card.querySelector('.hero-desc').textContent = h.description || '';
  
  // Elements untuk expand/collapse
  const chevBtn = card.querySelector('.chevron-btn');
  const expanded = card.querySelector('.expanded-area');
  const grid = card.querySelector('.variants-grid');
  
  let isOpen = false;
  let isAnimating = false;
  
  /**
   * Toggle expand/collapse dengan smooth animation
   */
  function toggle(event) {
    if (event) event.stopPropagation();
    if (isAnimating) return;
    
    isAnimating = true;
    isOpen = !isOpen;
    
    // Toggle active class dengan smooth transition
    requestAnimationFrame(() => {
      chevBtn.classList.toggle('active', isOpen);
    });
    
    if (isOpen) {
      // Render content jika belum ada
      if (grid.children.length === 0) {
        renderSeriesContent();
      }
      
      // Expand animation
      expanded.style.display = 'block';
      expanded.style.overflow = 'hidden';
      expanded.style.height = '0';
      
      // Force reflow
      void expanded.offsetHeight;
      
      requestAnimationFrame(() => {
        const targetHeight = expanded.scrollHeight;
        expanded.style.height = `${targetHeight}px`;
        expanded.classList.add('show');
        
        setTimeout(() => {
          if (isOpen) {
            expanded.style.height = 'auto';
            expanded.style.overflow = 'visible';
          }
          isAnimating = false;
        }, 600);
      });
      
    } else {
      // Collapse animation
      const startHeight = expanded.scrollHeight;
      expanded.style.height = `${startHeight}px`;
      expanded.style.overflow = 'hidden';
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          expanded.style.height = '0px';
          expanded.classList.remove('show');
          
          setTimeout(() => {
            expanded.style.display = 'none';
            expanded.style.height = '';
            expanded.style.overflow = '';
            isAnimating = false;
          }, 600);
        });
      });
    }
  }
  
  /**
   * Render series content (nested items)
   */
  function renderSeriesContent() {
    grid.innerHTML = '';
    
    (h.series || []).forEach((s, seriesIndex) => {
      const wrap = document.createElement('div');
      wrap.className = 'series-item';
      
      // Stagger animation
      wrap.style.animationDelay = `${seriesIndex * 0.1}s`;
      
      const header = document.createElement('div');
      header.className = 'series-header';
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.innerHTML = `<span>${s.name}</span><span class="series-arrow">⟨</span>`;
      
      const content = document.createElement('div');
      content.className = 'series-content';
      content.style.height = '0px';
      content.style.overflow = 'hidden';
      
      const inner = document.createElement('div');
      inner.className = 'series-content-inner';
      
      // Render variant buttons
      (s.items || []).forEach(v => {
        const a = document.createElement('a');
        a.href = v.link;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'variant-btn';
        a.textContent = v.name;
        inner.appendChild(a);
      });
      
      content.appendChild(inner);
      
      /**
       * Toggle series dengan smooth animation
       */
      function toggleSeries(e) {
        e.stopPropagation();
        
        const isSeriesOpen = content.style.height !== '0px' && content.style.height !== '';
        
        requestAnimationFrame(() => {
          if (!isSeriesOpen) {
            const targetHeight = inner.scrollHeight;
            content.style.height = `${targetHeight}px`;
            header.classList.add('active');
          } else {
            content.style.height = '0px';
            header.classList.remove('active');
          }
        });
      }
      
      header.addEventListener('click', toggleSeries);
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleSeries(e);
        }
      });
      
      wrap.appendChild(header);
      wrap.appendChild(content);
      grid.appendChild(wrap);
    });
  }
  
  // Event listeners
  chevBtn.addEventListener('click', toggle);
  chevBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(e);
    }
  });
  
  return card;
}

/**
 * Render list dengan optimasi dan stagger animation
 */
function renderList(list) {
  if (isRendering) return;
  isRendering = true;
  
  // Clear existing content
  listWrap.innerHTML = '';
  
  if (!list || list.length === 0) {
    requestAnimationFrame(() => {
      emptyState.classList.add('show');
      emptyState.style.display = 'flex';
      listWrap.style.display = 'none';
      isRendering = false;
    });
    return;
  }
  
  emptyState.classList.remove('show');
  emptyState.style.display = 'none';
  listWrap.style.display = 'block';
  
  // Render items dengan requestAnimationFrame untuk smooth performance
  let currentIndex = 0;
  const batchSize = 5; // Render 5 items per frame
  
  function renderBatch() {
    const endIndex = Math.min(currentIndex + batchSize, list.length);
    
    for (let i = currentIndex; i < endIndex; i++) {
      listWrap.appendChild(renderItem(list[i], i));
    }
    
    currentIndex = endIndex;
    
    if (currentIndex < list.length) {
      requestAnimationFrame(renderBatch);
    } else {
      isRendering = false;
    }
  }
  
  requestAnimationFrame(renderBatch);
}

/**
 * Apply filters dengan optimasi
 */
function applyFilters() {
  const searchQuery = searchInput.value.toLowerCase().trim();
  
  let filtered = HEROES;
  
  // Filter by role
  if (selectedRole !== 'all') {
    filtered = filtered.filter(hero =>
      hero.description && hero.description.toLowerCase().includes(selectedRole.toLowerCase())
    );
  }
  
  // Filter by search query
  if (searchQuery) {
    filtered = filtered.filter(hero =>
      hero.name.toLowerCase().includes(searchQuery) ||
      (hero.description && hero.description.toLowerCase().includes(searchQuery))
    );
  }
  
  renderList(filtered);
}

// Debounced version untuk search input
const debouncedFilter = debounce(applyFilters, 300);

/**
 * Initialize role filter buttons
 */
function initRoleFilter() {
  const roleButtons = document.querySelectorAll('.role-btn');
  
  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active dari semua button
      roleButtons.forEach(b => b.classList.remove('active'));
      
      // Add active ke button yang diklik
      requestAnimationFrame(() => {
        btn.classList.add('active');
        selectedRole = btn.dataset.role;
        applyFilters();
      });
    });
    
    // Keyboard support
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
}

/**
 * Load data dari JSON
 */
async function load() {
  try {
    const res = await fetch('data.json');
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    HEROES = await res.json();
    
    if (!Array.isArray(HEROES)) {
      throw new Error('Data format is incorrect - expected an array');
    }
    
    // Render dengan smooth transition
    requestAnimationFrame(() => {
      renderList(HEROES);
      initRoleFilter();
      
      // Hide loading skeleton dengan fade out
      loadingEl.style.transition = 'opacity 0.4s ease';
      loadingEl.style.opacity = '0';
      
      setTimeout(() => {
        loadingEl.style.display = 'none';
      }, 400);
    });
    
  } catch (error) {
    console.error('Error loading data:', error);
    
    requestAnimationFrame(() => {
      emptyState.innerHTML = `
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <p>Gagal memuat data</p>
        <p style="font-size: 0.85em; opacity: 0.7; margin-top: 8px;">${error.message}</p>
      `;
      emptyState.classList.add('show');
      loadingEl.style.display = 'none';
    });
  }
}

// ===== EVENT LISTENERS =====

// Search input dengan debouncing
searchInput.addEventListener('input', debouncedFilter);

// Keyboard shortcut untuk focus search (Ctrl/Cmd + K)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.focus();
  }
});

// ===== INITIALIZATION =====

/**
 * Initialize page dengan smooth loading
 */
function initPage() {
  // Load data
  load();
  
  // Hide page loader setelah semua siap
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        pageLoader.classList.add('hide');
        document.body.classList.add('loaded');
      }, 500);
    });
  });
  
  // Fallback jika window.load tidak trigger
  setTimeout(() => {
    if (!document.body.classList.contains('loaded')) {
      pageLoader.classList.add('hide');
      document.body.classList.add('loaded');
    }
  }, 3000);
}

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}

// ===== PERFORMANCE OPTIMIZATION =====

// Passive event listeners untuk better scroll performance
if ('passive' in Object.getOwnPropertyDescriptor(EventTarget.prototype, 'addEventListener')) {
  document.addEventListener('scroll', throttle(() => {
    // Scroll optimizations jika diperlukan
  }, 100), { passive: true });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  // Clear timeouts
  if (searchTimeout) clearTimeout(searchTimeout);
});
