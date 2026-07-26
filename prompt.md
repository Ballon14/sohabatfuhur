# Prompt untuk Merancang Project (Sohabat Fuhur)

Salin dan tempel prompt di bawah ini ke opencode untuk memulai perancangan project.
`AGENTS.md` sudah berisi konteks project, jadi prompt ini fokus meminta agent membuat **rencana & struktur** terlebih dahulu sebelum menulis kode.

---

## Prompt

```
Saya ingin membangun project baru bernama "Sohabat Fuhur" — sebuah aplikasi web
untuk (1) monitoring server Proxmox dan (2) mengelola bisnis sewa VPS.
Baca AGENTS.md di root repo ini sebagai konteks utama sebelum melanjutkan.

Tech stack: Next.js (App Router) + TypeScript + Tailwind CSS + MySQL.
Database sudah ada, kredensial akan saya isi sendiri di .env.local — jangan
tanyakan atau tulis passwordnya, cukup siapkan .env.example.

Tolong lakukan langkah berikut secara berurutan:

1. RANCANGAN ARSITEKTUR
   - Usulkan struktur folder lengkap (app router, components, lib, types, prisma jika dipakai).
   - Tentukan apakah pakai Prisma atau mysql2 murni, beri alasan singkat.
   - Rancang alur autentikasi admin (misal NextAuth.js credentials provider).

2. SKEMA DATABASE
   - Rancang skema tabel MySQL untuk: users/admin, pelanggan, paket VPS,
     order/langganan, invoice/pembayaran, log aktivitas, dan node/VM Proxmox
     yang dipantau (cache data dari Proxmox API, bukan sumber utama).
   - Tampilkan dalam bentuk ERD (boleh teks/mermaid) + DDL SQL atau schema.prisma.

3. INTEGRASI PROXMOX
   - Jelaskan cara autentikasi ke Proxmox API (API Token).
   - Daftar endpoint Proxmox yang akan dipakai: status node, status VM/CT,
     resource usage, start/stop/restart VM.
   - Rancang layer abstraksi (lib/proxmox.ts) agar API route tinggal memanggil fungsi ini.

4. DAFTAR HALAMAN & ROUTE
   - Buat daftar route untuk:
     a. Dashboard monitoring (publik/internal, sesuai kebutuhan)
     b. Halaman katalog & order VPS (untuk calon pelanggan)
     c. Panel admin (/admin) untuk kelola paket, pelanggan, order, invoice, kontrol VM
     d. API routes yang dibutuhkan tiap halaman di atas

5. RENCANA BERTAHAP (ROADMAP)
   - Pecah pengerjaan jadi milestone kecil, contoh:
     Milestone 1: setup project, koneksi DB, autentikasi admin
     Milestone 2: CRUD paket VPS & pelanggan
     Milestone 3: integrasi Proxmox API + dashboard monitoring
     Milestone 4: modul order & invoice
     Milestone 5: polish UI (Tailwind), testing, deploy

Setelah rancangan di atas saya setujui, baru mulai generate kode sesuai
milestone pertama. Jangan langsung menulis semua kode sekaligus.

Tampilkan hasil rancangan dalam format terstruktur (heading per bagian),
agar mudah saya review sebelum lanjut ke tahap coding.
```

---

## Tips Pemakaian

- Jalankan prompt ini di root folder repo (setelah `AGENTS.md` ada di sana).
- Review dulu hasil rancangan (arsitektur, skema DB, roadmap) sebelum menyuruh agent mulai coding — ini mencegah agent membangun struktur yang salah arah di awal.
- Setelah rancangan disetujui, gunakan prompt lanjutan seperti:
  `"Lanjutkan ke Milestone 1: setup project Next.js, koneksi MySQL, dan autentikasi admin."`
- Untuk setiap milestone berikutnya, minta agent membuat ringkasan perubahan + menjalankan `npm run lint` dan `npm run build` sebelum commit.



untuk user dan api : 
(isi di .env.local, lihat .env.example untuk daftar variabel)
