'use client'

import { useState } from 'react'
import { Download, Upload, Cloud } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function BackupPage() {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Backup & Import</h1>

      {/* Tab Buttons */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'export' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('export')}
        >
          <Download size={16} className="inline mr-2" />
          Export
        </Button>
        <Button
          variant={activeTab === 'import' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('import')}
        >
          <Upload size={16} className="inline mr-2" />
          Import
        </Button>
      </div>

      {activeTab === 'export' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-bold mb-2">Export ke Google Drive</h3>
            <p className="text-sm text-nb-text-secondary mb-4">
              Simpan backup ke Google Drive kamu.
            </p>
            <Button variant="primary" size="sm">
              <Cloud size={16} className="inline mr-2" />
              Backup ke Drive
            </Button>
          </Card>

          <Card>
            <h3 className="font-bold mb-2">Export ke File Lokal</h3>
            <p className="text-sm text-nb-text-secondary mb-2">
              Download data sebagai file.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm">CSV</Button>
              <Button variant="secondary" size="sm">JSON</Button>
              <Button variant="secondary" size="sm">Excel</Button>
              <Button variant="secondary" size="sm">PDF</Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <h3 className="font-bold mb-2">Import dari Google Drive</h3>
            <p className="text-sm text-nb-text-secondary mb-4">
              Pilih file backup dari Google Drive.
            </p>
            <Button variant="primary" size="sm">
              <Cloud size={16} className="inline mr-2" />
              Pilih dari Drive
            </Button>
          </Card>

          <Card>
            <h3 className="font-bold mb-2">Import dari File Lokal</h3>
            <p className="text-sm text-nb-text-secondary mb-4">
              Upload file CSV atau JSON.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">Upload CSV</Button>
              <Button variant="secondary" size="sm">Upload JSON</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Backup History */}
      <div>
        <h2 className="text-lg font-bold mb-3">Riwayat Backup</h2>
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-8 text-center">
          <p className="text-sm text-nb-text-secondary">Belum ada riwayat backup</p>
        </div>
      </div>

      {/* Auto Backup */}
      <Card>
        <h3 className="font-bold mb-2">Auto Backup Mingguan</h3>
        <p className="text-sm text-nb-text-secondary mb-4">
          Backup otomatis ke Google Drive setiap minggu.
        </p>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-12 h-6 bg-gray-300 border-2 border-black relative transition-colors">
              <div className="w-5 h-5 bg-white border border-black absolute top-0.5 left-0.5 transition-transform" />
            </div>
            <span className="text-sm font-medium">Aktifkan</span>
          </label>
        </div>
      </Card>
    </div>
  )
}
