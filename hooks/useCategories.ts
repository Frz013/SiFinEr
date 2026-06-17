'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Category, CreateCategoryInput } from '@/types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const addCategory = useCallback(async (input: CreateCategoryInput) => {
    const tempId = -(Date.now())
    const optimisticCategory: Category = {
      id: tempId,
      userId: '',
      ...input,
    }

    setCategories(prev => [optimisticCategory, ...prev])

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to create category')
      const saved = await res.json()
      setCategories(prev =>
        prev.map(c => c.id === tempId ? saved : c)
      )
      return saved
    } catch (err) {
      setCategories(prev => prev.filter(c => c.id !== tempId))
      throw err
    }
  }, [])

  const updateCategory = useCallback(async (id: number, input: Partial<CreateCategoryInput>) => {
    const original = categories.find(c => c.id === id)
    if (original) {
      setCategories(list => list.map(c => c.id === id ? { ...c, ...input } : c))
    }

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to update category')
    } catch (err) {
      if (original) {
        setCategories(list => list.map(c => c.id === id ? original : c))
      }
      throw err
    }
  }, [categories])

  const deleteCategory = useCallback(async (id: number) => {
    const original = categories.find(c => c.id === id)
    setCategories(list => list.filter(c => c.id !== id))

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete category')
    } catch (err) {
      if (original) {
        setCategories(list => [...list, original].sort((a, b) => b.id - a.id))
      }
      throw err
    }
  }, [categories])

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refresh: fetchCategories,
  }
}
