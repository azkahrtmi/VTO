# PD Measurement Feature — Audit & Implementation Brief

> Dokumen ini adalah brief untuk coding agent. Tujuannya: (1) mengaudit codebase yang sudah ada untuk memahami bagaimana DeepAR VTO dan PD measurement saat ini bekerja, lalu (2) mengimplementasikan/memperbaiki fitur PD measurement sesuai spesifikasi di bawah.
>
> **Urutan kerja yang diharapkan:** audit dulu (Bagian 2) → laporkan temuan ke user → baru lanjut implementasi (Bagian 3-5). Jangan langsung menulis/menimpa kode sebelum audit selesai dan dikonfirmasi.

---

## 1. Context Proyek

- Aplikasi ini adalah **marketplace untuk optik tunggal** (single optical store), masih di tahap development untuk **demo ke client**.
- Fitur yang sudah ada di codebase saat ini:
  - UI/UX mockup aplikasi (katalog, halaman produk, dll)
  - **Virtual Try-On (VTO)** kacamata menggunakan **DeepAR Web SDK**
  - **PD (Pupillary Distance) measurement** — sudah ada implementasi awal, tapi cara hitungnya masih belum tepat / belum jelas
- Roadmap jangka menengah (tidak dikerjakan sekarang, tapi penting untuk konteks arsitektur):
  - Integrasi dengan **Odoo** sebagai CMS/inventory/order management
  - Upload model 3D DeepAR (frame kacamata) ke web melalui CMS
  - PD value user kemungkinan akan dipakai untuk: (a) scaling model 3D di VTO supaya proporsional di wajah user, dan (b) rekomendasi ukuran frame berdasarkan PD saat checkout

---

## 2. Audit Codebase (lakukan ini dulu)

Tujuan audit: paham *apa yang sudah ada* sebelum mengubah apapun, supaya tidak konflik dengan DeepAR VTO yang sudah berjalan.

### 2.1 Pemetaan struktur folder
- Petakan struktur folder project, fokus pada bagian yang berhubungan dengan: kamera/video, DeepAR, dan PD measurement.
- Catat di mana komponen VTO dan komponen PD measurement berada (apakah satu halaman/komponen yang sama, atau terpisah).

### 2.2 Integrasi DeepAR
- Temukan tempat inisialisasi DeepAR (cari `deepar.initialize`, file `.deepar`, konfigurasi license key, dsb).
- Cek apakah ada akses ke `FaceData` (landmark 2D/3D, 63 titik) dari DeepAR, dan apakah data ini dipakai di tempat lain selain rendering VTO.
- Cek bagaimana `<video>` / `<canvas>` element dikelola — apakah DeepAR memegang stream kamera secara eksklusif, atau bisa di-share.

### 2.3 Implementasi PD yang sudah ada
- Temukan file/komponen yang menghitung PD saat ini.
- Catat: library apa yang dipakai (DeepAR landmarks? library lain?), titik mana yang dianggap "pupil", dan bagaimana skala px→mm dihitung saat ini (atau apakah belum ada kalibrasi sama sekali — banyak implementasi awal cuma menghitung jarak piksel mentah tanpa konversi ke mm).
- Catat di mana hasil PD ditampilkan/disimpan (state lokal, context, localStorage, backend, dll).

### 2.4 Dependencies
- Cek `package.json` — apakah sudah ada `@mediapipe/tasks-vision`, `@mediapipe/face_mesh`, `face-api.js`, `tensorflow.js`, atau library face-landmark lainnya yang terinstall tapi belum dipakai.
- Catat versi React/framework yang dipakai, dan apakah ada constraint bundle size yang perlu diperhatikan.

### 2.5 Format laporan audit
Sebelum lanjut ke implementasi, tulis ringkasan singkat berisi:
1. Lokasi komponen VTO dan PD (path file).
2. Status implementasi PD saat ini (ada/tidak, pakai apa, formula apa).
3. Apakah kamera di-share antara VTO dan PD, atau terpisah.
4. Dependency yang relevan yang sudah/belum ada.
5. Rekomendasi: apakah implementasi PD saat ini bisa di-refactor, atau perlu dibuat ulang dari nol sebagai modul terpisah.

---

## 3. Spesifikasi Fitur PD (target)

### 3.1 Output
- **Binocular PD saja** — satu angka dalam mm (contoh: "PD Anda: 62 mm").
- Tidak perlu near PD atau monocular split di fase ini (lihat Bagian 6 — Out of Scope).
- Tampilkan disclaimer kecil di bawah hasil (lihat 5.4).

### 3.2 Metode kalibrasi: iris-diameter reference
- **Tanpa objek tambahan** (tidak perlu kartu ID/kredit).
- Gunakan asumsi diameter horizontal iris manusia ≈ **11.7 mm** (rata-rata populasi, ±0.5mm) sebagai "penggaris" bawaan.
- Alasan: UX paling mulus untuk demo, cross-platform (desktop & mobile browser), dan ini pendekatan standar industri untuk PD measurement berbasis browser.

### 3.3 Formula
```
scale_mm_per_px = 11.7 / iris_diameter_px
PD_mm = pupil_distance_px * scale_mm_per_px
```
- `iris_diameter_px`: rata-rata dari diameter iris kiri dan kanan dalam piksel (lihat 5.2 untuk cara hitung dari landmark).
- `pupil_distance_px`: jarak Euclidean antara titik pusat iris/pupil kiri dan kanan dalam piksel.
- Sebaiknya hitung `scale_mm_per_px` dari **rata-rata kedua mata** (bukan cuma satu mata) untuk mengurangi noise.

