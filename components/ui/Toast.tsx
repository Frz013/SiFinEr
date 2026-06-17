'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
  onDismiss?: () => void
}

export default function Toast({ message, action, duration = 3000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onDismiss?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  if (!visible) return null

  return (
    <div className="fixed bottom-[90px] right-6 bg-black text-white px-4 py-3 border-2 border-black shadow-[4px_4px_0px_#555] text-sm font-medium z-50 flex items-center gap-3 animate-slide-up">
      <span>{message}</span>
      {action && (
        <button
          onClick={() => {
            action.onClick()
            setVisible(false)
          }}
          className="text-nb-primary font-bold underline cursor-pointer hover:text-yellow-300"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
