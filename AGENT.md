# AGENT.md — SiFinEr Development Guide

Dokumen ini adalah panduan kerja untuk AI agent yang akan membangun SiFinEr. Baca seluruh dokumen ini sebelum menulis satu baris kode pun.

---

## 1. Konteks Proyek

SiFinEr adalah web app finance tracker personal. Stack: **Next.js 14 + Turso + Drizzle ORM + NextAuth.js + Tailwind CSS**. Deploy ke **Vercel free plan**. Baca `PRD.md` untuk spesifikasi lengkap dan `DESIGN.md` untuk semua keputusan visual.

---

## 2. Struktur Direktori

```
sifiner/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Halaman login
│   ├── (app)/
│   │   ├── layout.tsx            # Layout dengan sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── backup/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── transactions/
│   │   │   ├── route.ts          # GET, POST
│   │   │   └── [id]/
│   │   │       └── route.ts      # PUT, DELETE
│   │   ├── categories/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── user/
│   │   │   ├── me/route.ts
│   │   │   └── settings/route.ts
│   │   ├── backup/
│   │   │   ├── export/route.ts
│   │   │   ├── import/route.ts
│   │   │   └── drive/
│   │   │       ├── upload/route.ts
│   │   │       └── list/route.ts
│   │   └── cron/
│   │       └── weekly-backup/route.ts
│   ├── globals.css
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # Komponen dasar (button, input, badge, dll)
│   ├── dashboard/
│   │   ├── BalanceCard.tsx
│   │   ├── SummaryBar.tsx
│   │   ├── PieChart.tsx
│   │   ├── LineChart.tsx
│   │   ├── TransactionTable.tsx
│   │   ├── TransactionRow.tsx
│   │   ├── FilterBar.tsx
│   │   └── AddTransactionSheet.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── SyncIndicator.tsx
│   └── backup/
│       ├── BackupHistory.tsx
│       └── ImportModal.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts              # Turso client
│   │   └── schema.ts             # Drizzle schema
│   ├── auth.ts                   # NextAuth config
│   ├── google-drive.ts           # Google Drive helper
│   ├── export.ts                 # Export helpers (CSV, JSON, Excel, PDF)
│   └── utils.ts                  # Format currency, date, dll
├── hooks/
│   ├── useTransactions.ts        # Data fetching + optimistic updates
│   ├── useCategories.ts
│   └── useSyncStatus.ts          # Indikator sync state
├── types/
│   └── index.ts                  # TypeScript types
├── vercel.json                   # Cron job config
└── drizzle.config.ts
```

---

## 3. Setup & Environment Variables

File `.env.local` yang dibutuhkan:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate dengan: openssl rand -base64 32>

# Google OAuth
GOOGLE_CLIENT_ID=<dari Google Cloud Console>
GOOGLE_CLIENT_SECRET=<dari Google Cloud Console>

# Turso
TURSO_DATABASE_URL=libsql://<nama-db>.turso.io
TURSO_AUTH_TOKEN=<turso auth token>

# Vercel Cron (untuk proteksi endpoint cron)
CRON_SECRET=<random string>
```

**Google OAuth Setup:**
1. Buat project di [console.cloud.google.com](https://console.cloud.google.com)
2. Enable: Google+ API, Google Drive API
3. OAuth consent screen: External, tambahkan scope `email`, `profile`, `drive.file`
4. Buat OAuth 2.0 Client ID, tambahkan redirect URI: `http://localhost:3000/api/auth/callback/google`

**Turso Setup:**
```bash
npm install -g turso
turso auth login
turso db create sifiner
turso db show sifiner          # ambil URL
turso db tokens create sifiner # ambil token
```

---

## 4. Database Setup (Drizzle + Turso)

### 4.1 Schema (`lib/db/schema.ts`)

