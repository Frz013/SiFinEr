'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Card from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'

interface BalanceCardProps {
  balance: number
  initialBalance: number
  currency?: string
}

export default function BalanceCard({ balance, initialBalance, currency = 'IDR' }: BalanceCardProps) {
  const [hidden, setHidden] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sifiner_hide_balance') === 'true'
    }
    return false
  })

  const toggleHidden = () => {
    const next = !hidden
    setHidden(next)
    localStorage.setItem('sifiner_hide_balance', String(next))
  }

  return (
    <Card hero>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-black/70">
            Saldo Saat Ini
          </p>
          <p className="text-[36px] font-extrabold font-mono leading-tight mt-1">
            {hidden ? '••••••••' : formatCurrency(balance, currency)}
          </p>
          <p className="text-xs text-black/60 mt-1">
            Saldo awal: {formatCurrency(initialBalance, currency)}
          </p>
        </div>
        <button
          onClick={toggleHidden}
          className="w-8 h-8 flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100 transition-colors"
          aria-label={hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
        >
          {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </Card>
  )
}
