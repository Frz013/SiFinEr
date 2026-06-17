'use client'

import { useState, useCallback } from 'react'

export type SyncStatus = 'saved' | 'saving' | 'error'

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>('saved')

  const setSaving = useCallback(() => {
    setStatus('saving')
  }, [])

  const setSaved = useCallback(() => {
    setStatus('saved')
  }, [])

  const setError = useCallback(() => {
    setStatus('error')
  }, [])

  return { status, setSaving, setSaved, setError }
}
