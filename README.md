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
    ├── 06-mch-dehydrogenation-pt13/     # Paper 6: Katalisis Dehidrogenasi LOHC Pt13
    │   ├── index.html                   # Showcase lengkap Paper 6
    │   └── assets/                      # 13 Gambar resolusi tinggi (Fig. 1 s/d Fig. 13)
    ├── 07-sq3370-click-chemistry-cancer/# Paper 7: Kimia Klik SQ3370 Immuno-Onkologi
    │   ├── index.html                   # Showcase lengkap Paper 7
    │   └── assets/                      # 8 Gambar resolusi tinggi (Fig. 1 s/d Fig. 6, Scheme 1–2)
    ├── 08-pyridotetrazine-anticancer-jak2/ # Paper 8: Piridotetrazin Antikanker JAK2 & DFT
    │   ├── index.html                   # Showcase lengkap Paper 8
    │   └── assets/                      # 12 Gambar resolusi tinggi (Fig. 1 s/d Fig. 12)
    └── 09-biib068-btk-inhibitor-lupus/  # Paper 9: BIIB068 Reversible BTK Inhibitor Autoimun
        ├── index.html                   # Showcase lengkap Paper 9
        └── assets/                      # 10 Gambar resolusi tinggi (TOC, Fig. 1 s/d Fig. 8, Scheme 1)
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
| 07 | **SQ3370 Activates Cytotoxic Drug via Click Chemistry at Tumor and Elicits Sustained Responses in Injected and Non-Injected Lesions** | *Advanced Therapeutics* 4 (Wiley-VCH, 2021) | Kimia Klik Bioortogonal, CAPAC, SQ3370, Tetrazin, TCO, Doksorubisin, Abscopal, MC38 | [Buka Paper 07](papers/07-sq3370-click-chemistry-cancer/index.html) |
| 08 | **Synthesis of pyrido-annelated [1,2,4,5]tetrazines, [1,2,4]triazepine, and [1,2,4,5]tetrazepines for anticancer, DFT, and molecular docking studies** | *Scientific Reports* 13 (Springer Nature, 2023) | Sintesis PASE Hijau, NCI-60, Kanker Kolon HCT-116 77.9%, Docking JAK2 -7.25 kcal/mol, DFT B3LYP | [Buka Paper 08](papers/08-pyridotetrazine-anticancer-jak2/index.html) |
| 09 | **Discovery of BIIB068: A Selective, Potent, Reversible Bruton’s Tyrosine Kinase Inhibitor as an Orally Efficacious Agent for Autoimmune Diseases** | *Journal of Medicinal Chemistry* 63 (ACS, 2020) | BTK Reversibel, SBDD, Kantung H3, PDB 6TFP, Selektivitas >400x (395 Kinase), In Vivo TI-2 93%, Fase I Manusia | [Buka Paper 09](papers/09-biib068-btk-inhibitor-lupus/index.html) |

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
