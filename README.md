# DoneRight 🎯 - Manajemen Tugas Mahasiswa berbasis Progressive Web App (PWA 2.0)

DoneRight adalah aplikasi manajemen tugas (*task management*) modern berbasis **Progressive Web App (PWA II)** dengan arsitektur **Offline-First**, integrasi langsung **Supabase BaaS (Backend-as-a-Service)**, serta sistem pengingat deadline multi-platform. Aplikasi ini dirancang untuk mendampingi mahasiswa dalam mengelola kegiatan akademik, memantau tenggat waktu (*deadline*), dan menganalisis produktivitas secara otomatis.

---

## ⚡ Arsitektur & Teknologi PWA 2.0

Aplikasi ini mengimplementasikan spesifikasi Progressive Web App generasi kedua (PWA 2.0) secara penuh:

1. **Arsitektur Offline-First & Sinkronisasi Latar Belakang (`SyncService`)**:
   - Pengguna tetap dapat membuat, menyunting, mencentang selesai, maupun menghapus tugas dalam kondisi **tanpa koneksi internet (offline)**.
   - Semua mutasi data saat offline disimpan dalam antrean lokal (`localStorage`) dan disinkronkan secara otomatis (*auto-replay*) ke Supabase PostgreSQL begitu perangkat mendeteksi koneksi internet kembali (`online` event listener & periodic poller).

2. **Service Worker & Caching Otomatis (`vite-plugin-pwa` + Workbox)**:
   - Terintegrasi dengan Service Worker kustom (`sw-custom.js`) dan modul Workbox.
   - Menerapkan strategi caching `StaleWhileRevalidate` untuk seluruh aset statis (HTML, JS, CSS, Font, dan Gambar) hingga 30 hari, memastikan aplikasi dapat dibuka seketika (*instant launch*) tanpa membebani kuota data.

3. **Notifikasi Sistem HP & Web Push API (`NotificationService`)**:
   - Pengingat otomatis untuk tugas berstatus **H-1 Deadline** (<= 24 jam) yang memicu notifikasi sistem langsung di bilah status ponsel maupun peramban desktop via `reg.showNotification()` dan Web Notification API.
   - Interaksi klik notifikasi langsung membuka atau mengarahkan (*focus/navigate*) jendela PWA ke halaman tugas.
   - Dilengkapi bilah aktivasi notifikasi interaktif serta tombol **"Tes Notif"** untuk memverifikasi izin sistem secara langsung.

4. **Dukungan Instalasi PWA (*Installable App*)**:
   - Memenuhi standar Web App Manifest (`manifest.webmanifest`) dengan mode tampilan `standalone`, orientasi portrait, tema dinamis (`#4f46e5`), dan ikon *maskable* (192px & 512px).
   - Dapat diinstal langsung ke layar utama (*homescreen*) Android, iOS, maupun Desktop (Google Chrome, Microsoft Edge) layaknya aplikasi native tanpa perlu app store.

---

## 🚀 Fitur Unggulan Aplikasi

### 1. Manajemen Tugas Cerdas
- **Siklus CRUD Tugas Lengkap**: Judul, Deskripsi, Tenggat Waktu (*Deadline*), Kategori, Tingkat Prioritas (Tinggi, Sedang, Rendah), dan Pengulangan (*Recurrence*).
- **Indikator Tenggat Real-Time**: Label visual status tugas (Selesai, Aktif, Menjelang Deadline, dan Terlambat/Overdue).
- **Checklist Selesai Cepat**: Menandai penyelesaian tugas dengan perhitungan ketepatan waktu otomatis.
- **Trash Bin (Tempat Sampah)**: Sistem penghapusan aman (*soft-delete* dengan `deleted_at`) yang memungkinkan pemulihan (*restore*) tugas atau penghapusan permanen.

### 2. Autentikasi & Profil Pengguna
- Registrasi akun, Login, dan sistem Lupa Kata Sandi (*Forgot Password*).
- Halaman profil mahasiswa dengan data identitas terstruktur:
  - Nama Lengkap
  - NIM (Nomor Induk Mahasiswa)
  - Kelompok Praktikum
  - Program Studi
  - Alamat Email & Pembaruan Kata Sandi
- Integrasi foto profil (*avatar*) langsung dengan **Supabase Storage**.

### 3. Laporan Produktivitas & Cetak Dokumen PDF Resmi
- **Laporan Produktivitas Mahasiswa**:
  - Penghitungan *Productivity Rate* dinamis berdasarkan persentase tugas yang diselesaikan tepat waktu.
  - Statistik komprehensif: Total Tugas, Tugas Selesai, Selesai Tepat Waktu, dan Terlambat.
