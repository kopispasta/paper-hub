# Panduan Desain & Standar Editorial TelaahSains Hub (Paper Hub)

Dokumen ini merupakan spesifikasi master dan acuan baku untuk pembuatan serta pemeliharaan seluruh halaman paper di TelaahSains Hub. Semua kontributor manusia maupun model AI **wajib** mengikuti struktur, hierarki kelas, dan format konten dalam panduan ini guna memastikan konsistensi visual 100% dan integritas editorial tanpa *workslop*.

---

## 1. Filosofi Desain & Standar Editorial

1. **Editorial Sains Berwibawa (Anti-AI-Workslop)**:
   - Konten telaah bukan ringkasan generik atau *bullet-point* dangkal. Teks harus menyajikan pembedahan mendalam terhadap metodologi, data numerik, kinetika/termodinamika, kristalografi, serta implikasi industri atau klinis dari paper asli.
   - Penulisan mengacu pada standar editorial jurnal prestisius seperti *Nature*, *Science*, dan *Cell*, namun disajikan dalam Bahasa Indonesia ilmiah yang lugas, presisi, dan elegan.

2. **Tata Letak Baku 3-Kolom (Three-Column Balanced Editorial Layout)**:
   - **Kolom Kiri**: Panel Catatan Riset Personal (disuntikkan secara dinamis oleh `shared/reader.js` pada `#reader-left-sidebar`), bersifat *sticky* mengikuti *scroll*.
   - **Kolom Tengah (`lg:col-span-8`)**: Isi naskah artikel telaah utama, tabel data, gambar mikroskopi/kristal, dan sitasi resmi.
   - **Kolom Kanan (`lg:col-span-4`)**: Sidebar *sticky* berisi 3 kartu wajib: **Daftar Isi Artikel** (`#toc-list`), **Glosarium Istilah Kunci**, dan **Indeks Gambar Paper**.

3. **Interaktivitas Terpadu**:
   - Sinkronisasi status selesai baca (`reader.js` <-> `localStorage` <-> katalog utama `index.html`).
   - ScrollSpy TOC dinamis yang menyorot posisi bab aktif saat halaman digulir.
   - Lightbox modal resolusi tinggi untuk seluruh inspeksi visual gambar/skema ilmiah.
   - Tombol salin sitasi cepat (format APA dan BibTeX).

---

## 2. Standar Notasi Ilmiah & Matematika (Bebas Kerusakan Renderer Terminal)

Demi mencegah rusaknya spasi vertikal, keterpotongan tabel, dan pembelahan tag tebal (**bold**):

1. **Dilarang Keras Menggunakan Delimiter LaTeX Math**:
   - **JANGAN PERNAH** menggunakan `$`, `$$`, `\(`, atau `\[` di mana pun dalam HTML, atribut teks, maupun komentar.
   - Jangan menulis `$10^{20}$`, `$V_{cell}$`, `$E_{ads}$`, `$\Delta E_{rxn}$`, `$IC_{50}$`, atau `$\sim 6.3 \times 10^{19}$`.

2. **Gunakan Unicode Superscript & Subscript**:
   - Satuan & Eksponen: `Å` (bukan `\AA`), `cm²·V⁻¹·s⁻¹`, `10²⁰`, `cm⁻³`, `(Ω·m·s)⁻¹`, `W·m⁻¹·K⁻¹·s⁻¹`, `Å³`, `eV`, `°C`.
   - Simbol Relasi: `≈` atau `~` (bukan `\sim`), `>>` atau `≫` (bukan `\gg`), `→` (bukan `\to`), `Δ` (bukan `\Delta`).

3. **Gunakan Inline Code Backtick untuk Besaran Fisik & Energi**:
   - Tulis besaran seperti `E_ads`, `ΔE_rxn`, `E_g`, `E_form`, `ΔG`, `ΔH`, `IC_50`, `K_d`, `R_ct`, `LLE` di dalam tanda backtick tunggal.
   - Contoh perbandingan: `|E_ads(MCA)| > |E_ads(MCH)| > |E_ads(MNC)|` (dalam satu baris kode inline utuh).

4. **Tabel Data Ilmiah**:
   - Setiap sel tabel harus berupa teks sebaris atau backticked code. Jangan menggunakan *line break* `<br>` berlebihan di dalam sel tabel numerik.

