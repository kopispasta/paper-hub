# TelaahSains Hub: Repositori Showcase Paper Ilmiah Interaktif

Repositori khusus untuk mengelola seluruh hasil telaah paper ilmiah internasional yang telah ditransformasikan ke dalam format majalah sains populer (*Chemistry World / Nature Style*), lengkap dengan gambar resolusi tinggi hasil ekstraksi langsung dari PDF paper.

---

## Struktur Folder Repositori

```text
paper-hub/
├── index.html                           # Portal Utama (Dashboard Katalog Paper)
├── README.md                            # Dokumentasi repositori & indeks sitasi
├── serve.sh                             # Skrip peluncur server lokal satu-klik
└── papers/                              # Direktori masing-masing paper
    ├── 01-mos2-mxene-her/               # Paper 1: MoS2/Ti3C2 MXene untuk HER Basa
    │   ├── index.html                   # Showcase lengkap Paper 1
    │   └── assets/                      # 5 Gambar resolusi tinggi (Fig. 1 s/d Fig. 5)
    ├── 02-alphaml-clete/                # Paper 2: AlphaML Platform Klasifikasi Tabular
    │   ├── index.html                   # Showcase lengkap Paper 2
    │   └── assets/                      # 9 Gambar resolusi tinggi (Abstrak grafis, Fig. 1 s/d Fig. 8)
    ├── 03-camno3-thermoelectric/        # Paper 3: Bi-doped CaMnO3 Termoelektrik
    │   ├── index.html                   # Showcase lengkap Paper 3
    │   └── assets/                      # 9 Gambar resolusi tinggi (Fig. 1 s/d Fig. 9)
    ├── 04-sip2-thermoelectric/          # Paper 4: Monolayer SiP2 2D Termoelektrik
    │   ├── index.html                   # Showcase lengkap Paper 4
    │   └── assets/                      # 7 Gambar resolusi tinggi (Fig. 1 s/d Fig. 7)
    ├── 05-mox2-thermoelectric/          # Paper 5: TMDC MoX2 Termoelektrik & Rekor ZT
    │   ├── index.html                   # Showcase lengkap Paper 5
    │   └── assets/                      # 7 Gambar resolusi tinggi (Fig. 1 s/d Fig. 7)
    └── 06-mch-dehydrogenation-pt13/     # Paper 6: Katalisis Dehidrogenasi LOHC Pt13
        ├── index.html                   # Showcase lengkap Paper 6
        └── assets/                      # 13 Gambar resolusi tinggi (Fig. 1 s/d Fig. 13)
```

---

## Daftar Paper dalam Katalog

| No | Judul Artikel | Jurnal / Penerbit | Kata Kunci Kunci | Tautan Berkas |
|:---|:---|:---|:---|:---|
| 01 | **Two-dimension MoS₂/Ti₃C₂ MXene nanocomposite for an efficient hydrogen evolution reaction in alkaline media** | *Materials Research Bulletin* 190 (Elsevier, 2025) | MoS₂, MXene, HER Basa, Overpotensial 421 mV, R_ct 1.66 kΩ | [Buka Paper 01](papers/01-mos2-mxene-her/index.html) |
| 02 | **AlphaML: A clear, legible, explainable, transparent, and elucidative binary classification platform for tabular data** | *Patterns* 5 (Cell Press, 2024) | CLETE, 15 Algoritma, SHAP, LIME, custom_score, Optuna | [Buka Paper 02](papers/02-alphaml-clete/index.html) |
| 03 | **Investigation of electron and phonon transport in Bi-doped CaMnO₃ for thermoelectric applications** | *Materials Research Bulletin* 141 (Elsevier, 2021) | Termoelektrik, Pelanggaran Hukum WF, Bilangan Lorenz 4× L₀, Doping Bismut | [Buka Paper 03](papers/03-camno3-thermoelectric/index.html) |
| 04 | **Potential thermoelectric candidate monolayer silicon diphosphide (SiP₂) from a first-principles calculation** | *Computational Materials Science* 188 (Elsevier, 2021) | Monolayer SiP₂, Anisotropi Termal 7.3×, Seebeck >3 mV/K, ZT 0.90 | [Buka Paper 04](papers/04-sip2-thermoelectric/index.html) |
| 05 | **Thermal transport and thermoelectric properties of transition metal dichalcogenides MoX₂ from first-principles calculation** | *Physica Scripta* 99 (IOP Publishing, 2024) | TMDC MoX₂, Model Kinetik-Kolektif KCM, MoTe₂ ZT Rekor 2.77 @550K & 3.55 @900K | [Buka Paper 05](papers/05-mox2-thermoelectric/index.html) |
| 06 | **Substituent effect on the reactivity of liquid organic hydrogen carriers: A DFT study on methylcyclohexane dehydrogenation over Pt13 cluster** | *International Journal of Hydrogen Energy* 193 (Elsevier, 2025) | LOHC, MCH, MCA, MNC, Klaster Pt₁₃, DFT DMol3, Efek Substituen, RDS, ΔG, E_a | [Buka Paper 06](papers/06-mch-dehydrogenation-pt13/index.html) |

---

## Cara Membuka & Mengakses

### Opsi 1: Langsung Buka di Browser (Mac)
Cukup jalankan perintah berikut di terminal:
```zsh
open /Users/gadgetline/paper-hub/index.html
```

### Opsi 2: Menggunakan Server Lokal
Jalankan server Python dari dalam folder `paper-hub`:
```zsh
cd /Users/gadgetline/paper-hub
python3 -m http.server 8080
```
Lalu buka peramban Anda di: `http://localhost:8080`

---

## Fitur Utama Portal

1. **Pencarian Real-Time (Live Search):** Filter instan di dashboard utama untuk menemukan paper berdasarkan judul, penulis, jurnal, maupun kata kunci ilmiah.
2. **Kategori Bidang:** Pemisahan kategori satu-klik antara *Material 2D & Energi*, *Fisika Termoelektrik*, dan *Kecerdasan Buatan Biomedis*.
3. **Navigasi Terhubung Dua Arah:** Setiap halaman ulasan paper memiliki tombol `← Katalog Utama` di navigasi atas untuk mempermudah kembali ke daftar katalog kapan saja.
4. **Fitur Lightbox Terpadu:** Setiap gambar pada seluruh paper dapat diklik untuk memperbesar tampilan (*fullscreen zoom*) demi memeriksa detail kurva, grafik, dan kisi kristal mikro.
5. **Standar Tipografi Editorial:** Bebas dari elemen warna-warni berlebih (*no AI workslop*), nyaman dibaca dalam waktu lama dengan font Serif elegan (*Newsreader*) dan Sans-Serif tajam (*Plus Jakarta Sans*).
