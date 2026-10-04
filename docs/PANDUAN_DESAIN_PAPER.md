# Panduan Desain & Standar Editorial TelaahSains Hub (Paper Hub)

Dokumen ini merupakan spesifikasi master dan acuan baku definitif untuk pembuatan serta pemeliharaan seluruh halaman paper di TelaahSains Hub. Seluruh format, komponen visual, dan tata letak didasarkan secara presisi pada format otentik paper terdahulu (Paper 01–05). Semua kontributor manusia maupun model AI **wajib** mengikuti standar dalam panduan ini guna memastikan konsistensi visual 100% dan integritas editorial sains berkualitas tinggi tanpa *workslop*.

---

## 1. Filosofi Desain & Standar Editorial

1. **Editorial Sains Berwibawa (Anti-AI-Workslop)**:
   - Konten telaah bukan ringkasan generik atau *bullet-point* dangkal. Teks menyajikan pembedahan mendalam terhadap metodologi komputasi/eksperimen, data numerik riil, kinetika/termodinamika, kristalografi, serta implikasi industri atau klinis dari naskah asli.
   - Gaya penulisan mengacu pada standar editorial jurnal sains papan atas (*Nature*, *Science*, *Advanced Materials*, *Cell*), disajikan dalam Bahasa Indonesia ilmiah yang lugas, presisi, dan elegan.

2. **Tata Letak Baku 3-Kolom Seimbang (Balanced Three-Column Layout)**:
   - **Kolom Kiri**: Panel Catatan Pembaca Personal (disuntikkan secara dinamis oleh `shared/reader.js` pada `#reader-left-sidebar`), bersifat *sticky* mengikuti *scroll*.
   - **Kolom Tengah (`lg:col-span-8`)**: Naskah telaah utama, tabel data publikasi, diagram/mikroskopi resolusi tinggi, kotak persamaan, dan blok sitasi resmi.
   - **Kolom Kanan (`lg:col-span-4`)**: Sidebar navigasi *sticky* berisi 3 kartu wajib: **Daftar Isi Artikel** (`#toc-list` dengan ScrollSpy), **Glosarium Istilah Kunci**, dan **Indeks Gambar Paper**.

3. **Interaktivitas Terpadu**:
   - Sinkronisasi status selesai baca (`reader.js` <-> `localStorage` <-> katalog utama `index.html`).
   - ScrollSpy TOC dinamis yang menyorot posisi bab aktif saat halaman digulir.
   - Lightbox modal resolusi tinggi untuk seluruh inspeksi visual gambar dan skema ilmiah.
   - Tombol salin sitasi cepat 1-klik (format APA dan BibTeX) dengan notifikasi *toast*.

---

## 2. Standar Notasi Ilmiah & Matematika (Bebas Kerusakan Renderer Terminal)

Demi mencegah rusaknya spasi vertikal, keterpotongan tabel, dan pembelahan tag tebal (**bold**):

1. **Dilarang Keras Menggunakan Delimiter LaTeX Math**:
   - **JANGAN PERNAH** menggunakan `$`, `$$`, `\(`, atau `\[` di mana pun dalam HTML, atribut teks, maupun komentar.
   - Jangan menulis `$10^{20}$`, `$V_{cell}$`, `$E_{ads}$`, `$\Delta E_{rxn}$`, `$E_{hull}$`, `$\sigma_{eff}$`, atau `$\sim 6.3 \times 10^{19}$`.

2. **Gunakan Unicode Superscript & Subscript**:
   - Satuan & Eksponen: `Å` (bukan `\AA`), `cm²·V⁻¹·s⁻¹`, `10²⁰`, `cm⁻³`, `(Ω·m·s)⁻¹`, `W·m⁻¹·K⁻¹·s⁻¹`, `Å³`, `eV`, `°C`.
   - Simbol Relasi: `≈` atau `~` (bukan `\sim`), `>>` atau `≫` (bukan `\gg`), `→` (bukan `\to`), `Δ` (bukan `\Delta`).

3. **Gunakan Inline Code Backtick untuk Besaran Fisik & Energi**:
   - Tulis besaran seperti `E_ads`, `ΔE_rxn`, `E_g`, `E_form`, `E_hull`, `σ_eff`, `ΔG`, `ΔH`, `R_ct`, `L_SSE`, `d_SEI` di dalam tanda backtick tunggal.
   - Perbandingan & nilai mutlak: `|E_ads(MCA)| > |E_ads(MCH)| > |E_ads(MNC)|` (dalam satu baris kode inline utuh).

