/**
 * TelaahSains Hub: Portal Dashboard Experience Controller
 * Features:
 * - Grid View vs Matrix Table View Switcher with localStorage persistence
 * - Tech Tag Filtering (#DFT, #Material2D, #KimiaMedisinal, etc.)
 * - Local Bookmarks / Reading List (⭐ save for later)
 * - Live Search synchronization across Grid & Table
 * - Automatic Theme Sync (Paper, Sepia, Dark Slate)
 */

(function () {
  'use strict';

  const BOOKMARK_KEY = 'telaahsains_bookmarks';
  const VIEW_KEY = 'telaahsains_portal_view';
  const THEME_KEY = 'telaahsains_reader_theme';

  // --- 1. THEME SYNC ---
  function syncTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'paper';
    document.body.classList.remove('theme-sepia', 'theme-dark');
    if (savedTheme === 'sepia') document.body.classList.add('theme-sepia');
    if (savedTheme === 'dark') document.body.classList.add('theme-dark');

    // Update portal theme toggle if present
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
      return JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveBookmarks(bms) {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bms));
    updateBookmarkUI();
  }

  window.toggleBookmark = function (paperId, event) {
    if (event) event.stopPropagation();
    let bms = getBookmarks();
    const idx = bms.indexOf(paperId);
    let isAdded = false;
    if (idx >= 0) {
      bms.splice(idx, 1);
    } else {
      bms.push(paperId);
      isAdded = true;
    }
    saveBookmarks(bms);
    showPortalToast(isAdded ? `Paper #${paperId} ditambahkan ke daftar baca!` : `Paper #${paperId} dihapus dari daftar baca.`);
  };

  function updateBookmarkUI() {
    const bms = getBookmarks();
    const countEl = document.getElementById('bookmark-count');
    if (countEl) countEl.textContent = bms.length;

    // Update star icons across cards and table rows
    document.querySelectorAll('[data-bookmark-btn]').forEach(btn => {
      const pid = btn.getAttribute('data-bookmark-btn');
      const isBookmarked = bms.includes(pid);
      btn.classList.toggle('text-amber-500', isBookmarked);
      btn.classList.toggle('text-zinc-300', !isBookmarked);
      btn.setAttribute('title', isBookmarked ? 'Hapus dari daftar baca' : 'Tandai untuk dibaca nanti');
      btn.innerHTML = isBookmarked
        ? '<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>'
        : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>';
    });
  }

  // --- 3. VIEW MODE (GRID vs TABLE) ---
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

  // --- 4. FILTERING & SEARCH ---
  let currentCategory = 'all';
  let currentTag = 'all';

  window.filterCategory = function (cat) {
    currentCategory = cat;
    // Update category buttons
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

    const items = document.querySelectorAll('[data-paper-item]');
    let visibleCount = 0;

    items.forEach(el => {
      const pid = el.getAttribute('data-paper-id');
      const cat = el.getAttribute('data-category') || '';
      const tags = el.getAttribute('data-tags') || '';
      const keywords = (el.innerText + ' ' + (el.getAttribute('data-keywords') || '')).toLowerCase();

      // Category filter check
      let matchesCat = false;
      if (currentCategory === 'all') {
        matchesCat = true;
      } else if (currentCategory === 'bookmarks') {
        matchesCat = bms.includes(pid);
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
  document.addEventListener('DOMContentLoaded', () => {
    syncTheme();
    updateBookmarkUI();
    const savedView = localStorage.getItem(VIEW_KEY) || 'grid';
    setPortalView(savedView);
  });

})();
