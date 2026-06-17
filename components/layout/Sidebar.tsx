'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, Download, Settings, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

const navItems = [
  { label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
  { label: 'Backup', icon: Download, href: '/backup' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

export default function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-150"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-[280px] max-w-[100vw] bg-white border-r-[3px] border-black shadow-[6px_0px_0px_#000] z-50 transform transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* User info */}
        <div className="p-4 border-b-2 border-black">
          <div className="flex items-center gap-3">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || 'User'}
                width={48}
                height={48}
                className="border-2 border-black"
              />
            ) : (
              <div className="w-12 h-12 border-2 border-black bg-nb-primary flex items-center justify-center font-bold text-lg">
                {user?.name?.charAt(0) || '?'}
              </div>
            )}
            <div>
              <p className="font-bold text-base">{user?.name || 'User'}</p>
              <p className="text-sm text-nb-text-secondary">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href)
                  onClose()
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left font-medium transition-colors min-h-[44px]
                  ${isActive
                    ? 'bg-nb-primary font-bold'
                    : 'hover:bg-nb-bg'
                  }
                `}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t-2 border-black p-2">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-4 py-3 text-left font-medium text-nb-expense-dark hover:bg-red-50 transition-colors min-h-[44px]"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
