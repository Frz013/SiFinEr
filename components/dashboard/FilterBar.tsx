'use client'

import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'

interface FilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  categories: { id: number; name: string; color: string }[]
  selectedCategoryId: number | null
  onCategoryChange: (id: number | null) => void
  period: string
  onPeriodChange: (period: string) => void
  customRange: { from: string; to: string }
  onCustomRangeChange: (range: { from: string; to: string }) => void
}

const PERIODS = [
  { label: 'Hari Ini', value: 'today' },
  { label: 'Kemarin', value: 'yesterday' },
  { label: '7 Hari', value: '7days' },
  { label: '30 Hari', value: '30days' },
  { label: 'Custom', value: 'custom' },
]

export default function FilterBar({
  searchValue,
  onSearchChange,
  categories,
  selectedCategoryId,
  onCategoryChange,
  period,
  onPeriodChange,
  customRange,
  onCustomRangeChange,
}: FilterBarProps) {
  const [showCats, setShowCats] = useState(false)
  const [showPeriods, setShowPeriods] = useState(false)

  const selectedCat = categories.find(c => c.id === selectedCategoryId)

  return (
    <div className="flex flex-col gap-3">
      {/* Search + Kategori + Periode */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nb-text-placeholder" />
          <input
            type="text"
            placeholder="Cari deskripsi..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border-2 border-black rounded-none bg-white pl-9 pr-3 py-2 text-sm shadow-[3px_3px_0px_#000] outline-none focus:shadow-[4px_4px_0px_#000] focus:bg-nb-bg min-h-[44px]"
          />
        </div>

        {/* Kategori filter */}
        <div className="relative">
          <button
            onClick={() => setShowCats(!showCats)}
            className="flex items-center gap-2 border-2 border-black rounded-none bg-white px-3 py-2 text-sm shadow-[3px_3px_0px_#000] min-h-[44px] hover:bg-gray-50"
          >
            {selectedCategoryId && selectedCat ? (
              <span
                className="w-3 h-3 border border-black"
                style={{ backgroundColor: selectedCat.color }}
              />
            ) : null}
            {selectedCategoryId && selectedCat ? selectedCat.name : 'Kategori'}
            <ChevronDown size={14} />
          </button>
          {showCats && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowCats(false)} />
              <div className="absolute top-full left-0 mt-1 z-20 bg-white border-2 border-black shadow-[4px_4px_0px_#000] min-w-[160px]">
                <button
                  onClick={() => { onCategoryChange(null); setShowCats(false) }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-nb-bg min-h-[44px]"
                >
                  Semua Kategori
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { onCategoryChange(cat.id); setShowCats(false) }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-nb-bg flex items-center gap-2 min-h-[44px]"
                  >
                    <span className="w-3 h-3 border border-black" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Periode filter */}
        <div className="relative">
          <button
            onClick={() => setShowPeriods(!showPeriods)}
            className="flex items-center gap-2 border-2 border-black rounded-none bg-white px-3 py-2 text-sm shadow-[3px_3px_0px_#000] min-h-[44px] hover:bg-gray-50"
          >
            {PERIODS.find(p => p.value === period)?.label || 'Periode'}
            <ChevronDown size={14} />
          </button>
          {showPeriods && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowPeriods(false)} />
              <div className="absolute top-full left-0 mt-1 z-20 bg-white border-2 border-black shadow-[4px_4px_0px_#000] min-w-[160px]">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => { onPeriodChange(p.value); setShowPeriods(false) }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-nb-bg min-h-[44px] ${
                      period === p.value ? 'bg-nb-primary font-bold' : ''
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Custom Date Range - hanya muncul saat periode Custom dipilih */}
      {period === 'custom' && (
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-black mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={customRange.from}
              onChange={(e) => onCustomRangeChange({ ...customRange, from: e.target.value })}
              className="w-full border-2 border-black rounded-none bg-white px-3 py-2 text-sm shadow-[3px_3px_0px_#000] outline-none focus:shadow-[4px_4px_0px_#000] focus:bg-nb-bg min-h-[44px]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-black mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={customRange.to}
              onChange={(e) => onCustomRangeChange({ ...customRange, to: e.target.value })}
              className="w-full border-2 border-black rounded-none bg-white px-3 py-2 text-sm shadow-[3px_3px_0px_#000] outline-none focus:shadow-[4px_4px_0px_#000] focus:bg-nb-bg min-h-[44px]"
            />
          </div>
        </div>
      )}
    </div>
  )
}
