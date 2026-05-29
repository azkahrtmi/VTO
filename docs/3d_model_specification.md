# 📐 Spesifikasi 3D Model Kacamata — VTO System

> Dokumen ini adalah **standar wajib** yang harus diikuti oleh setiap 3D artist
> yang membuat model kacamata untuk sistem Virtual Try-On (VTO).
> Model yang tidak mengikuti standar ini **tidak akan berfungsi** dengan benar di aplikasi.

---

## 1. Format File

| Property | Standar |
|----------|---------|
| **Format** | `.glb` (binary glTF 2.0) |
| **Versi glTF** | 2.0 |
| **Kompresi** | Draco compression (recommended) |
| **Max file size** | < 3MB per model (target < 1.5MB) |

---

## 2. Hierarki Node (SANGAT PENTING)

### ✅ Struktur yang BENAR (Flat Hierarchy)

Semua bagian kacamata harus **sejajar** di bawah satu root node.
**JANGAN** nested/bersarang.

```
GlassesRoot                    ← Root node (nama bebas, tapi deskriptif)
├── Frame                      ← Gagang + frame kacamata (WAJIB)
├── LensInner                  ← Lensa bagian dalam / multiply (WAJIB)
├── LensOuter                  ← Lensa bagian luar / additive (WAJIB)
├── LogoLeft                   ← Logo di sisi kiri (opsional)
├── LogoRight                  ← Logo di sisi kanan (opsional)
├── Metal                      ← Bagian metal/hinge (opsional)
├── NosePad                    ← Nose pad (opsional)
└── TempleTip                  ← Ujung gagang / ear tip (opsional)
```

### ❌ Struktur yang SALAH (Nested Hierarchy)

```
Assembly-2                     ← ❌ Nama tidak deskriptif
└── SomeGroup
    └── AnotherGroup
        └── YetAnotherGroup
            └── Mesh_1.002     ← ❌ Gagang, tapi nested 4 level
                └── Mesh_1.002_2   ← ❌ Lensa sebagai CHILD dari gagang
```

### Kenapa Harus Flat?

1. **Kontrol Independen** — Warna frame dan lensa harus bisa diubah **terpisah** lewat kode.
   Jika lensa adalah child dari frame, mengubah frame otomatis mempengaruhi lensa.

2. **DeepAR Compatibility** — DeepAR mengakses node berdasarkan **nama**.
   Hierarki nested membuat nama node sulit diprediksi dan sering berubah saat export.

3. **Maintainability** — Flat hierarchy lebih mudah di-debug dan di-maintain.

---

## 3. Naming Convention

### Node Wajib

| Nama Node | Fungsi | Material Type |
|-----------|--------|---------------|
| `Frame` | Frame depan + gagang (temple) + bridge | Opaque PBR |
| `LensInner` | Lensa bagian dalam (efek multiply/darken) | Semi-transparent, Multiply blend |
| `LensOuter` | Lensa bagian luar (efek refleksi/highlight) | Semi-transparent, Additive blend |

### Node Opsional

| Nama Node | Fungsi | Material Type |
|-----------|--------|---------------|
| `LogoLeft` | Logo di gagang kiri | Opaque/Decal |
| `LogoRight` | Logo di gagang kanan | Opaque/Decal |
| `LogoFront` | Logo di frame depan | Opaque/Decal |
| `Metal` | Bagian metal (hinge, bridge) | Metallic PBR |
| `NosePad` | Nose pad | Opaque PBR |
| `TempleTip` | Ujung gagang (ear tip) | Opaque PBR |

### Aturan Naming

- Gunakan **PascalCase** (huruf besar di awal setiap kata)
- **JANGAN** gunakan nama generik (`Mesh_1`, `polySurface35`, `Node_7`)
- **JANGAN** gunakan karakter khusus atau spasi
- Nama harus **deskriptif** dan **konsisten** di semua model

---

## 4. Origin & Orientation

