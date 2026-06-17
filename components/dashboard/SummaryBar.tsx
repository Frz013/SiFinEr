'use client'

import { formatCurrency } from '@/lib/utils'

interface SummaryBarProps {
  totalIncome: number
  totalExpense: number
  periodLabel: string
  currency?: string
}

export default function SummaryBar({ totalIncome, totalExpense, periodLabel, currency = 'IDR' }: SummaryBarProps) {
  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row">
      <div className="flex-1 p-3 border-b-2 sm:border-b-0 sm:border-r-2 border-black">
        <p className="text-[11px] font-bold uppercase text-nb-text-secondary tracking-wider">
          Total Masuk
        </p>
        <p className="text-lg font-bold font-mono text-nb-income-dark mt-1">
          +{formatCurrency(totalIncome, currency)}
        </p>
      </div>
      <div className="flex-1 p-3 border-b-2 sm:border-b-0 sm:border-r-2 border-black">
        <p className="text-[11px] font-bold uppercase text-nb-text-secondary tracking-wider">
          Total Keluar
        </p>
        <p className="text-lg font-bold font-mono text-nb-expense-dark mt-1">
          -{formatCurrency(totalExpense, currency)}
        </p>
      </div>
      <div className="flex-1 p-3">
        <p className="text-[11px] font-bold uppercase text-nb-text-secondary tracking-wider">
          Periode
        </p>
        <p className="text-lg font-bold mt-1">
          {periodLabel}
        </p>
      </div>
    </div>
  )
}
