'use client'

import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import { formatCurrency, formatDateFull } from '@/lib/utils'

interface Transaction {
  id: number
  amount: number
  type: 'income' | 'expense'
  description: string | null
  date: number
  categoryName: string | null
  categoryColor: string | null
}

interface TransactionRowProps {
  index: number
  transaction: Transaction
  onEdit: (t: Transaction) => void
  onDelete: (id: number) => void
}

export default function TransactionRow({ index, transaction, onEdit, onDelete }: TransactionRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isIncome = transaction.type === 'income'

  return (
    <tr className="border-b border-black hover:bg-nb-bg transition-colors last:border-b-0">
      <td className="px-3 py-2.5 text-sm text-nb-text-secondary w-12">
        {index + 1}
      </td>
      <td className={`px-3 py-2.5 text-sm font-mono font-bold min-w-[140px] ${
        isIncome ? 'text-nb-income-dark' : 'text-nb-expense-dark'
      }`}>
        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
      </td>
      <td className="px-3 py-2.5 min-w-[140px]">
        {transaction.categoryName ? (
          <Badge color={transaction.categoryColor || '#FACC15'}>
            {transaction.categoryName}
          </Badge>
        ) : (
          <span className="text-xs text-nb-text-placeholder">-</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-sm min-w-[90px]" title={formatDateFull(transaction.date)}>
        {new Date(transaction.date * 1000).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
        })}
      </td>
      <td className="px-3 py-2.5 text-sm text-nb-text-secondary flex-1">
        {transaction.description || <span className="italic text-nb-text-placeholder">-</span>}
      </td>
      <td className="px-3 py-2.5 w-12 relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors"
          aria-label="Menu"
        >
          <MoreVertical size={16} />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-white border-2 border-black shadow-[4px_4px_0px_#000] min-w-[140px]">
              <button
                onClick={() => { onEdit(transaction); setMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-nb-bg min-h-[44px]"
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                onClick={() => { onDelete(transaction.id); setMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-nb-expense-dark hover:bg-red-50 min-h-[44px]"
              >
                <Trash2 size={14} />
                Hapus
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  )
}