### Origin (Titik Pusat)

```
    Tampak Depan Kacamata:
    
         ┌─────────────────────────┐
         │    LogoLeft    LogoRight │
    ─────┤          ⊕              ├─────  ← Gagang kiri & kanan
         │   ┌───┐     ┌───┐      │
         │   │ L │     │ R │      │
         │   │   │     │   │      │
         │   └───┘     └───┘      │
         └────────┬───┬────────────┘
                  │   │
                  └───┘ ← Bridge
    
    ⊕ = ORIGIN (0, 0, 0) → Harus di CENTER OF BRIDGE (tengah jembatan hidung)
```

| Axis | Posisi Origin |
|------|--------------|
| **X** | Tepat di tengah (antara lensa kiri dan kanan) |
| **Y** | Sejajar dengan bagian atas bridge |
| **Z** | Di permukaan depan frame |

### Orientasi (Facing Direction)

| Axis | Arah |
|------|------|
| **Facing** | **-Y** (menghadap ke bawah di Blender = menghadap kamera di DeepAR) |
| **Up** | **+Z** di Blender → export dengan "+Y Up" |
| **Gagang** | Memanjang ke arah **+Y** (ke belakang/ke arah telinga) |

> ⚠️ **PENTING**: DeepAR menggunakan konvensi **-Y facing**. 
> Di Blender, ini berarti kacamata harus menghadap ke bawah (-Y) sebelum export.
> Saat export glTF, centang "+Y Up" dan orientasi akan otomatis benar.

---

## 5. Skala (Scale)

| Property | Nilai |
|----------|-------|
| **Unit System** | Metric (1 unit = 1 meter, standar glTF) |
| **Total Width** | ~0.135 - 0.145 meter (13.5 - 14.5 cm) |
| **Lens Width** | ~0.05 - 0.055 meter (5 - 5.5 cm) per lensa |
| **Bridge Width** | ~0.018 - 0.022 meter (1.8 - 2.2 cm) |
| **Temple Length** | ~0.135 - 0.145 meter (13.5 - 14.5 cm) |

> Gunakan referensi ukuran kacamata asli dari client.
> Ukuran biasanya tertera di bagian dalam gagang (contoh: 52□18-140).
> - 52 = lens width (mm), 18 = bridge width (mm), 140 = temple length (mm)

### Apply Scale

Sebelum export, **SELALU** apply scale di Blender:
```
Ctrl+A → Apply → Scale
```
Pastikan scale di Transform panel menunjukkan `1.000` untuk X, Y, Z.

---

## 6. Material Specification

### Frame (Gagang + Frame Depan)

| Property | Nilai |
|----------|-------|
| **Shader** | Principled BSDF |
| **Base Color** | Warna dasar frame (akan di-override oleh app) |
| **Metallic** | 0.0 (plastik) atau 0.8-1.0 (metal) |
| **Roughness** | 0.3 - 0.7 |
| **Alpha** | **1.0 (fully opaque)** |
| **Blend Mode** | **Opaque** |
| **Backface Culling** | **ON** ✅ |
| **Depth Write** | **ON** ✅ |

> ⚠️ **KRITIS**: Frame HARUS opaque dan backface culling HARUS ON.
> Jika tidak, gagang akan "tembus" terlihat dari balik kepala saat AR rendering.

### Lensa Inner (LensInner)

| Property | Nilai |
|----------|-------|
| **Shader** | Principled BSDF |
| **Base Color** | Warna lensa gelap (misal: hitam/coklat) |
| **Alpha** | 0.3 - 0.6 (semi-transparent) |
| **Blend Mode** | **Alpha Blend** |
| **Backface Culling** | OFF (lensa harus visible dari dua sisi) |

### Lensa Outer (LensOuter)

