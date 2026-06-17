'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [currency, setCurrency] = useState('IDR')
  const [initialBalance, setInitialBalance] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const handleSave = async () => {
    setSaveLoading(true)
    setSaveMsg(null)
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency,
          initialBalance: Number(initialBalance.replace(/[^0-9]/g, '')) || undefined,
        }),
      })
      if (!res.ok) throw new Error('Gagal')
      setSaveMsg('Tersimpan ✓')
      setTimeout(() => setSaveMsg(null), 3000)
    } catch {
      setSaveMsg('Gagal menyimpan')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-extrabold">Settings</h1>

      {/* Profile */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          {session?.user?.image ? (
            <img src={session.user.image} alt="" className="w-12 h-12 border-2 border-black" />
          ) : (
            <div className="w-12 h-12 bg-nb-primary border-2 border-black flex items-center justify-center font-bold">
              {session?.user?.name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <p className="font-bold">{session?.user?.name}</p>
            <p className="text-sm text-nb-text-secondary">{session?.user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <h3 className="font-bold mb-4">Preferensi</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Mata Uang</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full border-2 border-black bg-white px-3 py-2 text-base shadow-[3px_3px_0px_#000] min-h-[44px]"
            >
              <option value="IDR">IDR — Rupiah Indonesia</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="SGD">SGD — Singapore Dollar</option>
            </select>
          </div>

          <Input
            label="Edit Saldo Awal"
            type="text"
            inputMode="numeric"
            placeholder="Masukkan saldo awal baru"
            value={initialBalance}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '')
              setInitialBalance(val ? `Rp ${Number(val).toLocaleString('id-ID')}` : '')
            }}
          />

          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saveLoading}>
              {saveLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
            {saveMsg && <span className="text-sm font-medium">{saveMsg}</span>}
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-nb-expense!">
        <h3 className="font-bold mb-2 text-nb-expense-dark">Zona Berbahaya</h3>
        <p className="text-sm text-nb-text-secondary mb-4">
          Tindakan di bawah ini tidak dapat dibatalkan.
        </p>
        <div className="space-y-2">
          <Button variant="danger" size="sm">
            Hapus Semua Transaksi
          </Button>
          <Button variant="danger" size="sm">
            Hapus Akun & Semua Data
          </Button>
        </div>
      </Card>
    </div>
  )
}