4. **Tabel Data Ilmiah**:
   - Setiap sel tabel harus berupa teks sebaris atau backticked code. Jangan menggunakan *line break* `<br>` berlebihan di dalam sel tabel numerik.

---

## 3. Anatomi Kerangka Lengkap (Master HTML Skeleton)

Setiap file `papers/<slug-paper>/index.html` wajib mengimplementasikan struktur baku berikut:

```html
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Judul Paper Bahasa Indonesia] — TelaahSains Hub</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Google Fonts: Newsreader (Serif Editorial) & Plus Jakarta Sans (UI Sans) & JetBrains Mono -->
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
              ink: '#161616',        /* Deep charcoal black for text */
              body: '#262626',       /* Warm reading body text */
              muted: '#666666',      /* Subtle secondary meta */
              lightmuted: '#8c8c8c', /* Captions & tiny labels */
              line: '#e5e5e5',       /* Hairline dividers */
              softbg: '#fafafa',     /* Off-white background */
              paper: '#ffffff',      /* Pure white card backgrounds */
              accent: '#0a74c0',     /* Royal Society of Chemistry editorial blue */
              accentDark: '#08538a', /* Deep hover blue */
              accentLight: '#f0f7fc' /* Minimalist blue wash for active states */
            }
          },
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            serif: ['"Newsreader"', 'Georgia', 'serif'],
            mono: ['"JetBrains Mono"', 'monospace']
          }
        }
      }
    }
  </script>

  <style>
    /* Editorial Typographic Rhythm (Baku Paper 01-05) */
    body {
      background-color: #fafafa;
      color: #262626;
      -webkit-font-smoothing: antialiased;
    }
    
    .article-body p {
      font-family: "Newsreader", Georgia, serif;
      font-size: 1.125rem; /* 18px */
      line-height: 1.82;
      color: #262626;
      margin-bottom: 1.6rem;
    }

    .article-body p strong {
      font-weight: 600;
      color: #161616;
    }

    .editorial-dropcap::first-letter {
      font-size: 4rem;
      float: left;
      line-height: 0.8;
      margin-right: 0.65rem;
      margin-top: 0.25rem;
      font-weight: 600;
      color: #161616;
      font-family: "Newsreader", Georgia, serif;
    }

    /* Publication-style Scientific Table */
    .pub-table {
      border-top: 2px solid #161616;
      border-bottom: 2px solid #161616;
      width: 100%;
    }
    .pub-table th {
      border-bottom: 1px solid #161616;
      font-family: "Plus Jakarta Sans", sans-serif;
      font-weight: 600;
      font-size: 0.8125rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.75rem 0.5rem;
    }
    .pub-table td {
      border-bottom: 1px solid #eeeeee;
      font-family: "Plus Jakarta Sans", sans-serif;
      font-size: 0.875rem;
      padding: 0.75rem 0.5rem;
    }
    .pub-table tr:last-child td {
      border-bottom: none;
    }

    /* Reading Indicator */
    #reading-progress {
      transition: width 0.1s ease-out;
    }

    /* Figure Box */
    .figure-container {
      background: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      padding: 1.25rem;
      margin: 2.5rem 0;
    }
  </style>

  <!-- Shared Reader System CSS -->
  <link rel="stylesheet" href="../../shared/reader.css">
</head>

<body class="selection:bg-editorial-accentLight selection:text-editorial-accent" data-paper-id="[Nomor Dua Digit: 01, 02, ...]">

  <!-- TOP HEADER & PROGRESS STRIP -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-editorial-line font-sans transition-all">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <a href="../../index.html" class="flex items-center gap-2 text-xs font-semibold text-editorial-ink hover:text-editorial-accent transition-colors">
          <svg class="w-4 h-4 text-editorial-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Katalog Utama</span>
        </a>
        <span class="text-editorial-line">/</span>
        <span class="text-xs font-mono text-editorial-muted">Paper #[Nomor]</span>
      </div>

      <div class="flex items-center gap-4 text-xs font-sans text-editorial-muted">
        <span class="hidden sm:inline">Estimasi Baca: [XX] Menit</span>
        <div class="h-3 w-px bg-editorial-line hidden sm:inline"></div>
        <span class="font-mono text-editorial-ink font-semibold">[Nama Jurnal Singkat]</span>
      </div>
    </div>
    <!-- Reading Progress Indicator -->
    <div id="reading-progress" class="h-0.5 bg-editorial-accent w-0 transition-all duration-150"></div>
  </header>

  <!-- ARTICLE HERO SECTION -->
  <section class="bg-white border-b border-editorial-line pt-12 pb-10">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Category Tag & Meta (Format Teks Uppercase Bersih, BUKAN badge pill) -->
      <div class="flex items-center gap-3 text-xs font-semibold tracking-wider uppercase text-editorial-accent mb-4 font-sans">
        <span>[Kategori Bidang]</span>
        <span class="text-editorial-line">•</span>
        <span class="text-editorial-muted">[Subtopik / Metode Spesifik]</span>
      </div>

      <!-- Main Headline (Font Sans Bold, Leading Rapat) -->
      <h1 class="text-3xl sm:text-4xl lg:text-[42px] font-bold text-editorial-ink tracking-tight font-sans leading-[1.18] mb-6">
        [Judul Komprehensif Bahasa Indonesia]
      </h1>

      <!-- Standfirst / Lead Paragraph (Font Serif Italic dengan Aksen Border Kiri) -->
      <p class="text-lg sm:text-xl font-serif italic text-editorial-body leading-relaxed mb-8 border-l-2 border-editorial-accent pl-5">
        [Lead editorial mendalam yang merangkum urgensi riset, metode kunci, dan temuan puncak secara elegan.]
      </p>

      <!-- Authors & Affiliations Strip (Bersih, Rata Kiri & Kanan) -->
      <div class="pt-6 border-t border-editorial-line flex flex-wrap items-center justify-between gap-4 text-xs text-editorial-muted font-sans">
        <div>
          <div class="text-editorial-ink font-semibold text-sm">
            [Daftar Penulis Lengkap]*
          </div>
          <div class="mt-1 text-editorial-muted">
            [Afiliasi Universitas / Lembaga Riset Penulis]
          </div>
        </div>
        <div class="text-right">
          <div class="text-editorial-ink font-medium">[Nama Jurnal Lengkap] • [Open Access/Status]</div>
          <div>[Volume/Artikel, Tahun] • DOI: [Nomor DOI]</div>
        </div>
      </div>

    </div>
  </section>

  <!-- KEY FINDINGS AT A GLANCE (Wadah Kartu Putih Tunggal Elegan) -->
  <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white border border-editorial-line rounded p-6 shadow-sm font-sans">
      <h2 class="text-xs font-bold uppercase tracking-wider text-editorial-ink mb-4 flex items-center justify-between border-b border-editorial-line pb-2">
        <span>Rangkuman Angka Kunci Kinerja [Subjek Riset]</span>
        <span class="text-editorial-muted font-normal lowercase font-mono">[Penulis et al., Tahun]</span>
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
        <div>
          <div class="text-xs text-editorial-muted">[Parameter 1]</div>
          <div class="text-2xl font-bold text-editorial-ink mt-0.5">[Nilai] <span class="text-xs font-normal text-editorial-muted">[Satuan]</span></div>
          <div class="text-[11px] text-editorial-muted mt-1">[Keterangan komparatif singkat]</div>
        </div>
        <div>
          <div class="text-xs text-editorial-muted">[Parameter 2]</div>
          <div class="text-2xl font-bold text-editorial-ink mt-0.5">[Nilai] <span class="text-xs font-normal text-editorial-muted">[Satuan]</span></div>
          <div class="text-[11px] text-editorial-muted mt-1">[Keterangan komparatif singkat]</div>
        </div>
        <div>
          <div class="text-xs text-editorial-muted">[Parameter 3]</div>
          <div class="text-2xl font-bold text-editorial-ink mt-0.5">[Nilai] <span class="text-xs font-normal text-editorial-muted">[Satuan]</span></div>
          <div class="text-[11px] text-editorial-muted mt-1">[Keterangan komparatif singkat]</div>
        </div>
        <div>
          <div class="text-xs text-editorial-muted">[Parameter 4]</div>
          <div class="text-2xl font-bold text-editorial-ink mt-0.5">[Nilai] <span class="text-xs font-normal text-editorial-muted">[Satuan]</span></div>
          <div class="text-[11px] text-editorial-muted mt-1">[Keterangan komparatif singkat]</div>
        </div>
      </div>
    </div>
  </section>

  <!-- MAIN ARTICLE LAYOUT (3 Columns: Left Notes + Center Article + Right Aside) -->
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      
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

        <!-- SECTIONS 1 TO 6 (Nomor Bab Bulat 1., 2., ... tanpa nol di depan pada Heading) -->
        <section id="bab-1" class="pt-2">
          <h2 class="text-2xl font-bold font-sans text-editorial-ink tracking-tight mb-4">
            1. [Judul Bab 1]
          </h2>
          <p class="editorial-dropcap">
            [Paragraf pembuka bab 1 dengan huruf inisial besar klasik editorial.]
          </p>
          <p>
            [Paragraf isi mendalam...]
          </p>
        </section>

        <!-- SECTION 2 S/D 5 (Gunakan class="pt-8") -->
        <section id="bab-2" class="pt-8">
          <h2 class="text-2xl font-bold font-sans text-editorial-ink tracking-tight mb-4">
            2. [Judul Bab 2]
          </h2>
          <!-- Figure Container Baku -->
          <figure class="figure-container">
            <div class="overflow-hidden flex justify-center bg-white p-2">
              <img 
                src="assets/fig1_[nama].png" 
                alt="[Deskripsi Gambar 1]" 
                class="w-full max-w-2xl h-auto object-contain cursor-zoom-in hover:opacity-95 transition-opacity"
                onclick="openLightbox('assets/fig1_[nama].png', 'Gambar 1: [Judul Singkat]')"
              >
            </div>
            <figcaption class="mt-4 pt-3 border-t border-editorial-line text-xs font-sans text-editorial-muted leading-relaxed">
              <span class="font-bold text-editorial-ink">Gambar 1 | [Judul Gambar].</span> 
              [Keterangan detail gambar...]
              <div class="mt-1 text-[11px] text-editorial-lightmuted">Sumber: [Penulis et al., Jurnal Tahun]. (Klik gambar untuk perbesar)</div>
            </figcaption>
          </figure>
        </section>

        <!-- SECTION 6 (Penutup & Garis Pemisah Atas: class="pt-8 border-t border-editorial-line mt-10") -->
        <section id="bab-6" class="pt-8 border-t border-editorial-line mt-10">
          <h2 class="text-2xl font-bold font-sans text-editorial-ink tracking-tight mb-4">
            6. [Judul Bab 6 Kesimpulan & Prospek]
          </h2>
          <p class="editorial-dropcap">
            [Paragraf kesimpulan...]
          </p>

          <!-- CITATION BLOCK RESMI (Format APA & Tombol Salin BibTeX) -->
          <div class="mt-10 p-5 bg-white border border-editorial-line rounded font-sans">
            <div class="text-xs font-bold uppercase tracking-wider text-editorial-ink mb-2">
              Sitasi Paper Resmi (APA Format)
            </div>
            <p class="font-mono text-xs text-editorial-body leading-relaxed select-all">
              [Teks sitasi APA lengkap...]
            </p>

            <!-- Quick Copy Buttons -->
            <div class="mt-4 flex flex-wrap gap-2">
              <button onclick="copyCitation('apa', '[Teks sitasi APA]')" class="reader-toolbar-btn">
                <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                Salin Sitasi APA
              </button>
              <button onclick="copyCitation('bibtex', '@article{...}')" class="reader-toolbar-btn">
                <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                Salin BibTeX
              </button>
            </div>
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
              <a href="#bab-1" class="block py-1 hover:text-editorial-accent transition-colors">• 1. [Judul Ringkas Bab 1]</a>
              <a href="#bab-2" class="block py-1 hover:text-editorial-accent transition-colors">• 2. [Judul Ringkas Bab 2]</a>
              <a href="#bab-3" class="block py-1 hover:text-editorial-accent transition-colors">• 3. [Judul Ringkas Bab 3]</a>
              <a href="#bab-4" class="block py-1 hover:text-editorial-accent transition-colors">• 4. [Judul Ringkas Bab 4]</a>
              <a href="#bab-5" class="block py-1 hover:text-editorial-accent transition-colors">• 5. [Judul Ringkas Bab 5]</a>
              <a href="#bab-6" class="block py-1 hover:text-editorial-accent transition-colors">• 6. [Judul Ringkas Bab 6]</a>
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
                <p class="text-editorial-muted mt-0.5">[Definisi padat dan esensial.]</p>
              </div>
              <div>
                <span class="font-semibold text-editorial-ink">[Istilah 2]:</span>
                <p class="text-editorial-muted mt-0.5">[Definisi padat dan esensial.]</p>
              </div>
              <div>
                <span class="font-semibold text-editorial-ink">[Istilah 3]:</span>
                <p class="text-editorial-muted mt-0.5">[Definisi padat dan esensial.]</p>
              </div>
              <div>
                <span class="font-semibold text-editorial-ink">[Istilah 4]:</span>
                <p class="text-editorial-muted mt-0.5">[Definisi padat dan esensial.]</p>
              </div>
              <div>
                <span class="font-semibold text-editorial-ink">[Istilah 5]:</span>
                <p class="text-editorial-muted mt-0.5">[Definisi padat dan esensial.]</p>
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
                  <span>Fig. 1: [Topik Gambar 1]</span>
                  <span class="text-editorial-lightmuted font-mono">p. [Hal]</span>
                </a>
              </li>
              <li>
                <a href="#bab-y" class="hover:text-editorial-accent flex items-center justify-between">
                  <span>Fig. 2: [Topik Gambar 2]</span>
                  <span class="text-editorial-lightmuted font-mono">p. [Hal]</span>
                </a>
              </li>
            </ul>
          </div>

        </div>
      </aside>

    </div>
  </div>

  <!-- LIGHTBOX MODAL (For full-res image viewing) -->
  <div id="lightbox" class="fixed inset-0 bg-black/80 z-50 hidden flex flex-col items-center justify-center p-4 backdrop-blur-sm" onclick="closeLightbox()">
    <div class="relative max-w-5xl max-h-[90vh] bg-white rounded p-3 shadow-2xl flex flex-col" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between pb-2 mb-2 border-b border-editorial-line text-xs font-sans text-editorial-ink">
        <span id="lightbox-caption" class="font-bold"></span>
        <button onclick="closeLightbox()" class="p-1 hover:bg-editorial-softbg rounded text-editorial-muted hover:text-editorial-ink">
          ✕ Tutup
        </button>
      </div>
      <div class="overflow-auto max-h-[80vh] flex items-center justify-center p-2">
        <img id="lightbox-img" src="" alt="" class="max-w-full max-h-[75vh] object-contain">
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <footer class="border-t border-editorial-line bg-white py-10 text-xs text-editorial-muted font-sans">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <span class="font-bold text-editorial-ink">KimiaFokus</span> — Diseminasi Riset Sains Material Indonesia bergaya editorial terpercaya.
      </div>
      <div class="flex items-center gap-4">
        <a href="https://doi.org/[DOI]" target="_blank" class="hover:underline text-editorial-accent">Paper Asli di [Publisher]</a>
        <span>•</span>
        <a href="#" class="hover:text-editorial-ink">Kembali ke Atas ↑</a>
      </div>
    </div>
  </footer>

  <!-- SCRIPT -->
  <script>
    // Minimalist Summary Toggle
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

  <!-- Shared Reader Experience Script -->
  <script src="../../shared/reader.js"></script>

</body>
</html>
```

