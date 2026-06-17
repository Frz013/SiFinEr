'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { SessionProvider } from 'next-auth/react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { useSyncStatus } from '@/hooks/useSyncStatus'
import type { SyncStatus } from '@/components/layout/SyncIndicator'

function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { status: syncStatus } = useSyncStatus()
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-nb-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-nb-primary border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-lg font-extrabold">S</span>
          </div>
          <p className="text-sm text-nb-text-secondary">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nb-bg">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        syncStatus={syncStatus as SyncStatus}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={{
          name: session?.user?.name,
          email: session?.user?.email,
          image: session?.user?.image,
        }}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {children}
      </main>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  )
}
