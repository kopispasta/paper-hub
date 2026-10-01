/**
 * TelaahSains Hub: Shared Reader Experience Controller
 * Features:
 * - Theme Switcher (Paper, Sepia, Dark Slate) with persistence
 * - Font Size Scaling (Normal 18px, Large 20px, Extra 22px) with persistence
 * - Dynamic Floating ScrollSpy TOC for Desktop
 * - Enhanced Lightbox with Pan, Interactive Zoom (100%-350%), and Download
 * - One-Click Citation Copying with Toast Notification
 */

(function () {
  'use strict';

  // --- 1. THEME & FONT SIZE CONTROLLERS ---
  const THEME_KEY = 'telaahsains_reader_theme';
  const FONT_SIZE_KEY = 'telaahsains_font_size';

  function initPreferences() {
    // Theme
    const savedTheme = localStorage.getItem(THEME_KEY) || 'paper';
    setTheme(savedTheme, false);

    // Font Size
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY) || 'md';
    setFontSize(savedFontSize, false);
  }

  window.setTheme = function (theme, save = true) {
    document.body.classList.remove('theme-sepia', 'theme-dark');
    if (theme === 'sepia') document.body.classList.add('theme-sepia');
    if (theme === 'dark') document.body.classList.add('theme-dark');

    // Update active UI buttons if present
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme-btn') === theme);
    });

    if (save) {
      localStorage.setItem(THEME_KEY, theme);
      showToast(`Tema diubah: ${theme === 'dark' ? 'Dark Slate' : theme === 'sepia' ? 'Sepia Hangat' : 'Kertas (Siang)'}`);
    }
  };

  window.setFontSize = function (size, save = true) {
    document.body.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    document.body.classList.add(`font-size-${size}`);

    // Update active UI buttons if present
    document.querySelectorAll('[data-size-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-size-btn') === size);
    });

    if (save) {
      localStorage.setItem(FONT_SIZE_KEY, size);
      showToast(`Ukuran teks: ${size === 'sm' ? 'Kompak (16px)' : size === 'lg' ? 'Besar (20px)' : 'Standar (18px)'}`);
    }
  };

  // --- 2. TOAST NOTIFICATION ---
  let toastTimer = null;
  window.showToast = function (message) {
    let toast = document.getElementById('reader-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'reader-toast';
      toast.className = 'reader-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  };

  // --- 3. CITATION COPIER ---
  window.copyCitation = function (type, text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Sitasi format ${type.toUpperCase()} tersalin ke clipboard!`);
    }).catch(() => {
      showToast('Gagal menyalin sitasi secara otomatis.');
    });
  };

  // --- 4. FLOATING SCROLLSPY TOC GENERATOR ---
  function initFloatingTOC() {
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    if (sections.length < 3) return;

    // Check if sidebar already exists
    let sidebar = document.getElementById('floating-toc-sidebar');
    if (!sidebar) {
      sidebar = document.createElement('aside');
      sidebar.id = 'floating-toc-sidebar';
      sidebar.className = 'floating-toc-sidebar hidden xl:block';

      const title = document.createElement('div');
      title.className = 'toc-title';
      title.textContent = 'Daftar Isi Bab';
      sidebar.appendChild(title);

      const navList = document.createElement('nav');
      sections.forEach(sec => {
        const h2 = sec.querySelector('h2');
        if (!h2) return;
        const link = document.createElement('a');
        link.href = `#${sec.id}`;
        link.className = 'toc-link';
        // Clean text like "01. Title..."
        link.textContent = h2.textContent.trim();
        link.setAttribute('data-target-id', sec.id);
        navList.appendChild(link);
      });
      sidebar.appendChild(navList);
      document.body.appendChild(sidebar);
    }

    // ScrollSpy using IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          document.querySelectorAll('.floating-toc-sidebar .toc-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-target-id') === id);
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    sections.forEach(sec => observer.observe(sec));
  }

  // --- 5. ENHANCED LIGHTBOX WITH PAN & ZOOM ---
  let currentZoom = 1.0;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  window.openLightbox = function (src, caption) {
    let lb = document.getElementById('lightbox');
    if (!lb) return;

    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    const zoomText = document.getElementById('lightbox-zoom-val');

    img.src = src;
    cap.textContent = caption || '';
    
    // Reset zoom and pan
    currentZoom = 1.0;
    panX = 0;
    panY = 0;
    applyImageTransform();

    lb.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  window.closeLightbox = function () {
    const lb = document.getElementById('lightbox');
    if (lb) {
      lb.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  };

  window.zoomLightbox = function (delta) {
    if (delta === 0) {
      currentZoom = 1.0;
      panX = 0;
      panY = 0;
    } else {
      currentZoom = Math.min(3.5, Math.max(1.0, currentZoom + delta));
      if (currentZoom === 1.0) {
        panX = 0;
        panY = 0;
      }
    }
    applyImageTransform();
  };

  function applyImageTransform() {
    const img = document.getElementById('lightbox-img');
    const wrapper = document.getElementById('lightbox-img-wrapper');
    const zoomVal = document.getElementById('lightbox-zoom-val');
    if (!img) return;

    img.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
    if (zoomVal) {
      zoomVal.textContent = `${Math.round(currentZoom * 100)}%`;
    }

    if (wrapper) {
      if (currentZoom > 1.0) {
        wrapper.classList.add('is-zoomed');
      } else {
        wrapper.classList.remove('is-zoomed');
      }
    }
  }

  window.downloadLightboxImage = function () {
    const img = document.getElementById('lightbox-img');
    if (!img || !img.src) return;
    const a = document.createElement('a');
    a.href = img.src;
    const fileName = img.src.split('/').pop().split('?')[0] || 'figure.png';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Mengunduh berkas gambar: ${fileName}`);
  };

  function setupLightboxPanZoom() {
    const wrapper = document.getElementById('lightbox-img-wrapper');
    if (!wrapper) return;

    wrapper.addEventListener('mousedown', (e) => {
      if (currentZoom <= 1.0) return;
      isDragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging || currentZoom <= 1.0) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      applyImageTransform();
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Mouse wheel zoom
    wrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      zoomLightbox(delta);
    }, { passive: false });
  }

  // --- 6. INJECT HEADER CONTROLS TOOLBAR IF NOT IN HTML ---
  function injectHeaderControls() {
    const headerRight = document.querySelector('header .max-w-4xl > div:last-child');
    if (!headerRight || headerRight.querySelector('.reader-controls-cluster')) return;

    const cluster = document.createElement('div');
    cluster.className = 'reader-controls-cluster flex items-center gap-2 border-l border-editorial-line pl-3 ml-1';
    cluster.innerHTML = `
      <!-- Theme Switcher -->
      <div class="flex items-center border border-editorial-line rounded overflow-hidden text-[11px] bg-white">
        <button onclick="setTheme('paper')" data-theme-btn="paper" title="Tema Kertas (Siang)" class="px-2 py-0.5 hover:bg-zinc-100 transition-colors">Kertas</button>
        <button onclick="setTheme('sepia')" data-theme-btn="sepia" title="Tema Sepia (Nyaman)" class="px-2 py-0.5 hover:bg-zinc-100 transition-colors border-l border-editorial-line">Sepia</button>
        <button onclick="setTheme('dark')" data-theme-btn="dark" title="Tema Dark Slate (Malam)" class="px-2 py-0.5 hover:bg-zinc-100 transition-colors border-l border-editorial-line">Gelap</button>
      </div>
      <!-- Font Sizer -->
      <div class="hidden sm:flex items-center border border-editorial-line rounded overflow-hidden text-[11px] bg-white">
        <button onclick="setFontSize('sm')" data-size-btn="sm" title="Teks Kompak (16px)" class="px-1.5 py-0.5 hover:bg-zinc-100 font-mono transition-colors">A-</button>
        <button onclick="setFontSize('md')" data-size-btn="md" title="Teks Standar (18px)" class="px-1.5 py-0.5 hover:bg-zinc-100 font-mono transition-colors border-l border-editorial-line">A</button>
        <button onclick="setFontSize('lg')" data-size-btn="lg" title="Teks Besar (20px)" class="px-1.5 py-0.5 hover:bg-zinc-100 font-mono transition-colors border-l border-editorial-line">A+</button>
      </div>
    `;

    headerRight.prepend(cluster);

    // Sync button states
    const curTheme = localStorage.getItem(THEME_KEY) || 'paper';
    const curSize = localStorage.getItem(FONT_SIZE_KEY) || 'md';
    cluster.querySelectorAll(`[data-theme-btn="${curTheme}"]`).forEach(b => b.classList.add('bg-zinc-800', 'text-white'));
    cluster.querySelectorAll(`[data-size-btn="${curSize}"]`).forEach(b => b.classList.add('bg-zinc-800', 'text-white'));
  }

  // --- 7. ENHANCE LIGHTBOX MODAL STRUCTURE ---
  function enhanceLightboxModal() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;

    // Check if controls already present
    if (lb.querySelector('#lightbox-toolbar')) return;

    // Replace inner structure with enhanced toolbar, wrapper, and caption
    const oldImg = document.getElementById('lightbox-img');
    const oldCap = document.getElementById('lightbox-caption');
    const src = oldImg ? oldImg.src : '';
    const capText = oldCap ? oldCap.textContent : '';

    lb.innerHTML = `
      <div class="relative w-full max-w-5xl h-[92vh] flex flex-col items-center justify-between p-2 select-none" onclick="event.stopPropagation()">
        
        <!-- Top Toolbar -->
        <div id="lightbox-toolbar" class="w-full flex items-center justify-between text-zinc-300 font-sans text-xs px-2 py-1 bg-black/60 backdrop-blur rounded border border-white/10">
          <div class="flex items-center gap-1.5">
            <span class="text-zinc-400 text-[11px] hidden sm:inline">Perbesaran:</span>
            <button onclick="zoomLightbox(-0.5)" class="px-2 py-1 hover:bg-white/10 rounded font-mono font-bold" title="Perkecil [-]">-</button>
            <span id="lightbox-zoom-val" class="font-mono text-white text-[11px] min-w-10 text-center">100%</span>
            <button onclick="zoomLightbox(0.5)" class="px-2 py-1 hover:bg-white/10 rounded font-mono font-bold" title="Perbesar [+]">+</button>
            <button onclick="zoomLightbox(0)" class="px-2 py-1 hover:bg-white/10 rounded text-[11px] ml-1 text-zinc-400 hover:text-white" title="Reset Ukuran [0]">1:1</button>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="downloadLightboxImage()" class="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition-colors text-xs font-medium">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span>Unduh Gambar</span>
            </button>
            <button onclick="closeLightbox()" class="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-red-500/80 text-white rounded transition-colors text-xs font-mono">
              <span>Tutup [ESC]</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Center Image Viewport -->
        <div id="lightbox-img-wrapper" class="flex-1 w-full flex items-center justify-center my-2">
          <img id="lightbox-img" src="${src}" alt="" class="max-w-full max-h-full object-contain rounded bg-white p-2 shadow-2xl">
        </div>

        <!-- Bottom Caption -->
        <p id="lightbox-caption" class="text-zinc-200 text-xs text-center max-w-3xl font-sans bg-black/50 px-4 py-2 rounded border border-white/10 line-clamp-3">
          ${capText}
        </p>
      </div>
    `;

    setupLightboxPanZoom();
  }

  // --- 8. GLOBAL INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    initPreferences();
    injectHeaderControls();
    enhanceLightboxModal();
    initFloatingTOC();

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      const lb = document.getElementById('lightbox');
      const isLbOpen = lb && !lb.classList.contains('hidden');

      if (e.key === 'Escape' && isLbOpen) {
        closeLightbox();
      } else if (isLbOpen) {
        if (e.key === '+' || e.key === '=') zoomLightbox(0.5);
        if (e.key === '-' || e.key === '_') zoomLightbox(-0.5);
        if (e.key === '0') zoomLightbox(0);
      }
    });

    // Reading Progress Indicator
    window.addEventListener('scroll', () => {
      const prog = document.getElementById('reading-progress');
      if (!prog) return;
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      prog.style.width = scrolled + '%';
    });
  });

})();
