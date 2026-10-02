/**
 * TelaahSains Hub: Portal Dashboard Experience Controller
 * Features:
 * - Cross-Origin file:// & HTTP Dual-Channel Session Synchronization (window.name + URL state)
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
  const FONT_SIZE_KEY = 'telaahsains_font_size';
  const SYNC_TIME_KEY = 'telaahsains_sync_time';
  const SYNC_PREFIX = 'TS_SYNC::';

  // --- 0. CROSS-ORIGIN file:// & HTTP SYNC ENGINE ---
  function getSessionSync() {
    try {
      if (window.name && window.name.startsWith(SYNC_PREFIX)) {
        return JSON.parse(window.name.slice(SYNC_PREFIX.length));
      }
    } catch (e) {}
    return null;
  }

  function setSessionSync(data) {
    try {
      const current = getSessionSync() || {};
      const merged = { ...current, ...data };
      window.name = SYNC_PREFIX + JSON.stringify(merged);
    } catch (e) {}
  }

  function getUrlSync() {
    try {
      const params = new URLSearchParams(window.location.search);
      const data = {};

      if (params.has('sync') || params.has('sync_data')) {
        const raw = params.get('sync') || params.get('sync_data');
        let parsed = null;
        try {
          parsed = JSON.parse(decodeURIComponent(escape(atob(raw))));
        } catch (e1) {
          try {
            parsed = JSON.parse(decodeURIComponent(raw));
          } catch (e2) {}
        }
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.read || parsed.readPapers)) {
            data.readPapers = (parsed.read || parsed.readPapers).map(id => String(id).padStart(2, '0'));
          }
          if (Array.isArray(parsed.bms || parsed.bookmarks)) {
            data.bookmarks = (parsed.bms || parsed.bookmarks).map(id => String(id).padStart(2, '0'));
          }
          if (parsed.notes && typeof parsed.notes === 'object') {
            data.notes = parsed.notes;
          }
          if (parsed.theme) data.theme = parsed.theme;
          if (parsed.size || parsed.fontSize) data.fontSize = parsed.size || parsed.fontSize;
          if (parsed.last || parsed.lastReading) data.lastReading = parsed.last || parsed.lastReading;
          data.updatedAt = parsed.ts || parsed.updatedAt || Date.now();
          data._fromSyncUrl = true;
        }
      }

      if (params.has('ts_read')) {
        data.readPapers = params.get('ts_read').split(',').filter(Boolean).map(id => String(id).padStart(2, '0'));
      }
      if (params.has('ts_bms')) {
        data.bookmarks = params.get('ts_bms').split(',').filter(Boolean).map(id => String(id).padStart(2, '0'));
      }
      if (params.has('ts_theme')) {
        data.theme = params.get('ts_theme');
      }
      if (params.has('ts_size')) {
        data.fontSize = params.get('ts_size');
      }
      if (params.has('ts_time')) {
        data.updatedAt = parseInt(params.get('ts_time'), 10) || 0;
      }
      return Object.keys(data).length > 0 ? data : null;
    } catch (e) {
      return null;
    }
  }

  function cleanSyncUrlParams() {
    try {
      if (!window.location.search) return;
      const params = new URLSearchParams(window.location.search);
      let changed = false;
      ['ts_read', 'ts_bms', 'ts_theme', 'ts_size', 'ts_time', 'ts_last', 'sync', 'sync_data'].forEach(k => {
        if (params.has(k)) {
          params.delete(k);
          changed = true;
        }
      });
      if (changed) {
        const newSearch = params.toString() ? '?' + params.toString() : '';
        const newUrl = window.location.pathname + newSearch + window.location.hash;
        window.history.replaceState(null, '', newUrl);
      }
    } catch (e) {}
  }

  function getAllPapersNotes() {
    const res = {};
    for (let i = 1; i <= 10; i++) {
      const pid = String(i).padStart(2, '0');
      const n = localStorage.getItem('telaahsains_notes_' + pid);
      if (n) {
        try {
          const arr = JSON.parse(n);
          if (Array.isArray(arr) && arr.length > 0) res[pid] = arr;
        } catch (e) {}
      }
    }
    return res;
  }

  function pushLocalToSession(customTime) {
    try {
      let localRead = [];
      try { localRead = JSON.parse(localStorage.getItem(READ_KEY)) || []; } catch (e) {}
      let localBms = [];
      try { localBms = JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || []; } catch (e) {}
      let localLast = null;
      try { localLast = JSON.parse(localStorage.getItem(LAST_READING_KEY)); } catch (e) {}
      const localTheme = localStorage.getItem(THEME_KEY) || 'paper';
      const localSize = localStorage.getItem(FONT_SIZE_KEY) || 'md';
      const time = customTime || parseInt(localStorage.getItem(SYNC_TIME_KEY) || '0', 10) || Date.now();

      setSessionSync({
        ts_sync: true,
        readPapers: localRead.map(id => String(id).padStart(2, '0')),
        bookmarks: localBms.map(id => String(id).padStart(2, '0')),
        lastReading: localLast,
        notes: getAllPapersNotes(),
        theme: localTheme,
        fontSize: localSize,
        updatedAt: time
      });
    } catch (e) {}
  }

  function reconcileSyncState() {
    const session = getSessionSync();
    const urlSync = getUrlSync();
    const localTime = parseInt(localStorage.getItem(SYNC_TIME_KEY) || '0', 10);

    let incoming = null;
    let incomingTime = 0;

    if (session && session.updatedAt && session.updatedAt > incomingTime) {
      incoming = session;
      incomingTime = session.updatedAt;
    }
    if (urlSync && urlSync.updatedAt && urlSync.updatedAt >= incomingTime) {
      incoming = { ...(incoming || {}), ...urlSync };
      incomingTime = urlSync.updatedAt;
    }

    if (incoming) {
      if (incomingTime > localTime || incoming._fromSyncUrl) {
        if (Array.isArray(incoming.readPapers)) {
          const normalized = Array.from(new Set(incoming.readPapers.map(id => String(id).padStart(2, '0'))));
          localStorage.setItem(READ_KEY, JSON.stringify(normalized));
        }
        if (Array.isArray(incoming.bookmarks)) {
          const normalized = Array.from(new Set(incoming.bookmarks.map(id => String(id).padStart(2, '0'))));
          localStorage.setItem(BOOKMARK_KEY, JSON.stringify(normalized));
        }
        if (incoming.notes && typeof incoming.notes === 'object') {
          Object.keys(incoming.notes).forEach(pid => {
            const normPid = String(pid).padStart(2, '0');
            const incNotes = incoming.notes[pid];
            if (Array.isArray(incNotes)) {
              let cur = [];
              try { cur = JSON.parse(localStorage.getItem('telaahsains_notes_' + normPid)) || []; } catch (e) {}
              const curIds = new Set(cur.map(n => n.id));
              const merged = [...cur];
              incNotes.forEach(inN => {
                if (!curIds.has(inN.id)) merged.push(inN);
              });
              localStorage.setItem('telaahsains_notes_' + normPid, JSON.stringify(merged));
            }
          });
        }
        if (incoming.theme) localStorage.setItem(THEME_KEY, incoming.theme);
        if (incoming.fontSize) localStorage.setItem(FONT_SIZE_KEY, incoming.fontSize);
        if (incoming.lastReading && typeof incoming.lastReading === 'object') {
          localStorage.setItem(LAST_READING_KEY, JSON.stringify(incoming.lastReading));
        }
        const effectiveTime = Math.max(incomingTime, Date.now());
        localStorage.setItem(SYNC_TIME_KEY, String(effectiveTime));
        pushLocalToSession(effectiveTime);
        if (incoming._fromSyncUrl) {
          setTimeout(() => {
            showPortalToast('Progres bacaan berhasil disinkronkan dari perangkat lain!');
          }, 350);
        }
      } else if (localTime === 0 && incomingTime === 0) {
        let localRead = [];
        try { localRead = JSON.parse(localStorage.getItem(READ_KEY)) || []; } catch (e) {}
        const incRead = Array.isArray(incoming.readPapers) ? incoming.readPapers : [];
        const mergedRead = Array.from(new Set([...localRead, ...incRead].map(id => String(id).padStart(2, '0'))));

        let localBms = [];
        try { localBms = JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || []; } catch (e) {}
        const incBms = Array.isArray(incoming.bookmarks) ? incoming.bookmarks : [];
        const mergedBms = Array.from(new Set([...localBms, ...incBms].map(id => String(id).padStart(2, '0'))));

        const now = Date.now();
        localStorage.setItem(READ_KEY, JSON.stringify(mergedRead));
        localStorage.setItem(BOOKMARK_KEY, JSON.stringify(mergedBms));
        if (incoming.theme) localStorage.setItem(THEME_KEY, incoming.theme);
        if (incoming.fontSize) localStorage.setItem(FONT_SIZE_KEY, incoming.fontSize);
        localStorage.setItem(SYNC_TIME_KEY, String(now));
        pushLocalToSession(now);
      } else {
        pushLocalToSession(localTime);
      }
    } else {
      pushLocalToSession(localTime || Date.now());
    }

    if (urlSync) {
      cleanSyncUrlParams();
    }
  }

  function updateOutgoingLinks() {
    try {
      const readList = getReadPapers();
      const bms = getBookmarks();
      const theme = localStorage.getItem(THEME_KEY) || 'paper';
      const syncTime = localStorage.getItem(SYNC_TIME_KEY) || String(Date.now());

      const queryParts = [];
      if (readList.length > 0) queryParts.push('ts_read=' + encodeURIComponent(readList.join(',')));
      if (bms.length > 0) queryParts.push('ts_bms=' + encodeURIComponent(bms.join(',')));
      if (theme) queryParts.push('ts_theme=' + encodeURIComponent(theme));
      queryParts.push('ts_time=' + encodeURIComponent(syncTime));
      const queryString = '?' + queryParts.join('&');

      document.querySelectorAll('a[href*="papers/"]').forEach(a => {
        const rawHref = a.getAttribute('href');
        if (!rawHref) return;
        const baseHref = rawHref.split('?')[0].split('#')[0];
        const hash = rawHref.includes('#') ? '#' + rawHref.split('#')[1] : '';
        a.href = baseHref + queryString + hash;
      });
    } catch (e) {}
  }

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

  function setPortalTheme(theme) {
    document.body.classList.remove('theme-sepia', 'theme-dark');
    if (theme === 'sepia') document.body.classList.add('theme-sepia');
    if (theme === 'dark') document.body.classList.add('theme-dark');
    const now = Date.now();
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(SYNC_TIME_KEY, String(now));
    pushLocalToSession(now);
    document.querySelectorAll('[data-theme-btn]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-theme-btn') === theme);
    });
    updateOutgoingLinks();
  }
  window.setPortalTheme = setPortalTheme;

  // --- 2. BOOKMARKS / READING LIST ---
  function getBookmarks() {
    try {
      const raw = JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || [];
      return Array.from(new Set(raw.map(id => String(id).padStart(2, '0'))));
    } catch (e) {
      return [];
    }
  }

  function saveBookmarks(bms, customTime) {
    const normalized = Array.from(new Set(bms.map(id => String(id).padStart(2, '0'))));
    const now = customTime || Date.now();
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(normalized));
    localStorage.setItem(SYNC_TIME_KEY, String(now));
    pushLocalToSession(now);
    updateBookmarkUI();
    updateOutgoingLinks();
  }

  function toggleBookmark(paperId, event) {
    if (event) event.stopPropagation();
    reconcileSyncState();
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
    const now = Date.now();
    saveBookmarks(bms, now);
    showPortalToast(isAdded ? `Paper #${pid} ditambahkan ke daftar baca ⭐` : `Paper #${pid} dihapus dari daftar baca.`);
    applyAllFilters();
  }
  window.toggleBookmark = toggleBookmark;

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

  function saveReadPapers(arr, customTime) {
    const normalized = Array.from(new Set(arr.map(id => String(id).padStart(2, '0'))));
    const now = customTime || Date.now();
    localStorage.setItem(READ_KEY, JSON.stringify(normalized));
    localStorage.setItem(SYNC_TIME_KEY, String(now));
    pushLocalToSession(now);
    updateReadUI();
    updateOutgoingLinks();
  }

  function toggleReadStatus(paperId, event) {
    if (event) event.stopPropagation();
    reconcileSyncState();
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
    const now = Date.now();
    saveReadPapers(readList, now);
    showPortalToast(isRead ? `Paper #${pid} ditandai: Selesai Dibaca ✓` : `Tanda selesai Paper #${pid} dihapus.`);
    applyAllFilters();
  }
  window.toggleReadStatus = toggleReadStatus;

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
  function setPortalView(view) {
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
  }
  window.setPortalView = setPortalView;

  // --- 6. FILTERING & SEARCH ---
  let currentCategory = 'all';
  let currentTag = 'all';

  function filterCategory(cat) {
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
  }
  window.filterCategory = filterCategory;

  function filterTag(tag) {
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
  }
  window.filterTag = filterTag;

  function liveSearch() {
    applyAllFilters();
  }
  window.liveSearch = liveSearch;

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

  // --- 8. CROSS-DEVICE PROGRESS SYNC MODAL & UTILITIES ---
  function getSyncPayload() {
    let readPapers = [];
    try { readPapers = JSON.parse(localStorage.getItem(READ_KEY)) || []; } catch (e) {}
    let bookmarks = [];
    try { bookmarks = JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || []; } catch (e) {}
    let lastReading = null;
    try { lastReading = JSON.parse(localStorage.getItem(LAST_READING_KEY)); } catch (e) {}
    const theme = localStorage.getItem(THEME_KEY) || 'paper';
    const fontSize = localStorage.getItem(FONT_SIZE_KEY) || 'md';
    const updatedAt = parseInt(localStorage.getItem(SYNC_TIME_KEY) || '0', 10) || Date.now();

    return {
      read: readPapers.map(id => String(id).padStart(2, '0')),
      bms: bookmarks.map(id => String(id).padStart(2, '0')),
      last: lastReading,
      notes: getAllPapersNotes(),
      theme: theme,
      size: fontSize,
      ts: updatedAt
    };
  }

  function getSyncUrl() {
    const payload = getSyncPayload();
    payload.ts = Date.now();
    const jsonStr = JSON.stringify(payload);
    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
    const baseUrl = window.location.origin + window.location.pathname;
    return baseUrl + '?sync=' + encodeURIComponent(b64);
  }

  function openSyncModal() {
    const modal = document.getElementById('sync-modal');
    if (!modal) return;

    // Update stats in modal
    const readList = getReadPapers();
    const bms = getBookmarks();
    const readEl = document.getElementById('sync-status-read');
    if (readEl) readEl.textContent = readList.length + ' paper';
    const bmsEl = document.getElementById('sync-status-bms');
    if (bmsEl) bmsEl.textContent = bms.length + ' paper';

    const allNotes = getAllPapersNotes();
    let totalNotes = 0;
    let papersWithNotes = 0;
    Object.keys(allNotes).forEach(k => {
      if (allNotes[k].length > 0) {
        totalNotes += allNotes[k].length;
        papersWithNotes++;
      }
    });
    const notesEl = document.getElementById('sync-status-notes');
    if (notesEl) notesEl.textContent = `${totalNotes} catatan (${papersWithNotes} paper)`;

    // Populate URL input
    const syncUrl = getSyncUrl();
    const urlInput = document.getElementById('sync-url-input');
    if (urlInput) urlInput.value = syncUrl;

    // Reset copy button
    const copyText = document.getElementById('copy-sync-text');
    if (copyText) copyText.textContent = 'Salin Tautan';

    // Update QR Code
    const qrImg = document.getElementById('sync-qr-img');
    if (qrImg) {
      qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(syncUrl);
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  window.openSyncModal = openSyncModal;

  function closeSyncModal() {
    const modal = document.getElementById('sync-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
  window.closeSyncModal = closeSyncModal;

  function toggleSyncQr() {
    const container = document.getElementById('sync-qr-container');
    const label = document.getElementById('qr-toggle-label');
    if (!container) return;
    const isHidden = container.classList.contains('hidden');
    container.classList.toggle('hidden');
    if (label) {
      label.textContent = isHidden ? '✕ Sembunyikan QR Code' : '📷 Tampilkan QR Code untuk Kamera HP';
    }
  }
  window.toggleSyncQr = toggleSyncQr;

  function copySyncUrl() {
    const urlInput = document.getElementById('sync-url-input');
    const copyText = document.getElementById('copy-sync-text');
    if (!urlInput) return;
    const url = urlInput.value;

    function onCopied() {
      if (copyText) copyText.textContent = 'Tersalin!';
      showPortalToast('Tautan sinkronisasi disalin ke clipboard!');
      setTimeout(() => { if (copyText) copyText.textContent = 'Salin Tautan'; }, 2500);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(onCopied).catch(() => {
        urlInput.select();
        document.execCommand('copy');
        onCopied();
      });
    } else {
      urlInput.select();
      document.execCommand('copy');
      onCopied();
    }
  }
  window.copySyncUrl = copySyncUrl;

  function exportSyncFile() {
    try {
      const payload = getSyncPayload();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'telaahsains-progres-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showPortalToast('Berkas cadangan berhasil diunduh!');
    } catch (e) {
      showPortalToast('Gagal mengekspor berkas: ' + e.message);
    }
  }
  window.exportSyncFile = exportSyncFile;

  function importSyncFile(input) {
    if (!input || !input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);
        applyImportedData(parsed);
        showPortalToast('Progres berhasil diimpor!');
        closeSyncModal();
      } catch (err) {
        showPortalToast('Format berkas tidak valid!');
      }
      input.value = '';
    };
    reader.readAsText(file);
  }
  window.importSyncFile = importSyncFile;

  function applyImportedData(data) {
    if (!data || typeof data !== 'object') return;
    const now = Date.now();
    if (Array.isArray(data.read || data.readPapers)) {
      const readList = Array.from(new Set((data.read || data.readPapers).map(id => String(id).padStart(2, '0'))));
      localStorage.setItem(READ_KEY, JSON.stringify(readList));
    }
    if (Array.isArray(data.bms || data.bookmarks)) {
      const bmsList = Array.from(new Set((data.bms || data.bookmarks).map(id => String(id).padStart(2, '0'))));
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bmsList));
    }
    if (data.notes && typeof data.notes === 'object') {
      Object.keys(data.notes).forEach(pid => {
        const normPid = String(pid).padStart(2, '0');
        const incNotes = data.notes[pid];
        if (Array.isArray(incNotes)) {
          let cur = [];
          try { cur = JSON.parse(localStorage.getItem('telaahsains_notes_' + normPid)) || []; } catch (e) {}
          const curIds = new Set(cur.map(n => n.id));
          const merged = [...cur];
          incNotes.forEach(inN => {
            if (!curIds.has(inN.id)) merged.push(inN);
          });
          localStorage.setItem('telaahsains_notes_' + normPid, JSON.stringify(merged));
        }
      });
    }
    if (data.theme) localStorage.setItem(THEME_KEY, data.theme);
    if (data.size || data.fontSize) localStorage.setItem(FONT_SIZE_KEY, data.size || data.fontSize);
    if (data.last || data.lastReading) {
      localStorage.setItem(LAST_READING_KEY, JSON.stringify(data.last || data.lastReading));
    }
    localStorage.setItem(SYNC_TIME_KEY, String(now));
    pushLocalToSession(now);

    updateReadUI();
    updateBookmarkUI();
    updateNotesUI();
    renderLastReadingWidget();
    syncTheme();
    applyAllFilters();
    updateOutgoingLinks();
  }

  function resetSyncData() {
    if (!confirm('Apakah Anda yakin ingin menghapus semua histori bacaan, catatan, dan bookmark di perangkat ini?')) return;
    localStorage.removeItem(READ_KEY);
    localStorage.removeItem(BOOKMARK_KEY);
    localStorage.removeItem(LAST_READING_KEY);
    for (let i = 1; i <= 10; i++) {
      localStorage.removeItem('telaahsains_notes_' + String(i).padStart(2, '0'));
    }
    const now = Date.now();
    localStorage.setItem(SYNC_TIME_KEY, String(now));
    pushLocalToSession(now);

    updateReadUI();
    updateBookmarkUI();
    updateNotesUI();
    renderLastReadingWidget();
    applyAllFilters();
    updateOutgoingLinks();
    closeSyncModal();
    showPortalToast('Data lokal berhasil direset.');
  }
  window.resetSyncData = resetSyncData;

  function updateNotesUI() {
    document.querySelectorAll('[data-paper-id]').forEach(el => {
      const pid = String(el.getAttribute('data-paper-id') || '').padStart(2, '0');
      let notes = [];
      try { notes = JSON.parse(localStorage.getItem('telaahsains_notes_' + pid)) || []; } catch (e) {}
      
      let badge = el.querySelector('.paper-notes-indicator');
      if (notes.length > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'paper-notes-indicator inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded';
          const metaContainer = el.querySelector('.flex.items-center.gap-2, .paper-meta-row');
          if (metaContainer) {
            metaContainer.appendChild(badge);
          } else {
            el.appendChild(badge);
          }
        }
        badge.innerHTML = `📝 ${notes.length} catatan`;
        badge.classList.remove('hidden');
      } else if (badge) {
        badge.classList.add('hidden');
      }
    });
  }

  // Modal event listeners (Escape & outside click)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSyncModal();
  });
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('sync-modal');
    if (modal && !modal.classList.contains('hidden') && e.target === modal) {
      closeSyncModal();
    }
  });

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
    reconcileSyncState();
    syncTheme();
    updateBookmarkUI();
    updateReadUI();
    updateNotesUI();
    renderLastReadingWidget();
    updateOutgoingLinks();
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
    if (e.key === READ_KEY || e.key === BOOKMARK_KEY || e.key === THEME_KEY || e.key === LAST_READING_KEY || e.key === SYNC_TIME_KEY || (e.key && e.key.startsWith('telaahsains_notes_'))) {
      reconcileSyncState();
      updateReadUI();
      updateBookmarkUI();
      updateNotesUI();
      renderLastReadingWidget();
      syncTheme();
      applyAllFilters();
      updateOutgoingLinks();
    }
  });

  // Browser bfcache navigation (Back / Forward button)
  window.addEventListener('pageshow', () => {
    reconcileSyncState();
    syncTheme();
    updateBookmarkUI();
    updateReadUI();
    updateNotesUI();
    renderLastReadingWidget();
    applyAllFilters();
    updateOutgoingLinks();
  });

  // Tab switching visibility
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      reconcileSyncState();
      syncTheme();
      updateBookmarkUI();
      updateReadUI();
      updateNotesUI();
      renderLastReadingWidget();
      applyAllFilters();
      updateOutgoingLinks();
    }
  });

  // Outgoing navigation click
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="papers/"]');
    if (link) {
      pushLocalToSession();
      updateOutgoingLinks();
    }
  });

})();
