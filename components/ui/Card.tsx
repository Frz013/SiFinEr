interface CardProps {
  children: React.ReactNode
  hero?: boolean
  className?: string
}

export default function Card({ children, hero = false, className = '' }: CardProps) {
  return (
    <div
      className={`
        ${hero
          ? 'bg-nb-primary border-[3px] border-black shadow-[6px_6px_0px_#000] p-6'
          : 'bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-4'
        }
        ${className}
      `}
    >
      {children}
    </div>
  )
}
