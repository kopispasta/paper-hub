/**
 * TelaahSains Hub: Shared Reader Experience Controller
 * Features:
 * - Theme Switcher (Paper, Sepia, Dark Slate) with persistence
 * - Font Size Scaling (Normal 18px, Large 20px, Extra 22px) with persistence
 * - Dynamic Floating ScrollSpy TOC for Desktop
 * - Enhanced Lightbox with Pan, Interactive Zoom (100%-350%), and Download
 * - One-Click Citation Copying with Toast Notification
 * - Precise Reading History & Scroll Position Restoration
 * - Read Checklist Status (Mark as completed) & Article End Completion Card
 */

(function () {
  'use strict';

  const THEME_KEY = 'telaahsains_reader_theme';
  const FONT_SIZE_KEY = 'telaahsains_font_size';
  const LAST_READING_KEY = 'telaahsains_last_reading';
  const SCROLL_POS_KEY = 'telaahsains_scroll_';
  const READ_PAPERS_KEY = 'telaahsains_read_papers';

  // --- 0. EXTRACT PAPER METADATA ---
  function getPaperMetadata() {
    const path = window.location.pathname;
    const matchId = path.match(/(?:papers\/)?(\d{2})-[^/]+/);
    let paperId = matchId ? matchId[1] : '';

    if (!paperId) {
      const headerMono = document.querySelector('header span.font-mono')?.textContent || '';
      const m = headerMono.match(/#(\d{2})/);
      if (m) paperId = m[1];
    }

    const titleEl = document.querySelector('h1');
    const title = titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : document.title;

    let relativeUrl = '';
    const pIdx = path.indexOf('papers/');
    if (pIdx >= 0) {
      relativeUrl = path.slice(pIdx);
    } else {
      relativeUrl = `papers/${paperId}/index.html`;
    }

    return { paperId, title, url: relativeUrl };
  }

  // --- 1. THEME & FONT SIZE CONTROLLERS ---
  function initPreferences() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'paper';
    setTheme(savedTheme, false);

    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY) || 'md';
    setFontSize(savedFontSize, false);
  }

  window.setTheme = function (theme, save = true) {
    document.body.classList.remove('theme-sepia', 'theme-dark');
    if (theme === 'sepia') document.body.classList.add('theme-sepia');
    if (theme === 'dark') document.body.classList.add('theme-dark');

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

    document.querySelectorAll('[data-size-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-size-btn') === size);
    });

    if (save) {
      localStorage.setItem(FONT_SIZE_KEY, size);
      showToast(`Ukuran teks: ${size === 'sm' ? 'Kompak (16px)' : size === 'lg' ? 'Besar (20px)' : 'Standar (18px)'}`);
    }
  };

  // --- 2. TOAST NOTIFICATIONS ---
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

  function showResumeToast(saved) {
    let resumeToast = document.getElementById('reader-resume-toast');
    if (!resumeToast) {
      resumeToast = document.createElement('div');
      resumeToast.id = 'reader-resume-toast';
      resumeToast.className = 'reader-resume-toast';
      document.body.appendChild(resumeToast);
    }

    const sectionLabel = saved.sectionTitle ? ` • ${saved.sectionTitle}` : '';
    resumeToast.innerHTML = `
      <span>Melanjutkan dari posisi terakhir (<strong>${saved.scrollPercent}%</strong>${sectionLabel})</span>
      <button onclick="scrollToTopAndDismiss()">Mulai dari Awal ↑</button>
    `;
    resumeToast.classList.add('show');

    setTimeout(() => {
      resumeToast.classList.remove('show');
    }, 5500);
  }

  window.scrollToTopAndDismiss = function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const toast = document.getElementById('reader-resume-toast');
    if (toast) toast.classList.remove('show');
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
        link.textContent = h2.textContent.trim();
        link.setAttribute('data-target-id', sec.id);
        navList.appendChild(link);
      });
      sidebar.appendChild(navList);
      document.body.appendChild(sidebar);
    }

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

    img.src = src;
    cap.textContent = caption || '';

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

    wrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      zoomLightbox(delta);
    }, { passive: false });
  }

  function enhanceLightboxModal() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    if (lb.querySelector('#lightbox-toolbar')) return;

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

  // --- 6. READ CHECKLIST CONTROLLER ---
  function getReadPapers() {
    try {
      return JSON.parse(localStorage.getItem(READ_PAPERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  window.toggleCurrentPaperRead = function () {
    const meta = getPaperMetadata();
    if (!meta.paperId) return;

    let readList = getReadPapers();
    const idx = readList.indexOf(meta.paperId);
    let isRead = false;
    if (idx >= 0) {
      readList.splice(idx, 1);
    } else {
      readList.push(meta.paperId);
      isRead = true;
    }

    localStorage.setItem(READ_PAPERS_KEY, JSON.stringify(readList));
    updateReadChecklistUI(meta.paperId);
    showToast(isRead ? `Paper #${meta.paperId} ditandai: Selesai Dibaca ✓` : `Tanda selesai dibaca Paper #${meta.paperId} dihapus.`);
  };

  function updateReadChecklistUI(paperId) {
    const readList = getReadPapers();
    const isRead = readList.includes(paperId);

    // Header read button
    const headerBtn = document.getElementById('header-read-btn');
    if (headerBtn) {
      headerBtn.classList.toggle('is-read', isRead);
      headerBtn.innerHTML = isRead
        ? `<svg class="w-3.5 h-3.5 text-emerald-600 fill-current" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
           <span class="hidden md:inline">Selesai Dibaca</span>`
        : `<svg class="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
           <span class="hidden md:inline">Tandai Selesai</span>`;
    }

    // Bottom completion card
    const cardStatus = document.getElementById('completion-status-text');
    const cardBtn = document.getElementById('completion-toggle-btn');
    const cardIcon = document.getElementById('completion-icon-box');
    if (cardStatus && cardBtn) {
      if (isRead) {
        cardStatus.textContent = 'Status: Telah Selesai Dibaca ✓';
        cardStatus.className = 'font-bold text-sm text-emerald-700';
        if (cardIcon) cardIcon.className = 'w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0';
        cardBtn.textContent = 'Batal Tandai Selesai';
        cardBtn.className = 'px-3 py-1.5 border border-zinc-300 hover:bg-zinc-100 text-zinc-700 rounded text-xs font-medium transition-colors';
      } else {
        cardStatus.textContent = 'Selesai Membaca Telaah Paper Ini?';
        cardStatus.className = 'font-bold text-sm text-editorial-ink';
        if (cardIcon) cardIcon.className = 'w-10 h-10 rounded-full bg-blue-50 text-editorial-accent flex items-center justify-center shrink-0';
        cardBtn.textContent = 'Tandai Sudah Dibaca ✓';
        cardBtn.className = 'px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs transition-colors';
      }
    }
  }

  function injectCompletionCard() {
    const meta = getPaperMetadata();
    if (!meta.paperId || document.getElementById('reader-completion-card')) return;

    const main = document.querySelector('main');
    if (!main) return;

    const card = document.createElement('div');
    card.id = 'reader-completion-card';
    card.className = 'my-10 p-5 bg-white border border-editorial-line rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans shadow-xs';
    card.innerHTML = `
      <div class="flex items-center gap-3.5">
        <div id="completion-icon-box" class="w-10 h-10 rounded-full bg-blue-50 text-editorial-accent flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <div id="completion-status-text" class="font-bold text-sm text-editorial-ink">Selesai Membaca Telaah Paper Ini?</div>
          <p class="text-xs text-editorial-muted mt-0.5">Catat progres membaca Anda di portal lokal untuk memantau kemajuan kajian literatur.</p>
        </div>
      </div>
      <button onclick="toggleCurrentPaperRead()" id="completion-toggle-btn" class="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs transition-colors shrink-0">
        Tandai Sudah Dibaca ✓
      </button>
    `;

    main.appendChild(card);
    updateReadChecklistUI(meta.paperId);
  }

  // --- 7. INJECT HEADER CONTROLS TOOLBAR ---
  function injectHeaderControls() {
    const headerRight = document.querySelector('header .max-w-4xl > div:last-child');
    if (!headerRight || headerRight.querySelector('.reader-controls-cluster')) return;

    const meta = getPaperMetadata();

    const cluster = document.createElement('div');
    cluster.className = 'reader-controls-cluster flex items-center gap-2 border-l border-editorial-line pl-3 ml-1';
    cluster.innerHTML = `
      <!-- Read Checklist Toggle Button -->
      <button onclick="toggleCurrentPaperRead()" id="header-read-btn" class="read-checklist-btn" title="Tandai paper ini sudah selesai dibaca">
        <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span class="hidden md:inline">Tandai Selesai</span>
      </button>

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

    const curTheme = localStorage.getItem(THEME_KEY) || 'paper';
    const curSize = localStorage.getItem(FONT_SIZE_KEY) || 'md';
    cluster.querySelectorAll(`[data-theme-btn="${curTheme}"]`).forEach(b => b.classList.add('bg-zinc-800', 'text-white'));
    cluster.querySelectorAll(`[data-size-btn="${curSize}"]`).forEach(b => b.classList.add('bg-zinc-800', 'text-white'));

    updateReadChecklistUI(meta.paperId);
  }

  // --- 8. PRECISE SCROLL TRACKING & RESTORATION ---
  let scrollTrackTimer = null;
  function setupScrollTracking() {
    window.addEventListener('scroll', () => {
      // 1. Reading Progress Bar
      const prog = document.getElementById('reading-progress');
      const winScroll = window.scrollY || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = height > 0 ? Math.min(100, Math.max(0, (winScroll / height) * 100)) : 0;
      if (prog) prog.style.width = scrolled + '%';

      // 2. Throttled Position & History Recording
      clearTimeout(scrollTrackTimer);
      scrollTrackTimer = setTimeout(() => {
        const meta = getPaperMetadata();
        if (!meta.paperId) return;

        // Detect current section title
        let sectionTitle = '';
        const headings = document.querySelectorAll('main section[id] h2, main h2');
        for (const h of headings) {
          const rect = h.getBoundingClientRect();
          if (rect.top <= 200) {
            sectionTitle = h.textContent.trim().replace(/^\d+\.\s*/, '');
          }
        }
        if (!sectionTitle && headings.length > 0) {
          sectionTitle = headings[0].textContent.trim().replace(/^\d+\.\s*/, '');
        }

        const currentPos = {
          paperId: meta.paperId,
          title: meta.title,
          url: meta.url,
          scrollY: Math.round(winScroll),
          scrollPercent: Math.round(scrolled),
          sectionTitle: sectionTitle,
          updatedAt: Date.now()
        };

        localStorage.setItem(LAST_READING_KEY, JSON.stringify(currentPos));
        localStorage.setItem(SCROLL_POS_KEY + meta.paperId, JSON.stringify(currentPos));
      }, 250);
    });
  }

  function restoreScrollPosition() {
    // If URL has explicit hash (e.g. #mekanisme), allow normal hash jumping
    if (window.location.hash && window.location.hash !== '#') return;

    const meta = getPaperMetadata();
    if (!meta.paperId) return;

    const raw = localStorage.getItem(SCROLL_POS_KEY + meta.paperId);
    if (!raw) return;

    try {
      const saved = JSON.parse(raw);
      // Restore if scrolled more than 160px and not 0%
      if (saved.scrollY && saved.scrollY > 160 && saved.scrollPercent > 2) {
        setTimeout(() => {
          window.scrollTo({
            top: saved.scrollY,
            behavior: 'smooth'
          });
          showResumeToast(saved);
        }, 300);
      }
    } catch (e) {
      console.error('Error restoring scroll:', e);
    }
  }

  // --- 9. GLOBAL INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    initPreferences();
    injectHeaderControls();
    injectCompletionCard();
    enhanceLightboxModal();
    initFloatingTOC();
    setupScrollTracking();
    restoreScrollPosition();

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
  });

})();