---

## 4. Spesifikasi Elemen Editorial di Dalam Naskah (`article-body`)

Semua komponen naskah di dalam `<main class="lg:col-span-8 article-body">` harus menggunakan format spesifik berikut:

### 4.1 Paragraf Pertama Pembuka Bab (`.editorial-dropcap`)
```html
<p class="editorial-dropcap">
  Huruf pertama akan otomatis berukuran 4rem berfont Newsreader serif klasik dengan margin floating presisi.
</p>
```

### 4.2 Kotak Catatan / Penekanan Mekanistik (Callout Box)
```html
<div class="my-6 p-5 bg-[#f0f7fc] border-l-4 border-editorial-accent rounded-r">
  <div class="font-bold text-editorial-accent text-sm font-sans mb-1.5">[Judul Penekanan Mekanistik]</div>
  <div class="text-xs sm:text-sm font-sans text-editorial-body leading-relaxed space-y-2">
    <p>[Pembahasan mendalam...]</p>
  </div>
</div>
```

### 4.3 Wadah Gambar / Mikroskopi Ilmiah (`.figure-container`)
```html
<figure class="figure-container">
  <div class="overflow-hidden flex justify-center bg-white p-2">
    <img 
      src="assets/fig1_struktur.png" 
      alt="Deskripsi visual" 
      class="w-full max-w-2xl h-auto object-contain cursor-zoom-in hover:opacity-95 transition-opacity"
      onclick="openLightbox('assets/fig1_struktur.png', 'Gambar 1: Deskripsi')"
    >
  </div>
  <figcaption class="mt-4 pt-3 border-t border-editorial-line text-xs font-sans text-editorial-muted leading-relaxed">
    <span class="font-bold text-editorial-ink">Gambar 1 | [Judul Gambar].</span> 
    [Deskripsi rinci panel (a), (b), (c)...]
    <div class="mt-1 text-[11px] text-editorial-lightmuted">Sumber: [Sitasi]. (Klik gambar untuk perbesar)</div>
  </figcaption>
</figure>
```