---

## 3. Anatomi Kerangka Lengkap (HTML Skeleton Template)

Setiap file `papers/<slug-paper>/index.html` harus mengimplementasikan kerangka berikut:

```html
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Judul Paper] — Telaah Mendalam TelaahSains Hub</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Google Fonts: Newsreader (Serif Editorial) & Plus Jakarta Sans (UI Sans) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Tailwind Configuration matching Design System -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            editorial: {
              bg: '#fcfcfc',
              softbg: '#fafafa',
              card: '#ffffff',
              ink: '#18181b',
              body: '#27272a',
              muted: '#71717a',
              lightmuted: '#a1a1aa',
              line: '#e4e4e7',
              accent: '#0a74c0',
              accenthover: '#085d99',
            }
          },
          fontFamily: {
            serif: ['Newsreader', 'Georgia', 'serif'],
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          }
        }
      }
    }
  </script>

  <!-- Shared Reader System CSS -->
  <link rel="stylesheet" href="../../shared/reader.css">
</head>
<body class="bg-editorial-bg text-editorial-body antialiased selection:bg-blue-100 selection:text-blue-900">

  <!-- TOP HEADER & PROGRESS STRIP -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-editorial-line font-sans">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <a href="../../index.html" class="flex items-center gap-2 text-xs font-semibold text-editorial-ink hover:text-editorial-accent transition-colors">
          <svg class="w-4 h-4 text-editorial-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Katalog Utama</span>
        </a>
        <span class="text-editorial-line">/</span>
        <span class="text-xs font-mono text-editorial-muted">Paper #[Nomor]</span>
      </div>

      <div class="flex items-center gap-4 text-xs text-editorial-muted">
        <span class="hidden sm:inline">Estimasi Baca: [XX] Menit</span>
        <div class="h-3 w-px bg-editorial-line hidden sm:inline"></div>
        <span class="font-mono text-editorial-ink font-semibold">[Nama Jurnal]</span>
      </div>
    </div>
    <!-- Reading Progress Indicator -->
    <div id="reading-progress" class="h-0.5 bg-editorial-accent w-0 transition-all duration-150"></div>
  </header>

  <!-- ARTICLE HERO SECTION -->
  <section class="bg-white border-b border-editorial-line pt-12 pb-10">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Badges -->
      <div class="flex flex-wrap items-center gap-2 mb-6 text-xs font-sans">
        <span class="px-2 py-0.5 rounded bg-blue-50 text-editorial-accent font-semibold uppercase tracking-wider text-[11px] border border-blue-200/60">
          [Topik Utama]
        </span>
        <span class="text-editorial-lightmuted">•</span>
        <span class="text-editorial-muted">[Metode Kunci]</span>
        <span class="text-editorial-lightmuted">•</span>
        <span class="text-editorial-muted">[Fokus Riset]</span>
      </div>

      <!-- Headline -->
      <h1 class="font-serif text-3xl sm:text-4xl md:text-[2.65rem] leading-[1.22] font-semibold text-editorial-ink tracking-tight mb-5">
        [Judul Komprehensif Bahasa Indonesia]
      </h1>

      <!-- Lead Paragraph -->
      <p class="font-sans text-base sm:text-lg text-editorial-muted leading-relaxed mb-6 font-normal">
        [Lead editorial mendalam yang merangkum urgensi, terobosan sains, serta hasil puncak riset.]
      </p>

      <!-- Author Strip -->
      <div class="pt-4 pb-6 border-y border-editorial-line text-xs font-sans text-editorial-muted flex flex-wrap justify-between items-center gap-y-3 mb-8">
        <div>
          <span class="font-semibold text-editorial-ink">[Daftar Penulis Utama, dkk.]</span>
          <span class="block text-editorial-lightmuted mt-0.5">[Institusi Utama & Negara]</span>
        </div>
        <div class="text-right font-mono text-[11px]">
          <div class="text-editorial-ink font-semibold">[Sitasi Jurnal & Tahun]</div>
          <div class="text-editorial-muted">DOI: [Link DOI]</div>
        </div>
      </div>

      <!-- Abstract Graphic Figure (Optional tapi Sangat Disarankan) -->
      <figure class="figure-container">
        <img 
          src="assets/[gambar_abstrak].png" 
          alt="Visual Abstract" 
          class="w-full h-auto cursor-zoom-in rounded border border-editorial-line/60"
          onclick="openLightbox(this.src, this.alt)"
        >
        <figcaption class="mt-3 text-xs text-editorial-muted font-sans leading-normal">
          <strong class="text-editorial-ink font-semibold">Visual Abstract.</strong> [Keterangan visual abstract].
        </figcaption>
      </figure>

      <!-- 4 Key Metrics Strip -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-8 font-sans">
        <div class="p-3 bg-white border border-editorial-line rounded shadow-xs">
          <div class="text-[11px] uppercase tracking-wider text-editorial-muted font-semibold">[Label Metrik 1]</div>
          <div class="text-2xl font-bold text-editorial-ink mt-0.5 font-mono">[Nilai 1]</div>
          <div class="text-[11px] text-editorial-muted mt-0.5">[Subteks 1]</div>
        </div>
        <div class="p-3 bg-white border border-editorial-line rounded shadow-xs">
          <div class="text-[11px] uppercase tracking-wider text-editorial-muted font-semibold">[Label Metrik 2]</div>
          <div class="text-2xl font-bold text-editorial-accent mt-0.5 font-mono">[Nilai 2]</div>
          <div class="text-[11px] text-editorial-muted mt-0.5">[Subteks 2]</div>
        </div>
        <div class="p-3 bg-white border border-editorial-line rounded shadow-xs">
          <div class="text-[11px] uppercase tracking-wider text-editorial-muted font-semibold">[Label Metrik 3]</div>
          <div class="text-2xl font-bold text-emerald-700 mt-0.5 font-mono">[Nilai 3]</div>
          <div class="text-[11px] text-editorial-muted mt-0.5">[Subteks 3]</div>
        </div>
        <div class="p-3 bg-white border border-editorial-line rounded shadow-xs">
          <div class="text-[11px] uppercase tracking-wider text-editorial-muted font-semibold">[Label Metrik 4]</div>
          <div class="text-2xl font-bold text-editorial-ink mt-0.5 font-mono">[Nilai 4]</div>
          <div class="text-[11px] text-editorial-muted mt-0.5">[Subteks 4]</div>
        </div>
      </div>

    </div>
  </section>

  <!-- MAIN ARTICLE LAYOUT WRAPPER (3 Columns: Left Notes + Center Article + Right Aside) -->
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-10">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      <!-- ARTICLE TEXT (Cols 1-8) -->
      <main class="lg:col-span-8 article-body">

        <!-- EXECUTIVE SUMMARY ACCORDION -->
        <div class="border border-editorial-line bg-white rounded p-5 mb-10">
          <div class="flex items-center justify-between cursor-pointer select-none" onclick="toggleSummary()">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-editorial-accent"></span>
              <h3 class="text-sm font-bold text-editorial-ink tracking-tight font-sans">
                Ringkasan Singkat untuk Peneliti (4 Poin Utama)
              </h3>
            </div>
            <span id="summary-chevron" class="text-xs font-mono text-editorial-muted">[- tutup]</span>
          </div>
          <div id="summary-content" class="mt-4 pt-4 border-t border-editorial-line text-xs sm:text-sm font-sans text-editorial-body space-y-2.5 leading-relaxed">
            <p><strong>1. [Latar Belakang & Masalah]:</strong> [Penjelasan]</p>
            <p><strong>2. [Inovasi Metodologi]:</strong> [Penjelasan]</p>
            <p><strong>3. [Temuan Data Numerik Kunci]:</strong> [Penjelasan]</p>
            <p><strong>4. [Dampak & Translasi Riset]:</strong> [Penjelasan]</p>
          </div>
        </div>

        <!-- TABLE OF CONTENTS (MINI JUMP NAV) -->
        <nav class="p-4 bg-zinc-50 border border-editorial-line rounded text-xs font-sans mb-8">
          <div class="font-bold text-editorial-ink uppercase tracking-wider mb-2">Navigasi Bab Telaah</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-editorial-body">
            <a href="#bab-1" class="hover:text-editorial-accent flex items-center gap-1.5">
              <span class="text-editorial-lightmuted font-mono">01.</span> [Judul Bab 1]
            </a>
            <a href="#bab-2" class="hover:text-editorial-accent flex items-center gap-1.5">
              <span class="text-editorial-lightmuted font-mono">02.</span> [Judul Bab 2]
            </a>
            <a href="#bab-3" class="hover:text-editorial-accent flex items-center gap-1.5">
              <span class="text-editorial-lightmuted font-mono">03.</span> [Judul Bab 3]
            </a>
            <a href="#bab-4" class="hover:text-editorial-accent flex items-center gap-1.5">
              <span class="text-editorial-lightmuted font-mono">04.</span> [Judul Bab 4]
            </a>
            <a href="#bab-5" class="hover:text-editorial-accent flex items-center gap-1.5">
              <span class="text-editorial-lightmuted font-mono">05.</span> [Judul Bab 5]
            </a>
            <a href="#bab-6" class="hover:text-editorial-accent flex items-center gap-1.5">
              <span class="text-editorial-lightmuted font-mono">06.</span> [Judul Bab 6]
            </a>
          </div>
        </nav>

        <!-- SECTIONS 1 TO 6 -->
        <section id="bab-1">
          <h2>01. [Judul Bab 1]</h2>
          <p class="editorial-dropcap">
            [Paragraf pembuka bab 1 yang secara otomatis memiliki huruf depan besar dekoratif editorial.]
          </p>
          <p>
            [Paragraf lanjutan dengan analisis data dan fakta mendalam...]
          </p>
        </section>

        <!-- (Lanjutkan hingga Bab 6) -->

        <!-- METADATA & CITATION SECTION -->
        <section class="mt-16 pt-8 border-t border-editorial-line text-xs font-sans text-editorial-muted">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div class="font-bold text-editorial-ink uppercase tracking-wider mb-2">Informasi Publikasi Resmi</div>
              <ul class="space-y-1">
                <li><strong>Judul Asli:</strong> [Judul Bahasa Inggris]</li>
                <li><strong>Penulis:</strong> [Semua Penulis]</li>
                <li><strong>Afiliasi:</strong> [Afiliasi]</li>
                <li><strong>Jurnal:</strong> [Jurnal, Volume, Halaman, Tahun]</li>
                <li><strong>DOI:</strong> <a href="[URL]" target="_blank" class="text-editorial-accent hover:underline">[Nomor DOI]</a></li>
              </ul>

              <!-- Citation Buttons -->
              <div class="mt-4 flex flex-wrap gap-2">
                <button onclick="copyCitation('apa', '[Sitasi APA Lengkap]')" class="reader-toolbar-btn">
                  <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                  Salin Sitasi APA
                </button>
                <button onclick="copyCitation('bibtex', '[Format BibTeX]')" class="reader-toolbar-btn">
                  <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                  Salin BibTeX
                </button>
              </div>
            </div>
            <div>
              <div class="font-bold text-editorial-ink uppercase tracking-wider mb-2">Metodologi & Parameter Riset</div>
              <ul class="space-y-1">
                <li><strong>Metode Kunci:</strong> [Detail Metode]</li>
                <li><strong>Instrumen/Software:</strong> [Software/Instrumen]</li>
                <li><strong>Validasi:</strong> [Validasi]</li>
              </ul>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-editorial-line flex items-center justify-between">
            <a href="../../index.html" class="inline-flex items-center gap-1.5 text-xs font-semibold text-editorial-ink hover:text-editorial-accent">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Kembali ke Katalog Utama Paper-Hub
            </a>
            <span class="text-editorial-lightmuted">TelaahSains Hub • Format Editorial Sains Bebas AI Workslop</span>
          </div>
        </section>

      </main>

      <!-- SIDEBAR NAVIGATION & GLOSSARY (Cols 9-12) -->
      <aside class="lg:col-span-4 space-y-8 font-sans">
        
        <!-- STICKY CONTAINER -->
        <div class="sticky top-20 space-y-6">
          
          <!-- CARD 1: DAFTAR ISI ARTIKEL (Wajib ID #toc-list untuk ScrollSpy) -->
          <div class="bg-white border border-editorial-line rounded p-5">
            <h4 class="text-xs font-bold uppercase tracking-wider text-editorial-ink mb-3 pb-2 border-b border-editorial-line">
              Daftar Isi Artikel
            </h4>
            <nav class="space-y-1.5 text-xs text-editorial-muted" id="toc-list">
              <a href="#bab-1" class="block py-1 hover:text-editorial-accent transition-colors">• 1. [Judul Singkat Bab 1]</a>
              <a href="#bab-2" class="block py-1 hover:text-editorial-accent transition-colors">• 2. [Judul Singkat Bab 2]</a>
              <a href="#bab-3" class="block py-1 hover:text-editorial-accent transition-colors">• 3. [Judul Singkat Bab 3]</a>
              <a href="#bab-4" class="block py-1 hover:text-editorial-accent transition-colors">• 4. [Judul Singkat Bab 4]</a>
              <a href="#bab-5" class="block py-1 hover:text-editorial-accent transition-colors">• 5. [Judul Singkat Bab 5]</a>
              <a href="#bab-6" class="block py-1 hover:text-editorial-accent transition-colors">• 6. [Judul Singkat Bab 6]</a>
            </nav>
          </div>

          <!-- CARD 2: GLOSARIUM ISTILAH KUNCI (5 Istilah Relevan) -->
          <div class="bg-white border border-editorial-line rounded p-5 space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-editorial-ink pb-2 border-b border-editorial-line">
              Glosarium Istilah Kunci
            </h4>
            <div class="space-y-3 text-xs">
              <div>
                <span class="font-semibold text-editorial-ink">[Istilah 1]:</span>
                <p class="text-editorial-muted mt-0.5">[Definisi padat dan informatif]</p>
              </div>
              <div>
                <span class="font-semibold text-editorial-ink">[Istilah 2]:</span>
                <p class="text-editorial-muted mt-0.5">[Definisi padat dan informatif]</p>
              </div>
              <div>
                <span class="font-semibold text-editorial-ink">[Istilah 3]:</span>
                <p class="text-editorial-muted mt-0.5">[Definisi padat dan informatif]</p>
              </div>
              <div>
                <span class="font-semibold text-editorial-ink">[Istilah 4]:</span>
                <p class="text-editorial-muted mt-0.5">[Definisi padat dan informatif]</p>
              </div>
              <div>
                <span class="font-semibold text-editorial-ink">[Istilah 5]:</span>
                <p class="text-editorial-muted mt-0.5">[Definisi padat dan informatif]</p>
              </div>
            </div>
          </div>

          <!-- CARD 3: INDEKS GAMBAR PAPER -->
          <div class="bg-white border border-editorial-line rounded p-5">
            <h4 class="text-xs font-bold uppercase tracking-wider text-editorial-ink mb-3 pb-2 border-b border-editorial-line">
              Indeks Gambar Paper
            </h4>
            <ul class="text-xs space-y-2 text-editorial-muted">
              <li>
                <a href="#bab-x" class="hover:text-editorial-accent flex items-center justify-between">
                  <span>Fig. 1: [Keterangan Gambar 1]</span>
                  <span class="text-editorial-lightmuted font-mono">p. [Hal]</span>
                </a>
              </li>
              <li>
                <a href="#bab-y" class="hover:text-editorial-accent flex items-center justify-between">
                  <span>Fig. 2: [Keterangan Gambar 2]</span>
                  <span class="text-editorial-lightmuted font-mono">p. [Hal]</span>
                </a>
              </li>
            </ul>
          </div>

        </div>
      </aside>

    </div>
  </div>

  <!-- LIGHTBOX MODAL FOR FULL RESOLUTION IMAGE INSPECTION -->
  <div id="lightbox" class="fixed inset-0 bg-black/80 z-50 hidden flex flex-col items-center justify-center p-4 backdrop-blur-xs" onclick="closeLightbox()">
    <div class="relative max-w-5xl max-h-[90vh] flex flex-col items-center" onclick="event.stopPropagation()">
      <button onclick="closeLightbox()" class="absolute -top-10 right-0 text-white hover:text-zinc-300 text-sm font-mono flex items-center gap-1">
        <span>Tutup [ESC]</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
      <img id="lightbox-img" src="" alt="" class="max-w-full max-h-[80vh] object-contain rounded bg-white p-2 shadow-2xl">
      <p id="lightbox-caption" class="text-zinc-200 text-xs text-center mt-3 max-w-2xl font-sans"></p>
    </div>
  </div>

  <!-- INLINE TOGGLE SUMMARY SCRIPT -->
  <script>
    function toggleSummary() {
      const content = document.getElementById('summary-content');
      const chevron = document.getElementById('summary-chevron');
      if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        chevron.textContent = '[- tutup]';
      } else {
        content.classList.add('hidden');
        chevron.textContent = '[+ buka]';
      }
    }
  </script>

  <!-- SHARED READER EXPERIENCE SCRIPT -->
  <script src="../../shared/reader.js"></script>

</body>
</html>
```

