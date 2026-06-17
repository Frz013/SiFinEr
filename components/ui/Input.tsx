'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-black mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full border-2 border-black rounded-none bg-white px-3 py-2 text-base shadow-[3px_3px_0px_#000] outline-none focus:shadow-[4px_4px_0px_#000] focus:bg-nb-bg min-h-[44px] ${className}`}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
