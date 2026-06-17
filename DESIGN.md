# DESIGN.md — SiFinEr Visual Design System

Dokumen ini adalah **satu-satunya sumber kebenaran** untuk semua keputusan visual SiFinEr. Setiap komponen UI harus mengikuti panduan ini tanpa deviasi kecuali disebutkan secara eksplisit.

---

## 1. Filosofi Desain

SiFinEr menggunakan **neobrutalism** — gaya desain yang menolak shadow blur, rounded corner besar, dan gradien halus. Setiap elemen terasa solid, tegas, dan nyata. Tidak ada kesan "floating" atau "glass morphism". Identitas visual yang kuat dan tidak bisa disalahkan sebagai template generik.

**Prinsip utama:**
- Tegas dan jelas — tidak ada ambiguitas visual
- Cepat dibaca — hierarki informasi yang kuat
- Ringan di mata — tidak padat, tidak ramai
- Konsisten — setiap elemen mengikuti sistem yang sama

---

## 2. Color Palette

```
Background (body)   : #FFFDF5   /* krem hangat, bukan putih */
Surface (card)      : #FFFFFF   /* putih murni untuk card */
Border              : #000000   /* hitam, selalu */
Text Primary        : #000000
Text Secondary      : #555555
Text Placeholder    : #999999

/* Brand */
Primary (aksen)     : #FACC15   /* kuning bold — tombol utama, FAB */
Primary Hover       : #EAB308   /* kuning lebih gelap saat hover */

/* Semantik */
Income (masuk)      : #4ADE80   /* hijau */
Income Dark         : #16A34A   /* hijau gelap untuk teks di atas hijau muda */
Expense (keluar)    : #F87171   /* merah */
Expense Dark        : #DC2626

/* Kategori default (6 warna preset) */
Cat-1               : #FACC15   /* kuning */
Cat-2               : #60A5FA   /* biru */
Cat-3               : #4ADE80   /* hijau */
Cat-4               : #F87171   /* merah */
Cat-5               : #C084FC   /* ungu */
Cat-6               : #FB923C   /* oranye */
```

**Tailwind config extension:**
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      nb: {
        bg: '#FFFDF5',
        surface: '#FFFFFF',
        border: '#000000',
        primary: '#FACC15',
        'primary-hover': '#EAB308',
        income: '#4ADE80',
        'income-dark': '#16A34A',
        expense: '#F87171',
        'expense-dark': '#DC2626',
      }
    }
  }
}
```

---

## 3. Typography

```
Font Family
  Display + Body  : 'Inter' (Google Fonts)
  Monospace       : 'JetBrains Mono' (untuk angka nominal)

Type Scale
  xs    : 12px / font-medium
  sm    : 14px / font-normal
  base  : 16px / font-normal
  lg    : 18px / font-semibold
  xl    : 20px / font-bold
  2xl   : 24px / font-bold
  3xl   : 30px / font-extrabold
  4xl   : 36px / font-extrabold  (saldo utama)
```

**Aturan tipografi:**
- Semua nominal (angka uang) gunakan **JetBrains Mono**, bold
- Label dan heading gunakan Inter, bold atau extrabold
- Body text dan deskripsi gunakan Inter, regular atau medium
- Tidak ada italic kecuali untuk placeholder
- Letter spacing normal (tidak ada tracking yang diperlebar/dipersempit)

---

## 4. Spacing System

Ikuti spacing default Tailwind (basis 4px):

```
4px   = space-1
8px   = space-2
12px  = space-3
16px  = space-4   ← padding dasar komponen
20px  = space-5
24px  = space-6   ← gap antar section
32px  = space-8   ← padding halaman
40px  = space-10
48px  = space-12
```

---

## 5. Border & Shadow System

Ini adalah inti dari neobrutalism. **Jangan deviasi dari sistem ini.**

```css
/* Border standar */
border: 2px solid #000000;       /* semua card, input, button */
border: 3px solid #000000;       /* card utama (saldo) */
border: 1px solid #000000;       /* badge, tag kecil */

