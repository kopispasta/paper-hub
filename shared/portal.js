/**
 * TelaahSains Hub: Portal Dashboard Experience Controller
 * Features:
 * - Grid View vs Matrix Table View Switcher with localStorage persistence
 * - Tech Tag Filtering (#DFT, #Material2D, #KimiaMedisinal, etc.)
 * - Local Bookmarks / Reading List (⭐ save for later)
 * - Read Checklist Tracker (✔️ mark as completed with counter & filter)
 * - Last Reading History Widget (paper title, active section, scroll percentage)
 * - Live Search synchronization across Grid & Table
 * - Automatic Theme Sync (Paper, Sepia, Dark Slate)
 */

(function () {
  'use strict';

  const BOOKMARK_KEY = 'telaahsains_bookmarks';
  const READ_KEY = 'telaahsains_read_papers';
  const LAST_READING_KEY = 'telaahsains_last_reading';
  const VIEW_KEY = 'telaahsains_portal_view';
  const THEME_KEY = 'telaahsains_reader_theme';

  // --- 1. THEME SYNC ---
  function syncTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'paper';
    document.body.classList.remove('theme-sepia', 'theme-dark');
    if (savedTheme === 'sepia') document.body.classList.add('theme-sepia');
    if (savedTheme === 'dark') document.body.classList.add('theme-dark');

    document.querySelectorAll('[data-theme-btn]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-theme-btn') === savedTheme);
    });
  }

  window.setPortalTheme = function (theme) {
    document.body.classList.remove('theme-sepia', 'theme-dark');
    if (theme === 'sepia') document.body.classList.add('theme-sepia');
    if (theme === 'dark') document.body.classList.add('theme-dark');
    localStorage.setItem(THEME_KEY, theme);
    document.querySelectorAll('[data-theme-btn]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-theme-btn') === theme);
    });
  };

  // --- 2. BOOKMARKS / READING LIST ---
  function getBookmarks() {
    try {
      const raw = JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || [];
      return Array.from(new Set(raw.map(id => String(id).padStart(2, '0'))));
    } catch (e) {
      return [];
    }
  }

  function saveBookmarks(bms) {
    const normalized = Array.from(new Set(bms.map(id => String(id).padStart(2, '0'))));
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(normalized));
    updateBookmarkUI();
  }

  window.toggleBookmark = function (paperId, event) {
    if (event) event.stopPropagation();
    const pid = String(paperId).padStart(2, '0');
    let bms = getBookmarks();
    const idx = bms.indexOf(pid);
    let isAdded = false;
    if (idx >= 0) {
      bms.splice(idx, 1);
    } else {
      bms.push(pid);
      isAdded = true;
    }
    saveBookmarks(bms);
    showPortalToast(isAdded ? `Paper #${pid} ditambahkan ke daftar baca ⭐` : `Paper #${pid} dihapus dari daftar baca.`);
    applyAllFilters();
  };

  function updateBookmarkUI() {
    const bms = getBookmarks();
    const countEl = document.getElementById('bookmark-count');
    if (countEl) countEl.textContent = bms.length;

    document.querySelectorAll('[data-bookmark-btn]').forEach(btn => {
      const pid = String(btn.getAttribute('data-bookmark-btn')).padStart(2, '0');
      const isBookmarked = bms.includes(pid);
      btn.classList.toggle('text-amber-500', isBookmarked);
      btn.classList.toggle('text-zinc-300', !isBookmarked);
      btn.setAttribute('title', isBookmarked ? 'Hapus dari daftar baca' : 'Tandai untuk dibaca nanti');
      btn.innerHTML = isBookmarked
        ? '<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>'
        : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>';
    });
  }

  // --- 3. READ CHECKLIST CONTROLLER ---
  function getReadPapers() {
    try {
      const raw = JSON.parse(localStorage.getItem(READ_KEY)) || [];
      return Array.from(new Set(raw.map(id => String(id).padStart(2, '0'))));
    } catch (e) {
      return [];
    }
  }

  function saveReadPapers(arr) {
    const normalized = Array.from(new Set(arr.map(id => String(id).padStart(2, '0'))));
    localStorage.setItem(READ_KEY, JSON.stringify(normalized));
    updateReadUI();
  }

  window.toggleReadStatus = function (paperId, event) {
    if (event) event.stopPropagation();
    const pid = String(paperId).padStart(2, '0');
    let readList = getReadPapers();
    const idx = readList.indexOf(pid);
    let isRead = false;
    if (idx >= 0) {
      readList.splice(idx, 1);
    } else {
      readList.push(pid);
      isRead = true;
    }
    saveReadPapers(readList);
    showPortalToast(isRead ? `Paper #${pid} ditandai: Selesai Dibaca ✓` : `Tanda selesai Paper #${pid} dihapus.`);
    applyAllFilters();
  };

  function updateReadUI() {
    const readList = getReadPapers();
    const countEl = document.getElementById('completed-count');
    if (countEl) countEl.textContent = `${readList.length}/10`;

    document.querySelectorAll('[data-read-btn]').forEach(btn => {
      const pid = String(btn.getAttribute('data-read-btn')).padStart(2, '0');
      const isRead = readList.includes(pid);
      btn.classList.toggle('text-emerald-600', isRead);
      btn.classList.toggle('text-zinc-300', !isRead);
      btn.setAttribute('title', isRead ? 'Batalkan tanda selesai' : 'Tandai sudah selesai dibaca');
      btn.innerHTML = isRead
        ? '<svg class="w-4 h-4 text-emerald-600 fill-current" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>'
        : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    });

    document.querySelectorAll('[data-read-badge]').forEach(badge => {
      const pid = String(badge.getAttribute('data-read-badge')).padStart(2, '0');
      badge.classList.toggle('hidden', !readList.includes(pid));
    });
  }

  // --- 4. LAST READING HISTORY WIDGET ---
  function renderLastReadingWidget() {
    const container = document.getElementById('resume-reading-container');
    if (!container) return;

    const raw = localStorage.getItem(LAST_READING_KEY);
    if (!raw) {
      container.classList.add('hidden');
      return;
    }

    try {
      const last = JSON.parse(raw);
      if (!last || !last.paperId || !last.title) {
        container.classList.add('hidden');
        return;
      }

      const titleEl = document.getElementById('resume-title');
      const timeEl = document.getElementById('resume-time');
      const secEl = document.getElementById('resume-section');
      const pctEl = document.getElementById('resume-percent');
      const barEl = document.getElementById('resume-progress-bar');
      const btnEl = document.getElementById('resume-btn');

      if (titleEl) titleEl.textContent = `Paper #${last.paperId}: ${last.title}`;
      if (secEl) secEl.textContent = last.sectionTitle ? `Bagian: ${last.sectionTitle}` : 'Melanjutkan telaah';
      if (pctEl) pctEl.textContent = `${last.scrollPercent || 0}%`;
      if (barEl) barEl.style.width = `${last.scrollPercent || 0}%`;
      if (btnEl) btnEl.href = last.url || '#';

      if (timeEl && last.updatedAt) {
        timeEl.textContent = formatFriendlyTime(last.updatedAt);
      }

      container.classList.remove('hidden');
    } catch (e) {
      container.classList.add('hidden');
    }
  }

  function formatFriendlyTime(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} menit yang lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam yang lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari yang lalu`;
  }

  // --- 5. VIEW MODE (GRID vs TABLE) ---
  window.setPortalView = function (view) {
    const gridView = document.getElementById('paper-grid-container');
    const tableView = document.getElementById('paper-table-container');
    const btnGrid = document.getElementById('btn-view-grid');
    const btnTable = document.getElementById('btn-view-table');

    if (view === 'table') {
      if (gridView) gridView.classList.add('hidden');
      if (tableView) tableView.classList.remove('hidden');
      if (btnGrid) {
        btnGrid.classList.remove('bg-editorial-ink', 'text-white');
        btnGrid.classList.add('bg-white', 'text-editorial-muted');
      }
      if (btnTable) {
        btnTable.classList.remove('bg-white', 'text-editorial-muted');
        btnTable.classList.add('bg-editorial-ink', 'text-white');
      }
    } else {
      if (gridView) gridView.classList.remove('hidden');
      if (tableView) tableView.classList.add('hidden');
      if (btnTable) {
        btnTable.classList.remove('bg-editorial-ink', 'text-white');
        btnTable.classList.add('bg-white', 'text-editorial-muted');
      }
      if (btnGrid) {
        btnGrid.classList.remove('bg-white', 'text-editorial-muted');
        btnGrid.classList.add('bg-editorial-ink', 'text-white');
      }
    }
    localStorage.setItem(VIEW_KEY, view);
  };

  // --- 6. FILTERING & SEARCH ---
  let currentCategory = 'all';
  let currentTag = 'all';

  window.filterCategory = function (cat) {
    currentCategory = cat;
    document.querySelectorAll('.filter-cat-btn').forEach(btn => {
      btn.classList.remove('bg-editorial-ink', 'text-white');
      btn.classList.add('bg-white', 'text-editorial-muted');
    });
    const activeBtn = document.getElementById('btn-cat-' + cat);
    if (activeBtn) {
      activeBtn.classList.remove('bg-white', 'text-editorial-muted');
      activeBtn.classList.add('bg-editorial-ink', 'text-white');
    }
    applyAllFilters();
  };

  window.filterTag = function (tag) {
    currentTag = tag;
    document.querySelectorAll('.filter-tag-chip').forEach(btn => {
      btn.classList.remove('bg-editorial-accent', 'text-white', 'border-editorial-accent');
      btn.classList.add('bg-zinc-100', 'text-zinc-600', 'border-transparent');
    });
    const activeBtn = document.getElementById('tag-chip-' + tag.replace('#', '').toLowerCase());
    if (activeBtn) {
      activeBtn.classList.remove('bg-zinc-100', 'text-zinc-600', 'border-transparent');
      activeBtn.classList.add('bg-editorial-accent', 'text-white', 'border-editorial-accent');
    }
    applyAllFilters();
  };

  window.liveSearch = function () {
    applyAllFilters();
  };

  function applyAllFilters() {
    const searchVal = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    const bms = getBookmarks();
    const readList = getReadPapers();

    const items = document.querySelectorAll('[data-paper-item]');
    let visibleCount = 0;

    items.forEach(el => {
      const rawPid = el.getAttribute('data-paper-id');
      const pid = rawPid ? String(rawPid).padStart(2, '0') : '';
      const cat = el.getAttribute('data-category') || '';
      const tags = el.getAttribute('data-tags') || '';
      const keywords = (el.innerText + ' ' + (el.getAttribute('data-keywords') || '')).toLowerCase();

      // Category filter check
      let matchesCat = false;
      if (currentCategory === 'all') {
        matchesCat = true;
      } else if (currentCategory === 'bookmarks') {
        matchesCat = bms.includes(pid);
      } else if (currentCategory === 'completed') {
        matchesCat = readList.includes(pid);
      } else if (currentCategory === 'unread') {
        matchesCat = !readList.includes(pid);
      } else {
        matchesCat = cat.includes(currentCategory);
      }

      // Tag filter check
      let matchesTag = (currentTag === 'all' || tags.toLowerCase().includes(currentTag.toLowerCase()));

      // Search text check
      let matchesSearch = (!searchVal || keywords.includes(searchVal));

      if (matchesCat && matchesTag && matchesSearch) {
        el.classList.remove('hidden');
        visibleCount++;
      } else {
        el.classList.add('hidden');
      }
    });

    const emptyNotice = document.getElementById('empty-search-notice');
    if (emptyNotice) {
      emptyNotice.classList.toggle('hidden', visibleCount > 0);
    }
  }

  // Toast
  let toastTimer = null;
  function showPortalToast(msg) {
    let t = document.getElementById('portal-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'portal-toast';
      t.className = 'reader-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // Initialize
  function initPortal() {
    syncTheme();
    updateBookmarkUI();
    updateReadUI();
    renderLastReadingWidget();
    const savedView = localStorage.getItem(VIEW_KEY) || 'grid';
    setPortalView(savedView);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortal);
  } else {
    initPortal();
  }

  // Cross-tab and window storage synchronization
  window.addEventListener('storage', (e) => {
    if (e.key === READ_KEY) {
      updateReadUI();
      applyAllFilters();
    } else if (e.key === BOOKMARK_KEY) {
      updateBookmarkUI();
      applyAllFilters();
    } else if (e.key === LAST_READING_KEY) {
      renderLastReadingWidget();
    } else if (e.key === THEME_KEY) {
      syncTheme();
    }
  });

  // Browser bfcache navigation (Back / Forward button)
  window.addEventListener('pageshow', () => {
    syncTheme();
    updateBookmarkUI();
    updateReadUI();
    renderLastReadingWidget();
    applyAllFilters();
  });

  // Tab switching visibility
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      syncTheme();
      updateBookmarkUI();
      updateReadUI();
      renderLastReadingWidget();
      applyAllFilters();
    }
  });

})();
