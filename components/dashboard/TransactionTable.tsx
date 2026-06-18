'use client'

import { useState } from 'react'
import TransactionRow from './TransactionRow'
import type { TransactionWithCategory as Transaction } from '@/types'

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit: (t: Transaction) => void
  onDelete: (id: number) => void
}

export default function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-4 border-2 border-black flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <h3 className="font-bold text-base mb-1">Belum ada transaksi</h3>
        <p className="text-sm text-nb-text-secondary">
          Tap + untuk mulai mencatat keuanganmu.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-black text-white">
            <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-left border-r border-gray-700 w-12">#</th>
            <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-left border-r border-gray-700 min-w-[140px]">Nominal</th>
            <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-left border-r border-gray-700 min-w-[140px]">Kategori</th>
            <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-left border-r border-gray-700 min-w-[90px]">Tanggal</th>
            <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-left border-r border-gray-700">Deskripsi</th>
            <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-center w-12">···</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, i) => (
            <TransactionRow
              key={t.id}
              index={i}
              transaction={t}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