- **Laporan Sistem Global (Admin)**:
  - Rekapitulasi efisiensi sistem secara menyeluruh dari seluruh pengguna aktif.
- **Ekspor Dokumen PDF Kertas A4**:
  - Pembuatan dokumen PDF langsung pada sisi klien (*client-side*) menggunakan pustaka `jspdf`.
  - Format kertas standar internasional A4 dengan tipografi proporsional, rapi, dan siap cetak.

### 4. Panel Administrator (Admin Dashboard)
- **Ringkasan Metrik Sistem**: Pemantauan jumlah user terdaftar, total tugas aktif, sebaran prioritas tugas, dan rasio penyelesaian.
- **Manajemen Kategori Global**: Tambah, edit, dan hapus kategori tugas yang berlaku di seluruh platform.
- **Manajemen Akun Pengguna**: Pemantauan produktivitas pengguna per akun, fitur penonaktifan akun (*soft-delete* user), pemulihan akun, serta cetak laporan PDF individual pengguna.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

| Kategori | Teknologi | Keterangan |
|---|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) | React 19.2.6 (Hooks & Modular Component Architecture) |
| **Build Tool** | [Vite 8](https://vite.dev/) | Next-generation frontend tooling & super fast HMR |
| **Teknologi PWA** | [Vite PWA](https://vite-pwa-org.netlify.app/) | Service Worker, Workbox, Web App Manifest, Notification API |
| **BaaS & Database** | [Supabase](https://supabase.com/) | Cloud PostgreSQL, Supabase Auth, & Supabase Storage |
| **Ekspor Dokumen** | [jsPDF](https://parall.ax/products/jspdf) | Client-side A4 document generator (Standar resmi) |
| **Ikonografi** | [Lucide React](https://lucide.dev/) | Modern, lightweight, dan konsisten |
| **Styling** | Vanilla CSS Modular | Responsive design (Desktop & Mobile-first), Glassmorphic, CSS Variables |

---

## 📂 Struktur Direktori Proyek

```
DoneRight/
├── public/                     # Aset publik statis PWA
│   ├── favicon.svg             # Logo dan favicon aplikasi
│   ├── icon-192.png            # PWA Icon 192x192
│   ├── icon-512.png            # PWA Icon 512x512
│   ├── sw-custom.js            # Custom Service Worker (Push Notification handler)
│   └── notification-bell.png   # Ikon notifikasi sistem
│
├── src/
│   ├── assets/                 # Gambar dan ilustrasi
│   ├── components/             # Komponen UI modular
│   │   ├── admindashboard/     # Komponen khusus panel Admin
│   │   ├── dashboard/          # Komponen tugas, filter, modal detail
│   │   ├── profile/            # Form dan avatar profil pengguna
│   │   ├── report/             # Banner persentase, grid statistik, tombol aksi
│   │   ├── trash/              # Daftar tugas tempat sampah & modal pemulihan
│   │   ├── Navbar.jsx          # Header navigasi responsif (Desktop & Mobile)
│   │   ├── NavigationTabs.jsx  # Slider navigasi tab utama
│   │   └── ConfirmModal.jsx    # Dialog konfirmasi aksi penting
│   │
│   ├── config/
│   │   └── supabase.js         # Inisialisasi Supabase BaaS Client
│   │
│   ├── hooks/                  # Custom hooks manajemen state & fetcher
│   │   ├── useDashboardData.js
│   │   ├── useAdminDashboardData.js
│   │   ├── useUserReportData.js
│   │   ├── useAdminReportData.js
│   │   └── useNotifications.js
│   │
│   ├── pages/                  # Halaman utama aplikasi
│   │   ├── LandingPage.jsx     # Halaman sambutan awal
│   │   ├── Login.jsx           # Halaman masuk
│   │   ├── Register.jsx        # Halaman registrasi
│   │   ├── ForgotPassword.jsx  # Halaman lupa password
│   │   ├── Dashboard.jsx       # Papan utama tugas mahasiswa
│   │   ├── AdminDashboard.jsx  # Papan kendali administrator
│   │   ├── UserReport.jsx      # Halaman laporan produktivitas user
│   │   ├── AdminReport.jsx     # Halaman laporan sistem global
│   │   ├── Trash.jsx           # Halaman keranjang sampah tugas
│   │   └── Profile.jsx         # Halaman profil mahasiswa
│   │
│   ├── services/               # Layanan bisnis, BaaS, dan PWA
│   │   ├── authService.js      # Layanan autentikasi akun
│   │   ├── taskService.js      # CRUD tugas & integrasi offline cache
│   │   ├── syncService.js      # Antrean mutasi offline & auto-sync online
│   │   ├── notificationService.js # Web Notification & Service Worker Push
│   │   ├── categoryService.js  # Manajemen kategori
│   │   └── userService.js      # Manajemen user & avatar Supabase
│   │
│   ├── styles/                 # Desain antarmuka CSS terstruktur
│   ├── utils/
│   │   ├── pdfGenerator.js     # Generator laporan PDF standar A4
│   │   └── helpers.js          # Utilitas format tanggal, waktu, dan teks
│   │
│   ├── App.jsx                 # Routing dan state sesi utama
│   └── main.jsx                # Entry point aplikasi React
│
├── index.html                  # Template HTML dasar & meta viewport PWA
├── vite.config.js              # Konfigurasi Vite & VitePWA Workbox
└── package.json                # Daftar dependensi & skrip npm
```

---

## ⚙️ Petunjuk Pemasangan & Menjalankan Aplikasi

### 1. Prasyarat Sistem
*   **Node.js**: Versi 18.0.0 atau yang lebih baru.
*   **NPM**: Versi 9.0.0 atau yang lebih baru.
*   Peramban modern pendukung Service Worker (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### 2. Langkah Instalasi
1. Kloning repositori ini ke komputer Anda:
   ```bash
   git clone https://github.com/LanjarSetiawan/DoneRight.git
   cd DoneRight
   ```

2. Instal seluruh dependensi:
   ```bash
   npm install
   ```

3. Konfigurasi Environment Variables:
   Buat berkas `.env` di direktori *root* proyek (opsional jika sudah menggunakan fallback default):
   ```env
   VITE_SUPABASE_URL=https://proyek-anda.supabase.co
   VITE_SUPABASE_ANON_KEY=kunci-anonim-supabase-anda
   ```

4. Jalankan aplikasi dalam mode pengembangan (*development*):
   ```bash
   npm run dev
   ```
   Aplikasi akan aktif di alamat: `http://localhost:5173`

---

## 📱 Pengujian Fitur PWA (Offline & Notifikasi)

### A. Pengujian Instalasi Aplikasi
1. Buka `http://localhost:5173` di Google Chrome atau Microsoft Edge.
2. Klik ikon **"Install App"** di bilah alamat peramban (atau menu *Titik Tiga > Pasang DoneRight* di Android).
3. Aplikasi akan terinstal sebagai aplikasi mandiri di sistem operasi Anda.

### B. Pengujian Mode Offline & Sinkronisasi Otomatis
1. Buka halaman Dashboard tugas.
2. Buka **Inspect / Developer Tools** peramban (`F12`), masuk ke tab **Network**, lalu ubah opsi dari *No throttling* menjadi **Offline**.
3. Buat tugas baru atau centang selesai salah satu tugas. Perhatikan bahwa tugas langsung terbarui seketika (*optimistic update* via local storage).
4. Kembalikan koneksi Network ke **No throttling** (Online).
5. Layanan `syncService.js` akan langsung mengeksekusi antrean dan menyinkronkan data tugas ke database Supabase PostgreSQL secara otomatis.

### C. Pengujian Notifikasi Sistem HP
1. Klik ikon **Lonceng Notifikasi** di navbar atas.
2. Pada spanduk pemberitahuan, klik tombol **"Aktifkan"** untuk memberikan izin *System Notification*.
3. Klik tombol **"Tes Notif"**; notifikasi pengingat DoneRight akan langsung muncul di *notification shade* ponsel/desktop Anda.

---

## 🏗️ Build & Rilis Produksi

Untuk mengompilasi aplikasi menjadi berkas statis produksi siap hosting (Vercel, Netlify, Cloudflare Pages, atau Supabase Hosting):

```bash
npm run build
```

Hasil kompilasi akan tersimpan di direktori `dist/` lengkap beserta berkas `sw.js` (Service Worker terdaftar) dan *manifest*. Anda dapat menguji hasil produksi secara lokal menggunakan:

```bash
npm run preview
```

---

## 📄 Lisensi & Kontributor

Proyek **DoneRight PWA 2.0** dikembangkan untuk pemenuhan tugas akademik Praktikum Pengembangan Aplikasi Berbasis Web (PWA II) Program Studi Teknik Komputer, Universitas Diponegoro.

* **Pengembang**: Lanjar Setiawan (NIM: 21120124120023) — Kelompok 16
* **Lisensi**: MIT License — Terbuka untuk keperluan pembelajaran dan riset akademik.
