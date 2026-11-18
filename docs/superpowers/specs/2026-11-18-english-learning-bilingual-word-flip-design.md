# Spesifikasi Desain: Mode Belajar Bahasa Inggris (Kartu Kata 3D & Bilingual Per Kalimat)

**Tanggal:** 18 November 2026  
**Status:** Draft untuk Tinjauan Pengguna  
**Pilot Target:** Paper #14 (`papers/14-solution-plasma-ptco-her/index.html`)  

---

## 1. Tujuan & Masalah yang Diselesaikan

Pengguna ingin berlatih membaca artikel ilmiah langsung dalam bahasa Inggris (*full English*) secara bertahap agar kelak mampu memahami jurnal asli tanpa bergantung pada terjemahan bahasa Indonesia penuh. Untuk mendukung transisi ini tanpa merusak tipografi editorial TelaahSains Hub (*Newsreader* + *Plus Jakarta Sans*, tema *Paper / Sepia / Dark*), sistem menyediakan **tiga mode baca** yang dapat dialihkan secara instan pada satu halaman artikel yang sama:

1. **Mode `EN` (Baca Murni):** Teks 100% bahasa Inggris mengalir normal tanpa gangguan visual.
2. **Mode `EN ⇄ ID` (Kartu Kata 3D):** Teks tetap mengalir sebagai paragraf bahasa Inggris normal, namun setiap kata bahasa Inggris interaktif dapat diklik untuk memunculkan **kartu 3D mengambang** (*floating flip-card*) di atas kata tersebut berisi arti kontekstual dan tombol simpan kosakata.
3. **Mode `EN + ID` (Bilingual per Kalimat):** Setiap satu kalimat bahasa Inggris diikuti langsung oleh terjemahan bahasa Indonesianya tepat di bawah kalimat tersebut (*sentence-by-sentence*), sekaligus tetap mempertahankan fitur klik kata jika pengguna ingin memeriksa arti kata tertentu.

---

## 2. Arsitektur & Pemisahan Komponen

Sistem dibagi menjadi tiga unit terisolasi dengan antarmuka yang jelas:

### 2.1 Kontrol Global (`shared/language-tutor.css` & `shared/language-tutor.js`)
- **Aktivasi Terkendali:** Modul hanya menginisialisasi UI pengalih mode dan tokenizer apabila elemen `<body>` memiliki atribut `data-bilingual="true"`. Dengan demikian, Paper #01–#13 tetap berjalan persis seperti sebelumnya tanpa regresi selama masa uji coba.
- **Persistensi Preferensi:** Pilihan mode baca disimpan pada `localStorage` dengan kunci `telaahsains_lang_mode` (nilai valid: `'en'`, `'flip'`, `'bilingual'`; default untuk paper pilot: `'flip'`).
- **Kompatibilitas Tema:** Seluruh variabel warna kartu 3D, garis bawah kata interaktif, dan blok terjemahan bilingual menggunakan CSS custom properties milik `shared/reader.css` (`--bg-surface`, `--bg-subtle`, `--text-main`, `--text-muted`, `--border-color`, `--accent-color`), sehingga otomatis selaras pada tema *Paper*, *Sepia*, dan *Dark Slate*.

### 2.2 Kamus Kontekstual per Paper (`papers/<slug>/vocab.js`)
- Menyediakan peta kosakata spesifik artikel dalam objek global ringan `window.TS_PAPER_VOCAB` dengan format terstruktur:
  ```js
  window.TS_PAPER_VOCAB = {
    "synthesized": { id: "disintesis", lemma: "synthesize", pos: "verb" },
    "discharge": { id: "lucutan (plasma)", lemma: "discharge", pos: "noun" },
    "overpotential": { id: "overpotensial (tegangan berlebih)", lemma: "overpotential", pos: "noun" }
  };
  ```
- Dilengkapi oleh kamus kata dasar/akademik umum bawaan (`BASE_VOCAB`) di dalam `shared/language-tutor.js` untuk kata hubung, preposisi, dan kata kerja ilmiah umum (seperti *however*, *demonstrates*, *respectively*, *compared*, *through*).

### 2.3 Struktur HTML Bilingual pada Artikel (`papers/14-solution-plasma-ptco-her/index.html`)
- Kalimat di dalam naskah utama (Judul, Standfirst, Angka Kunci, Ringkasan Eksekutif, Bab 1–6, Keterangan Gambar 1–6, dan Glosarium) ditulis menggunakan pasangan kalimat semantik:
  ```html
  <span class="ts-pair">
    <span class="ts-en">Alkaline water electrolysis offers a promising route for green hydrogen production.</span>
    <span class="ts-id">Elektrolisis air alkali menawarkan jalur yang menjanjikan untuk produksi hidrogen hijau.</span>
  </span>
  ```
- **Perilaku CSS Lintas Mode:**
  - **Mode `EN` & `EN ⇄ ID`:** `.ts-pair` bersifat `display: inline` dan `.ts-id` disembunyikan (`display: none`). Kalimat `.ts-en` mengalir menyatu mulus menjadi satu paragraf editorial *Newsreader* lengkap dengan `.editorial-dropcap`.
  - **Mode `EN + ID`:** `.ts-pair` berubah menjadi `display: block; margin-bottom: 0.85rem;`, menampilkan `.ts-en` di baris atas dan `.ts-id` tepat di bawahnya dengan ukuran font sedikit lebih ringkas (`0.9375rem`), warna `--text-muted`, serta garis aksen kiri 2px agar struktur *Subject–Verb–Object* mudah dicocokkan satu per satu.

---

## 3. Desain Interaksi Kartu Kata 3D & Alur Data

