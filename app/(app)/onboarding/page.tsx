'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function OnboardingPage() {
  const [initialBalance, setInitialBalance] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    if (!session) {
      router.push('/login')
    }
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialBalance: Number(initialBalance.replace(/[^0-9]/g, '')),
        }),
      })

      if (!res.ok) throw new Error('Gagal menyimpan')

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-nb-bg flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-8 w-full max-w-md">
        <h1 className="text-2xl font-extrabold mb-2">
          Selamat datang di SiFinEr! 👋
        </h1>
        <p className="text-sm text-nb-text-secondary mb-6">
          Catat pemasukan dan pengeluaranmu dengan mudah. Mulai dengan memasukkan saldo awalmu.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-nb-bg border-2 border-black p-4">
            <p className="text-xs font-bold uppercase tracking-wider mb-1">
              Tips
            </p>
            <p className="text-sm text-nb-text-secondary">
              Saldo awal adalah uang yang kamu miliki saat ini. Ini akan menjadi dasar perhitungan saldo di dashboard.
            </p>
          </div>

          <Input
            label="Saldo Awal"
            type="text"
            inputMode="numeric"
            placeholder="Rp 0"
            value={initialBalance}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '')
              setInitialBalance(val ? `Rp ${Number(val).toLocaleString('id-ID')}` : '')
            }}
          />

          {error && (
            <p className="text-sm text-nb-expense-dark font-medium">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="full"
            disabled={loading || !initialBalance}
          >
            {loading ? 'Menyimpan...' : 'Mulai Catat Keuangan!'}
          </Button>

          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full text-sm text-nb-text-secondary underline hover:text-black transition-colors"
          >
            Lewati (isi nanti di Settings)
          </button>
        </form>
      </div>
    </div>
  )
}