### 4.4 Tabel Data Kuantitatif Publikasi (`.pub-table`)
```html
<div class="my-6">
  <div class="text-xs font-semibold text-editorial-muted uppercase tracking-wider mb-2 font-sans">
    Tabel 1 | [Judul Tabel Data Komparasi]
  </div>
  <div class="overflow-x-auto">
    <table class="pub-table">
      <thead>
        <tr class="text-editorial-ink">
          <th class="text-left">Material / Sampel</th>
          <th class="text-left">Kondisi Uji</th>
          <th class="text-right">Parameter A</th>
          <th class="text-right">Parameter B</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="font-medium text-editorial-ink">[Sampel Utama]</td>
          <td>[Kondisi]</td>
          <td class="text-right font-mono">[Nilai]</td>
          <td class="text-right font-mono">[Nilai]</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### 4.5 Kotak Persamaan Ilmiah (Publication Equation Card)
```html
<div class="my-6 p-4 bg-editorial-softbg border border-editorial-line rounded font-mono text-sm space-y-3">
  <div class="flex items-center justify-between border-b border-editorial-line pb-2">
    <span class="text-xs uppercase font-sans font-bold text-editorial-muted">Langkah 1 • [Nama Tahap / Persamaan]</span>
    <span class="text-xs text-editorial-lightmuted">(Persamaan 1)</span>
  </div>
  <div class="text-center py-1 text-editorial-ink font-semibold">
    f_r = [8N(P) + 6N(PS) + 4N(PS₂) + 2N(PS₃)] / [8Z]
  </div>