```typescript
import { sql } from 'drizzle-orm'
import { text, real, integer, sqliteTable, index } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),                          // Google sub ID
  email: text('email').unique().notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  initialBalance: real('initial_balance').default(0),
  currency: text('currency').default('IDR'),
  autoBackupEnabled: integer('auto_backup_enabled').default(0),
  autoBackupDay: integer('auto_backup_day').default(0),
  lastBackupAt: integer('last_backup_at'),
  createdAt: integer('created_at').notNull(),
})

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  color: text('color').notNull().default('#FACC15'),
})

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  description: text('description'),
  date: integer('date').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => ({
  userDateIdx: index('idx_transactions_user_date').on(table.userId, table.date),
}))
```

### 4.2 Turso Client (`lib/db/index.ts`)

```typescript
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

export const db = drizzle(client, { schema })
```

---

## 5. Auth Setup (`lib/auth.ts`)

```typescript
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Scope minimal saat login — drive.file diminta terpisah saat backup
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) return false
      
      const now = Math.floor(Date.now() / 1000)
      
      // Upsert user ke Turso
      await db
        .insert(users)
        .values({
          id: account.providerAccountId,
          email: user.email,
          name: user.name ?? null,
          avatarUrl: user.image ?? null,
          createdAt: now,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: { name: user.name, avatarUrl: user.image },
        })
      
      return true
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
})
```

---

## 6. Pola API Routes

Setiap API route harus:
1. Cek session — return 401 jika tidak ada
2. Gunakan `userId` dari session untuk semua query (tidak pernah dari body/params)
3. Validasi input dengan Zod
4. Return response yang konsisten

**Template API Route:**

```typescript
// app/api/transactions/route.ts
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { transactions } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, session.user.id))
    .orderBy(desc(transactions.date))

  return NextResponse.json(data)
}

const CreateSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  categoryId: z.number().nullable(),
  description: z.string().optional(),
  date: z.number(),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const now = Math.floor(Date.now() / 1000)
  const [row] = await db
    .insert(transactions)
    .values({
      ...parsed.data,
      userId: session.user.id,
      createdAt: now,
    })
    .returning()

  return NextResponse.json(row, { status: 201 })
}
```

---

## 7. Optimistic UI Pattern

Gunakan pola ini untuk semua operasi tulis agar UI terasa instan:

```typescript
// hooks/useTransactions.ts
import { useState, useCallback } from 'react'
import { useSyncStatus } from './useSyncStatus'

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const { setSaving, setSaved, setError } = useSyncStatus()

  const addTransaction = useCallback(async (data: CreateTransactionInput) => {
    // 1. Buat ID sementara
    const tempId = `temp_${Date.now()}`
    const optimisticItem = { ...data, id: tempId, createdAt: Date.now() }

    // 2. Tampilkan di UI dulu (optimistic)
    setTransactions(prev => [optimisticItem, ...prev])
    setSaving()

    try {
      // 3. Kirim ke server
      const res = await fetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      })
      const saved = await res.json()

      // 4. Replace item temp dengan data real dari server
      setTransactions(prev =>
        prev.map(t => t.id === tempId ? saved : t)
      )
      setSaved()
    } catch (err) {
      // 5. Jika gagal, rollback
      setTransactions(prev => prev.filter(t => t.id !== tempId))
      setError()
    }
  }, [])

  return { transactions, addTransaction }
}
```

---

## 8. Undo Delete Pattern

```typescript
const deleteTransaction = useCallback(async (id: number) => {
  // Simpan data sebelum hapus untuk undo
  const deleted = transactions.find(t => t.id === id)
  
  // Hapus dari UI dulu (optimistic)
  setTransactions(prev => prev.filter(t => t.id !== id))
  
  // Tampilkan toast dengan undo
  showToast({
    message: 'Transaksi dihapus',
    action: {
      label: 'Undo',
      onClick: () => {
        // Batalkan: kembalikan ke UI
        setTransactions(prev => [deleted!, ...prev].sort(byDate))
        cancelDelete()
      },
    },
    duration: 3000,
    onDismiss: async () => {
      // Setelah 3 detik tanpa undo: hapus dari server
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    },
  })
}, [transactions])
```

