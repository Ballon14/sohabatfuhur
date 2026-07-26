# AGENTS.md

Panduan ini digunakan oleh agent AI (opencode) saat bekerja di repository ini.
Baca file ini sepenuhnya sebelum membuat perubahan apa pun.

## Tentang Project

**Nama project:** Sohabat Fuhur — Proxmox Monitoring & VPS Rental Platform

**Deskripsi:**
Aplikasi web untuk:
1. **Monitoring server Proxmox** — menampilkan status node, VM/CT (CPU, RAM, disk, network, uptime), alert, dan resource usage secara real-time.
2. **Manajemen bisnis sewa VPS** — katalog paket VPS, pemesanan/order, manajemen pelanggan, invoice/pembayaran, status langganan (aktif/expired/suspended), dan panel admin untuk mengelola semua data tersebut.

**Repository:** https://github.com/Ballon14/sohabatfuhur.git

## Tech Stack

- **Framework:** Next.js (App Router) — gunakan versi stabil terbaru
- **Styling:** Tailwind CSS
- **Bahasa:** TypeScript (disarankan) untuk type-safety, kecuali sudah ada konvensi JS di project
- **Database:** MySQL
- **ORM/Query layer:** gunakan Prisma atau mysql2 (pilih salah satu secara konsisten, jangan campur)
- **Integrasi Proxmox:** Proxmox VE REST API (menggunakan API Token, bukan username/password)

## Konfigurasi Database

Database MySQL berjalan di server internal:

| Item | Nilai |
|---|---|
| Host | `10.10.10.5` |
| Database | `sohabatfuchur` |
| User | `iqbal` |
| Port | `3306` (default, sesuaikan jika berbeda) |

⚠️ **PENTING — Keamanan Kredensial:**
- **JANGAN PERNAH** menuliskan password database langsung di kode sumber atau di file yang di-commit ke Git.
- Semua kredensial (host, user, password, nama database, Proxmox API token) **wajib** disimpan di file `.env.local` (untuk lokal) dan di environment variables pada server produksi.
- Pastikan `.env`, `.env.local`, dan sejenisnya sudah masuk `.gitignore` sejak commit pertama.
- Sediakan file `.env.example` berisi nama variabel tanpa nilai asli, sebagai referensi.
- Karena repository ini akan di-push ke GitHub (kemungkinan publik), agent harus selalu memverifikasi tidak ada secret yang ter-commit sebelum melakukan `git push`.

Contoh `.env.example`:
```
DB_HOST=
DB_PORT=3306
DB_NAME=
DB_USER=
DB_PASSWORD=

PROXMOX_HOST=
PROXMOX_TOKEN_ID=
PROXMOX_TOKEN_SECRET=
PROXMOX_NODE=
```

## Struktur Project (target)

```
/app                # Next.js App Router
  /(dashboard)       # Halaman monitoring Proxmox
  /(vps)             # Halaman bisnis sewa VPS (katalog, order, invoice)
  /admin             # Panel admin
  /api               # Route handlers (proxmox proxy, db queries, auth)
/components          # Komponen UI reusable (Tailwind)
/lib
  /db.ts             # Koneksi & query MySQL
  /proxmox.ts         # Client untuk Proxmox API
/prisma               # Schema Prisma (jika pakai Prisma)
/types                # Type definitions
```

## Konvensi Kode

- Gunakan **App Router** Next.js, bukan Pages Router.
- Gunakan **Server Components** secara default; gunakan `"use client"` hanya saat perlu interaktivitas (form, chart real-time, dsb).
- Gunakan **Tailwind utility classes** langsung di JSX; hindari CSS terpisah kecuali untuk kasus khusus.
- Semua akses database dan Proxmox API dilakukan lewat **Route Handler (`/app/api/...`)** atau **Server Action**, tidak langsung dari client.
- Gunakan `async/await`, hindari callback style.
- Validasi input (form order, login, dsb) menggunakan library seperti `zod`.
- Format angka resource (CPU %, RAM GB, disk GB) dengan fungsi util terpusat agar konsisten di seluruh UI.

## Perintah yang Umum Digunakan

```bash
npm install          # install dependencies
npm run dev          # jalankan dev server
npm run build         # build production
npm run lint          # jalankan linter
npx prisma migrate dev   # jika menggunakan Prisma, jalankan migrasi
```

Agent sebaiknya menjalankan `npm run lint` dan `npm run build` sebelum menganggap sebuah task selesai, untuk memastikan tidak ada error.

## Git & Push ke Repository

- Remote: `https://github.com/Ballon14/sohabatfuhur.git`
- Branch utama: `main`
- Sebelum `git push`, agent **wajib**:
  1. Menjalankan `git status` dan meninjau file yang akan di-commit.
  2. Memastikan tidak ada file `.env*` (kecuali `.env.example`) ikut ter-commit.
  3. Menulis pesan commit yang jelas dan deskriptif (bahasa Indonesia atau Inggris, konsisten).
- Jangan melakukan `git push --force` kecuali diminta eksplisit oleh pengguna.

## Fitur Utama yang Perlu Dibangun

1. **Dashboard Monitoring Proxmox**
   - List node & status (online/offline)
   - Detail VM/CT: CPU, RAM, disk, uptime, IP
   - Grafik historis penggunaan resource
   - Alert jika resource melebihi ambang batas

2. **Modul Bisnis VPS**
   - Katalog paket VPS (spesifikasi, harga)
   - Form order/checkout
   - Manajemen invoice & status pembayaran
   - Status langganan pelanggan (aktif, akan expired, suspended)
   - Notifikasi (email/WhatsApp — opsional, tanyakan ke user jika dibutuhkan)

3. **Panel Admin**
   - CRUD paket VPS
   - CRUD pelanggan & order
   - Kontrol VM (start/stop/restart) via Proxmox API langsung dari dashboard admin
   - Log aktivitas admin

4. **Autentikasi**
   - Login admin (gunakan NextAuth.js atau solusi sejenis)
   - Proteksi route `/admin` dan `/api/admin/*`

## Catatan Tambahan untuk Agent

- Selalu cek apakah environment variable yang dibutuhkan sudah terdaftar di `.env.example` sebelum menggunakannya di kode.
- Karena koneksi Proxmox dan MySQL menuju IP internal (`10.10.10.5`), agent tidak bisa menguji koneksi nyata dari sandbox — cukup pastikan kode secara struktural benar dan gunakan connection pooling yang aman (mis. `mysql2/promise` dengan pool).
- Tulis kode yang mudah di-maintain: pisahkan logic Proxmox API, logic database, dan logic UI.
- Jika ada ambiguitas kebutuhan fitur, buat asumsi yang masuk akal, catat di komentar/PR description, dan lanjutkan — jangan berhenti hanya karena detail belum lengkap.