| Property | Nilai |
|----------|-------|
| **Shader** | Principled BSDF |
| **Base Color** | Warna highlight/refleksi |
| **Alpha** | 0.1 - 0.3 (sangat transparan) |
| **Blend Mode** | **Alpha Blend** |
| **Backface Culling** | OFF |

### Tips Material untuk DeepAR

- DeepAR mengontrol warna material lewat `u_color` parameter
- Warna yang di-set di Blender adalah **default** — app bisa override
- Gunakan material **PBR Metallic-Roughness** (BUKAN Specular-Glossiness)

---

## 7. Geometry Specification

| Property | Nilai |
|----------|-------|
| **Max Triangles** | < 15,000 per model (total semua mesh) |
| **Target Triangles** | 5,000 - 10,000 (sweet spot) |
| **Quads/N-gons** | Triangulate sebelum export |
| **Normals** | Smooth shading, recalculate normals |
| **UV Mapping** | Ya, setiap mesh harus punya UV |
| **Max Texture Size** | 1024 x 1024 pixel |
| **Texture Format** | PNG atau JPEG (embedded di GLB) |

### Optimasi Polycount

```
Area                  Target Triangles
─────────────────────────────────────
Frame depan           2,000 - 4,000
Gagang (kiri+kanan)   1,500 - 3,000
Lensa (2x)            500 - 1,000
Detail (logo, metal)  500 - 1,000
─────────────────────────────────────
TOTAL                 5,000 - 10,000
```

---

## 8. Blender Export Settings

### Sebelum Export (Checklist)

- [ ] Apply semua transform: `Ctrl+A` → All Transforms
- [ ] Flatten hierarchy (semua mesh di level root)
- [ ] Rename semua node sesuai naming convention
- [ ] Pastikan origin di center of bridge
- [ ] Pastikan facing -Y
- [ ] Recalculate normals: `Shift+N` (di Edit Mode)
- [ ] Triangulate: `Ctrl+T` (di Edit Mode) — opsional, glTF auto-triangulate

### Export Dialog (File → Export → glTF 2.0)

```
Format:                glTF Binary (.glb)

Include:
  └─ Limit to:         Selected Objects ✅ (select semua part kacamata)

Transform:
  └─ +Y Up:            ✅
  
Geometry:
  ├─ Apply Modifiers:  ✅
  ├─ UVs:              ✅
  ├─ Normals:          ✅
  ├─ Tangents:         ❌ (tidak perlu, hemat ukuran)
  ├─ Vertex Colors:    ❌
  └─ Compression:      ✅ (Draco) — opsional tapi recommended

Materials:
  └─ Export:           ✅

Animation:
  └─ All:              ❌ (JANGAN export animasi)
```

---

## 9. Validasi Setelah Export

### Online Validator
1. Buka https://gltf-viewer.donmccurdy.com/
2. Drag-drop file `.glb`
3. Pastikan:
   - Model terlihat benar (tidak terbalik, skala ok)
   - Hierarchy flat (cek di panel kiri)
   - Material terlihat benar (frame opaque, lensa transparan)

### DeepAR Studio
1. Import `.glb` ke DeepAR Studio
2. Cek hierarchy panel — harus flat
3. Pastikan setiap node bisa di-select dan diubah warnanya independen
4. Adjust occluder agar menutupi gagang saat menoleh

---

## 10. Mapping Reference: RayBan (Contoh yang Benar)

Model RayBan dari DeepAR adalah contoh hierarki yang **sudah benar**:

```
rayban                 ← Root
├── Plastic            ← Frame/gagang (= Frame)
├── LensesMultiply     ← Lensa dalam  (= LensInner)
├── LensesAdd          ← Lensa luar   (= LensOuter)
├── LogoSides          ← Logo samping  (= LogoLeft/LogoRight)
├── Metal              ← Metal parts   (= Metal)
└── LogoFront          ← Logo depan    (= LogoFront)
```

Naming-nya berbeda dari standar kita, tapi **strukturnya benar** — semua flat, sejajar.

---