### 3.1 Tokenisasi Aman untuk Konten Ilmiah
- Tokenizer di `shared/language-tutor.js` memindai *text node* di dalam elemen `.ts-en` (serta judul/tabel target bertanda `data-ts-tokenize`) secara aman tanpa menyentuh node di dalam `<script>`, `<style>`, `<code>`, atau elemen bertanda `data-no-tokenize`.
- **Aturan Pengecualian Token:** Token yang berupa angka murni, satuan/simbol matematika (`mV`, `dec⁻¹`, `±`, `°C`, `Ω`), atau rumus kimia yang mengandung angka/simbol subskrip (`H₂O`, `PtCo₃`, `NaBH₄`, `1.0 M KOH`) dibiarkan utuh dan tidak dibungkus sebagai kata terjemahan agar tidak memecah notasi sains.
- Kata bahasa Inggris alfabetik (termasuk kata berhubung tanda hubung seperti *one-pot*, *sub-2*, *non-equilibrium*) dibungkus menjadi `<span class="ts-word" tabindex="0">...</span>`.

### 3.2 Pencarian Arti (*Lookup*) & Normalisasi Morfologi
Saat pengguna mengklik `<span class="ts-word">`:
1. Bersihkan tanda baca tepi dan ubah ke huruf kecil (*lowercase*).
2. Cari kecocokan persis pada `window.TS_PAPER_VOCAB` terlebih dahulu (prioritas konteks paper), lalu `BASE_VOCAB`.
3. Jika belum ditemukan, jalankan *stemming/lemmatization* ringan (`-ies → -y`, `-es`, `-s`, `-ed`, `-ing`, `-ly`) dan cek ulang ke kedua kamus.
4. Jika kata merupakan istilah teknis yang tidak masuk kamus (misal nama kota/institusi atau singkatan), kartu tetap muncul dengan pesan informatif `"Istilah teknis / nama diri — klik untuk simpan ke catatan"`.

### 3.3 Kartu 3D Mengambang (*Floating Flip-Card*)
- **Penempatan Cerdas (*Viewport Clamping*):** Kartu diposisikan secara absolut tepat di atas kata yang diklik (atau di bawah kata apabila ruang di atas layar kurang dari 160px) dengan panah penunjuk mengarah ke kata tersebut.
- **Animasi Balik 3D (`perspective: 800px` & `transform-style: preserve-3d`):**
  - Saat terbuka, kartu menampilkan **Sisi Depan (EN)** secara singkat lalu otomatis beranimasi balik (`rotateY(180deg)`, ~350ms) ke **Sisi Belakang (ID)** yang memuat terjemahan bahasa Indonesia, bentuk dasar (*lemma*), dan label jenis kata (`noun`, `verb`, `adj`, `adv`, `term`).
  - Pengguna dapat mengklik badan kartu untuk membalik bolak-balik EN ⇄ ID secara manual.
- **Integrasi Simpan Kosakata:**
  - Tombol **`+ Simpan ke Catatan`** pada kartu memanggil mekanisme penyimpanan catatan di `shared/reader.js` (atau menulis ke `localStorage` kunci `telaahsains_notes_14` lalu memicu pembaruan panel catatan kiri) dalam format `kata (lemma) — arti bahasa Indonesia` di daftar *Key Points* / kosakata.
  - Penutupan kartu: klik di luar kartu, tekan tombol `Esc`, atau klik ikon `✕`.

---

## 4. Antarmuka Pengalih Mode (*Mode Switcher*)

- Ditempatkan sebagai bilah sub-kontrol ringkas tepat di bawah `<header>` (atau menyatu rapi di sisi kanan/bawah progress bar pada tampilan mobile & desktop) agar tidak berdesakan dengan breadcrumb `← Katalog Utama / Paper #14` dan kontrol tema *Paper / Sepia / Dark* di `shared/reader.js`.
- Memuat 3 tombol tersegmentasi (*segmented control*):
  - `EN` — Baca Murni
  - `EN ⇄ ID` — Kartu Kata
  - `EN + ID` — Bilingual Kalimat
- Mengubah mode langsung memperbarui kelas pada `<body>` (`lang-mode-en`, `lang-mode-flip`, `lang-mode-bilingual`) tanpa perlu *reload* halaman dan tetap mempertahankan posisi gulir (*scroll position*).

---

## 5. Penanganan Kasus Tepi (*Edge Cases*) & Verifikasi

1. **Dropcap pada Mode Bilingual:** Pada `.editorial-dropcap`, saat beralih ke `EN + ID`, `.ts-pair` pertama tetap menampilkan huruf pertama berbahasa Inggris berukuran besar, sementara `.ts-id` di bawahnya tidak ikut terkena `::first-letter` dropcap (diatasi lewat aturan CSS `.ts-id` terpisah).
2. **Integrasi ScrollSpy & Lightbox:** Menambahkan `.ts-pair` dan `.ts-word` tidak mengubah struktur `<section id="bab-X">` maupun `<img>` untuk Lightbox, sehingga ScrollSpy TOC kanan dan Lightbox gambar tetap berfungsi 100%.
3. **Verifikasi Pengujian (Paper #14 Pilot):**
   - Uji perpindahan ketiga mode (`EN`, `EN ⇄ ID`, `EN + ID`) pada tema *Paper*, *Sepia*, dan *Dark Slate*.
   - Uji klik kata di awal, tengah, dan tepi layar untuk memastikan posisi kartu 3D tidak terpotong batas layar.
   - Uji tombol `+ Simpan ke Catatan` agar entri kosakata langsung muncul di panel catatan sebelah kiri dan bertahan setelah *refresh* halaman.
   - Uji tidak adanya sintaks LaTeX (`$`, `$$`, `\(`, `\[`) maupun karakter markdown mentah di dalam HTML hasil akhir.
