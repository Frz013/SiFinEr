'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Category, CreateTransactionInput } from '@/types'

interface AddTransactionSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTransactionInput) => Promise<void>
  categories: Category[]
  onAddCategory: (name: string, type: 'income' | 'expense', color: string) => Promise<void>
}

const COLORS = ['#FACC15', '#60A5FA', '#4ADE80', '#F87171', '#C084FC', '#FB923C']

export default function AddTransactionSheet({
  isOpen,
  onClose,
  onSubmit,
  categories,
  onAddCategory,
}: AddTransactionSheetProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#FACC15')

  const filteredCategories = categories.filter(c => c.type === type)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const resetForm = () => {
    setAmount('')
    setCategoryId(null)
    setDescription('')
    setShowNewCat(false)
    setNewCatName('')
    setNewCatColor('#FACC15')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = Number(amount.replace(/[^0-9]/g, ''))
    if (!numAmount || numAmount <= 0) return

    setLoading(true)
    try {
      await onSubmit({
        amount: numAmount,
        type,
        categoryId,
        description: description || undefined,
        date: Math.floor(Date.now() / 1000),
      })
      resetForm()
      onClose()
    } catch {
      // error handled by hook
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    const cat = await onAddCategory(newCatName.trim(), type, newCatColor) as { id: number } | undefined
    if (cat && typeof cat === 'object' && 'id' in cat) {
      setCategoryId(cat.id)
      setShowNewCat(false)
      setNewCatName('')
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-[3px] border-black max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Handle bar */}
        <div className="w-10 h-1 bg-black mx-auto mt-4 mb-4" />

        <div className="px-4 pb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold">Tambah Transaksi</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border-2 border-black hover:bg-gray-100"
              aria-label="Tutup"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Toggle Income/Expense */}
            <div className="inline-flex border-2 border-black rounded-full p-0.5 bg-white">
              <button
                type="button"
                onClick={() => { setType('income'); setCategoryId(null) }}
                className={`px-4 py-2 text-sm font-bold transition-all min-h-[44px] ${
                  type === 'income' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                INCOME
              </button>
              <button
                type="button"
                onClick={() => { setType('expense'); setCategoryId(null) }}
                className={`px-4 py-2 text-sm font-bold transition-all min-h-[44px] ${
                  type === 'expense' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                EXPENSE
              </button>
            </div>

            {/* Amount */}
            <Input
              label="Nominal"
              type="text"
              inputMode="numeric"
              placeholder="Rp 0"
              value={amount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '')
                setAmount(val ? `Rp ${Number(val).toLocaleString('id-ID')}` : '')
              }}
              className="font-mono font-bold text-lg"
            />

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Kategori
              </label>
              <div className="flex flex-wrap gap-2">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id === categoryId ? null : cat.id)}
                    className={`px-3 py-2 text-sm font-semibold border-2 border-black shadow-[2px_2px_0px_#000] transition-all min-h-[44px] ${
                      categoryId === cat.id
                        ? 'bg-black text-white translate-x-[2px] translate-y-[2px] shadow-none'
                        : ''
                    }`}
                    style={{ backgroundColor: cat.id === categoryId ? undefined : cat.color }}
                  >
                    {cat.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowNewCat(!showNewCat)}
                  className="px-3 py-2 text-sm font-bold border-2 border-black border-dashed hover:bg-gray-50 min-h-[44px]"
                >
                  + Baru
                </button>
              </div>

              {/* New category form */}
              {showNewCat && (
                <div className="mt-3 p-3 bg-nb-bg border-2 border-black space-y-2">
                  <Input
                    placeholder="Nama kategori..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCatColor(c)}
                        className={`w-8 h-8 border-2 border-black ${
                          newCatColor === c ? 'ring-2 ring-offset-1 ring-black' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCategory}
                    disabled={!newCatName.trim()}
                  >
                    Simpan Kategori
                  </Button>
                </div>
              )}
            </div>

            {/* Description */}
            <Input
              label="Deskripsi (opsional)"
              placeholder="Opsional..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Save */}
            <Button
              type="submit"
              variant="primary"
              size="full"
              disabled={loading || !amount || Number(amount.replace(/[^0-9]/g, '')) <= 0}
            >
              {loading ? 'Menyimpan...' : 'SAVE'}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
