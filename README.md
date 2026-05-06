# VTO Eyewear

Web-based virtual try-on kacamata menggunakan React, TypeScript, MediaPipe Face Landmarker, dan Three.js. Aplikasi ini membuka kamera depan, melacak wajah secara real-time, lalu menempelkan model kacamata `.glb` ke wajah pengguna.

## Fitur Saat Ini

- Real-time face tracking dengan `@mediapipe/tasks-vision`
- Render 3D overlay memakai `@react-three/fiber` dan `three`
- Background video webcam langsung di dalam canvas Three.js
- Mirror mode untuk pengalaman seperti bercermin
- Multi-landmark anchor pada area hidung dan inner eye
- Dynamic scaling berdasarkan jarak antar mata
- Motion smoothing dengan `OneEuroFilter`
- Nose occlusion sederhana agar frame terlihat lebih natural
- Tuning manual untuk posisi, rotasi, dan ukuran model

## Tech Stack

- React 19
- TypeScript
- Vite
- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- MediaPipe Tasks Vision

## Cara Menjalankan

Pastikan Node.js sudah terpasang, lalu jalankan:

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
```

Preview hasil build:

```bash
npm run preview
```

## Cara Kerja Singkat

1. `CameraManager` meminta akses webcam dan menyiapkan elemen video.
2. `FaceTracker` menginisialisasi MediaPipe Face Landmarker dan memproses frame video.
3. `Experience` merender feed kamera sebagai background pada canvas Three.js.
4. `GlassesOverlay` membaca landmark dan transform wajah untuk memosisikan model kacamata.
5. `OneEuroFilter` menstabilkan posisi, rotasi, dan skala agar overlay tidak terlalu jitter.

## Struktur File Penting

- [src/App.tsx](C:/Users/le/Documents/Arus%20Digital/project/JS/VTO/src/App.tsx): flow start experience, loading state, dan error state
- [src/components/CameraManager.ts](C:/Users/le/Documents/Arus%20Digital/project/JS/VTO/src/components/CameraManager.ts): akses dan lifecycle webcam
- [src/components/FaceTracker.ts](C:/Users/le/Documents/Arus%20Digital/project/JS/VTO/src/components/FaceTracker.ts): inisialisasi dan loop deteksi MediaPipe
- [src/components/Experience.tsx](C:/Users/le/Documents/Arus%20Digital/project/JS/VTO/src/components/Experience.tsx): canvas Three.js, lighting, background video, dan overlay
- [src/components/GlassesOverlay.tsx](C:/Users/le/Documents/Arus%20Digital/project/JS/VTO/src/components/GlassesOverlay.tsx): logika anchor, scale, rotasi, smoothing, dan occlusion
- [src/components/CustomGlasses.tsx](C:/Users/le/Documents/Arus%20Digital/project/JS/VTO/src/components/CustomGlasses.tsx): load model `.glb` dan normalisasi bounding box
- [src/utils/OneEuroFilter.ts](C:/Users/le/Documents/Arus%20Digital/project/JS/VTO/src/utils/OneEuroFilter.ts): filter untuk mengurangi jitter
- [public/face_landmarker.task](C:/Users/le/Documents/Arus%20Digital/project/JS/VTO/public/face_landmarker.task): model MediaPipe lokal
- [public/glasses_converted.glb](C:/Users/le/Documents/Arus%20Digital/project/JS/VTO/public/glasses_converted.glb): model kacamata aktif
- [vto_wiki.md](C:/Users/le/Documents/Arus%20Digital/project/JS/VTO/vto_wiki.md): catatan teknis, roadmap, dan referensi implementasi

## Asset yang Dipakai

- File model wajah MediaPipe dibaca dari `public/face_landmarker.task`
- Runtime WASM MediaPipe di-load dari CDN `jsdelivr`
- Model kacamata default saat ini adalah `public/glasses_converted.glb`

Jika ingin mengganti model, titik awal yang paling relevan adalah:

- ganti path model di `CustomGlasses`
- sesuaikan normalisasi bounding box jika proporsi model berbeda
- tune offset di `TWEAK_CONFIG` pada `GlassesOverlay`

## Area Tuning Utama

Penyesuaian manual paling penting ada di [src/components/GlassesOverlay.tsx](C:/Users/le/Documents/Arus%20Digital/project/JS/VTO/src/components/GlassesOverlay.tsx):

- `geserVertikal`
- `geserMajuMundur`
- `pengaliUkuran`
- `balikRotasiKiriKanan`
- `balikModelDepanBelakang`
- `tampilkanTitikJangkar`

Bagian ini dipakai untuk fine-tuning posisi kacamata terhadap hasil tracking AI.

## Catatan Implementasi

- `README` ini mengikuti status implementasi repo saat ini, bukan roadmap penuh production.
- UI selector multi-model belum aktif meskipun `store.ts` masih menyimpan state `style`.
- Proyek ini lebih dekat ke MVP single-model daripada sistem marketplace multi-SKU.
- Browser akan meminta izin kamera saat experience dimulai.

## Pengembangan Lanjutan

Beberapa area yang masuk akal untuk tahap berikutnya:

- multi-SKU model selector
- metadata offset per model
- lazy loading dan preload asset
- responsive mobile layout
- fallback saat kamera tidak tersedia
- screenshot atau share result