### 3.4 UX Flow (high-level)
1. User membuka halaman/step "Ukur PD Anda" — **terpisah dari halaman VTO**.
2. Minta izin kamera, tampilkan live preview.
3. Jalankan face landmark detection (lihat Bagian 5) secara real-time.
4. Validasi kondisi pengukuran (lihat 5.3 — head pose, jarak ke kamera, stabilitas).
5. Setelah valid & stabil selama beberapa frame, ambil rata-rata/median PD dan tampilkan hasil.
6. Simpan hasil PD (state/context/localStorage — sesuaikan dengan pola data management yang ditemukan saat audit) supaya bisa dipakai ulang di halaman VTO.

---

## 4. Arsitektur yang Disarankan

- **Modul PD measurement berdiri sendiri**, terpisah dari engine DeepAR. Tidak perlu berjalan bersamaan dengan VTO — keduanya adalah *step* berbeda dalam user journey, bukan fitur real-time yang aktif simultan.
- DeepAR tetap dipakai khusus untuk VTO (sesuai fungsinya sekarang). Jangan coba memaksa DeepAR `FaceData` (63 landmark) untuk PD measurement — model itu tidak punya titik kontur iris yang dibutuhkan untuk kalibrasi (lihat diskusi sebelumnya: hanya cukup untuk approximate posisi mata untuk penempatan model 3D, bukan untuk pengukuran presisi).
- Gunakan **MediaPipe Face Landmarker (Tasks Vision)** dengan opsi iris refinement, dijalankan di komponen/page terpisah untuk step PD measurement.
- Data flow: `PD measurement page` → hasil PD (mm) → disimpan di state global/profile user → dibaca oleh `VTO page` untuk scaling model 3D kacamata.

---

## 5. Referensi Teknis

### 5.1 Setup MediaPipe
- Package: `@mediapipe/tasks-vision` (Face Landmarker API terbaru dari Google, berjalan via WASM, mendukung desktop & mobile browser).
- Aktifkan opsi iris/refined landmarks agar output berisi **478 titik** (468 titik wajah dasar + 10 titik iris).
- Jalankan di `runningMode: "VIDEO"` agar bisa proses stream kamera real-time, bukan single image.

### 5.2 Landmark indices untuk iris & pupil
Pada model 478-titik, 10 titik tambahan iris ada di index **468–477**:
- Index 468 = pusat iris mata pertama, index 469–472 = 4 titik batas iris (kiri/kanan/atas/bawah) mata pertama.
- Index 473 = pusat iris mata kedua, index 474–477 = 4 titik batas iris mata kedua.

> ⚠️ **Catatan penting untuk agent**: konvensi "mata kiri vs kanan" pada MediaPipe bisa terbalik secara visual tergantung apakah video di-mirror (selfie mode) atau tidak. Jangan asumsikan index 468 = "mata kiri user" tanpa verifikasi langsung — render titik-titik ini di canvas overlay dulu untuk memastikan urutannya sebelum dipakai dalam formula.

Cara hitung:
- `pupil_center_eyeA` = koordinat index 468 (atau 473)
- `iris_diameter_eyeA_px` = jarak antara pasangan titik batas horizontal (index 469 vs 471, atau sesuaikan setelah verifikasi orientasi)
- Lakukan hal yang sama untuk mata kedua, lalu rata-ratakan `iris_diameter_px` dari kedua mata.

### 5.3 Validitas pengukuran (stability & pose check)
Agar hasil tidak fluktuatif/salah, tambahkan validasi sebelum mengambil hasil final:
- **Head pose**: hanya hitung saat wajah relatif frontal (yaw & pitch mendekati 0°). Bisa dicek dari posisi relatif landmark hidung terhadap kedua mata.
- **Stabilitas temporal**: ambil beberapa sample (misal 15-30 frame ~0.5-1 detik), gunakan median PD dari sample tersebut, bukan satu frame saja — ini mengurangi noise dari deteksi yang sedikit goyang.
- **Jarak ke kamera**: jika wajah terlalu kecil/besar di frame (terlalu jauh/dekat), beri feedback ke user untuk reposisi — ini tidak mempengaruhi formula (karena kalibrasi relatif terhadap iris), tapi mempengaruhi presisi deteksi landmark itu sendiri.

### 5.4 Disclaimer text
Tampilkan teks kurang lebih:
> "Hasil ini adalah estimasi otomatis berbasis kamera (akurasi ±2-3mm). Untuk pemesanan lensa resep, hasil ini sebaiknya dikonfirmasi oleh optician."

---

## 6. Out of Scope (Fase 1 — jangan dikerjakan dulu)

- Near PD (PD untuk membaca/jarak dekat)
- Monocular PD (split kiri/kanan)
- Kalibrasi berbasis kartu referensi / depth sensor (TrueDepth)
- Integrasi penyimpanan PD ke backend/Odoo (cukup local state/localStorage untuk demo)

---

## 7. Pertanyaan yang Perlu Di-flag Balik ke User

Jika selama audit/implementasi menemukan hal-hal berikut, laporkan ke user sebelum melanjutkan:
- Implementasi PD yang sudah ada ternyata sudah memakai library/landmark tertentu yang berbeda dari rekomendasi di atas — perlu keputusan: refactor atau replace.
- Ada constraint bundle size / performance yang membuat penambahan MediaPipe jadi masalah.
- Struktur state management project tidak punya tempat jelas untuk menyimpan "PD value" yang reusable antar halaman — perlu disepakati pola penyimpanannya (context, store, dsb).
- Konvensi mirroring kamera (selfie vs non-mirrored) yang dipakai project, karena ini mempengaruhi index landmark mana yang merepresentasikan mata kiri/kanan user.
