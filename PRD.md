# PRD — SiFinEr (Simple Finance Tracker)

**Version:** 1.0  
**Status:** Ready for Development  
**Target Deploy:** Vercel Free Plan

---

## 1. Overview

SiFinEr adalah web app pencatat keuangan pribadi yang ringan, cepat, dan mudah digunakan di semua perangkat. Data disimpan di Turso (SQLite edge database) dengan opsi backup ke Google Drive milik user. Tidak ada server backend yang berat — semua operasi berjalan via Next.js serverless functions di Vercel.

### 1.1 Tujuan Produk

- Memudahkan user mencatat pemasukan dan pengeluaran dengan cepat
- Memberikan visualisasi keuangan yang mudah dibaca
- Menjaga data tetap milik user (backup ke Google Drive mereka sendiri)
- Dapat diakses dari device apapun tanpa instalasi

### 1.2 Target Pengguna

- Individu yang ingin mencatat keuangan pribadi secara sederhana
- Tidak membutuhkan fitur akuntansi kompleks
- Terbiasa dengan Google account

---

## 2. Stack Teknologi

```
Framework   : Next.js 14 (App Router)
Auth        : NextAuth.js (Google Provider)
Database    : Turso (SQLite edge, libsql client)
ORM         : Drizzle ORM
Charts      : Recharts
Export      : xlsx + papaparse + jsPDF (semua client-side)
Drive API   : googleapis (opsional, hanya untuk fitur backup)
Styling     : Tailwind CSS (neobrutalism theme)
Deploy      : Vercel Free Plan
Cron Jobs   : Vercel Cron (untuk auto backup mingguan)
```

---

## 3. Fitur & Spesifikasi

### 3.1 Auth & Onboarding

**Login**
- Provider: Google OAuth via NextAuth.js
- Scope saat login: `email`, `profile` saja (minimal, tidak menakutkan user)
- Scope Google Drive (`drive.file`) hanya diminta saat user aktif menggunakan fitur backup
- Setelah login pertama kali, user diarahkan ke halaman onboarding

**Onboarding (First-time only)**
- Form input saldo awal
- Penjelasan singkat cara kerja app (3 bullet point, tidak lebih)
- Setelah submit, redirect ke dashboard

**Session**
- Session disimpan via NextAuth.js (JWT strategy)
- User ID dari Google `sub` field digunakan sebagai primary key di Turso

---

### 3.2 Dashboard

**Layout (top to bottom)**
```
[ Header: logo SiFinEr + hamburger menu (kiri) + indikator sync (kanan) ]
[ Card: Saldo Saat Ini + tombol 👁 hide/show nominal                    ]
[ Toggle Filter: Semua | Masuk | Keluar                                 ]
[ Summary Bar: Total Masuk | Total Keluar | Periode aktif               ]
[ Chart Row: Pie Chart (kiri/atas) + Line Chart (kanan/bawah)           ]
[ Search Bar + Filter Kategori ▼ + Filter Tanggal ▼                    ]
[ Tabel Transaksi                                                        ]
[ FAB tombol + pojok kanan bawah                                        ]
```

**Card Saldo**
- Menampilkan saldo terkini (saldo awal ± semua transaksi)
- Tombol 👁 untuk hide/show nominal (state disimpan di localStorage)
- Format mata uang sesuai setting user (default: IDR)

**Summary Bar**
- Total Masuk pada periode aktif
- Total Keluar pada periode aktif
- Label periode aktif (misal: "30 Hari Terakhir")

**Pie Chart**
- Berdasarkan kategori transaksi pada periode aktif
- Warna per kategori menggunakan `color` dari tabel `categories`
- Klik slice = filter tabel berdasarkan kategori tersebut
- Tampil di kiri (desktop) / atas (mobile)

**Line Chart**
- X-axis: waktu, Y-axis: nominal
- Filter periode: Hari Ini | Kemarin | 7 Hari | 30 Hari
- Tampil dua line: pemasukan (hijau) + pengeluaran (merah)
- Tampil di kanan (desktop) / bawah (mobile)

**Filter & Search**
```
[ 🔍 Cari deskripsi... ] [ Kategori ▼ ] [ Tanggal ▼ ]
```
- Filter tanggal: Hari Ini, Kemarin, 7 Hari, 30 Hari, Custom Range
- Search berdasarkan teks deskripsi (client-side filtering)
- Semua filter bisa dikombinasikan

**Indikator Sync**
- Teks kecil di header kanan
- Status: `Tersimpan ✓` / `Menyimpan...` / `Gagal — Coba Lagi`
- Optimistic UI: data langsung tampil di tabel, sync ke Turso di background

---

### 3.3 Tabel Transaksi

**Kolom:**

| # | Nominal | Kategori | Tanggal | Deskripsi | ··· |
|---|---------|----------|---------|-----------|-----|
| 1 | +Rp 500.000 | Gaji | 17 Jun | Transfer BCA | ··· |
| 2 | -Rp 50.000 | Makan | 16 Jun | Warteg depan kos | ··· |

