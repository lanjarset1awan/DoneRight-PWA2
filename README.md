# DoneRight 🎯 - Sistem Manajemen Tugas Mahasiswa

DoneRight adalah aplikasi manajemen tugas (*task management*) berbasis web yang dirancang khusus untuk membantu mahasiswa mengorganisasi tugas, memantau tenggat waktu (*deadline*), dan mengevaluasi produktivitas belajar secara terstruktur dan otomatis.

---

## 🚀 Fitur Utama

1. **Autentikasi & Keamanan Tingkat Tinggi**:
   - Sistem login aman berbasis JSON Web Token (JWT).
   - Validasi domain email pendaftar secara real-time via pemeriksaan DNS/MX records untuk mencegah spam.
   - Alur verifikasi pendaftaran akun baru melalui tautan email aktivasi.
   - Sistem reset/lupa kata sandi yang aman.

2. **Mesin Manajemen Tugas Mandiri**:
   - Siklus CRUD tugas lengkap (Judul, Deskripsi, Tenggat, Kategori, Prioritas, Perulangan).
   - Penandaan tugas selesai (*checklist toggle*).
   - Fitur **Trash Bin (Tempat Sampah)**: Tugas tidak langsung terhapus permanen melainkan dipindahkan ke tempat sampah terlebih dahulu dan bisa dipulihkan (*restore*).

3. **Notifikasi Otomatis Multi-Saluran**:
   - Pengingat tugas H-1 deadline otomatis melalui ikon notifikasi di dalam aplikasi.
   - Pengiriman email pengingat tenggat tugas otomatis ke email pengguna menggunakan Nodemailer (SMTP).

4. **Statistik Produktivitas & Laporan PDF**:
   - Halaman statistik interaktif yang merangkum persentase tugas selesai, terlambat, dan aktif.
   - Ekspor laporan produktivitas berformat PDF resmi secara instan langsung dari server menggunakan PDFKit.

5. **Integrasi Cloud Storage (Foto Profil)**:
   - Pengunggahan foto profil yang terintegrasi langsung dengan Supabase Storage.
   - Tombol hapus/kosongkan foto profil yang ramah pengguna.

6. **Panel Administrator (Admin Control)**:
   - Pemantauan statistik platform secara keseluruhan.
   - Manajemen kategori global yang dapat diakses oleh semua pengguna.
   - Penonaktifan (*soft-delete*) dan pemulihan akun pengguna terdaftar demi keamanan platform.

---

## 🛠️ Teknologi yang Digunakan

*   **Frontend**: React (Vite), JavaScript (ES6+), Vanilla CSS (Sleek Glassmorphic & Modern Dark/Light Theme).
*   **Backend**: Node.js, Express.js, PostgreSQL (dengan Node-PG client pooling).
*   **Penyimpanan Aset**: Supabase Storage.
*   **Sistem Email**: Nodemailer (SMTP).
*   **Pembuat Dokumen**: PDFKit (Real-time PDF Compiler).

---

## 📂 Struktur Repositori

```
DoneRight/
├── Backend/          # Source code server Express.js
│   ├── src/
│   │   ├── config/   # Konfigurasi database pool
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/    # Validasi email, pengirim email, generator PDF
│   └── .env          # Variabel lingkungan backend (diabaikan oleh git)
│
└── Frontend/         # Source code aplikasi React
    ├── src/
    │   ├── components/
    │   ├── hooks/    # Custom React hooks untuk logika state
    │   ├── pages/
    │   └── styles/   # CSS Kustom untuk tampilan premium
    └── .env          # Variabel lingkungan frontend (diabaikan oleh git)
```

---

## ⚙️ Petunjuk Pemasangan & Menjalankan Aplikasi

### 1. Prasyarat
*   Node.js (versi 18+)
*   Akun Supabase (untuk PostgreSQL & Storage)
*   Akun SMTP Gmail (untuk pengiriman email otomatis)

### 2. Konfigurasi Backend
1. Masuk ke folder Backend:
   ```bash
   cd Backend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Buat berkas `.env` baru di dalam direktori `Backend/` dan isi konfigurasinya:
   ```env
   PORT=5000
   DATABASE_URL=URL_KONEKSI_POSTGRESQL_SUPABASE
   JWT_SECRET=KUNCI_RAHASIA_JWT_ANDA
   SUPABASE_URL=URL_SUPABASE_PROYEK_ANDA
   SUPABASE_SERVICE_ROLE_KEY=KUNCI_LAYANAN_SUPABASE
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=EMAIL_GMAIL_PENGIRIM
   EMAIL_PASS=KATA_SANDI_APLIKASI_GMAIL_16_KARAKTER
   FRONTEND_URL=http://localhost:5173
   ```
4. Jalankan server dalam mode pengembangan:
   ```bash
   npm run dev
   ```

### 3. Konfigurasi Frontend
1. Masuk ke folder Frontend:
   ```bash
   cd ../Frontend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Buat berkas `.env` baru di dalam direktori `Frontend/` dan isi alamat backend:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Jalankan aplikasi web frontend:
   ```bash
   npm run dev
   ```
5. Buka tautan `http://localhost:5173` di peramban (browser) Anda.

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik dan pengembangan pribadi kami. Lisensi bebas digunakan untuk pembelajaran lebih lanjut.
