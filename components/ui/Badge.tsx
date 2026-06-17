interface BadgeProps {
  children: React.ReactNode
  color?: string
  className?: string
}

export default function Badge({ children, color = '#FACC15', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 border border-black rounded text-xs font-semibold shadow-[2px_2px_0px_#000] ${className}`}
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  )
}