/* Shadow standar (offset shadow, BUKAN blur shadow) */
box-shadow: 4px 4px 0px #000000;   /* card, button normal */
box-shadow: 3px 3px 0px #000000;   /* komponen medium */
box-shadow: 2px 2px 0px #000000;   /* badge, elemen kecil */
box-shadow: 6px 6px 0px #000000;   /* card saldo (hero) */

/* Hover state — element "ditekan" */
/* Shift element ke kanan bawah, shadow hilang */
transform: translate(2px, 2px);
box-shadow: 2px 2px 0px #000000;

/* Active/pressed state */
transform: translate(4px, 4px);
box-shadow: none;

/* Border radius */
border-radius: 0px;       /* default semua elemen */
border-radius: 4px;       /* maksimal, hanya untuk badge/pill */
border-radius: 9999px;    /* hanya untuk toggle pill Income/Expense */
```

---

## 6. Komponen UI

### 6.1 Button

```
Variasi:
  Primary    → bg-yellow (#FACC15), border-black, shadow-4, text-black bold
  Secondary  → bg-white, border-black, shadow-4, text-black bold
  Danger     → bg-red (#F87171), border-black, shadow-4, text-black bold
  Ghost      → bg-transparent, border-black, no-shadow, text-black

Ukuran:
  sm   : px-3 py-1.5, text-sm
  md   : px-4 py-2, text-base    ← default
  lg   : px-6 py-3, text-lg
  full : w-full, py-3, text-base (untuk SAVE di bottom sheet)

State:
  hover  : translate(2px, 2px), shadow dikurangi jadi 2px
  active : translate(4px, 4px), shadow none
  disabled : opacity-50, cursor-not-allowed, no transform
```

**Tailwind class contoh (Primary Button):**
```html
<button class="
  bg-nb-primary
  border-2 border-black
  shadow-[4px_4px_0px_#000]
  hover:shadow-[2px_2px_0px_#000]
  hover:translate-x-[2px]
  hover:translate-y-[2px]
  active:shadow-none
  active:translate-x-[4px]
  active:translate-y-[4px]
  px-4 py-2
  font-bold
  transition-all duration-75
">
  Simpan
</button>
```

### 6.2 Input & Form

```css
/* Input standar */
.input-nb {
  border: 2px solid #000;
  border-radius: 0px;
  background: #fff;
  padding: 8px 12px;
  font-size: 16px;            /* minimal 16px agar iOS tidak zoom */
  box-shadow: 3px 3px 0px #000;
  outline: none;
  width: 100%;
}

.input-nb:focus {
  box-shadow: 4px 4px 0px #000;
  background: #FFFDF5;
}

.input-nb::placeholder {
  color: #999;
  font-style: italic;
}
```

**Label:**
- Selalu di atas input, bukan placeholder sebagai label
- Font: 14px, font-semibold, text-black
- Margin bottom: 4px

### 6.3 Card

```css
/* Card standar */
.card-nb {
  background: #fff;
  border: 2px solid #000;
  box-shadow: 4px 4px 0px #000;
  padding: 16px;
}

/* Card hero (saldo) */
.card-hero {
  background: #FACC15;
  border: 3px solid #000;
  box-shadow: 6px 6px 0px #000;
  padding: 24px;
}
```

### 6.4 Badge / Kategori Tag

```css
.badge-nb {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border: 1px solid #000;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: <warna kategori>;
  box-shadow: 2px 2px 0px #000;
}
```

### 6.5 Toggle Pill (Income / Expense)

```
[ INCOME ] [ EXPENSE ]

Active:
  background: #000
  text: #fff
  border: 2px solid #000

Inactive:
  background: #fff
  text: #000
  border: 2px solid #000

Container:
  border: 2px solid #000
  border-radius: 9999px
  padding: 2px
  background: #fff
```

### 6.6 Dropdown / Select

```css
.dropdown-nb {
  border: 2px solid #000;
  border-radius: 0;
  background: #fff;
  padding: 8px 12px;
  box-shadow: 3px 3px 0px #000;
  appearance: none;
  background-image: url("chevron-down");
  background-repeat: no-repeat;
  background-position: right 12px center;
}
```

Dropdown menu (list):
- Border: 2px solid #000
- Background: #fff
- Box-shadow: 4px 4px 0px #000
- Setiap item: padding 8px 12px, hover bg #FFFDF5
- Z-index cukup tinggi (50+)

### 6.7 FAB (Floating Action Button)

```css
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: #FACC15;
  border: 3px solid #000;
  border-radius: 0;
  box-shadow: 4px 4px 0px #000;
  font-size: 28px;
  font-weight: 800;
  cursor: pointer;
  z-index: 40;
  transition: all 75ms;
}

.fab:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000;
}

.fab:active {
  transform: translate(4px, 4px);
  box-shadow: none;
}
```

### 6.8 Toast / Notification

```css
.toast-nb {
  position: fixed;
  bottom: 90px;          /* di atas FAB */
  right: 24px;
  background: #000;
  color: #fff;
  padding: 12px 16px;
  border: 2px solid #000;
  box-shadow: 4px 4px 0px #555;
  font-size: 14px;
  font-weight: 500;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Tombol Undo di dalam toast */
.toast-action {
  color: #FACC15;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}
```

---

## 7. Layout

### 7.1 Header

```
Height: 56px
Background: #FACC15 (kuning)
Border-bottom: 2px solid #000

Konten:
  Kiri   : tombol hamburger ☰ (32x32, border 2px black, bg white)
  Tengah : logo "SiFinEr" (font extrabold, 20px)
  Kanan  : SyncIndicator (teks kecil 12px)
```

### 7.2 Sidebar

```
Width: 280px (desktop), 100vw maks (mobile)
Background: #fff
Border-right: 3px solid #000
Box-shadow: 6px 0px 0px #000

Overlay belakang: bg-black/40, klik untuk tutup

Struktur:
  ┌─────────────────────────────┐
  │  padding: 16px              │
  │  [foto 48x48, border 2px]   │
  │  [nama, font-bold 16px]     │
  │  [email, text-secondary]    │
  ├─────────────────────────────┤  border-top: 2px solid #000
  │  Nav items (padding 12px)   │
  │  hover: bg-#FFFDF5          │
  │  active: bg-#FACC15, bold   │
  ├─────────────────────────────┤  border-top: 2px solid #000 (di bawah)
  │  Logout (text-red, bottom)  │
  └─────────────────────────────┘
```

### 7.3 Dashboard Layout

```
/* Mobile (<768px): single column */
/* Desktop (≥768px): dua kolom untuk chart */

Body padding: 16px (mobile) / 24px (desktop)
Gap antar section: 24px

Urutan elemen:
1. Card Saldo (full width)
2. Toggle Filter (Semua | Masuk | Keluar)
3. Summary Bar (flex row, 3 kolom)
4. Chart Row:
   - Mobile: Pie (full width) → Line (full width)
   - Desktop: Pie (1/2) | Line (1/2)
5. Filter Bar (search + kategori + tanggal)
6. Tabel Transaksi (full width)
```

### 7.4 Bottom Sheet (Add Transaksi)

```
/* Muncul dari bawah ke atas, full width */

Overlay: bg-black/50, klik untuk tutup
Sheet:
  background: #fff
  border-top: 3px solid #000
  border-radius: 0
  padding: 20px 16px
  padding-bottom: max(20px, env(safe-area-inset-bottom))
  max-height: 90vh
  overflow-y: auto

Handle bar di atas (opsional):
  width: 40px, height: 4px
  background: #000
  margin: 0 auto 16px

Animasi:
  masuk: transform translateY(100%) → translateY(0), duration 200ms, ease-out
  keluar: translateY(0) → translateY(100%), duration 150ms, ease-in
```

---

## 8. Tabel Transaksi

```css
/* Container */
.table-container {
  border: 2px solid #000;
  box-shadow: 4px 4px 0px #000;
  overflow-x: auto;           /* scroll horizontal di mobile */
}

/* Table */
table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

/* Header row */
thead tr {
  background: #000;
  color: #fff;
}

thead th {
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
  border-right: 1px solid #333;
}

/* Body row */
tbody tr {
  border-bottom: 1px solid #000;
  transition: background 100ms;
}

tbody tr:hover {
  background: #FFFDF5;
}

tbody tr:last-child {
  border-bottom: none;
}

tbody td {
  padding: 10px 12px;
  font-size: 14px;
  border-right: 1px solid #eee;
  vertical-align: middle;
}

/* Kolom nominal */
.nominal-income {
  color: #16A34A;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
}

.nominal-expense {
  color: #DC2626;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
}
```

**Lebar kolom (referensi):**
```
#           : 48px   (fixed)
Nominal     : 140px  (fixed)
Kategori    : 140px
Tanggal     : 90px   (fixed)
Deskripsi   : flex 1 (ambil sisa)
···         : 48px   (fixed)
```

---

## 9. Charts

### 9.1 Pie Chart (Recharts)

```javascript
// Warna: gunakan color dari kategori masing-masing
// Tidak ada label di dalam slice (terlalu ramai)
// Legend di bawah chart
// Tooltip muncul saat hover: nama kategori + nominal + persentase

const PieChartConfig = {
  outerRadius: '80%',
  innerRadius: '0%',     // solid pie, bukan donut
  stroke: '#000',        // border hitam tiap slice
  strokeWidth: 2,
}
```

### 9.2 Line Chart (Recharts)

```javascript
const LineChartConfig = {
  // Dua line: income (hijau) dan expense (merah)
  income: { stroke: '#16A34A', strokeWidth: 2.5 },
  expense: { stroke: '#DC2626', strokeWidth: 2.5 },

  // Grid
  grid: { stroke: '#eee', strokeDasharray: '3 3' },

  // Axis
  xAxis: { tick: { fontSize: 12 }, tickLine: false },
  yAxis: { tick: { fontSize: 12 }, tickLine: false },

  // Tooltip style
  tooltip: {
    background: '#000',
    border: 'none',
    color: '#fff',
    fontSize: 12,
  },

  // Dot di titik data
  dot: { r: 4, fill: '#000', stroke: '#000' },
  activeDot: { r: 6 },
}
```

---

## 10. Sync Indicator

```
Posisi: header kanan, font-size 11px

States:
  Tersimpan ✓    → text-color: #16A34A (hijau)
  Menyimpan...   → text-color: #555, animasi dots berkedip
  Gagal — Coba Lagi → text-color: #DC2626, underline, clickable
```

---

## 11. Empty State

```
Container: text-center, padding 48px 24px
Ilustrasi: SVG sederhana (garis hitam, no fill)
           ukuran 80x80px
Heading: "Belum ada transaksi"
         font-bold, 16px, margin-top 16px
Body: "Tap + untuk mulai mencatat keuanganmu."
      text-secondary, 14px, margin-top 8px
```

---

## 12. Card Saldo (Hero)

```
Background  : #FACC15 (kuning)
Border      : 3px solid #000
Shadow      : 6px 6px 0px #000
Padding     : 24px
Margin-bottom: 24px

Label atas  : "Saldo Saat Ini"
              font-size: 12px, uppercase, letter-spacing, font-bold

Nominal     : font-size: 36px, font-extrabold, JetBrains Mono
              (atau ******* jika hide mode aktif)

Tombol 👁   : di kanan nominal
              16x16px, cursor pointer
              toggle show/hide

Subtitle    : "Saldo awal: Rp X.XXX.XXX"
              font-size: 12px, text-secondary, margin-top 4px
```

---

## 13. Summary Bar

```
Layout: flex row, 3 kolom equal width
Border: 2px solid #000 (container)
Shadow: 4px 4px 0px #000
Background: #fff

Setiap item:
  padding: 12px
  border-right: 2px solid #000 (kecuali item terakhir)

  Label: font-size 11px, uppercase, text-secondary, font-bold
  Value: font-size 18px, font-bold, JetBrains Mono
         income → warna hijau
         expense → warna merah
         periode → warna hitam
```

---

## 14. Responsive Breakpoints

```
Mobile  : 0px   — 767px
Tablet  : 768px — 1023px
Desktop : 1024px+

Sidebar:
  Mobile  : overlay, full-screen backdrop
  Desktop : fixed left, content margin-left 280px (atau tetap overlay)

Chart row:
  Mobile  : stacked (satu di atas yang lain)
  Desktop : side by side (50/50)

Tabel:
  Mobile  : overflow-x scroll, min-width: 600px
  Desktop : full width
```

---

## 15. Animasi & Transisi

Neobrutalism lebih mengutamakan kejelasan daripada animasi mewah. Gunakan dengan sangat hemat:

```
Button hover/active   : 75ms, tidak ada easing mewah
Sidebar slide         : 200ms ease-out (masuk), 150ms ease-in (keluar)
Bottom sheet slide    : 200ms ease-out (masuk), 150ms ease-in (keluar)
Overlay fade          : 150ms ease
Toast muncul          : 200ms ease-out dari bawah
Dots loading          : 1s infinite (untuk "Menyimpan...")

DILARANG:
  - Spring animations
  - Bounce effects
  - Scale animations pada card atau tombol
  - Gradien animasi / shimmer loading
```

---

## 16. Aksesibilitas

- Semua interactive element: `min-width: 44px; min-height: 44px`
- Focus ring: `outline: 3px solid #000; outline-offset: 2px`
- Semua gambar/icon: aria-label atau aria-hidden jika dekoratif
- Color contrast: semua kombinasi teks memenuhi WCAG AA (4.5:1)
- `prefers-reduced-motion`: disable semua animasi jika user request

---

## 17. Ikon

Gunakan **Lucide React** untuk semua ikon:

```javascript
import {
  Menu,        // hamburger
  Plus,        // FAB (tapi gunakan teks "+" lebih bold)
  Eye, EyeOff, // hide/show saldo
  MoreVertical,// ··· menu per baris
  Download,    // export
  Upload,      // import
  Cloud,       // backup
  Settings,    // settings
  LogOut,      // logout
  Check,       // tersimpan
  AlertCircle, // gagal sync
  ChevronDown, // dropdown
  Search,      // search
  Trash2,      // hapus
  Pencil,      // edit
} from 'lucide-react'
```

Ukuran ikon:
- Header/nav: 20px
- Dalam teks: 16px
- FAB: 28px (teks "+", bukan ikon)
- Tabel actions: 16px

---

## 18. Checklist Sebelum Build Komponen

Sebelum menulis kode komponen UI apapun, pastikan:

- [ ] Border menggunakan `2px solid #000` (atau 3px untuk hero)
- [ ] Shadow menggunakan `4px 4px 0px #000` (offset, bukan blur)
- [ ] Hover state menggeser element + kurangi shadow
- [ ] Border-radius `0px` (kecuali toggle pill dan badge ≤ 4px)
- [ ] Background body `#FFFDF5`, surface `#ffffff`
- [ ] Nominal menggunakan JetBrains Mono
- [ ] Semua tombol minimal 44x44px tap target
- [ ] Warna income `#4ADE80`/`#16A34A`, expense `#F87171`/`#DC2626`
- [ ] Tidak ada gradien, blur shadow, atau rounded-xl