</div>
```

---

## 5. Checklist Verifikasi Mandiri (Quality Assurance)

Sebelum melakukan `git commit` dan `push` untuk paper baru:

- [ ] **Kategori Hero**: Teks uppercase bersih (`text-xs font-semibold uppercase text-editorial-accent`), BUKAN badge berlatar biru (`bg-blue-50`).
- [ ] **Headline**: Font Sans Bold (`font-sans font-bold leading-[1.18] text-3xl sm:text-4xl lg:text-[42px] mb-6`).
- [ ] **Standfirst**: Font Serif Italic bergaris aksen kiri (`font-serif italic border-l-2 border-editorial-accent pl-5`).
- [ ] **Rangkuman Angka Kunci (Key Findings)**: Menggunakan wadah kartu putih tunggal (`bg-white border rounded p-6 shadow-sm`) tepat di bawah hero, bukan 4 kartu terpisah berlatar abu-abu.
- [ ] **Tidak Ada Gambar di Hero**: Seluruh visualisasi berada di dalam bab naskah artikel, bukan di dalam section hero.
- [ ] **Penomoran Bab**: Angka bulat `1.`, `2.`, `3.` (bukan `01.`) dengan tag `<h2 class="text-2xl font-bold font-sans text-editorial-ink tracking-tight mb-4">`.
- [ ] **Struktur 3-Kolom Utuh**: Pembungkus `grid grid-cols-1 lg:grid-cols-12 gap-12` dengan `main.lg:col-span-8` dan `aside.lg:col-span-4`.
- [ ] **3 Kartu Wajib di Aside**: Terdapat `#toc-list` (Daftar Isi), Glosarium Istilah Kunci, dan Indeks Gambar Paper.
- [ ] **Bebas LaTeX Delimiter**: Tidak ada `$`, `$$`, `\(`, atau `\[` di mana pun dalam HTML.
- [ ] **Dropcap**: Paragraf pertama pada setiap bab telaah menggunakan kelas `editorial-dropcap`.
- [ ] **Tabel Ilmiah**: Menggunakan struktur `.pub-table` bergaris ganda publikasi.
- [ ] **Blok Sitasi & Footer**: Terdapat blok sitasi resmi ber-format APA & BibTeX di ujung bab 6, serta footer di bawah naskah.
- [ ] **Script Shared Reader**: `<script src="../../shared/reader.js"></script>` terpasang sebelum `</body>`.
