'use client'

import { Menu } from 'lucide-react'
import SyncIndicator, { type SyncStatus } from './SyncIndicator'

interface HeaderProps {
  onMenuClick: () => void
  syncStatus: SyncStatus
  onRetry?: () => void
}

export default function Header({ onMenuClick, syncStatus, onRetry }: HeaderProps) {
  return (
    <header className="h-14 bg-nb-primary border-b-2 border-black flex items-center justify-between px-4 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="w-8 h-8 flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100 transition-colors"
        aria-label="Menu"
      >
        <Menu size={18} />
      </button>

      <h1 className="text-xl font-extrabold text-black tracking-tight">
        SiFinEr
      </h1>

      <SyncIndicator status={syncStatus} onRetry={onRetry} />
    </header>
  )
}