**Detail kolom:**
- `#` — nomor urut baris
- `Nominal` — warna **hijau + tanda `+`** untuk pemasukan, **merah + tanda `-`** untuk pengeluaran, format ribuan (Rp 1.000.000)
- `Kategori` — badge dengan warna kategori + dropdown inline untuk edit kategori atau tambah kategori baru
- `Tanggal` — format `DD MMM` (misal: 17 Jun), full date muncul di tooltip
- `Deskripsi` — teks bebas, placeholder "-" jika kosong
- `···` — menu titik tiga per baris

**Menu ··· (per baris):**
- Edit Nominal & Deskripsi
- Hapus → toast "Dihapus" + tombol **Undo** selama 3 detik sebelum benar-benar dihapus

**Perilaku tabel:**
- Urutan: terbaru ke terlama (default)
- Pagination atau infinite scroll jika data > 50 baris
- Empty state: ilustrasi kecil + teks "Belum ada transaksi. Tap + untuk mulai mencatat."
- Index database: `user_id` + `date` untuk query cepat

---

### 3.4 FAB & Bottom Sheet Add Transaksi

**FAB (Floating Action Button)**
- Posisi: pojok kanan bawah, fixed
- Icon: `+` besar, warna kuning (#FACC15), border hitam tebal
- Klik → munculkan bottom sheet dari bawah

**Bottom Sheet Add Transaksi**
```
[ Toggle: INCOME | EXPENSE ]
[ Input Nominal             ]  ← numpad otomatis muncul di mobile
[ Dropdown Kategori         ]  ← + tombol "Buat Kategori Baru"
[ Input Deskripsi           ]  ← opsional, placeholder "Opsional..."
[ Date Picker Tanggal       ]  ← default: sekarang
[ Tombol SAVE (full width)  ]
```

**Buat Kategori Baru (inline di dropdown):**
- Input nama kategori
- Color picker (6 warna preset neobrutalism)
- Pilih tipe: income / expense
- Tombol simpan → langsung tersedia di dropdown

---

### 3.5 Sidebar

```
┌──────────────────────────┐
│  [foto] Nama User        │
│  email@gmail.com         │
├──────────────────────────┤
│  📊  Dashboard           │
│  💾  Backup              │
│  ⚙️   Settings            │
├──────────────────────────┤
│  🚪  Logout              │
└──────────────────────────┘
```

- Dibuka via tombol hamburger `☰` di header kiri
- Overlay gelap di belakang sidebar saat terbuka
- Klik di luar sidebar = tutup
- Logout di bawah, dipisahkan divider, warna teks merah

---

### 3.6 Halaman Backup

**Backup Manual ke Google Drive**
1. User klik tombol "Backup ke Drive"
2. Jika belum pernah grant izin → minta scope `drive.file`
3. App export semua data user → format JSON
4. Upload ke folder "SiFinEr Backups" di Google Drive user
5. Konfirmasi berhasil + link ke file di Drive

**Import dari Google Drive**
1. User klik "Import dari Drive"
2. Tampilkan daftar file backup yang pernah dibuat app ini
3. User pilih file
4. App parse JSON → validasi schema → import ke Turso
5. Tampilkan preview jumlah transaksi yang akan diimport sebelum konfirmasi

**Import dari File Lokal**
- Upload file CSV atau JSON
- Validasi format sebelum import
- Preview data sebelum konfirmasi
- Tidak memerlukan izin Google apapun

**Riwayat Backup**
- Tabel: Tanggal, Ukuran file, Sumber (Manual / Auto), Status
- Tampil 10 backup terakhir

**Auto Backup Mingguan**
- Toggle ON/OFF (default: OFF)
- Pilih hari backup (default: Minggu)
- Info: "Backup otomatis akan dijalankan setiap [hari] dini hari"
- Disimpan di field `auto_backup_enabled` dan `auto_backup_day` di tabel `users`

---

### 3.7 Halaman Settings

- Nama tampilan
- Mata uang (IDR, USD, EUR, SGD — dropdown)
- Edit saldo awal (dengan konfirmasi, karena mengubah saldo total)
- Auto backup mingguan (shortcut ke toggle di halaman Backup)
- **Zona Berbahaya:**
  - Hapus semua transaksi (konfirmasi modal)
  - Hapus akun & semua data (konfirmasi modal + ketik "HAPUS")

---

### 3.8 Export

Semua export diproses di sisi client (tidak butuh server/function invocation):

| Format | Library | Isi |
|--------|---------|-----|
| CSV | papaparse | Semua transaksi |
| JSON | native JSON | Semua data (transaksi + kategori) |
| Excel | xlsx | Transaksi + summary sheet |
| PDF | jsPDF | Summary report + tabel transaksi |

---

## 4. Database Schema (Turso / SQLite)

```sql
-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,                        -- Google sub ID
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  initial_balance REAL DEFAULT 0,
  currency TEXT DEFAULT 'IDR',
  auto_backup_enabled INTEGER DEFAULT 0,      -- 0=off, 1=on
  auto_backup_day INTEGER DEFAULT 0,          -- 0=Minggu, 1=Senin, ..., 6=Sabtu
  last_backup_at INTEGER,                     -- Unix timestamp
  created_at INTEGER NOT NULL
);

-- Custom categories per user
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
  color TEXT NOT NULL DEFAULT '#FACC15',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL CHECK(amount > 0),
  type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
  category_id INTEGER,
  description TEXT,
  date INTEGER NOT NULL,                      -- Unix timestamp
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Index untuk query cepat
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_categories_user ON categories(user_id);
```

---

## 5. API Routes (Next.js)

```
POST   /api/auth/[...nextauth]     — NextAuth handler
GET    /api/user/me                — Get current user data
PUT    /api/user/settings          — Update settings

GET    /api/transactions           — List transactions (dengan filter query params)
POST   /api/transactions           — Create transaction
PUT    /api/transactions/[id]      — Update transaction
DELETE /api/transactions/[id]      — Delete transaction

GET    /api/categories             — List categories user
POST   /api/categories             — Create category
PUT    /api/categories/[id]        — Update category
DELETE /api/categories/[id]        — Delete category

POST   /api/backup/export          — Generate JSON backup
POST   /api/backup/drive/upload    — Upload backup ke Google Drive
GET    /api/backup/drive/list      — List backup files di Drive
POST   /api/backup/import          — Import dari JSON/CSV

POST   /api/cron/weekly-backup     — Endpoint Vercel Cron (protected)
```

---

## 6. Alur Aplikasi

```
1. User buka SiFinEr
       │
2. Cek session NextAuth
   ├── Belum login → halaman login (Google OAuth)
   └── Sudah login → lanjut
       │
3. Cek first-time user (kolom created_at di tabel users)
   ├── Ya → halaman onboarding (input saldo awal)
   └── Tidak → langsung dashboard
       │
4. Dashboard
   ├── Load data dari Turso (~10–50ms)
   ├── Tampilkan saldo, chart, summary, tabel
   ├── Filter, search, navigasi periode
   ├── Tap FAB + → bottom sheet → input → SAVE
   │   └── Optimistic UI: tampil dulu, sync background
   └── Menu ··· per baris → edit / hapus (dengan undo)
       │
5. Sidebar
   ├── Backup → manual / import / auto toggle
   ├── Settings → preferensi, hapus data
   └── Logout
       │
6. Vercel Cron (setiap hari, 00.00 UTC)
   ├── Query users WHERE auto_backup_enabled = 1
   ├── Filter user yang hari backup-nya = hari ini
   ├── Untuk setiap user: generate JSON → upload ke Drive
   └── Update last_backup_at
```

---

## 7. Non-Functional Requirements

| Aspek | Target |
|-------|--------|
| First load (LCP) | < 2 detik |
| Tambah transaksi (optimistic) | < 100ms (UI), < 500ms (sync) |
| Query tabel (Turso) | < 100ms |
| Mobile responsive | 320px — 1440px |
| Browser support | Chrome, Firefox, Safari, Edge (2 versi terakhir) |
| Aksesibilitas | Keyboard navigasi, ARIA label pada form |

---

## 8. Batasan & Mitigasi

| Potensi Masalah | Mitigasi |
|-----------------|---------|
| Turso free tier berubah | Dorong user aktifkan auto backup ke Drive |
| Google refresh token expire | Simpan + refresh token otomatis saat grant izin |
| Cron job gagal backup | Retry 1x, notifikasi gagal di dashboard |
| Data hilang saat import gagal | Validasi & preview sebelum overwrite |
| User hapus data tidak sengaja | Toast undo 3 detik |
| Banyak transaksi, tabel lambat | Pagination + index `user_id, date` |
| Vercel cold start function | Minimal logic di serverless functions |

---

## 9. Prioritas Development

```
Phase 1 — Core (MVP)
  ✦ Auth (Google OAuth) + onboarding saldo awal
  ✦ CRUD transaksi + kategori custom
  ✦ Dashboard: saldo card, tabel, filter, search
  ✦ Neobrutalism base styling + responsif

Phase 2 — Visualisasi
  ✦ Pie chart per kategori
  ✦ Line chart per periode
  ✦ Summary bar
  ✦ Hide saldo toggle

Phase 3 — Export / Import
  ✦ Export CSV, JSON, Excel, PDF (client-side)
  ✦ Import dari file lokal (CSV, JSON)

Phase 4 — Google Drive Integration
  ✦ Backup manual ke Drive
  ✦ Import dari Drive
  ✦ Auto backup mingguan + Vercel Cron

Phase 5 — Polish & Edge Cases
  ✦ Indikator sync (Tersimpan / Menyimpan... / Gagal)
  ✦ Toast undo hapus
  ✦ Empty state di tabel
  ✦ Notifikasi backup gagal/berhasil
  ✦ Hapus akun & semua data
  ✦ Mobile final check
  ✦ Aksesibilitas keyboard + ARIA
```
