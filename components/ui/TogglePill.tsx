'use client'

interface TogglePillProps {
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}

export default function TogglePill({ options, value, onChange }: TogglePillProps) {
  return (
    <div className="inline-flex border-2 border-black rounded-full p-0.5 bg-white">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 text-sm font-bold transition-all duration-75 min-h-[44px]
            ${value === opt.value
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-100'
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
