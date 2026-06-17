'use client'

export type SyncStatus = 'saved' | 'saving' | 'error'

interface SyncIndicatorProps {
  status: SyncStatus
  onRetry?: () => void
}

export default function SyncIndicator({ status, onRetry }: SyncIndicatorProps) {
  if (status === 'saved') {
    return (
      <span className="text-xs font-medium text-nb-income-dark">
        Tersimpan ✓
      </span>
    )
  }

  if (status === 'saving') {
    return (
      <span className="text-xs font-medium text-nb-text-secondary">
        Menyimpan<span className="animate-pulse">...</span>
      </span>
    )
  }

  return (
    <button
      onClick={onRetry}
      className="text-xs font-medium text-nb-expense-dark underline cursor-pointer hover:text-red-700"
    >
      Gagal — Coba Lagi
    </button>
  )
}
