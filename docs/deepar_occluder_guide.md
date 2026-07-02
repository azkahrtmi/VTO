# Head Occluder DeepAR — Verifikasi & Penyempurnaan

> Occluder = mesh kepala tak terlihat yang "memotong" bagian kacamata di
> belakangnya (gagang/temples), sehingga tidak menembus pelipis saat wajah
> menoleh. Ini kunci realisme ala FittingBox.

## Status saat ini (hasil inspeksi file efek, Juli 2026)

Kedua efek yang dipakai aplikasi **sudah berisi head occluder** bawaan
template RayBan DeepAR Studio:

| File efek | Occluder mesh | Material | Catatan |
|---|---|---|---|
| `public/coba4.deepar` | `Models/Head.armesh` (node `Head`) | `Materials/HeadOccluder.mat` | Model client `coba4_fixed.glb` |
| `public/rayban.deepar` | `Models/Head.armesh` (node `Head`) | `Materials/HeadOccluder.mat` | Template RayBan asli |

Artinya occluder kemungkinan sudah aktif. Yang perlu dipastikan adalah
**apakah bentuk/skala occluder pas dengan model kacamata client**.

## Cara verifikasi visual (di aplikasi, tanpa Studio)

1. Jalankan app → buka Virtual Try-On, pilih model client (coba4).
2. Putar kepala perlahan ke kiri/kanan sampai ~45–60°.
3. Amati gagang kacamata sisi yang menjauh dari kamera:
   - ✅ **Benar**: gagang "terpotong" secara halus di belakang pelipis/rambut.
   - ❌ **Salah — occluder terlalu kecil / tidak kena**: gagang terlihat
     menembus dan melayang di atas pipi/pelipis.
   - ❌ **Salah — occluder terlalu besar**: bagian depan frame/lensa ikut
     terpotong ("tergigit") padahal seharusnya terlihat.
4. Cek juga saat menunduk/mendongak (pitch) — kesalahan skala occluder
   biasanya paling terlihat di sini.

## Perbaikan di DeepAR Studio (jika hasil verifikasi ❌)

Perlu file project Studio (`.deeparproj`) asal efek ini, atau buat ulang
dari template. Langkah:

1. **Buka project** di DeepAR Studio (unduh: developer.deepar.ai).
   Jika project asli tidak ada, buat baru dari template **Glasses /
   Face Accessories** — template ini sudah menyertakan node `Head` +
   material `HeadOccluder`, lalu import `coba4_fixed.glb` ke dalamnya.
2. Di panel hierarki, pilih node **Head** (occluder).
   - Pastikan visible/enabled.
   - Material harus `HeadOccluder` — tipe *occluder* (menulis depth buffer
     saja, tanpa warna). Jangan diganti material biasa.
3. **Sesuaikan skala occluder** terhadap model kacamata:
   - Aktifkan mode preview kamera di Studio, kenakan efek, tolehkan kepala.
   - Jika gagang masih menembus: perbesar occluder sedikit di sumbu X
     (lebar kepala), ±2–5% per langkah.
   - Jika frame depan "tergigit": kecilkan sumbu Z (kedalaman) atau geser
     occluder sedikit ke belakang.
4. Perhatikan **render order**: occluder harus dirender *sebelum* mesh
   kacamata (di template bawaan sudah benar; jangan mengubah urutan node).
5. Export → **File → Export effect** → timpa `public/coba4.deepar`.
6. Tidak ada perubahan kode yang diperlukan — selama nama node
   `Frame` / `LensInner` / `LensOuter` / root tidak berubah,
   `nodeMapping` di `src/catalog/glasses.ts` tetap valid.
   Jika nama node berubah, perbarui mapping di katalog.

## Sekalian di Studio: peningkatan realisme lain (opsional)

- **Refleksi lensa**: template menyediakan `Textures/Reflection.png` +
  node `LensesAdd` (additive). Naikkan sedikit intensitasnya untuk kilau
  kaca yang lebih hidup.
- **Material frame**: ganti warna flat dengan matcap/PBR (contoh bawaan:
  `BlackMatCap.png`) agar frame plastik/metal terlihat premium.
- **Shadow lembut** di bawah frame (template RayBan punya `Shadow.png`) —
  menambah kesan menempel di wajah.

## Checklist selesai

- [ ] Verifikasi visual occluder pada model coba4 (putar kepala kiri/kanan)
- [ ] (Jika perlu) tuning skala occluder di DeepAR Studio + re-export
- [ ] Regresi: warna frame & lensa masih bisa diganti setelah re-export
      (nama node tidak berubah)
