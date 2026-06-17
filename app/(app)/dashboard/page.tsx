'use client'

import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import BalanceCard from '@/components/dashboard/BalanceCard'
import SummaryBar from '@/components/dashboard/SummaryBar'
import PieChartView from '@/components/dashboard/PieChart'
import LineChartView from '@/components/dashboard/LineChart'
import FilterBar from '@/components/dashboard/FilterBar'
import TransactionTable from '@/components/dashboard/TransactionTable'
import AddTransactionSheet from '@/components/dashboard/AddTransactionSheet'
import Toast from '@/components/ui/Toast'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { calculateBalance, filterByPeriod, formatCurrency } from '@/lib/utils'
import type { TransactionWithCategory, CreateTransactionInput } from '@/types'

const PERIOD_LABELS: Record<string, string> = {
  today: 'Hari Ini',
  yesterday: 'Kemarin',
  '7days': '7 Hari Terakhir',
  '30days': '30 Hari Terakhir',
}

export default function DashboardPage() {
  const { transactions, addTransaction, deleteTransaction } = useTransactions()
  const { categories, addCategory } = useCategories()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [period, setPeriod] = useState('30days')
  const [toast, setToast] = useState<{
    message: string
    action?: { label: string; onClick: () => void }
  } | null>(null)

  // Filter by period
  const periodTransactions = useMemo(() => {
    return filterByPeriod(transactions, period as 'today' | 'yesterday' | '7days' | '30days')
  }, [transactions, period])

  // Filter by search and category
  const filteredTransactions = useMemo(() => {
    let filtered = periodTransactions
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(q)
      )
    }
    if (selectedCategory !== null) {
      filtered = filtered.filter(t => t.categoryId === selectedCategory)
    }
    return filtered
  }, [periodTransactions, search, selectedCategory])

  // Balance
  const balance = useMemo(() => {
    const init = 0 // TODO: fetch from user settings
    return calculateBalance(init, transactions)
  }, [transactions])

  // Summary
  const summary = useMemo(() => {
    const totalIncome = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    return { totalIncome, totalExpense }
  }, [periodTransactions])

  // Pie chart data
  const pieData = useMemo(() => {
    const catMap = new Map<string, { value: number; color: string }>()
    periodTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const name = t.categoryName || 'Tanpa Kategori'
        const existing = catMap.get(name) || { value: 0, color: t.categoryColor || '#FACC15' }
        catMap.set(name, { value: existing.value + t.amount, color: existing.color })
      })
    return Array.from(catMap.entries()).map(([name, { value, color }]) => ({
      name, value, color,
    }))
  }, [periodTransactions])

  // Line chart data
  const lineData = useMemo(() => {
    const dailyMap = new Map<string, { income: number; expense: number }>()
    periodTransactions.forEach(t => {
      const dateStr = new Date(t.date * 1000).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      })
      const existing = dailyMap.get(dateStr) || { income: 0, expense: 0 }
      if (t.type === 'income') {
        dailyMap.set(dateStr, { ...existing, income: existing.income + t.amount })
      } else {
        dailyMap.set(dateStr, { ...existing, expense: existing.expense + t.amount })
      }
    })
    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateA.getTime() - dateB.getTime()
      })
  }, [periodTransactions])

  const handleAdd = async (data: CreateTransactionInput) => {
    await addTransaction(data)
    setToast({ message: 'Transaksi ditambahkan!' })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDelete = (id: number) => {
    const deleted = transactions.find(t => t.id === id)
    deleteTransaction(id)

    const undoTimer = setTimeout(async () => {
      // Actually delete on server
    }, 3000)

    setToast({
      message: 'Transaksi dihapus',
      action: {
        label: 'Undo',
        onClick: () => {
          clearTimeout(undoTimer)
          // Re-add would need the full data - simplified here
          setToast(null)
        },
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <BalanceCard balance={balance} initialBalance={0} />

      {/* Summary Bar */}
      <SummaryBar
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
        periodLabel={PERIOD_LABELS[period] || period}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PieChartView
          data={pieData}
          onSliceClick={(name) => {
            const cat = categories.find(c => c.name === name)
            if (cat) setSelectedCategory(cat.id === selectedCategory ? null : cat.id)
          }}
        />
        <LineChartView data={lineData} />
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        categories={categories}
        selectedCategoryId={selectedCategory}
        onCategoryChange={setSelectedCategory}
        period={period}
        onPeriodChange={setPeriod}
      />

      {/* Transaction Table */}
      <TransactionTable
        transactions={filteredTransactions}
        onEdit={() => {}}
        onDelete={handleDelete}
      />

      {/* FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-nb-primary border-[3px] border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] font-extrabold text-[28px] transition-all duration-75 z-30 flex items-center justify-center"
        aria-label="Tambah transaksi"
      >
        <Plus size={28} />
      </button>

      {/* Add Transaction Sheet */}
      <AddTransactionSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleAdd}
        categories={categories}
        onAddCategory={async (name, type, color) => {
          return await addCategory({ name, type, color })
        }}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          action={toast.action}
          duration={3000}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}
