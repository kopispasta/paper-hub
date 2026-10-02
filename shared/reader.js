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
  const BOOKMARK_KEY = 'telaahsains_bookmarks';
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
      try { localRead = JSON.parse(localStorage.getItem(READ_PAPERS_KEY)) || []; } catch (e) {}
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
          localStorage.setItem(READ_PAPERS_KEY, JSON.stringify(normalized));
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
            showToast('Progres berhasil disinkronkan!');
          }, 350);
        }
      } else if (localTime === 0 && incomingTime === 0) {
        let localRead = [];
        try { localRead = JSON.parse(localStorage.getItem(READ_PAPERS_KEY)) || []; } catch (e) {}
        const incRead = Array.isArray(incoming.readPapers) ? incoming.readPapers : [];
        const mergedRead = Array.from(new Set([...localRead, ...incRead].map(id => String(id).padStart(2, '0'))));

        let localBms = [];
        try { localBms = JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || []; } catch (e) {}
        const incBms = Array.isArray(incoming.bookmarks) ? incoming.bookmarks : [];
        const mergedBms = Array.from(new Set([...localBms, ...incBms].map(id => String(id).padStart(2, '0'))));

        const now = Date.now();
        localStorage.setItem(READ_PAPERS_KEY, JSON.stringify(mergedRead));
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

  function updatePortalLinks() {
    try {
      const readList = getReadPapers();
      const theme = localStorage.getItem(THEME_KEY) || 'paper';
      const size = localStorage.getItem(FONT_SIZE_KEY) || 'md';
      const syncTime = localStorage.getItem(SYNC_TIME_KEY) || String(Date.now());

      const queryParts = [];
      if (readList.length > 0) queryParts.push('ts_read=' + encodeURIComponent(readList.join(',')));
      if (theme) queryParts.push('ts_theme=' + encodeURIComponent(theme));
      if (size) queryParts.push('ts_size=' + encodeURIComponent(size));
      queryParts.push('ts_time=' + encodeURIComponent(syncTime));
      const queryString = '?' + queryParts.join('&');

      document.querySelectorAll('a[href*="index.html"]').forEach(a => {
        const rawHref = a.getAttribute('href');
        if (!rawHref) return;
        const baseHref = rawHref.split('?')[0].split('#')[0];
        const hash = rawHref.includes('#') ? '#' + rawHref.split('#')[1] : '';
        a.href = baseHref + queryString + hash;
      });
    } catch (e) {}
  }

  // --- 0. EXTRACT PAPER METADATA ---
  function getPaperMetadata() {
    let paperId = document.body.getAttribute('data-paper-id') || '';

    if (!paperId) {
      const path = window.location.pathname;
      const matchId = path.match(/(?:papers\/)?(\d{1,2})-[^/]+/);
      if (matchId) paperId = matchId[1];
    }

    if (!paperId) {
      const headerMono = document.querySelector('header span.font-mono')?.textContent || '';
      const m = headerMono.match(/#(\d{1,2})/);
      if (m) paperId = m[1];
    }

    paperId = paperId ? String(paperId).padStart(2, '0') : '';

    const titleEl = document.querySelector('h1');
    const title = titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : document.title;

    let relativeUrl = '';
    const path = window.location.pathname;
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

  function setTheme(theme, save = true) {
    document.body.classList.remove('theme-sepia', 'theme-dark');
    if (theme === 'sepia') document.body.classList.add('theme-sepia');
    if (theme === 'dark') document.body.classList.add('theme-dark');

    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme-btn') === theme);
    });

    if (save) {
      const now = Date.now();
      localStorage.setItem(THEME_KEY, theme);
      localStorage.setItem(SYNC_TIME_KEY, String(now));
      pushLocalToSession(now);
      updatePortalLinks();
      showToast(`Tema diubah: ${theme === 'dark' ? 'Dark Slate' : theme === 'sepia' ? 'Sepia Hangat' : 'Kertas (Siang)'}`);
    }
  }
  window.setTheme = setTheme;

  function setFontSize(size, save = true) {
    document.body.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    document.body.classList.add(`font-size-${size}`);

    document.querySelectorAll('[data-size-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-size-btn') === size);
    });

    if (save) {
      const now = Date.now();
      localStorage.setItem(FONT_SIZE_KEY, size);
      localStorage.setItem(SYNC_TIME_KEY, String(now));
      pushLocalToSession(now);
      updatePortalLinks();
      showToast(`Ukuran teks: ${size === 'sm' ? 'Kompak (16px)' : size === 'lg' ? 'Besar (20px)' : 'Standar (18px)'}`);
    }
  }
  window.setFontSize = setFontSize;

  // --- 2. TOAST NOTIFICATIONS ---
  let toastTimer = null;
  function showToast(message) {
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
  }
  window.showToast = showToast;

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
    if (document.querySelector('aside.lg\\:col-span-4')) return;
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

  // --- 4B. FLOATING READER NOTES CONTROLLER (Left Gutter & Mobile Drawer) ---
  // --- 4. READER NOTES (OFF-CANVAS DRAWER & GENERAL NOTES) ---
  const NOTES_PREFIX = 'telaahsains_notes_';

  function getPaperNotes(paperId) {
    if (!paperId) return [];
    try {
      return JSON.parse(localStorage.getItem(NOTES_PREFIX + paperId)) || [];
    } catch (e) {
      return [];
    }
  }

  function savePaperNotes(paperId, notes) {
    if (!paperId) return;
    localStorage.setItem(NOTES_PREFIX + paperId, JSON.stringify(notes));
    const now = Date.now();
    localStorage.setItem(SYNC_TIME_KEY, String(now));
    pushLocalToSession(now);
    updateNotesBadge(paperId);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatNoteTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const dateStr = `${d.getDate()} ${months[d.getMonth()]}`;
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${dateStr}, ${hours}:${mins}`;
  }

  function renderNotesList(paperId) {
    const container = document.getElementById('notes-list-container');
    if (!container) return;
    const notes = getPaperNotes(paperId);

    const countAll = notes.length;
    const countDone = notes.filter(n => n.done).length;

    const badgeEl = document.getElementById('notes-count-badge');
    if (badgeEl) badgeEl.textContent = `${countAll} item`;

    const sumEl = document.getElementById('notes-summary-text');
    if (sumEl) sumEl.textContent = `${countAll} catatan (${countDone} selesai)`;

    if (notes.length === 0) {
      container.innerHTML = `
        <div class="notes-empty-state">
          <div style="font-size: 1.6rem; margin-bottom: 0.4rem;">📝</div>
          <p style="font-weight: 600; color: var(--text-heading); margin-bottom: 0.25rem;">Belum ada catatan</p>
          <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">Tuliskan poin penting, kutipan, atau hal yang perlu dipelajari lebih lanjut di kolom atas.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = notes.map(note => {
      const completedClass = note.done ? 'is-completed' : '';
      const timeStr = formatNoteTime(note.createdAt);
      const safeText = escapeHtml(note.text);
      const searchQuery = encodeURIComponent(note.text);

      return `
        <div class="notes-card ${completedClass}" data-note-id="${note.id}">
          <div class="notes-card-header">
            <span class="notes-card-time">${timeStr}</span>
            <button type="button" onclick="deletePaperNote('${note.id}')" class="notes-card-del-btn" title="Hapus catatan">✕</button>
          </div>
          <div class="notes-card-text">${safeText}</div>
          <div class="notes-card-footer">
            <label class="notes-check-label">
              <input type="checkbox" ${note.done ? 'checked' : ''} onchange="togglePaperNoteDone('${note.id}')">
              <span>${note.done ? 'Selesai' : 'Tandai selesai'}</span>
            </label>
            <a href="https://www.google.com/search?q=${searchQuery}" target="_blank" rel="noopener noreferrer" class="notes-search-btn" title="Cari topik ini di Google">
              <span>🔍 Cari</span>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  function updateNotesBadge(paperId) {
    const notes = getPaperNotes(paperId);
    const count = notes.length;
    const headerBadge = document.getElementById('header-notes-badge');
    if (headerBadge) {
      headerBadge.textContent = count;
      headerBadge.classList.toggle('hidden', count === 0);
    }
    const edgeBadge = document.getElementById('floating-notes-badge');
    if (edgeBadge) {
      edgeBadge.textContent = count;
    }
    const countBadge = document.getElementById('notes-count-badge');
    if (countBadge) {
      countBadge.textContent = `${count} item`;
    }
  }

  function submitNewNote() {
    const meta = getPaperMetadata();
    if (!meta.paperId) return;
    const input = document.getElementById('note-input-text');
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
      input.focus();
      return;
    }

    const notes = getPaperNotes(meta.paperId);
    const newNote = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      text: text,
      done: false,
      createdAt: Date.now()
    };

    notes.unshift(newNote);
    savePaperNotes(meta.paperId, notes);
    input.value = '';
    renderNotesList(meta.paperId);
    showToast('Catatan berhasil ditambahkan!');
  }
  window.submitNewNote = submitNewNote;

  function togglePaperNoteDone(noteId) {
    const meta = getPaperMetadata();
    if (!meta.paperId) return;
    const notes = getPaperNotes(meta.paperId);
    const note = notes.find(n => n.id === noteId);
    if (note) {
      note.done = !note.done;
      savePaperNotes(meta.paperId, notes);
      renderNotesList(meta.paperId);
      if (note.done) {
        showToast('Catatan ditandai selesai!');
      }
    }
  }
  window.togglePaperNoteDone = togglePaperNoteDone;

  function deletePaperNote(noteId) {
    const meta = getPaperMetadata();
    if (!meta.paperId) return;
    const notes = getPaperNotes(meta.paperId);
    const remaining = notes.filter(n => n.id !== noteId);
    savePaperNotes(meta.paperId, remaining);
    renderNotesList(meta.paperId);
    showToast('Catatan dihapus.');
  }
  window.deletePaperNote = deletePaperNote;

  function clearCompletedNotes() {
    const meta = getPaperMetadata();
    if (!meta.paperId) return;
    const notes = getPaperNotes(meta.paperId);
    const active = notes.filter(n => !n.done);
    if (active.length === notes.length) {
      showToast('Tidak ada catatan yang ditandai selesai.');
      return;
    }
    if (confirm('Hapus semua catatan yang sudah ditandai selesai di paper ini?')) {
      savePaperNotes(meta.paperId, active);
      renderNotesList(meta.paperId);
      showToast('Catatan selesai dibersihkan.');
    }
  }
  window.clearCompletedNotes = clearCompletedNotes;

  function copyPaperNotesMarkdown() {
    const meta = getPaperMetadata();
    if (!meta.paperId) return;
    const notes = getPaperNotes(meta.paperId);
    if (notes.length === 0) {
      showToast('Belum ada catatan untuk disalin.');
      return;
    }

    const lines = [];
    lines.push(`### Catatan Pembaca: Paper #${meta.paperId} - ${meta.title}`);
    lines.push(`*Dicatat via TelaahSains Hub (${new Date().toLocaleDateString('id-ID')})*\n`);

    notes.forEach(n => {
      lines.push(`- ${n.done ? '[x]' : '[ ]'} ${n.text}`);
    });

    const md = lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(md).then(() => {
        showToast('Catatan tersalin dalam format Markdown!');
      }).catch(() => fallbackCopyNotes(md));
    } else {
      fallbackCopyNotes(md);
    }

    function fallbackCopyNotes(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Catatan tersalin!');
    }
  }
  window.copyPaperNotesMarkdown = copyPaperNotesMarkdown;

  function openNotesDrawer() {
    const drawer = document.getElementById('floating-notes-sidebar');
    const backdrop = document.getElementById('notes-drawer-backdrop');
    if (drawer) drawer.classList.add('is-open');
    if (backdrop) backdrop.classList.add('is-open');
    const input = document.getElementById('note-input-text');
    if (input) {
      setTimeout(() => input.focus(), 150);
    }
  }
  window.openNotesDrawer = openNotesDrawer;

  function closeNotesDrawer() {
    const drawer = document.getElementById('floating-notes-sidebar');
    const backdrop = document.getElementById('notes-drawer-backdrop');
    if (drawer) drawer.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
  }
  window.closeNotesDrawer = closeNotesDrawer;

  function toggleNotesSidebar() {
    const drawer = document.getElementById('floating-notes-sidebar');
    if (drawer && drawer.classList.contains('is-open')) {
      closeNotesDrawer();
    } else {
      openNotesDrawer();
    }
  }
  window.toggleNotesSidebar = toggleNotesSidebar;

  function initFloatingNotes() {
    const meta = getPaperMetadata();
    if (!meta.paperId) return;

    // 1. Backdrop
    let backdrop = document.getElementById('notes-drawer-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'notes-drawer-backdrop';
      backdrop.className = 'notes-drawer-backdrop';
      backdrop.onclick = closeNotesDrawer;
      document.body.appendChild(backdrop);
    }

    // 2. Off-canvas Drawer
    let sidebar = document.getElementById('floating-notes-sidebar');
    if (!sidebar) {
      sidebar = document.createElement('aside');
      sidebar.id = 'floating-notes-sidebar';
      sidebar.className = 'notes-drawer';

      sidebar.innerHTML = `
        <!-- Header -->
        <div class="notes-drawer-header">
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <div class="notes-icon-badge">
              <svg style="width: 0.95rem; height: 0.95rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </div>
            <div>
              <div class="notes-title-text">Catatan Pembaca</div>
              <div class="notes-subtitle-text">Paper #${meta.paperId}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <button type="button" onclick="copyPaperNotesMarkdown()" class="notes-tool-btn" title="Salin semua catatan sebagai Markdown">
              <svg style="width: 0.85rem; height: 0.85rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
            </button>
            <button type="button" onclick="closeNotesDrawer()" class="notes-close-btn" title="Tutup bilah catatan">✕</button>
          </div>
        </div>

        <!-- Input Box -->
        <div class="notes-input-box">
          <textarea id="note-input-text" class="notes-textarea" placeholder="Tuliskan catatan, poin penting, pertanyaan, atau hal yang perlu dipelajari..."></textarea>
          <div class="notes-input-actions">
            <span class="notes-hint">Enter untuk simpan</span>
            <button type="button" onclick="submitNewNote()" class="notes-submit-btn">+ Tambah Catatan</button>
          </div>
        </div>

        <!-- Section Bar -->
        <div class="notes-section-bar">
          <span style="font-weight: 600; color: var(--text-heading);">Daftar Catatan</span>
          <span id="notes-count-badge" class="notes-count-badge">0 item</span>
        </div>

        <!-- Scrollable List -->
        <div id="notes-list-container" class="notes-list-scroll"></div>

        <!-- Footer Bar -->
        <div class="notes-drawer-footer">
          <span id="notes-summary-text" style="color: var(--text-muted); font-size: 0.72rem;">0 catatan</span>
          <button type="button" onclick="clearCompletedNotes()" class="notes-footer-btn" title="Bersihkan catatan yang sudah selesai">Bersihkan Selesai</button>
        </div>
      `;

      document.body.appendChild(sidebar);

      // Textarea enter shortcut
      const ta = sidebar.querySelector('#note-input-text');
      if (ta) {
        ta.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitNewNote();
          }
        });
      }
    }

    // 3. Floating Edge Tab Button (Pinned to extreme left border)
    let pill = document.getElementById('floating-notes-pill');
    if (!pill) {
      pill = document.createElement('button');
      pill.id = 'floating-notes-pill';
      pill.className = 'floating-notes-edge-btn';
      pill.title = 'Buka Catatan Pembaca';
      pill.onclick = toggleNotesSidebar;
      pill.innerHTML = `
        <svg style="width: 0.95rem; height: 0.95rem; color: var(--accent-color);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        <span>Catatan</span>
        <span id="floating-notes-badge" class="notes-edge-badge">0</span>
      `;
      document.body.appendChild(pill);
    }

    renderNotesList(meta.paperId);
    updateNotesBadge(meta.paperId);
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
      const raw = JSON.parse(localStorage.getItem(READ_PAPERS_KEY)) || [];
      return Array.from(new Set(raw.map(id => String(id).padStart(2, '0'))));
    } catch (e) {
      return [];
    }
  }

  function toggleCurrentPaperRead() {
    const meta = getPaperMetadata();
    if (!meta.paperId) return;

    reconcileSyncState();
    let readList = getReadPapers();
    const pid = String(meta.paperId).padStart(2, '0');
    const idx = readList.indexOf(pid);
    let isRead = false;
    if (idx >= 0) {
      readList.splice(idx, 1);
    } else {
      readList.push(pid);
      isRead = true;
    }

    const now = Date.now();
    localStorage.setItem(READ_PAPERS_KEY, JSON.stringify(readList));
    localStorage.setItem(SYNC_TIME_KEY, String(now));
    pushLocalToSession(now);
    updatePortalLinks();
    updateReadChecklistUI(pid);
    showToast(isRead ? `Paper #${pid} ditandai: Selesai Dibaca ✓` : `Tanda selesai dibaca Paper #${pid} dihapus.`);
  }
  window.toggleCurrentPaperRead = toggleCurrentPaperRead;

  function updateReadChecklistUI(paperId) {
    const meta = getPaperMetadata();
    const pid = String(paperId || meta.paperId).padStart(2, '0');
    if (!pid) return;
    const readList = getReadPapers();
    const isRead = readList.includes(pid);

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

    // Try finding the citation block or citation section to insert BEFORE it
    const sitasiSec = main.querySelector('section#sitasi, section.citation-section');
    if (sitasiSec) {
      main.insertBefore(card, sitasiSec);
    } else {
      // Look for citation div/section containing copyCitation button
      const citationEl = Array.from(main.querySelectorAll('section, div')).find(el => 
        el.querySelector && el.querySelector('button[onclick*="copyCitation"]')
      );
      if (citationEl) {
        citationEl.parentNode.insertBefore(card, citationEl);
      } else {
        main.appendChild(card);
      }
    }
    updateReadChecklistUI(meta.paperId);
  }

  // --- 7. INJECT HEADER CONTROLS TOOLBAR ---
  function injectHeaderControls() {
    const headerRight = document.querySelector('header .max-w-4xl > div:last-child, header .max-w-6xl > div:last-child, header > div > div:last-child');
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

      <!-- Reader Notes Toggle Button -->
      <button onclick="toggleNotesSidebar()" id="header-notes-btn" class="reader-toolbar-btn flex items-center gap-1.5" title="Buka Catatan Pembaca">
        <svg class="w-3.5 h-3.5 text-editorial-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        <span class="hidden lg:inline">Catatan</span>
        <span id="header-notes-badge" class="font-mono text-[10px] bg-editorial-accent text-white px-1.5 py-0.2 rounded-full hidden">0</span>
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
        pushLocalToSession(currentPos.updatedAt);
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
  function initReader() {
    reconcileSyncState();
    initPreferences();
    injectHeaderControls();
    injectCompletionCard();
    enhanceLightboxModal();
    initFloatingTOC();
    initFloatingNotes();
    setupScrollTracking();
    restoreScrollPosition();
    updatePortalLinks();

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      const lb = document.getElementById('lightbox');
      const isLbOpen = lb && !lb.classList.contains('hidden');
      const drawer = document.getElementById('floating-notes-sidebar');
      const isDrawerOpen = drawer && drawer.classList.contains('is-open');

      if (e.key === 'Escape') {
        if (isLbOpen) {
          closeLightbox();
        } else if (isDrawerOpen) {
          closeNotesDrawer();
        }
      } else if (isLbOpen) {
        if (e.key === '+' || e.key === '=') zoomLightbox(0.5);
        if (e.key === '-' || e.key === '_') zoomLightbox(-0.5);
        if (e.key === '0') zoomLightbox(0);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReader);
  } else {
    initReader();
  }

  // Cross-tab and window storage synchronization
  window.addEventListener('storage', (e) => {
    if (e.key === READ_PAPERS_KEY || e.key === SYNC_TIME_KEY || (e.key && e.key.startsWith(NOTES_PREFIX))) {
      reconcileSyncState();
      const meta = getPaperMetadata();
      if (meta.paperId) {
        updateReadChecklistUI(meta.paperId);
        renderNotesList(meta.paperId);
        updateNotesBadge(meta.paperId);
      }
      updatePortalLinks();
    } else if (e.key === THEME_KEY && e.newValue) {
      setTheme(e.newValue, false);
    } else if (e.key === FONT_SIZE_KEY && e.newValue) {
      setFontSize(e.newValue, false);
    }
  });

  // Browser bfcache navigation (Back / Forward button)
  window.addEventListener('pageshow', () => {
    reconcileSyncState();
    const meta = getPaperMetadata();
    if (meta.paperId) {
      updateReadChecklistUI(meta.paperId);
      renderNotesList(meta.paperId);
      updateNotesBadge(meta.paperId);
    }
    updatePortalLinks();
  });

  // Tab switching visibility
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      reconcileSyncState();
      const meta = getPaperMetadata();
      if (meta.paperId) {
        updateReadChecklistUI(meta.paperId);
        renderNotesList(meta.paperId);
        updateNotesBadge(meta.paperId);
      }
      updatePortalLinks();
    }
  });

  // Outgoing link click handler
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="index.html"]');
    if (link) {
      pushLocalToSession();
      updatePortalLinks();
    }
  });

})();
