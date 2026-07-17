'use client'

import { create } from 'zustand'
import type { Category } from '@/lib/categories'
import {
  addCategory as firestoreAdd,
  updateCategory as firestoreUpdate,
  deleteCategoryWithMigration,
} from '@/lib/firestore/categories'
import { toast } from '@/store/toastStore'

type CategoryStore = {
  categories: Category[]
  userId: string | null
  isLoading: boolean
  fetchError: boolean
  retryToken: number

  setUserId: (id: string | null) => void
  setCategories: (cats: Category[]) => void
  setLoading: (v: boolean) => void
  setFetchError: (v: boolean) => void
  setSubscriptionFailed: () => void
  requestRetry: () => void

  addCategory: (cat: Category) => void
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => void
  deleteCategory: (id: string, targetId: string) => void
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  userId: null,
  isLoading: true,
  fetchError: false,
  retryToken: 0,

  setUserId: (id) => set({ userId: id }),
  setCategories: (categories) => set({ categories, isLoading: false, fetchError: false }),
  setLoading: (v) => set({ isLoading: v }),
  setFetchError: (v) => set({ fetchError: v }),
  setSubscriptionFailed: () => set({ isLoading: false, fetchError: true }),
  requestRetry: () => set((s) => ({ isLoading: true, fetchError: false, retryToken: s.retryToken + 1 })),

  addCategory: (cat) => {
    const { userId } = get()
    if (!userId) return
    set((s) => ({ categories: [...s.categories, cat] }))
    firestoreAdd(userId, cat).catch(() => {
      set((s) => ({ categories: s.categories.filter((c) => c.id !== cat.id) }))
      toast.error('카테고리 저장에 실패했어요.')
    })
  },

  updateCategory: (id, data) => {
    const { userId, categories } = get()
    if (!userId) return
    const prev = categories.find((c) => c.id === id)
    if (!prev) return
    set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)) }))
    firestoreUpdate(userId, id, data).catch(() => {
      set((s) => ({ categories: s.categories.map((c) => (c.id === id ? prev : c)) }))
      toast.error('카테고리 수정에 실패했어요.')
    })
  },

  deleteCategory: (id, targetId) => {
    const { userId, categories } = get()
    if (!userId || categories.length <= 1) return
    const prev = categories.find((c) => c.id === id)
    if (!prev) return
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }))
    deleteCategoryWithMigration(userId, id, targetId).catch(() => {
      set((s) => ({ categories: [...s.categories, prev] }))
      toast.error('카테고리 삭제에 실패했어요.')
    })
  },
}))
