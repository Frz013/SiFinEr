# SiFinEr — Simple Finance Tracker

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![Turso](https://img.shields.io/badge/Turso-SQLite-4ADE80)](https://turso.tech)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C084FC)](https://orm.drizzle.team)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**SiFinEr** adalah web app pencatat keuangan pribadi yang ringan, cepat, dan mudah digunakan di semua perangkat. Data disimpan di Turso (SQLite edge database) dengan opsi backup ke Google Drive.

> Dibangun dengan desain **Neobrutalism** — tegas, kontras tinggi, shadow keras tanpa blur.

---

## Daftar Isi

- [Fitur](#fitur)
- [Preview](#preview)
- [Stack Teknologi](#stack-teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Panduan Setup](#panduan-setup)
  - [1. Prasyarat](#1-prasyarat)
  - [2. Clone & Install](#2-clone--install)
  - [3. Setup Database Turso](#3-setup-database-turso)
  - [4. Google OAuth](#4-google-oauth)
  - [5. Environment Variables](#5-environment-variables)
  - [6. Jalankan Development](#6-jalankan-development)
- [User Guide](#user-guide)
  - [Login](#login)
  - [Dashboard](#dashboard)
  - [Tambah Transaksi](#tambah-transaksi)
  - [Kategori](#kategori)
  - [Filter & Search](#filter--search)
  - [Export Data](#export-data)
  - [Backup & Restore](#backup--restore)
- [API Routes](#api-routes)
- [Deploy ke Vercel](#deploy-ke-vercel)
- [Command Reference](#command-reference)
- [Contributing](#contributing)
- [Lisensi](#lisensi)

---

## Fitur

| Fitur | Status |
|-------|--------|
| 🔐 Login dengan Google OAuth | ✅ |
| 💰 Catat pemasukan & pengeluaran | ✅ |
| 📊 Dashboard dengan balance card | ✅ |
| 🥧 Pie chart per kategori | ✅ |
| 📈 Line chart income vs expense | ✅ |
| 🔍 Filter & search transaksi | ✅ |
| 📋 Tabel transaksi dengan menu ··· | ✅ |
| ↩️ Undo delete (3 detik) | ✅ |
| 📱 Responsive mobile & desktop | ✅ |
| 💾 Hide/show saldo | ✅ |
| ⚡ Optimistic UI (instan) | ✅ |
| 📤 Export CSV, JSON, Excel, PDF | ✅ |
| 📥 Import dari file lokal | ✅ |
| ☁️ Backup ke Google Drive | ✅ (manual) |
| 🤖 Auto backup mingguan (Vercel Cron) | ✅ |
| ⚙️ Settings (currency, saldo awal) | ✅ |

## Preview

Halaman | Tampilan
--------|---------
**Login** | Card putih di atas background krem, tombol "Login dengan Google" kuning dengan border hitam tebal
**Dashboard** | Header kuning, card saldo hero, summary bar 3 kolom, pie & line chart, tabel transaksi, FAB +
**Bottom Sheet** | Toggle INCOME/EXPENSE, input nominal, kategori badge, deskripsi, tanggal, SAVE

## Stack Teknologi

```
Framework       : Next.js 16 (App Router)
Auth            : NextAuth.js v5 (Google Provider)
Database        : Turso (SQLite edge database)
ORM             : Drizzle ORM
Charts          : Recharts
Styling         : Tailwind CSS v4 (Neobrutalism theme)
Icons           : Lucide React
Export CSV      : PapaParse
Export Excel    : SheetJS (xlsx)
Export PDF      : jsPDF + jspdf-autotable
Drive API       : googleapis
Deploy          : Vercel Free Plan
Cron Jobs       : Vercel Cron (auto backup mingguan)
```

## Struktur Proyek

```
sifiner/
├── app/
│   ├── (auth)/login/           # Halaman login
│   ├── (app)/
│   │   ├── dashboard/          # Dashboard utama
│   │   ├── backup/             # Backup & import
│   │   ├── settings/           # Pengaturan user
│   │   ├── onboarding/         # First-time setup
│   │   └── layout.tsx          # Layout dengan sidebar + session provider
│   ├── api/
│   │   ├── auth/[...nextauth]  # NextAuth handler
│   │   ├── transactions/       # CRUD transaksi
│   │   ├── categories/         # CRUD kategori
│   │   ├── user/               # User profile & settings
│   │   ├── cron/               # Vercel Cron endpoint
│   │   └── backup/             # Export/import/drive
│   ├── globals.css             # Tailwind + neobrutalism tokens
│   └── layout.tsx              # Root layout
├── components/
│   ├── ui/                     # Button, Input, Card, Badge, Toast, TogglePill
│   ├── dashboard/              # BalanceCard, SummaryBar, PieChart, LineChart,
│   │                           # TransactionTable, FilterBar, AddTransactionSheet
│   └── layout/                 # Header, Sidebar, SyncIndicator
├── lib/
│   ├── db/                     # Turso client + schema Drizzle
│   ├── auth.ts                 # NextAuth config
│   ├── utils.ts                # formatCurrency, filterByPeriod, dll
│   └── export.ts               # Export helpers (CSV, JSON, Excel, PDF)
├── hooks/                      # useTransactions, useCategories, useSyncStatus
├── types/                      # TypeScript interfaces
├── middleware.ts               # Route protection
├── drizzle.config.ts           # Drizzle Kit config
└── vercel.json                 # Vercel config + cron
```

---

## Panduan Setup

### 1. Prasyarat

- Node.js 18+
- npm
- Akun Google (untuk OAuth)
- Akun [Turso](https://turso.tech) (free tier)
- Akun [Vercel](https://vercel.com) (free tier, opsional untuk deploy)

### 2. Clone & Install

```bash
git clone https://github.com/<username>/sifiner.git
cd sifiner
npm install
```

### 3. Setup Database Turso

```bash
# Install Turso CLI
npm install -g turso

# Login ke Turso
turso auth login

# Buat database baru
turso db create sifiner

# Ambil credentials
turso db show sifiner          # → TURSO_DATABASE_URL (libsql://...)
turso db tokens create sifiner # → TURSO_AUTH_TOKEN

# Push schema ke database
npx drizzle-kit push
```

### 4. Google OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru → "SiFinEr"
3. Buka **APIs & Services** → **OAuth consent screen**
   - User type: External
   - Tambahkan scope: `email`, `profile`, `drive.file`
4. Buka **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://<domain-vercelmu>/api/auth/callback/google`
5. Catat **Client ID** dan **Client Secret**

### 5. Environment Variables

Buat file `.env.local`:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate: openssl rand -base64 32>

# Google OAuth
GOOGLE_CLIENT_ID=<dari Google Cloud Console>
GOOGLE_CLIENT_SECRET=<dari Google Cloud Console>

# Turso
TURSO_DATABASE_URL=libsql://<nama-db>.turso.io
TURSO_AUTH_TOKEN=<dari turso db tokens create>

# Vercel Cron
CRON_SECRET=<random string panjang>
```

### 6. Jalankan Development

```bash
npm run dev
# Buka http://localhost:3000
```

---

## User Guide

### Login

1. Buka SiFinEr — langsung diarahkan ke halaman login
2. Klik **"Login dengan Google"**
3. Pilih akun Google Anda
4. **Pertama kali?** → Halaman onboarding untuk input saldo awal
5. **Sudah pernah?** → Langsung ke Dashboard

### Dashboard

Setelah login, Anda akan melihat:

1. **Header Kuning** — logo SiFinEr, toggle sidebar, sync indicator
2. **Card Saldo** — saldo terkini (hijau untuk positif, merah untuk negatif)
   - klik 👁 untuk hide/show nominal (tersimpan di localStorage)
3. **Summary Bar** — Total Masuk (hijau) | Total Keluar (merah) | Periode
4. **Pie Chart** — pengeluaran per kategori (klik slice = filter tabel)
5. **Line Chart** — grafik income vs expense per periode
6. **Filter Bar** — search deskripsi, filter kategori, filter periode
7. **Tabel Transaksi** — daftar transaksi terbaru
8. **FAB +** — tambah transaksi baru

### Tambah Transaksi

1. Klik **FAB** (tombol + kuning pojok kanan bawah)
2. **Bottom sheet** muncul dari bawah:
   - **Toggle** — pilih INCOME atau EXPENSE
   - **Nominal** — masukkan jumlah (numpad otomatis di mobile)
   - **Kategori** — pilih dari kategori yang ada, atau buat baru
   - **Deskripsi** — opsional
3. Klik **SAVE**
4. Transaksi langsung muncul di tabel (optimistic UI) + saldo terupdate

> **Pro tip:** Kategori expense/income bisa dibuat inline saat add transaksi, dengan 6 warna preset neobrutalism.

### Kategori

Kategori bersifat per-user dan reusable. Untuk menambah kategori baru:

- Saat add transaksi, klik **"+ Baru"** di bawah kategori
- Masukkan nama kategori dan pilih warna
- Kategori langsung tersedia di dropdown

### Filter & Search

Gunakan filter bar di atas tabel:

- **🔍 Cari** — cari berdasarkan teks deskripsi (client-side)
- **Kategori ▼** — filter berdasarkan kategori tertentu
- **Periode ▼** — Hari Ini | Kemarin | 7 Hari | 30 Hari
- **Kombinasi** — semua filter bisa digunakan bersamaan

### Export Data

Export diproses di **client-side** (tidak perlu server):

| Format | Library | Button |
|--------|---------|--------|
| CSV | PapaParse | Download CSV |
| JSON | Native | Download JSON |
| Excel (.xlsx) | SheetJS | Download Excel |
| PDF | jsPDF | Download PDF |

Buka halaman **Backup** → pilih format export → file langsung terdownload.

### Backup & Restore

**Backup Manual ke Google Drive:**
1. Buka halaman **Backup**
2. Klik **"Backup ke Drive"**
3. Grant izin `drive.file` (hanya sekali)
4. Data diexport sebagai JSON → upload ke folder "SiFinEr Backups"
5. Link file akan ditampilkan

**Import dari Google Drive:**
1. Klik **"Import dari Drive"**
2. Pilih file backup dari daftar
3. Preview data → konfirmasi → import ke Turso

**Import dari File Lokal:**
1. Upload file CSV atau JSON
2. Validasi format
3. Preview sebelum konfirmasi

**Auto Backup Mingguan:**
1. Buka **Settings** atau **Backup**
2. Toggle **Auto Backup** ON
3. Pilih hari backup (default: Minggu)
4. Backup dijalankan jam 00.00 WIB via Vercel Cron

---

## API Routes

| Route | Method | Deskripsi |
|-------|--------|-----------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handler |
| `/api/transactions` | GET | List transaksi user |
| `/api/transactions` | POST | Buat transaksi baru |
| `/api/transactions/[id]` | PUT | Update transaksi |
| `/api/transactions/[id]` | DELETE | Hapus transaksi |
| `/api/categories` | GET | List kategori user |
| `/api/categories` | POST | Buat kategori baru |
| `/api/categories/[id]` | PUT | Update kategori |
| `/api/categories/[id]` | DELETE | Hapus kategori |
| `/api/user/me` | GET | Get user profile |
| `/api/user/settings` | PUT | Update settings (currency, saldo, dll) |
| `/api/backup/drive/upload` | POST | Upload backup ke Google Drive |
| `/api/backup/drive/list` | GET | List backup files di Drive |
| `/api/cron/weekly-backup` | POST | Vercel Cron (auto backup) |

Semua API route (kecuali auth dan cron) mewajibkan session valid → return 401 jika tidak ada.

---

## Deploy ke Vercel

1. **Push ke GitHub:**
   ```bash
   gh repo create sifiner --private
   git push origin main
   ```

2. **Buat Vercel project:**
   ```bash
   npx vercel --prod
   ```

3. **Set environment variables** di Vercel Dashboard:
   - `NEXTAUTH_URL` → URL Vercel production
   - `NEXTAUTH_SECRET` → generated
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
   - `TURSO_DATABASE_URL` & `TURSO_AUTH_TOKEN`
   - `CRON_SECRET`

4. **Update Google OAuth redirect URI:**
   - Tambahkan `https://<vercel-domain>/api/auth/callback/google`
   - ke Authorized redirect URIs di Google Cloud Console

---

## Command Reference

| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build production |
| `npm start` | Jalankan production server |
| `npm run lint` | ESLint check |
| `npm run db:push` | Push schema ke Turso |
| `npx drizzle-kit generate` | Generate migration files |
| `npx drizzle-kit migrate` | Jalankan migration |

## Contributing

1. Buat branch: `git checkout -b feature/<nama-fitur>`
2. Commit: `git commit -m "feat(<scope>): <deskripsi>"`
3. Push: `git push origin feature/<nama-fitur>`
4. Buat Pull Request

Format commit: `type(scope): deskripsi`

- `feat`: fitur baru
- `fix`: perbaikan bug
- `chore`: setup, config, dependencies
- `style`: perubahan UI/CSS
- `refactor`: refactor tanpa fitur baru

## Lisensi

MIT © 2026 — dibangun dengan ❤️ menggunakan Next.js, Turso, dan neobrutalism.