---

## 9. Vercel Cron (Auto Backup Mingguan)

**`vercel.json`:**
```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-backup",
      "schedule": "0 17 * * *"
    }
  ]
}
```
> `0 17 * * *` = jam 17.00 UTC = 00.00 WIB

**Endpoint cron (`app/api/cron/weekly-backup/route.ts`):**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  // Proteksi: hanya Vercel yang bisa panggil endpoint ini
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().getDay() // 0=Minggu, 1=Senin, ...

  // Ambil user yang auto backup aktif dan jadwalnya hari ini
  const usersToBackup = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.autoBackupEnabled, 1),
        eq(users.autoBackupDay, today)
      )
    )

  const results = await Promise.allSettled(
    usersToBackup.map(user => backupUserToDrive(user))
  )

  // Update last_backup_at untuk yang berhasil
  // Log error untuk yang gagal

  return NextResponse.json({ processed: usersToBackup.length })
}
```

---

## 10. Google Drive Integration

Scope `drive.file` hanya diminta saat user pertama kali menggunakan fitur backup. Simpan refresh token untuk auto backup:

```typescript
// lib/google-drive.ts
import { google } from 'googleapis'

export function getDriveClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  return google.drive({ version: 'v3', auth: oauth2Client })
}

export async function uploadBackupToDrive(
  drive: ReturnType<typeof getDriveClient>,
  jsonData: string,
  userId: string,
) {
  // Cari atau buat folder "SiFinEr Backups"
  const folderName = 'SiFinEr Backups'
  let folderId = await findOrCreateFolder(drive, folderName)

  const fileName = `sifiner-backup-${new Date().toISOString().split('T')[0]}.json`

  const file = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
      mimeType: 'application/json',
    },
    media: {
      mimeType: 'application/json',
      body: jsonData,
    },
    fields: 'id, name, webViewLink',
  })

  return file.data
}
```

---

## 11. Export Helpers (`lib/export.ts`)

```typescript
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportToCSV(transactions: Transaction[]): void {
  const csv = Papa.unparse(transactions.map(t => ({
    Tanggal: new Date(t.date * 1000).toLocaleDateString('id-ID'),
    Jenis: t.type === 'income' ? 'Masuk' : 'Keluar',
    Nominal: t.amount,
    Kategori: t.categoryName ?? '-',
    Deskripsi: t.description ?? '-',
  })))
  downloadFile(csv, 'sifiner-transaksi.csv', 'text/csv')
}

export function exportToJSON(data: ExportData): void {
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, 'sifiner-backup.json', 'application/json')
}

