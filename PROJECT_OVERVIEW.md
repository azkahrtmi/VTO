# VTO Optical Marketplace - Project Overview

## 1. Ringkasan Proyek

Aplikasi ini adalah demo marketplace optik tunggal untuk menampilkan katalog kacamata, halaman landing, halaman produk, Virtual Try-On berbasis kamera, dan fitur pengukuran PD berbasis kamera.

Target utama saat ini adalah demo client, bukan production final. Arsitektur sudah mengarah ke integrasi CMS/inventory melalui Odoo, tetapi sebagian data masih memakai katalog lokal sebagai fallback.

## 2. Stack Teknologi

| Area | Teknologi |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 4 + CSS inline per komponen |
| State | Zustand |
| VTO Engine | DeepAR Web SDK |
| PD Detection | MediaPipe Tasks Vision FaceLandmarker |
| 3D/AR Support | Three.js, React Three Fiber, Drei |
| CMS Roadmap | Odoo 18 custom addon |
| Icons | lucide-react |

## 3. Struktur Folder Penting

| Path | Fungsi |
|---|---|
| `src/App.tsx` | Router sederhana landing/catalog/VTO modal |
| `src/store.ts` | Zustand store untuk katalog, selected glasses, dan state VTO |
| `src/components/DeepARVTO.tsx` | Komponen utama Virtual Try-On DeepAR |
| `src/components/AutoPDOverlay.tsx` | Overlay pengukuran PD berbasis MediaPipe |
| `src/catalog/glasses.ts` | Katalog kacamata lokal fallback |
| `src/types/glasses.ts` | Type model kacamata, size, dan node mapping DeepAR |
| `src/utils/odooApi.ts` | Client API untuk Odoo |
| `src/components/landing` | Komponen landing page |
| `src/components/eyeglasses` | Halaman katalog eyeglasses |
| `odoo-addons/vto_catalog` | Addon Odoo custom untuk katalog VTO |

## 4. Alur Aplikasi

1. User masuk ke landing page.
2. User bisa membuka halaman katalog `/eyeglasses`.
3. User bisa membuka Virtual Try-On dari landing atau katalog.
4. App membuka modal VTO.
5. `DeepARVTO` menginisialisasi kamera dan DeepAR.
6. User memilih frame kacamata dari katalog.
7. User bisa mengganti warna frame, warna lensa, ukuran, dan reset.
8. User bisa membuka overlay `Ukur PD dengan Kamera`.
9. PD overlay memakai kamera terpisah dan MediaPipe untuk menghitung estimasi binocular PD.

## 5. Virtual Try-On DeepAR

Komponen utama: `src/components/DeepARVTO.tsx`

DeepAR diinisialisasi dengan:

- `licenseKey` dari `VITE_DEEPAR_LICENSE_KEY`
- `previewElement` dari container React
- kamera `facingMode: "user"`
- `numberOfFaces: 4`

Effect kacamata diambil dari `selectedGlasses.deeparEffect`, lalu dimuat ke beberapa face slot:

```ts
deepAR.switchEffect(effect, {
  slot: `glasses_face_${i}`,
  face: i,
})
```

Fitur DeepAR yang sudah ada:

- Load effect `.deepar`
- Multi-face effect slot sampai 4 wajah
- Change frame color via `changeParameterVector`
- Change lens color via `changeParameterVector`
- Size variant support
- Base scale per model
- Reset effect
- Node mapping per model

## 6. Data Kacamata

Model data ada di `src/types/glasses.ts`.

Field penting:

- `id`
- `name`
- `sku`
- `deeparEffect`
- `lensWidthMm`
- `bridgeMm`
- `templeMm`
- `frameWidthMm`
- `framePdMm`
- `pdCalibrationMm`
- `nodeMapping`
- `sizes`

Katalog lokal fallback ada di `src/catalog/glasses.ts`. Saat ini berisi beberapa effect DeepAR seperti:

- `coba4-deepar`
- `rayban-deepar`
- `2023-deepar`

## 7. State Management

State global memakai Zustand di `src/store.ts`.

State utama:

- `selectedGlassesId`
- `glassesCatalog`
- `odooProducts`
- `showDots`
- `showGlasses`
- `isAdjustMode`
- `userScale`

Catatan audit: belum ada state global khusus untuk menyimpan hasil PD. Saat ini PD masih hidup di local state `AutoPDOverlay`, belum dipakai ulang oleh VTO scaling atau checkout.

## 8. PD Measurement

Komponen utama: `src/components/AutoPDOverlay.tsx`

Library:

- `@mediapipe/tasks-vision`
- `FaceLandmarker`
- `FilesetResolver`

Model:

- `/face_landmarker.task`
- running mode `VIDEO`
- output yang diharapkan minimal 478 landmark

Landmark iris yang dipakai:

