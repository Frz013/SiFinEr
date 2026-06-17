'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSyncStatus } from './useSyncStatus'
import type { Transaction, TransactionWithCategory, CreateTransactionInput } from '@/types'

export function useTransactions() {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setSaving, setSaved, setError: setSyncError } = useSyncStatus()

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/transactions')
      if (!res.ok) throw new Error('Failed to fetch transactions')
      const data = await res.json()
      setTransactions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = useCallback(async (input: CreateTransactionInput) => {
    const tempId = -(Date.now())
    const optimisticItem: TransactionWithCategory = {
      id: tempId,
      userId: '',
      amount: input.amount,
      type: input.type,
      categoryId: input.categoryId,
      description: input.description ?? null,
      date: input.date,
      createdAt: Date.now(),
      categoryName: null,
      categoryColor: null,
    }

    setTransactions(prev => [optimisticItem, ...prev])
    setSaving()

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to create transaction')
      const saved = await res.json()
      setTransactions(prev =>
        prev.map(t => t.id === tempId ? saved : t)
      )
      setSaved()
      return saved
    } catch (err) {
      setTransactions(prev => prev.filter(t => t.id !== tempId))
      setSyncError()
      throw err
    }
  }, [setSaving, setSaved, setSyncError])

  const updateTransaction = useCallback(async (id: number, input: Partial<CreateTransactionInput>) => {
    const original = transactions.find(t => t.id === id)
    if (original) {
      setTransactions(list => list.map(t => t.id === id ? { ...t, ...input } : t))
    }

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to update transaction')
    } catch (err) {
      if (original) {
        setTransactions(list => list.map(t => t.id === id ? original : t))
      }
      throw err
    }
  }, [transactions])

  const deleteTransaction = useCallback(async (id: number) => {
    const original = transactions.find(t => t.id === id)
    setTransactions(list => list.filter(t => t.id !== id))

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete transaction')
    } catch (err) {
      if (original) {
        setTransactions(list => [...list, original].sort((a, b) => b.date - a.date))
      }
      throw err
    }
  }, [transactions])

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refresh: fetchTransactions,
  }
}
