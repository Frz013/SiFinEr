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

// Format tanggal lengkap (untuk tooltip)
export function formatDateFull(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Hitung saldo saat ini
export function calculateBalance(
  initialBalance: number,
  transactions: { type: 'income' | 'expense'; amount: number }[]
): number {
  return transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount
  }, initialBalance)
}

// Filter transaksi berdasarkan periode
export function filterByPeriod<T extends { date: number }>(
  transactions: T[],
  period: 'today' | 'yesterday' | '7days' | '30days' | 'custom',
  customRange?: { from: number; to: number }
): T[] {
  const now = Math.floor(Date.now() / 1000)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
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