## 11. Panduan Fix: Model coba4.glb (Dari Client)

### Masalah Saat Ini

```
❌ Hierarki nested 6+ level
❌ Lensa (Mesh_1.002_2) adalah child dari gagang (Mesh_1.002)
❌ Nama node generik (polySurface35, Node_7, etc.)
❌ Gagang tembus ke kepala saat AR (occluder issue)
```

### Step-by-Step Fix di Blender

#### Step 1: Import & Inspect
```
File → Import → glTF 2.0 → pilih coba4.glb
```
Buka Outliner (panel kanan atas), lihat hierarchy yang nested.

#### Step 2: Flatten Hierarchy
Untuk setiap mesh (Mesh_1.002, Mesh_1.002_2, dll):
1. Select mesh di Outliner
2. `Alt+P` → **Clear Parent** (Keep Transform)
3. Ulangi sampai semua mesh di level root (tidak ada parent)

#### Step 3: Hapus Empty Groups
Hapus semua node kosong yang tersisa:
- `Assembly-2`, `Bonia_BE40122M_Fin`, `polySurface35.003`, dll
- Select → `Delete`

#### Step 4: Pisahkan Lensa dari Gagang (JIKA masih satu mesh)
Jika lensa dan gagang masih satu mesh setelah flatten:
1. Select mesh → `Tab` (Edit Mode)
2. Select faces lensa → `P` → **Selection** (pisahkan jadi mesh baru)
3. Ulangi untuk membuat LensInner dan LensOuter

#### Step 5: Rename Semua Node
```
Mesh_1.002       → Frame
Mesh_1.002_2     → LensInner
(buat duplikat)  → LensOuter
```
Double-click nama di Outliner untuk rename.

#### Step 6: Set Origin ke Center of Bridge
1. Select semua mesh (`A`)
2. Tentukan posisi bridge: `Shift+S` → Cursor to Selected (snap ke area bridge)
3. Atau manual: posisikan 3D Cursor di tengah bridge
4. Select semua → `Ctrl+Shift+Alt+C` → Origin to 3D Cursor

#### Step 7: Fix Material Gagang
1. Select `Frame`
2. Di Material Properties:
   - Alpha: `1.0`
   - Blend Mode: `Opaque`
   - Backface Culling: `✅ ON`
   - Shadow Mode: `Opaque`

#### Step 8: Fix Material Lensa
1. Select `LensInner`
2. Di Material Properties:
   - Alpha: `0.4` (adjust sesuai kebutuhan)
   - Blend Mode: `Alpha Blend`
   - Backface Culling: `❌ OFF`

#### Step 9: Apply All Transforms
```
Select All → Ctrl+A → All Transforms
```

#### Step 10: Export
Ikuti export settings di Section 8 di atas.

#### Step 11: DeepAR Studio
1. Import `.glb` yang sudah di-fix
2. Adjust orientation jika perlu (-Y facing)
3. Adjust scale
4. **Adjust occluder**: perbesar/reposisi occluder agar gagang tidak tembus kepala
5. Export sebagai `.deepar`

---

## Checklist Final per Model

- [ ] Format: `.glb` (binary glTF 2.0)
- [ ] Hierarki: Flat (semua mesh sejajar di root)
- [ ] Naming: Sesuai convention (`Frame`, `LensInner`, `LensOuter`, dll)
- [ ] Origin: Center of bridge (0, 0, 0)
- [ ] Orientation: Facing -Y
- [ ] Scale: Real-world size (~14cm width)
- [ ] Transform: Applied (scale 1,1,1)
- [ ] Frame material: Opaque, backface culling ON
- [ ] Lens material: Semi-transparent, proper blend mode
- [ ] Polycount: < 15,000 triangles
- [ ] File size: < 3MB
- [ ] Validated di glTF viewer
- [ ] Tested di DeepAR Studio
- [ ] Node mapping terdaftar di `glasses.ts` catalog