export function exportToExcel(transactions: Transaction[], summary: Summary): void {
  const wb = XLSX.utils.book_new()
  // Sheet 1: Transaksi
  const ws1 = XLSX.utils.json_to_sheet(transactions.map(formatForExcel))
  XLSX.utils.book_append_sheet(wb, ws1, 'Transaksi')
  // Sheet 2: Summary
  const ws2 = XLSX.utils.json_to_sheet([summary])
  XLSX.utils.book_append_sheet(wb, ws2, 'Ringkasan')
  XLSX.writeFile(wb, 'sifiner-laporan.xlsx')
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

---

## 12. Format Utilities (`lib/utils.ts`)

```typescript
// Format mata uang
export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format tanggal singkat (untuk kolom tabel)
export function formatDateShort(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  })
}

// Hitung saldo saat ini
export function calculateBalance(
  initialBalance: number,
  transactions: Transaction[]
): number {
  return transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount
  }, initialBalance)
}

// Filter transaksi berdasarkan periode
export function filterByPeriod(
  transactions: Transaction[],
  period: 'today' | 'yesterday' | '7days' | '30days' | 'custom',
  customRange?: { from: number; to: number }
): Transaction[] {
  const now = Math.floor(Date.now() / 1000)
  const today = new Date(); today.setHours(0,0,0,0)
  const todayTs = Math.floor(today.getTime() / 1000)

  const ranges = {
    today: { from: todayTs, to: now },
    yesterday: { from: todayTs - 86400, to: todayTs },
    '7days': { from: now - 7 * 86400, to: now },
    '30days': { from: now - 30 * 86400, to: now },
    custom: customRange ?? { from: 0, to: now },
  }

  const { from, to } = ranges[period]
  return transactions.filter(t => t.date >= from && t.date <= to)
}
```

---

## 13. Rules & Constraints untuk Agent

### WAJIB dilakukan:
- [ ] Selalu validasi `userId` dari session, **tidak pernah** dari user input
- [ ] Gunakan TypeScript strict mode (`"strict": true` di tsconfig)
- [ ] Validasi semua input API dengan Zod sebelum diproses
- [ ] Semua query Turso harus include `WHERE user_id = ?` untuk isolasi data
- [ ] Export (CSV/JSON/Excel/PDF) diproses di client-side, bukan di serverless function
- [ ] Baca `DESIGN.md` sebelum membuat atau memodifikasi komponen UI apapun
- [ ] Ikuti pola optimistic UI untuk semua operasi tulis (add, edit, delete)
- [ ] Gunakan `Math.floor(Date.now() / 1000)` untuk Unix timestamp, bukan `Date.now()`

### DILARANG:
- [ ] Jangan simpan data sensitif (token, email) di localStorage
- [ ] Jangan panggil Google Drive API di critical path (hanya saat backup)
- [ ] Jangan buat komponen UI baru tanpa mengecek `DESIGN.md` terlebih dahulu
- [ ] Jangan gunakan `any` type di TypeScript
- [ ] Jangan buat logic di server yang bisa dilakukan di client (export, format, filter)
- [ ] Jangan bypass auth check di API routes manapun

### Urutan pengerjaan yang benar:
1. Setup environment + database schema
2. Auth flow (login, session, onboarding)
3. CRUD transaksi + kategori (API + hooks)
4. Dashboard UI (ikuti layout di PRD)
5. Charts (Recharts)
6. Export/Import (client-side)
7. Google Drive integration
8. Cron job auto backup
9. Polish (empty state, toast, sync indicator)

---

## 14. Testing Checklist

Sebelum dianggap selesai, verifikasi semua item berikut:

**Auth:**
- [ ] Login dengan Google berhasil
- [ ] User baru diarahkan ke onboarding
- [ ] User lama langsung ke dashboard
- [ ] Logout membersihkan session

**Transaksi:**
- [ ] Tambah transaksi income muncul instan (optimistic)
- [ ] Tambah transaksi expense muncul instan (optimistic)
- [ ] Edit nominal dan deskripsi berfungsi
- [ ] Hapus dengan undo 3 detik berfungsi
- [ ] Data tersimpan di Turso setelah sync

**Dashboard:**
- [ ] Saldo terhitung benar (initial ± transaksi)
- [ ] Hide/show saldo berfungsi
- [ ] Filter periode mengubah chart dan tabel
- [ ] Search deskripsi berfungsi
- [ ] Filter kategori berfungsi

**Export:**
- [ ] CSV ter-download dengan data benar
- [ ] JSON ter-download dengan data benar
- [ ] Excel ter-download dengan data benar
- [ ] PDF ter-download dengan data benar

**Backup:**
- [ ] Backup manual ke Drive berhasil
- [ ] Import dari Drive berhasil
- [ ] Import dari file lokal (CSV/JSON) berhasil
- [ ] Auto backup tersimpan settingnya
- [ ] Cron job berjalan dan update `last_backup_at`

**Mobile:**
- [ ] Bottom sheet muncul dari bawah saat FAB diklik
- [ ] Tabel bisa di-scroll horizontal di layar kecil
- [ ] Sidebar overlay berfungsi di mobile
- [ ] Semua tombol mudah di-tap (min 44x44px)
