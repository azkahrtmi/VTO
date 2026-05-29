# 🔗 Panduan Integrasi Odoo — VTO Headless CMS

> Panduan ini menjelaskan cara setup Odoo 18 sebagai **Headless CMS** 
> untuk mengelola catalog kacamata yang ditampilkan di React frontend.

---

## Arsitektur

```
┌─────────────────┐     HTTP/JSON      ┌──────────────────┐
│   React App     │ ◄──────────────── │   Odoo 18 CMS    │
│  localhost:5173  │    /api/vto/*      │  localhost:8069   │
│                 │                    │                  │
│  - Landing Page │                    │  - Admin Panel   │
│  - VTO Camera   │                    │  - Kelola Produk │
│  - Catalog      │                    │  - REST API      │
└─────────────────┘                    └────────┬─────────┘
                                                │
                                       ┌────────▼─────────┐
                                       │   PostgreSQL DB   │
                                       │   localhost:5433  │
                                       └──────────────────┘
```

---

## Prerequisites

### 1. Install Docker Desktop

Docker adalah cara paling mudah untuk menjalankan Odoo tanpa install Python/PostgreSQL manual.

1. Download **Docker Desktop for Windows**: https://www.docker.com/products/docker-desktop/
2. Install dan restart PC jika diminta
3. Buka Docker Desktop, tunggu sampai statusnya "Running"
4. Verifikasi di terminal:

```powershell
docker --version
# Output: Docker version 27.x.x
docker compose version
# Output: Docker Compose version v2.x.x
```

> 💡 **Tidak mau pakai Docker?** Alternatif: Download Odoo Windows Installer dari 
> https://www.odoo.com/page/download (pilih Community, v18). 
> Installer otomatis include PostgreSQL.

---

## Step 1: Jalankan Odoo

Buka terminal di folder `d:\VTO`:

```powershell
# Jalankan Odoo + PostgreSQL (pertama kali akan download ~1GB)
docker compose up -d

# Cek status
docker compose ps
# Harus muncul: vto-odoo (running), vto-postgres (running)

# Lihat logs kalau ada error
docker compose logs odoo
```

Tunggu ~30 detik, lalu buka: **http://localhost:8069**

### First Time Setup

Saat pertama kali buka Odoo, kamu akan diminta setup database:

| Field | Isi |
|-------|-----|
| Master Password | `admin` (atau biarkan default) |
| Database Name | `vto` |
| Email | `admin@vto.local` |
| Password | `admin` (atau terserah kamu) |
| Language | Bahasa Indonesia (atau English) |
| Country | Indonesia |

Klik **Create Database**, tunggu ~1-2 menit.

---

## Step 2: Install Module VTO Catalog

Setelah login ke Odoo:

1. Buka menu **Settings** (⚙️ icon kiri atas)
2. Klik **Activate the developer mode** di bagian bawah halaman
3. Buka menu **Apps**
4. Klik **Update Apps List** (tombol di atas)
5. Cari **"VTO Catalog"**
6. Klik **Install**

> ⚠️ Jika tidak muncul di daftar Apps, coba restart Odoo:
> ```powershell
> docker compose restart odoo
> ```
> Lalu ulangi langkah 3-6.

Setelah install, akan muncul menu baru: **VTO Catalog** → **Catalog** → **Kacamata**

---

## Step 3: Tambah Data Kacamata

Klik **VTO Catalog** → **Kacamata** → **New**

Contoh data untuk diisi:

| Field | Contoh 1 | Contoh 2 |
|-------|----------|----------|
| Nama | Bonia Classic Black | RayBan Wayfarer |
| SKU | BN-001 | RB-001 |
| Brand | Bonia | RayBan |
| Harga | 1500000 | 2500000 |
| Warna | Black | Tortoise |
| Warna Hex | #000000 | #8B4513 |
| Kategori | Kacamata Optik | Kacamata Hitam |
| AR Engine | DeepAR | DeepAR |
| URL Model 3D | /coba4.glb | /rayban.deepar |
| URL DeepAR | /coba4.deepar | /rayban.deepar |
| Published | ✅ | ✅ |
| Featured | ✅ | ❌ |

Klik **Save** setelah mengisi.

---

## Step 4: Test API

Buka browser atau Postman:

### Health Check
```
GET http://localhost:8069/api/vto/health
```
Expected:
```json
{
    "status": "ok",
    "message": "VTO Catalog API is running",
    "version": "1.0.0"
}
```

### List Kacamata
```
GET http://localhost:8069/api/vto/glasses
```
Expected:
```json
{
    "success": true,
    "count": 2,
    "data": [
        {
            "id": 1,
            "name": "Bonia Classic Black",
            "sku": "BN-001",
            "brand": "Bonia",
            "price": 1500000,
            "color_hex": "#000000",
            ...
        }
    ]
}
```

---

## Step 5: Connect React App

### Tambah environment variable

Di file `d:\VTO\.env`, tambahkan:

```
VITE_ODOO_URL=http://localhost:8069
```

### Contoh penggunaan di React

```typescript
import { fetchGlassesFromOdoo, checkOdooHealth } from '../utils/odooApi';

// Cek apakah Odoo tersedia
const isOdooUp = await checkOdooHealth();
console.log('Odoo status:', isOdooUp ? '✅ Connected' : '❌ Not available');

// Fetch catalog dari Odoo
if (isOdooUp) {
    const glasses = await fetchGlassesFromOdoo();
    console.log('Glasses from Odoo:', glasses);
    // → Tampilkan di UI
}
```

---

## Perintah Berguna

```powershell
# Start Odoo
docker compose up -d

# Stop Odoo (data tetap ada)
docker compose down

# Stop Odoo + hapus semua data (reset total)
docker compose down -v

# Restart Odoo (setelah ubah module)
docker compose restart odoo

# Lihat log Odoo
docker compose logs -f odoo

# Masuk ke shell Odoo container
docker compose exec odoo bash
```

---

## Troubleshooting

### "Module VTO Catalog tidak muncul di Apps"
- Pastikan folder `odoo-addons/vto_catalog/` ada dan tidak kosong
- Restart Odoo: `docker compose restart odoo`
- Di Odoo: Settings → Developer Mode → Apps → Update Apps List

### "CORS error di browser"
- Pastikan Odoo berjalan di `localhost:8069`
- Pastikan `VITE_ODOO_URL` di `.env` sudah benar
- Controller sudah handle CORS headers (cek `controllers/main.py`)

### "Database connection error"
- Cek apakah PostgreSQL running: `docker compose ps`
- Cek logs: `docker compose logs db`

### "Port 8069 sudah dipakai"
- Ubah port di `docker-compose.yml`: `"8070:8069"`
- Update `VITE_ODOO_URL` ke `http://localhost:8070`

---

## Production Deployment

Untuk production (React di Vercel + Odoo di VPS):

1. **React di Vercel**: Set environment variable `VITE_ODOO_URL=https://odoo.yourdomain.com`
2. **Odoo di VPS**: 
   - Copy `docker-compose.yml` dan `odoo-addons/` ke VPS
   - `docker compose up -d`
   - Setup reverse proxy (Nginx) untuk HTTPS
   - Update CORS di `controllers/main.py` ke domain production

```nginx
# Contoh Nginx reverse proxy untuk Odoo
server {
    listen 443 ssl;
    server_name odoo.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8069;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
