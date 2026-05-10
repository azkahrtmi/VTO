# Analisis Masalah Virtual Try-On (VTO)

Dokumen ini menjelaskan secara mendetail semua masalah yang ditemukan pada aplikasi VTO, **kenapa** masalah tersebut terjadi, dan **bagaimana** cara memperbaikinya.

---

## Daftar Isi

1. [Gagang Kacamata Tidak Tertutup saat Menoleh](#1-gagang-kacamata-tidak-tertutup-saat-menoleh)
2. [Kacamata Bergetar (Jitter)](#2-kacamata-bergetar-jitter)
3. [Delay Kacamata saat Wajah Bergerak](#3-delay-kacamata-saat-wajah-bergerak)
4. [Kacamata Tidak Tepat di Mobile](#4-kacamata-tidak-tepat-di-mobile-responsive)

---

## 1. Gagang Kacamata Tidak Tertutup saat Menoleh

### Gejala
- Model `coba1`: Saat kepala menoleh ke samping, gagang kacamata **tertutup** oleh wajah (benar).
- Model `coba2` dan `coba3`: Saat kepala menoleh ke samping, gagang kacamata **tetap terlihat menembus wajah** (salah).

### Kenapa Bisa Terjadi?

Untuk memahami masalah ini, kita perlu memahami bagaimana AR bekerja:

```
┌─────────────────────────────────────────────────┐
│                  LAYAR HP/PC                    │
│                                                 │
│   Layer 1 (Paling Belakang): Video Kamera       │
│   Layer 2 (Tengah):          Head Occluder      │
│   Layer 3 (Paling Depan):    Kacamata 3D        │
│                                                 │
└─────────────────────────────────────────────────┘
```

Aplikasi AR kita menumpuk 3 layer di atas satu sama lain. Masalahnya, komputer **tidak tahu** bahwa kepala fisik pengguna seharusnya "di depan" gagang kacamata. Bagi komputer, kacamata 3D selalu berada di layer paling depan, sehingga gagang kacamata selalu terlihat — bahkan saat seharusnya "di belakang" kepala.

Untuk mengatasi ini, kita menggunakan **Head Occluder** — sebuah model 3D berbentuk kepala manusia yang **transparan** (tidak terlihat oleh pengguna), tapi berfungsi sebagai "topeng gaib" yang menyembunyikan bagian kacamata yang berada di belakangnya.

```
Tampak Atas (Saat Menoleh ke Kiri):

          Kamera
            │
     ┌──────▼──────┐
     │   OCCLUDER   │ ← Topeng gaib berbentuk kepala
     │  ┌────────┐  │
     │  │ WAJAH  │  │
     │  └────────┘  │
     │              │
     └──┬───────┬───┘
   GAGANG       GAGANG
   (tersembunyi) (terlihat)
        │           │
   Di belakang   Di depan
   occluder      occluder
```

**Kenapa coba1 berhasil tapi coba2/coba3 tidak?**

Jawabannya: **Panjang gagang kacamata berbeda-beda.** 

Head occluder kita saat ini menggunakan skala `0.08` dan posisi `0 -0.3 -0.1`. Ukuran ini cukup untuk menutupi gagang pendek (seperti `coba1`), tapi **tidak cukup lebar** untuk menutupi gagang yang lebih panjang pada `coba2` dan `coba3`.

### Apakah Harus Konfigurasi Ulang di Blender?

**TIDAK.** Masalah ini **bukan** di model kacamata Anda. Model kacamata dari Blender sudah benar. Yang perlu diperbaiki adalah **konfigurasi occluder di dalam kode** (`MindARVTO.tsx`).

### Cara Memperbaiki

Di file `src/components/MindARVTO.tsx`, ubah bagian occluder:

```diff
  <!-- Konfigurasi Lama -->
  <a-gltf-model 
    mindar-face-occluder 
    src="#headModel" 
-   position="0 -0.3 -0.1" 
-   scale="0.08 0.08 0.08"
  ></a-gltf-model>

  <!-- Konfigurasi Baru -->
  <a-gltf-model 
    mindar-face-occluder 
    src="#headModel" 
+   position="0 -0.3 0.05" 
+   scale="0.095 0.095 0.095"
  ></a-gltf-model>
```

**Penjelasan perubahan:**
| Parameter | Lama | Baru | Alasan |
|-----------|------|------|--------|
| `position Z` | `-0.1` (mundur) | `0.05` (maju) | Occluder dimajukan sedikit agar lebih "memeluk" sisi wajah, sehingga area di sekitar telinga lebih tertutup. |
| `scale` | `0.08` | `0.095` | Occluder diperbesar agar cakupan area kepala lebih luas, mampu menutupi gagang yang lebih panjang. |

> **Catatan Penting:** Head occluder adalah model kepala **generic** (rata-rata). Ia tidak akan sempurna 100% untuk semua bentuk wajah manusia. Tetapi dengan skala dan posisi yang tepat, hasilnya akan sangat mendekati realistis.

---

## 2. Kacamata Bergetar (Jitter)

### Gejala
Kacamata terlihat "bergetar" atau "gemetar" meskipun wajah pengguna diam. Getarannya tidak separah riset awal, tapi masih cukup mengganggu secara visual.

### Kenapa Bisa Terjadi?

MindAR menggunakan teknologi **Face Landmark Detection** — yaitu mendeteksi 468 titik pada wajah manusia di setiap frame video kamera. Dari titik-titik tersebut, MindAR menghitung posisi, rotasi, dan skala wajah dalam ruang 3D.

```
Frame 1: Hidung terdeteksi di koordinat (152.3, 201.7)
Frame 2: Hidung terdeteksi di koordinat (152.5, 201.4)  ← Bergeser 0.2 pixel!
Frame 3: Hidung terdeteksi di koordinat (152.1, 201.9)  ← Bergeser lagi!
```

Meskipun wajah Anda **diam sempurna**, kamera selalu menghasilkan sedikit "noise" (gangguan) pada setiap frame. Noise ini disebabkan oleh:
1. **Sensor kamera** yang tidak 100% konsisten antar frame.
2. **Pencahayaan** yang berfluktuasi (lampu neon berkedip 50-60x/detik).
3. **Kompresi video** yang menghasilkan artefak berbeda di setiap frame.
4. **Algoritma deteksi** yang memiliki margin error ±1-2 pixel.

Pergeseran 0.2 pixel ini sangat kecil di layar, tapi saat dikalikan dengan skala kacamata (`6.8x`), pergeseran tersebut menjadi terlihat jelas oleh mata manusia.

### Apakah Harus Konfigurasi Ulang di Blender?

**TIDAK.** Masalah ini **100% masalah software tracking**, bukan masalah model 3D.

### Cara Memperbaiki

MindAR memiliki built-in **One Euro Filter** — sebuah algoritma smoothing yang dirancang khusus untuk mengurangi jitter pada tracking real-time. Filter ini memiliki 2 parameter:

| Parameter | Fungsi | Default | Rekomendasi |
|-----------|--------|---------|-------------|
| `filterMinCF` | **Cutoff Frequency** — Semakin rendah, semakin halus (kurang jitter), tapi semakin lambat respons. | `0.001` | `0.1` |
| `filterBeta` | **Speed Coefficient** — Semakin tinggi, semakin responsif (kurang delay), tapi semakin jitter. | `1000` | `10` |

Di file `src/components/MindARVTO.tsx`, ubah atribut `mindar-face`:

```diff
  <a-scene 
-   mindar-face="uiScanning: #scanning-overlay; uiError: yes; uiLoading: yes" 
+   mindar-face="uiScanning: #scanning-overlay; uiError: yes; uiLoading: yes; filterMinCF: 0.1; filterBeta: 10" 
    embedded
  >
```

**Visualisasi efek filter:**

```
Tanpa Filter (Default):
Posisi: ████░███░██░████░███░██  ← Bergetar acak

Dengan filterMinCF: 0.1, filterBeta: 10:
Posisi: ██████████████████████  ← Halus, stabil
```

---

## 3. Delay Kacamata saat Wajah Bergerak

### Gejala
Saat wajah bergerak (menoleh, mengangguk), kacamata mengikuti gerakan wajah tapi **terlambat** sedikit. Seolah-olah kacamata "menyusul" posisi wajah.

### Kenapa Bisa Terjadi?

Delay dan jitter adalah **dua sisi dari koin yang sama**. Keduanya dikendalikan oleh One Euro Filter yang sama.

```
                    JITTER ◄─────────────────► DELAY
                    (Bergetar)                  (Lambat)
                         │                        │
Konfigurasi Agresif:  ███░███░██              ████████
(filterBeta tinggi)   Sangat responsif        Tidak ada delay
                      Tapi JITTER parah       

Konfigurasi Smooth:   ██████████              ████──████
(filterBeta rendah)   Sangat halus            Ada sedikit delay
                      Tidak jitter
                      
Sweet Spot:           ████░█████              ████─████
(filterBeta: 10)      Cukup halus             Delay minimal
                      Jitter minimal          Masih responsif
```

**Secara teknis:**
- Smoothing filter bekerja dengan cara menghitung **rata-rata bergerak** dari beberapa frame terakhir.
- Jika filter menggunakan 5 frame terakhir untuk menghitung posisi, maka posisi kacamata akan selalu "tertinggal" 2-3 frame dari posisi wajah yang sebenarnya.
- Pada kamera 30fps, delay 3 frame = **100ms** — cukup untuk terlihat oleh mata manusia.

### Apakah Harus Konfigurasi Ulang di Blender?

**TIDAK.** Ini murni masalah algoritma tracking, bukan masalah model 3D.

### Cara Memperbaiki

Tidak ada "solusi sempurna" karena ini adalah **trade-off fundamental**. Yang bisa kita lakukan adalah menemukan titik tengah yang paling nyaman.

**Panduan Tuning:**

```
Jika terlalu JITTER (bergetar):
  → Turunkan filterMinCF (misal: 0.1 → 0.05)
  → Turunkan filterBeta  (misal: 10 → 5)

Jika terlalu DELAY (lambat):
  → Naikkan filterBeta   (misal: 10 → 50)
  → Naikkan filterMinCF  (misal: 0.1 → 0.2)
```

**Rekomendasi awal:** `filterMinCF: 0.1; filterBeta: 10`  
Jika delay masih terasa, coba: `filterMinCF: 0.1; filterBeta: 50`

---

## 4. Kacamata Tidak Tepat di Mobile (Responsive)

### Gejala
Di desktop, kacamata menempel sempurna di wajah. Tapi saat dibuka di HP (atau mode responsive di DevTools), kacamata terlihat **di luar wajah** — bisa terlalu ke atas, ke bawah, atau ke samping.

### Kenapa Bisa Terjadi?

Masalah ini disebabkan oleh **perbedaan aspect ratio** antara kamera dan layar.

**Desktop:**
```
Kamera Desktop: 16:9 (1280x720)
Layar Desktop:  16:9 (1920x1080)

Rasio kamera ≈ rasio layar → COCOK!

┌────────────────────────────┐
│        Video Kamera        │
│    ┌──────────────────┐    │
│    │                  │    │
│    │   😊 ← Wajah    │    │
│    │   👓 ← Kacamata  │    │  ← Kacamata tepat di wajah
│    │                  │    │
│    └──────────────────┘    │
└────────────────────────────┘
```

**Mobile (Portrait):**
```
Kamera HP: 4:3 atau 16:9 (landscape secara fisik)
Layar HP:  9:19.5 (portrait)

Rasio kamera ≠ rasio layar → TIDAK COCOK!

┌──────────┐
│          │
│  Video   │ ← Video kamera di-crop/stretch
│  Kamera  │    agar muat di layar portrait
│          │
│ 😊       │ ← Wajah bergeser karena crop
│    👓    │ ← Kacamata masih di posisi lama
│          │    (berdasarkan koordinat landscape)
│          │
│          │
└──────────┘
```

**Penjelasan teknis:**

MindAR mendeteksi posisi wajah berdasarkan **koordinat pixel kamera** (misalnya: hidung di pixel 640, 360). Koordinat ini kemudian diterjemahkan ke **koordinat 3D** di dalam scene A-Frame.

Masalahnya: A-Frame menghitung koordinat 3D berdasarkan **ukuran canvas** yang ada di layar. Jika canvas berukuran 1280x720 (landscape) tapi layar HP berukuran 414x896 (portrait), maka terjadi **mismatch** antara:
- Di mana MindAR "pikir" wajah berada (berdasarkan kamera).
- Di mana A-Frame "menggambar" kacamata (berdasarkan canvas).

Akibatnya, kacamata terlihat "melayang" di tempat yang salah.

### Apakah Harus Konfigurasi Ulang di Blender?

**TIDAK.** Ini **100% masalah konfigurasi web** (HTML, CSS, dan JavaScript).

### Cara Memperbaiki

Ada 3 perbaikan yang harus dilakukan **bersamaan**:

#### Perbaikan 1: Viewport Meta Tag

Di file `index.html`, cegah browser HP melakukan zoom yang bisa merusak perhitungan koordinat:

```diff
- <meta name="viewport" content="width=device-width, initial-scale=1.0" />
+ <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

**Kenapa ini penting?** Jika pengguna tidak sengaja melakukan pinch-to-zoom di HP, seluruh layout A-Frame akan bergeser dan kacamata langsung meleset.

#### Perbaikan 2: CSS untuk A-Frame Canvas

Di file `src/index.css`, tambahkan CSS yang memaksa canvas A-Frame selalu memenuhi layar:

```css
/* Paksa a-scene dan canvas-nya mengisi penuh container */
a-scene {
  width: 100% !important;
  height: 100% !important;
  position: fixed !important;
  inset: 0 !important;
}

a-scene .a-canvas {
  width: 100% !important;
  height: 100% !important;
  position: absolute !important;
  inset: 0 !important;
}

/* Paksa video kamera mengisi layar tanpa distorsi */
a-scene video {
  object-fit: cover !important;
}
```

**Kenapa ini penting?** Tanpa CSS ini, A-Frame mungkin menghitung ukuran canvas berdasarkan ukuran default (biasanya 300x150 pixel di beberapa browser mobile), bukan ukuran layar sebenarnya.

#### Perbaikan 3: Orientation Change Handler

Di file `src/components/MindARVTO.tsx`, tambahkan handler untuk mendeteksi perubahan orientasi HP:

```typescript
useEffect(() => {
  const handleOrientationChange = () => {
    // Beri waktu browser menghitung ulang ukuran layar
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  };
  window.addEventListener('orientationchange', handleOrientationChange);
  return () => window.removeEventListener('orientationchange', handleOrientationChange);
}, []);
```

**Kenapa ini penting?** Saat HP diputar dari portrait ke landscape (atau sebaliknya), browser membutuhkan waktu untuk menghitung ulang ukuran layar. Jika A-Frame tidak diberi tahu bahwa ukuran layar berubah, ia akan terus menggunakan ukuran lama dan kacamata akan meleset.

---

## Ringkasan Keseluruhan

| # | Masalah | Penyebab | Fix di Blender? | Fix di Kode? | File yang Diubah |
|---|---------|----------|:---:|:---:|---|
| 1 | Gagang tidak tertutup | Occluder terlalu kecil | ❌ | ✅ | `MindARVTO.tsx` |
| 2 | Kacamata bergetar | Noise kamera + filter default | ❌ | ✅ | `MindARVTO.tsx` |
| 3 | Delay saat bergerak | Trade-off dari smoothing | ❌ | ✅ | `MindARVTO.tsx` |
| 4 | Tidak tepat di mobile | Aspect ratio mismatch | ❌ | ✅ | `index.html`, `index.css`, `MindARVTO.tsx` |

> **Kesimpulan:** Semua perbaikan dilakukan **di kode**, bukan di Blender. Model 3D Anda yang sudah dirapikan (pivot, skala 15.3cm, arah -Y) sudah benar dan tidak perlu diubah lagi.