| Landmark | Fungsi |
|---|---|
| 468 | pusat iris mata pertama |
| 469-472 | batas iris mata pertama |
| 473 | pusat iris mata kedua |
| 474-477 | batas iris mata kedua |

Formula PD:

```ts
pixelsPerMm = irisDiameterPx / 11.7
PD_mm = pupilDistancePx / pixelsPerMm
```

Validasi yang sudah ada:

- cek jumlah landmark iris
- cek head tilt sederhana dari hidung ke dagu
- smoothing diameter iris
- smoothing PD
- window stabilitas 10 sample
- auto-lock saat stabil dan alignment target terpenuhi
- capture gambar hasil
- stop kamera setelah locked untuk mengurangi beban mobile

Catatan penting: hasil PD berbasis kamera tetap estimasi. Akurasi dipengaruhi kualitas kamera, pencahayaan, crop wajah, posisi kepala, dan stabilitas landmark iris.

## 9. Status PD Dibanding Brief

Brief meminta PD sebagai modul terpisah dari DeepAR. Implementasi saat ini sudah terpisah secara engine karena PD memakai MediaPipe, bukan DeepAR FaceData. Namun secara UI, PD masih dibuka dari dalam panel kontrol `DeepARVTO`, bukan sebagai page/step mandiri.

| Requirement Brief | Status Saat Ini |
|---|---|
| Pakai MediaPipe FaceLandmarker | Sudah |
| Pakai iris diameter 11.7mm | Sudah |
| Binocular PD saja | Sudah |
| Terpisah dari DeepAR engine | Sudah secara teknis |
| Terpisah sebagai page/step | Belum |
| Simpan PD reusable | Belum |
| Disclaimer optician | Belum konsisten |
| Median 15-30 frame | Belum, masih smoothing/window pendek |
| Head pose yaw/pitch kuat | Belum, masih tilt sederhana |
| Integrasi PD ke VTO scale | Belum |

## 10. Masalah Teknis Saat Ini

1. Deteksi pupil masih kurang stabil pada kamera nyata, terutama mobile.
2. Auto-lock bisa terasa kurang natural karena alignment target dan landmark iris bisa meleset.
3. Kamera mobile perlu tuning terus karena browser HP sering crop, mirror, atau menurunkan kualitas stream.
4. PD belum disimpan di Zustand/localStorage.
5. PD belum mempengaruhi scaling model kacamata.
6. `DeepARVTO.tsx` masih memakai `// @ts-nocheck`, jadi type safety di bagian paling penting belum kuat.
7. Ada beberapa file/dokumen dengan encoding mojibake, terutama simbol Indonesia/panah/emoji.

## 11. Integrasi Odoo

Frontend sudah punya client API di `src/utils/odooApi.ts`.

Endpoint yang didukung:

- `GET /api/vto/health`
- `GET /api/vto/glasses`
- `GET /api/vto/glasses/:id`
- `GET /api/vto/glasses/featured`

Addon Odoo ada di `odoo-addons/vto_catalog`, dengan model `glasses.product` dan controller REST API.

Frontend memanggil `loadCatalogFromOdoo()` saat app mount, lalu menyimpan hasil ke `odooProducts`. Di halaman eyeglasses, data Odoo digabung dengan mock product lokal.

## 12. Rekomendasi Lanjutan

Prioritas teknis berikutnya:

1. Jadikan PD measurement sebagai page/step mandiri, bukan overlay dari VTO.
2. Simpan hasil PD ke Zustand dan localStorage.
3. Tambahkan disclaimer hasil estimasi.
4. Ganti auto-lock full otomatis menjadi semi-auto: sistem mendeteksi kandidat pupil, user bisa koreksi titik jika confidence rendah.
5. Tambahkan mode still-frame: ambil satu frame bagus, lalu ukur dari gambar diam agar lebih stabil daripada live tracking terus-menerus.
6. Integrasikan PD ke VTO scaling hanya setelah hasil PD stabil dan UX koreksi titik sudah ada.
7. Bersihkan `// @ts-nocheck` di `DeepARVTO.tsx`.
8. Rapikan encoding dokumen agar tidak ada mojibake.

## 13. Kesimpulan Audit

Aplikasi sudah memiliki fondasi kuat untuk demo: landing page, katalog, VTO DeepAR, kontrol frame/lensa, katalog lokal, Odoo API client, dan addon Odoo awal. Fitur PD sudah mengikuti pendekatan yang direkomendasikan brief secara formula dan library, tetapi akurasi UX masih belum cukup untuk full otomatis di kamera HP.

Rekomendasi paling aman adalah mengubah PD dari full auto live measurement menjadi semi-auto assisted measurement: MediaPipe memberi kandidat pupil, user diberi UI koreksi titik, lalu hasil disimpan sebagai estimasi PD. Ini lebih reliable untuk demo client dan lebih jujur terhadap keterbatasan kamera browser.
