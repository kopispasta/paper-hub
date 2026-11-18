/**
 * TelaahSains Hub: English Learning Tutor (3D Word-Flip & Sentence Bilingual)
 * Activates only on pages with <body data-bilingual="true">.
 */

(function () {
  'use strict';

  const LANG_MODE_KEY = 'telaahsains_lang_mode';
  const VALID_MODES = ['en', 'flip', 'bilingual'];

  // Common academic & general English vocabulary fallback
  const BASE_VOCAB = {
    "a": { id: "sebuah / suatu", lemma: "a", pos: "art" },
    "an": { id: "sebuah / suatu", lemma: "an", pos: "art" },
    "the": { id: "(kata sandang tentu)", lemma: "the", pos: "art" },
    "and": { id: "dan", lemma: "and", pos: "conj" },
    "or": { id: "atau", lemma: "or", pos: "conj" },
    "but": { id: "tetapi / namun", lemma: "but", pos: "conj" },
    "yet": { id: "namun / belum", lemma: "yet", pos: "conj" },
    "while": { id: "sementara / sedangkan", lemma: "while", pos: "conj" },
    "whereas": { id: "sedangkan / padahal", lemma: "whereas", pos: "conj" },
    "although": { id: "meskipun", lemma: "although", pos: "conj" },
    "though": { id: "meskipun", lemma: "though", pos: "conj" },
    "because": { id: "karena", lemma: "because", pos: "conj" },
    "since": { id: "sejak / karena", lemma: "since", pos: "conj" },
    "if": { id: "jika / apabila", lemma: "if", pos: "conj" },
    "unless": { id: "kecuali jika", lemma: "unless", pos: "conj" },
    "until": { id: "hingga / sampai", lemma: "until", pos: "conj" },
    "when": { id: "ketika / saat", lemma: "when", pos: "conj" },
    "where": { id: "di mana", lemma: "where", pos: "conj" },
    "that": { id: "bahwa / yang / itu", lemma: "that", pos: "pron/conj" },
    "which": { id: "yang (mana)", lemma: "which", pos: "pron" },
    "who": { id: "yang (orang)", lemma: "who", pos: "pron" },
    "this": { id: "ini", lemma: "this", pos: "det" },
    "these": { id: "ini (jamak)", lemma: "these", pos: "det" },
    "those": { id: "itu (jamak)", lemma: "those", pos: "det" },
    "such": { id: "seperti itu / sedemikian", lemma: "such", pos: "det" },
    "both": { id: "keduanya", lemma: "both", pos: "det" },
    "all": { id: "semua / seluruh", lemma: "all", pos: "det" },
    "each": { id: "masing-masing / setiap", lemma: "each", pos: "det" },
    "every": { id: "setiap", lemma: "every", pos: "det" },
    "other": { id: "lainnya", lemma: "other", pos: "adj" },
    "another": { id: "yang lain", lemma: "another", pos: "det" },
    "only": { id: "hanya", lemma: "only", pos: "adv" },
    "also": { id: "juga", lemma: "also", pos: "adv" },
    "even": { id: "bahkan", lemma: "even", pos: "adv" },
    "not": { id: "tidak / bukan", lemma: "not", pos: "adv" },
    "no": { id: "tidak ada / tanpa", lemma: "no", pos: "det" },
    "more": { id: "lebih", lemma: "more", pos: "adv" },
    "most": { id: "paling / sebagian besar", lemma: "most", pos: "adv" },
    "less": { id: "lebih sedikit / kurang", lemma: "less", pos: "adv" },
    "very": { id: "sangat", lemma: "very", pos: "adv" },
    "highly": { id: "sangat", lemma: "highly", pos: "adv" },
    "significantly": { id: "secara signifikan", lemma: "significant", pos: "adv" },
    "dramatically": { id: "secara dramatis", lemma: "dramatic", pos: "adv" },
    "remarkably": { id: "secara luar biasa", lemma: "remarkable", pos: "adv" },
    "simultaneously": { id: "secara bersamaan / serentak", lemma: "simultaneous", pos: "adv" },
    "respectively": { id: "secara berurutan", lemma: "respective", pos: "adv" },
    "however": { id: "namun / akan tetapi", lemma: "however", pos: "adv" },
    "therefore": { id: "oleh karena itu", lemma: "therefore", pos: "adv" },
    "thus": { id: "dengan demikian", lemma: "thus", pos: "adv" },
    "hence": { id: "maka dari itu", lemma: "hence", pos: "adv" },
    "furthermore": { id: "lebih lanjut / selain itu", lemma: "furthermore", pos: "adv" },
    "moreover": { id: "selain itu / terlebih lagi", lemma: "moreover", pos: "adv" },
    "consequently": { id: "akibatnya", lemma: "consequently", pos: "adv" },
    "additionally": { id: "sebagai tambahan", lemma: "additional", pos: "adv" },
    "meanwhile": { id: "sementara itu", lemma: "meanwhile", pos: "adv" },
    "instead": { id: "sebagai gantinya", lemma: "instead", pos: "adv" },
    "overall": { id: "secara keseluruhan", lemma: "overall", pos: "adv" },
    "nearly": { id: "hampir", lemma: "nearly", pos: "adv" },
    "approximately": { id: "sekitar / kira-kira", lemma: "approximately", pos: "adv" },
    "mainly": { id: "terutama", lemma: "mainly", pos: "adv" },
    "directly": { id: "secara langsung", lemma: "direct", pos: "adv" },
    "rapidly": { id: "dengan cepat", lemma: "rapid", pos: "adv" },
    "uniformly": { id: "secara seragam", lemma: "uniform", pos: "adv" },
    "effectively": { id: "secara efektif", lemma: "effective", pos: "adv" },
    "efficiently": { id: "secara efisien", lemma: "efficient", pos: "adv" },
    "of": { id: "dari", lemma: "of", pos: "prep" },
    "in": { id: "di / dalam", lemma: "in", pos: "prep" },
    "on": { id: "pada / di atas", lemma: "on", pos: "prep" },
    "at": { id: "pada / di", lemma: "at", pos: "prep" },
    "to": { id: "ke / untuk / terhadap", lemma: "to", pos: "prep" },
    "for": { id: "untuk / selama", lemma: "for", pos: "prep" },
    "with": { id: "dengan", lemma: "with", pos: "prep" },
    "without": { id: "tanpa", lemma: "without", pos: "prep" },
    "by": { id: "oleh / dengan cara", lemma: "by", pos: "prep" },
    "from": { id: "dari", lemma: "from", pos: "prep" },
    "as": { id: "sebagai / seperti", lemma: "as", pos: "prep" },
    "into": { id: "ke dalam", lemma: "into", pos: "prep" },
    "onto": { id: "ke atas", lemma: "onto", pos: "prep" },
    "through": { id: "melalui", lemma: "through", pos: "prep" },
    "via": { id: "melalui / lewat", lemma: "via", pos: "prep" },
    "between": { id: "di antara (dua)", lemma: "between", pos: "prep" },
    "among": { id: "di antara (banyak)", lemma: "among", pos: "prep" },
    "during": { id: "selama", lemma: "during", pos: "prep" },
    "within": { id: "di dalam", lemma: "within", pos: "prep" },
    "beyond": { id: "melampaui / di luar", lemma: "beyond", pos: "prep" },
    "under": { id: "di bawah", lemma: "under", pos: "prep" },
    "over": { id: "di atas / selama", lemma: "over", pos: "prep" },
    "above": { id: "di atas", lemma: "above", pos: "prep" },
    "below": { id: "di bawah", lemma: "below", pos: "prep" },
    "near": { id: "dekat", lemma: "near", pos: "prep" },
    "around": { id: "sekitar", lemma: "around", pos: "prep" },
    "against": { id: "terhadap / melawan", lemma: "against", pos: "prep" },
    "across": { id: "melintasi / di seluruh", lemma: "across", pos: "prep" },
    "along": { id: "sepanjang", lemma: "along", pos: "prep" },
    "is": { id: "adalah / merupakan", lemma: "be", pos: "verb" },
    "are": { id: "adalah / merupakan (jamak)", lemma: "be", pos: "verb" },
    "was": { id: "adalah (lampau)", lemma: "be", pos: "verb" },
    "were": { id: "adalah (lampau jamak)", lemma: "be", pos: "verb" },
    "be": { id: "menjadi / berada", lemma: "be", pos: "verb" },
    "been": { id: "telah menjadi", lemma: "be", pos: "verb" },
    "being": { id: "sedang menjadi", lemma: "be", pos: "verb" },
    "has": { id: "memiliki / telah", lemma: "have", pos: "verb" },
    "have": { id: "memiliki / telah", lemma: "have", pos: "verb" },
    "had": { id: "telah memiliki", lemma: "have", pos: "verb" },
    "can": { id: "dapat / bisa", lemma: "can", pos: "modal" },
    "could": { id: "dapat / bisa", lemma: "could", pos: "modal" },
    "may": { id: "mungkin / dapat", lemma: "may", pos: "modal" },
    "might": { id: "mungkin", lemma: "might", pos: "modal" },
    "must": { id: "harus", lemma: "must", pos: "modal" },
    "will": { id: "akan", lemma: "will", pos: "modal" },
    "would": { id: "akan", lemma: "would", pos: "modal" },
    "should": { id: "seharusnya", lemma: "should", pos: "modal" },
    "show": { id: "menunjukkan", lemma: "show", pos: "verb" },
    "exhibit": { id: "memperlihatkan / menunjukkan", lemma: "exhibit", pos: "verb" },
    "demonstrate": { id: "membuktikan / mendemonstrasikan", lemma: "demonstrate", pos: "verb" },
    "reveal": { id: "mengungkapkan", lemma: "reveal", pos: "verb" },
    "confirm": { id: "mengonfirmasi", lemma: "confirm", pos: "verb" },
    "indicate": { id: "mengindikasikan / menandakan", lemma: "indicate", pos: "verb" },
    "suggest": { id: "menyarankan / mengisyaratkan", lemma: "suggest", pos: "verb" },
    "provide": { id: "menyediakan / memberikan", lemma: "provide", pos: "verb" },
    "offer": { id: "menawarkan", lemma: "offer", pos: "verb" },
    "achieve": { id: "mencapai / meraih", lemma: "achieve", pos: "verb" },
    "obtain": { id: "memperoleh", lemma: "obtain", pos: "verb" },
    "require": { id: "membutuhkan / memerlukan", lemma: "require", pos: "verb" },
    "need": { id: "membutuhkan", lemma: "need", pos: "verb" },
    "use": { id: "menggunakan", lemma: "use", pos: "verb" },
    "utilize": { id: "memanfaatkan", lemma: "utilize", pos: "verb" },
    "enable": { id: "memungkinkan", lemma: "enable", pos: "verb" },
    "allow": { id: "memungkinkan / mengizinkan", lemma: "allow", pos: "verb" },
    "prevent": { id: "mencegah", lemma: "prevent", pos: "verb" },
    "suppress": { id: "menekan / menghambat", lemma: "suppress", pos: "verb" },
    "limit": { id: "membatasi", lemma: "limit", pos: "verb" },
    "hinder": { id: "menghambat", lemma: "hinder", pos: "verb" },
    "enhance": { id: "meningkatkan / memperkuat", lemma: "enhance", pos: "verb" },
    "improve": { id: "meningkatkan / memperbaiki", lemma: "improve", pos: "verb" },
    "increase": { id: "meningkat / menaikkan", lemma: "increase", pos: "verb" },
    "decrease": { id: "menurun / menurunkan", lemma: "decrease", pos: "verb" },
    "reduce": { id: "mengurangi / mereduksi", lemma: "reduce", pos: "verb" },
    "promote": { id: "mendorong / mempercepat", lemma: "promote", pos: "verb" },
    "facilitate": { id: "memfasilitasi / mempermudah", lemma: "facilitate", pos: "verb" },
    "accelerate": { id: "mempercepat", lemma: "accelerate", pos: "verb" },
    "remain": { id: "tetap / bertahan", lemma: "remain", pos: "verb" },
    "maintain": { id: "mempertahankan", lemma: "maintain", pos: "verb" },
    "form": { id: "membentuk / bentuk", lemma: "form", pos: "verb/noun" },
    "generate": { id: "menghasilkan", lemma: "generate", pos: "verb" },
    "produce": { id: "memproduksi / menghasilkan", lemma: "produce", pos: "verb" },
    "induce": { id: "memicu / menginduksi", lemma: "induce", pos: "verb" },
    "trigger": { id: "memicu", lemma: "trigger", pos: "verb" },
    "cause": { id: "menyebabkan", lemma: "cause", pos: "verb" },
    "lead": { id: "mengarah pada / menyebabkan", lemma: "lead", pos: "verb" },
    "result": { id: "menghasilkan / berakibat", lemma: "result", pos: "verb/noun" },
    "compare": { id: "membandingkan", lemma: "compare", pos: "verb" },
    "evaluate": { id: "mengevaluasi", lemma: "evaluate", pos: "verb" },
    "investigate": { id: "menyelidiki / menginvestigasi", lemma: "investigate", pos: "verb" },
    "analyze": { id: "menganalisis", lemma: "analyze", pos: "verb" },
    "observe": { id: "mengamati", lemma: "observe", pos: "verb" },
    "detect": { id: "mendeteksi", lemma: "detect", pos: "verb" },
    "measure": { id: "mengukur", lemma: "measure", pos: "verb" },
    "determine": { id: "menentukan", lemma: "determine", pos: "verb" },
    "control": { id: "mengendalikan / kontrol", lemma: "control", pos: "verb/noun" },
    "modulate": { id: "memodulasi / mengatur", lemma: "modulate", pos: "verb" },
    "stabilize": { id: "menstabilkan", lemma: "stabilize", pos: "verb" },
    "interact": { id: "berinteraksi", lemma: "interact", pos: "verb" },
    "high": { id: "tinggi", lemma: "high", pos: "adj" },
    "higher": { id: "lebih tinggi", lemma: "high", pos: "adj" },
    "highest": { id: "tertinggi", lemma: "high", pos: "adj" },
    "low": { id: "rendah", lemma: "low", pos: "adj" },
    "lower": { id: "lebih rendah", lemma: "low", pos: "adj" },
    "lowest": { id: "terendah", lemma: "low", pos: "adj" },
    "large": { id: "besar", lemma: "large", pos: "adj" },
    "small": { id: "kecil", lemma: "small", pos: "adj" },
    "fast": { id: "cepat", lemma: "fast", pos: "adj" },
    "slow": { id: "lambat", lemma: "slow", pos: "adj" },
    "sluggish": { id: "lamban / lambat", lemma: "sluggish", pos: "adj" },
    "strong": { id: "kuat", lemma: "strong", pos: "adj" },
    "weak": { id: "lemah", lemma: "weak", pos: "adj" },
    "uniform": { id: "seragam", lemma: "uniform", pos: "adj" },
    "efficient": { id: "efisien", lemma: "efficient", pos: "adj" },
    "stable": { id: "stabil", lemma: "stable", pos: "adj" },
    "commercial": { id: "komersial", lemma: "commercial", pos: "adj" },
    "conventional": { id: "konvensional", lemma: "conventional", pos: "adj" },
    "ambient": { id: "suhu/kondisi ruang", lemma: "ambient", pos: "adj" },
    "harsh": { id: "keras / ekstrem", lemma: "harsh", pos: "adj" },
    "promising": { id: "menjanjikan", lemma: "promising", pos: "adj" },
    "crucial": { id: "krusial / sangat penting", lemma: "crucial", pos: "adj" },
    "essential": { id: "esensial / penting", lemma: "essential", pos: "adj" },
    "key": { id: "kunci / utama", lemma: "key", pos: "adj/noun" },
    "major": { id: "utama", lemma: "major", pos: "adj" },
    "minor": { id: "minor / kecil", lemma: "minor", pos: "adj" },
    "clean": { id: "bersih", lemma: "clean", pos: "adj" },
    "pure": { id: "murni", lemma: "pure", pos: "adj" },
    "pristine": { id: "murni / asli tanpa cacat", lemma: "pristine", pos: "adj" },
    "study": { id: "penelitian / studi", lemma: "study", pos: "noun" },
    "work": { id: "karya / penelitian", lemma: "work", pos: "noun" },
    "method": { id: "metode", lemma: "method", pos: "noun" },
    "approach": { id: "pendekatan", lemma: "approach", pos: "noun" },
    "process": { id: "proses", lemma: "process", pos: "noun" },
    "system": { id: "sistem", lemma: "system", pos: "noun" },
    "reaction": { id: "reaksi", lemma: "reaction", pos: "noun" },
    "energy": { id: "energi", lemma: "energy", pos: "noun" },
    "time": { id: "waktu", lemma: "time", pos: "noun" },
    "rate": { id: "laju / tingkat", lemma: "rate", pos: "noun" },
    "value": { id: "nilai", lemma: "value", pos: "noun" },
    "structure": { id: "struktur", lemma: "structure", pos: "noun" },
    "surface": { id: "permukaan", lemma: "surface", pos: "noun" },
    "interface": { id: "antarmuka", lemma: "interface", pos: "noun" },
    "step": { id: "tahap / langkah", lemma: "step", pos: "noun" },
    "performance": { id: "kinerja / performa", lemma: "performance", pos: "noun" },
    "activity": { id: "aktivitas", lemma: "activity", pos: "noun" },
    "stability": { id: "stabilitas", lemma: "stability", pos: "noun" },
    "durability": { id: "durabilitas / ketahanan", lemma: "durability", pos: "noun" }
  };

  let activeWordEl = null;
  let cardEl = null;

  function getSavedMode() {
    try {
      const m = localStorage.getItem(LANG_MODE_KEY);
      if (VALID_MODES.includes(m)) return m;
    } catch (e) {}
    return 'flip';
  }

  function setMode(mode) {
    if (!VALID_MODES.includes(mode)) mode = 'flip';
    document.body.classList.remove('lang-mode-en', 'lang-mode-flip', 'lang-mode-bilingual');
    document.body.classList.add('lang-mode-' + mode);
    try {
      localStorage.setItem(LANG_MODE_KEY, mode);
    } catch (e) {}

    document.querySelectorAll('.ts-mode-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.getAttribute('data-lang-mode') === mode);
    });

    closeFlipCard();
  }

  function cleanToken(raw) {
    return String(raw || '')
      .replace(/^[("'“‘\[{]+/, '')
      .replace(/[)"'”’\]}.,;:!?]+$/, '')
      .trim();
  }

  function dictGet(key) {
    const paperVocab = window.TS_PAPER_VOCAB || {};
    if (Object.prototype.hasOwnProperty.call(paperVocab, key)) {
      return paperVocab[key];
    }
    if (Object.prototype.hasOwnProperty.call(BASE_VOCAB, key)) {
      return BASE_VOCAB[key];
    }
    return null;
  }

  function lookupWord(rawWord) {
    const cleaned = cleanToken(rawWord);
    const lower = cleaned.toLowerCase();
    if (!lower) {
      return { word: rawWord, id: '', lemma: '', pos: 'term', found: false };
    }

    // 1. Direct exact lookup
    let hit = dictGet(lower);
    if (hit) {
      return { word: cleaned, id: hit.id, lemma: hit.lemma || lower, pos: hit.pos || 'term', found: true };
    }

    // 2. Simple morphological normalization
    const candidates = [];
    if (lower.endsWith('ies') && lower.length > 4) candidates.push(lower.slice(0, -3) + 'y');
    if (lower.endsWith('es') && lower.length > 3) candidates.push(lower.slice(0, -2));
    if (lower.endsWith('s') && lower.length > 2) candidates.push(lower.slice(0, -1));
    if (lower.endsWith('ied') && lower.length > 4) candidates.push(lower.slice(0, -3) + 'y');
    if (lower.endsWith('ed') && lower.length > 3) {
      candidates.push(lower.slice(0, -2));
      candidates.push(lower.slice(0, -1));
    }
    if (lower.endsWith('ing') && lower.length > 4) {
      candidates.push(lower.slice(0, -3));
      candidates.push(lower.slice(0, -3) + 'e');
    }
    if (lower.endsWith('ly') && lower.length > 3) {
      candidates.push(lower.slice(0, -2));
      if (lower.endsWith('ily')) candidates.push(lower.slice(0, -3) + 'y');
    }

    for (let i = 0; i < candidates.length; i++) {
      hit = dictGet(candidates[i]);
      if (hit) {
        return { word: cleaned, id: hit.id, lemma: hit.lemma || candidates[i], pos: hit.pos || 'term', found: true };
      }
    }

    // 3. Hyphenated fallback: look up parts if full compound isn't listed
    if (lower.includes('-')) {
      const parts = lower.split('-');
      const translatedParts = parts.map(p => {
        const pHit = dictGet(p);
        return pHit ? pHit.id : p;
      });
      if (parts.some(p => dictGet(p))) {
        return {
          word: cleaned,
          id: translatedParts.join(' - '),
          lemma: lower,
          pos: 'compound',
          found: true
        };
      }
    }

    return {
      word: cleaned,
      id: 'Istilah khusus / nama diri (belum ada di kamus lokal)',
      lemma: lower,
      pos: 'term',
      found: false
    };
  }

  function tokenizeElement(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentNode;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'SVG') {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent.closest && parent.closest('.ts-id, .ts-word, [data-no-tokenize]')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const textNodes = [];
    let current;
    while ((current = walker.nextNode())) {
      textNodes.push(current);
    }

    // Split text keeping delimiters; match English alphabetical words (including hyphenated compounds)
    const tokenRegex = /([A-Za-z]+(?:-[A-Za-z0-9]+)*)/g;

    textNodes.forEach(node => {
      const text = node.nodeValue;
      if (!/[A-Za-z]/.test(text)) return;

      const frag = document.createDocumentFragment();
      let lastIdx = 0;
      let match;

      tokenRegex.lastIndex = 0;
      while ((match = tokenRegex.exec(text)) !== null) {
        if (match.index > lastIdx) {
          frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
        }

        const token = match[1];
        // Avoid splitting chemical formulas/units that have digits attached directly before/after (e.g. H2O, PtCo3, mV/dec)
        const prevChar = match.index > 0 ? text[match.index - 1] : ' ';
        const nextChar = text[match.index + token.length] || ' ';
        const attachedToDigitOrSubscript = /[0-9₀-₉⁰-⁹]/.test(prevChar) || /[0-9₀-₉⁰-⁹]/.test(nextChar);

        if (attachedToDigitOrSubscript) {
          frag.appendChild(document.createTextNode(token));
        } else {
          const span = document.createElement('span');
          span.className = 'ts-word';
          span.setAttribute('tabindex', '0');
          span.textContent = token;
          frag.appendChild(span);
        }

        lastIdx = match.index + token.length;
      }

      if (lastIdx < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIdx)));
      }

      if (node.parentNode) {
        node.parentNode.replaceChild(frag, node);
      }
    });
  }

  function injectModeSwitcher() {
    if (document.getElementById('ts-lang-bar')) return;
    const header = document.querySelector('header');
    if (!header) return;

    const bar = document.createElement('div');
    bar.id = 'ts-lang-bar';
    bar.innerHTML = `
      <div class="ts-lang-bar-inner">
        <div class="ts-lang-label">
          <span class="ts-lang-dot"></span>
          <span>Mode Latihan Bahasa Inggris</span>
        </div>
        <div class="ts-lang-controls" role="group" aria-label="Pilih Mode Bahasa">
          <button type="button" class="ts-mode-btn" data-lang-mode="en" title="Teks 100% Bahasa Inggris bersih">
            <span class="ts-mode-badge">EN</span>
            <span>Asli</span>
          </button>
          <button type="button" class="ts-mode-btn" data-lang-mode="flip" title="Klik kata apa saja untuk membalik kartu arti 3D">
            <span class="ts-mode-badge">EN ⇄ ID</span>
            <span>Kartu Kata</span>
          </button>
          <button type="button" class="ts-mode-btn" data-lang-mode="bilingual" title="Terjemahan Bahasa Indonesia langsung di bawah setiap kalimat">
            <span class="ts-mode-badge">EN + ID</span>
            <span>Bilingual</span>
          </button>
        </div>
      </div>
    `;

    header.insertAdjacentElement('afterend', bar);

    bar.querySelectorAll('.ts-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setMode(btn.getAttribute('data-lang-mode'));
      });
    });
  }

  function createFlipCard() {
    if (document.getElementById('ts-flip-card')) return document.getElementById('ts-flip-card');

    const card = document.createElement('div');
    card.id = 'ts-flip-card';
    card.className = 'hidden';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', 'Kartu Terjemahan Kata');

    card.innerHTML = `
      <div class="ts-card-inner" id="ts-card-inner">
        <div class="ts-card-face ts-card-front">
          <div>
            <div class="ts-card-top">
              <span class="ts-card-badge" id="ts-front-pos">TERM</span>
              <button type="button" class="ts-card-close" title="Tutup (Esc)">✕</button>
            </div>
            <div class="ts-card-word" id="ts-front-word">word</div>
            <div class="ts-card-lemma" id="ts-front-lemma">base: word</div>
          </div>
          <div class="ts-card-actions">
            <span class="ts-card-hint">Klik kartu untuk balik ⇄</span>
          </div>
        </div>

        <div class="ts-card-face ts-card-back">
          <div>
            <div class="ts-card-top">
              <span class="ts-card-badge" id="ts-back-pos">ID</span>
              <button type="button" class="ts-card-close" title="Tutup (Esc)">✕</button>
            </div>
            <div class="ts-card-meaning" id="ts-back-meaning">arti</div>
            <div class="ts-card-lemma" id="ts-back-sub">word</div>
          </div>
          <div class="ts-card-actions">
            <span class="ts-card-hint">Klik kartu ⇄ EN</span>
            <button type="button" class="ts-save-btn" id="ts-save-vocab-btn">+ Simpan Catatan</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(card);

    // Flip toggle on card body click (except buttons)
    const inner = card.querySelector('#ts-card-inner');
    inner.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      card.classList.toggle('is-flipped');
    });

    card.querySelectorAll('.ts-card-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeFlipCard();
      });
    });

    const saveBtn = card.querySelector('#ts-save-vocab-btn');
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const word = card.dataset.currentWord || '';
      const lemma = card.dataset.currentLemma || '';
      const meaning = card.dataset.currentMeaning || '';
      if (!word) return;

      const label = lemma && lemma !== word.toLowerCase()
        ? `${word} (${lemma}) — ${meaning}`
        : `${word} — ${meaning}`;

      if (typeof window.addReaderNote === 'function') {
        window.addReaderNote(label);
      } else {
        const input = document.getElementById('note-input-text');
        if (input && typeof window.submitNewNote === 'function') {
          input.value = label;
          window.submitNewNote();
        }
      }
      saveBtn.textContent = '✓ Tersimpan';
      saveBtn.classList.add('is-saved');
    });

    return card;
  }

  function closeFlipCard() {
    if (activeWordEl) {
      activeWordEl.classList.remove('is-active');
      activeWordEl = null;
    }
    if (cardEl) {
      cardEl.classList.add('hidden');
      cardEl.classList.remove('is-flipped');
    }
  }

  function openFlipCard(wordEl) {
    if (!cardEl) cardEl = createFlipCard();

    if (activeWordEl && activeWordEl !== wordEl) {
      activeWordEl.classList.remove('is-active');
    }
    activeWordEl = wordEl;
    activeWordEl.classList.add('is-active');

    const info = lookupWord(wordEl.textContent);

    cardEl.dataset.currentWord = info.word;
    cardEl.dataset.currentLemma = info.lemma;
    cardEl.dataset.currentMeaning = info.id;

    cardEl.querySelector('#ts-front-pos').textContent = (info.pos || 'term').toUpperCase();
    cardEl.querySelector('#ts-front-word').textContent = info.word;
    cardEl.querySelector('#ts-front-lemma').textContent =
      info.lemma && info.lemma !== info.word.toLowerCase() ? `kata dasar: ${info.lemma}` : 'kata dasar';

    cardEl.querySelector('#ts-back-pos').textContent = `ID • ${(info.pos || 'term').toUpperCase()}`;
    cardEl.querySelector('#ts-back-meaning').textContent = info.id;
    cardEl.querySelector('#ts-back-sub').textContent =
      info.lemma && info.lemma !== info.word.toLowerCase() ? `${info.word} (${info.lemma})` : info.word;

    const saveBtn = cardEl.querySelector('#ts-save-vocab-btn');
    saveBtn.textContent = '+ Simpan Catatan';
    saveBtn.classList.remove('is-saved');

    // Position relative to viewport
    const rect = wordEl.getBoundingClientRect();
    const cardW = Math.min(280, window.innerWidth - 24);
    const cardH = 156;
    const margin = 12;

    let left = rect.left + rect.width / 2 - cardW / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - cardW - margin));

    let top = rect.top - cardH - 10;
    if (top < 64) {
      top = rect.bottom + 10;
    }

    cardEl.style.left = `${Math.round(left)}px`;
    cardEl.style.top = `${Math.round(top)}px`;

    // Show front briefly then trigger 3D flip animation to Indonesian meaning
    cardEl.classList.remove('is-flipped');
    cardEl.classList.remove('hidden');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cardEl.classList.contains('hidden')) {
          cardEl.classList.add('is-flipped');
        }
      });
    });
  }

  function initEvents() {
    document.addEventListener('click', (e) => {
      const wordEl = e.target.closest('.ts-word');
      if (wordEl) {
        if (document.body.classList.contains('lang-mode-en')) return;
        e.stopPropagation();
        if (activeWordEl === wordEl && cardEl && !cardEl.classList.contains('hidden')) {
          closeFlipCard();
        } else {
          openFlipCard(wordEl);
        }
        return;
      }

      if (cardEl && !cardEl.contains(e.target)) {
        closeFlipCard();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeFlipCard();
      } else if (e.key === 'Enter' && document.activeElement && document.activeElement.classList.contains('ts-word')) {
        if (!document.body.classList.contains('lang-mode-en')) {
          openFlipCard(document.activeElement);
        }
      }
    });

    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      if (cardEl && !cardEl.classList.contains('hidden')) {
        if (Math.abs(window.scrollY - lastScrollY) > 60) {
          closeFlipCard();
        }
      }
      lastScrollY = window.scrollY;
    }, { passive: true });
  }

  function init() {
    if (document.body.getAttribute('data-bilingual') !== 'true') return;

    injectModeSwitcher();
    createFlipCard();

    // Tokenize all English sentence blocks & explicit tokenize targets
    document.querySelectorAll('.ts-en, [data-ts-tokenize]').forEach(el => {
      tokenizeElement(el);
    });

    initEvents();
    setMode(getSavedMode());
  }

  // Export for unit testing if needed
  window.TSLanguageTutor = {
    lookupWord: lookupWord,
    setMode: setMode
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
