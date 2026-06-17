import type { TransactionWithCategory, ExportData, Summary } from '@/types'

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToCSV(transactions: TransactionWithCategory[]) {
  const { unparse } = require('papaparse')
  const rows = transactions.map(t => ({
    Tanggal: new Date(t.date * 1000).toLocaleDateString('id-ID'),
    Jenis: t.type === 'income' ? 'Masuk' : 'Keluar',
    Nominal: t.amount,
    Kategori: t.categoryName || '-',
    Deskripsi: t.description || '-',
  }))
  const csv = unparse(rows)
  downloadFile(csv, 'sifiner-transaksi.csv', 'text/csv')
}

export function exportToJSON(data: ExportData) {
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, 'sifiner-backup.json', 'application/json')
}

export function exportToExcel(transactions: TransactionWithCategory[], summary: Summary) {
  const XLSX = require('xlsx')

  const txData = transactions.map(t => ({
    Tanggal: new Date(t.date * 1000).toLocaleDateString('id-ID'),
    Jenis: t.type === 'income' ? 'Masuk' : 'Keluar',
    Nominal: t.amount,
    Kategori: t.categoryName || '-',
    Deskripsi: t.description || '-',
  }))

  const wb = XLSX.utils.book_new()
  const ws1 = XLSX.utils.json_to_sheet(txData)
  XLSX.utils.book_append_sheet(wb, ws1, 'Transaksi')

  const ws2 = XLSX.utils.json_to_sheet([{
    'Total Masuk': summary.totalIncome,
    'Total Keluar': summary.totalExpense,
    'Saldo': summary.balance,
    Periode: summary.period,
  }])
  XLSX.utils.book_append_sheet(wb, ws2, 'Ringkasan')

  XLSX.writeFile(wb, 'sifiner-laporan.xlsx')
}

export async function exportToPDF(transactions: TransactionWithCategory[], summary: Summary) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()

  // Title
  doc.setFontSize(18)
  doc.text('Laporan Keuangan SiFinEr', 14, 22)

  // Summary
  doc.setFontSize(12)
  doc.text(`Periode: ${summary.period}`, 14, 32)
  doc.text(`Total Masuk: Rp ${summary.totalIncome.toLocaleString('id-ID')}`, 14, 40)
  doc.text(`Total Keluar: Rp ${summary.totalExpense.toLocaleString('id-ID')}`, 14, 48)
  doc.text(`Saldo: Rp ${summary.balance.toLocaleString('id-ID')}`, 14, 56)

  // Table
  const tableData = transactions.map(t => [
    new Date(t.date * 1000).toLocaleDateString('id-ID'),
    t.type === 'income' ? 'Masuk' : 'Keluar',
    `Rp ${t.amount.toLocaleString('id-ID')}`,
    t.categoryName || '-',
    t.description || '-',
  ])

  autoTable(doc, {
    head: [['Tanggal', 'Jenis', 'Nominal', 'Kategori', 'Deskripsi']],
    body: tableData,
    startY: 65,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 0, 0] },
  })

  doc.save('sifiner-laporan.pdf')
}