---

## 4. Spesifikasi Elemen Editorial di Dalam Naskah (`article-body`)

Semua elemen di dalam `<main class="lg:col-span-8 article-body">` harus menggunakan komponen berikut:

### 4.1 Paragraf Pertama Pembuka Bab (`.editorial-dropcap`)
```html
<p class="editorial-dropcap">
  Huruf pertama akan otomatis berukuran besar bergaya font serif bergaris tebal.
</p>
```

### 4.2 Kotak Penekanan / Poin Penting (`.callout-box`)
```html
<div class="callout-box">
  <div class="callout-title">Temuan Utama & Signifikansi Mekanistik</div>
  <p class="callout-body">
    Isi pembahasan poin kunci yang menuntut perhatian khusus pembaca...
  </p>
</div>
```

### 4.3 Wadah Gambar / Grafik Riset (`.figure-container`)
```html
<figure class="figure-container">
  <img 
    src="assets/fig1_struktur.png" 
    alt="Deskripsi lengkap gambar" 
    class="w-full h-auto cursor-zoom-in rounded border border-editorial-line/60"
    onclick="openLightbox(this.src, this.alt)"
  >
  <figcaption class="mt-3 text-xs text-editorial-muted font-sans leading-normal">
    <strong class="text-editorial-ink font-semibold">Fig. 1.</strong> Keterangan gambar dengan konteks biologi/fisika lengkap.
  </figcaption>
</figure>
```

### 4.4 Tabel Data Kuantitatif (`.editorial-table`)
Tabel data numerik harus dibungkus `<div class="overflow-x-auto">`:
```html
<div class="overflow-x-auto my-6">
  <table class="editorial-table">
    <thead>
      <tr>
        <th>Sistem Material</th>
        <th>Celah Pita (eV)</th>
        <th>Mobilitas (cm²·V⁻¹·s⁻¹)</th>
        <th>E_form (eV/atom)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-medium text-editorial-ink">2d-SiP (Monolayer)</td>
        <td class="font-mono">2.61</td>
        <td class="font-mono">~450</td>
        <td class="font-mono">-0.17</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 5. Checklist Verifikasi Mandiri (Quality Assurance)

Sebelum melakukan `git commit` dan `push` untuk paper baru:

- [ ] **Struktur 3-Kolom Utuh**: Apakah pembungkus `grid grid-cols-1 lg:grid-cols-12 gap-10` memiliki `main.lg:col-span-8` dan `aside.lg:col-span-4`?
- [ ] **3 Kartu Wajib di Aside**: Apakah ada kartu `#toc-list`, Glosarium Istilah Kunci, dan Indeks Gambar Paper?
- [ ] **Bebas LaTeX Delimiter**: Tidak ada `$`, `$$`, `\(`, atau `\[` di seluruh file HTML.
- [ ] **Executive Summary Accordion**: Apakah blok ringkasan 4 poin ada di atas navigasi bab dan fungsi `toggleSummary()` terdefinisi?
- [ ] **Dropcap**: Apakah paragraf pertama pada setiap bab telaah menggunakan kelas `editorial-dropcap`?
- [ ] **Lightbox**: Apakah semua tag `<img>` memiliki handler `onclick="openLightbox(this.src, this.alt)"` dan elemen `#lightbox` ada di bawah?
- [ ] **Script Shared Reader**: Apakah `<script src="../../shared/reader.js"></script>` terpasang sebelum `</body>`?
- [ ] **Sinkronisasi Katalog Utama**: Apakah paper baru telah ditambahkan ke `index.html` dengan kartu preview yang seragam?
