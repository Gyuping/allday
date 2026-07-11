'use client'

import {
  collection, doc, onSnapshot,
  setDoc, updateDoc, deleteDoc, writeBatch, deleteField, FieldValue,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Todo } from '@/types'

const col = (userId: string) => collection(db, 'users', userId, 'todos')
const ref = (userId: string, id: string) => doc(db, 'users', userId, 'todos', id)

export function subscribeTodos(
  userId: string,
  callback: (todos: Todo[]) => void,
  onError?: (e: Error) => void
) {
  return onSnapshot(
    col(userId),
    (snap) => {
      const todos = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Todo))
      callback(todos)
    },
    (e) => {
      console.error('[subscribeTodos]', e)
      onError?.(e)
    }
  )
}

function cleanForSet(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))
}

function cleanForUpdate(obj: Record<string, unknown>): Record<string, unknown | FieldValue> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === undefined ? deleteField() : v])
  )
}

export const addTodo = (userId: string, todo: Todo) => {
  const { id, ...rest } = todo
  return setDoc(ref(userId, id), cleanForSet(rest as Record<string, unknown>))
}

export const updateTodo = (userId: string, id: string, data: Partial<Todo>) =>
  updateDoc(ref(userId, id), cleanForUpdate(data as Record<string, unknown>))

export const deleteTodo = (userId: string, id: string) =>
  deleteDoc(ref(userId, id))

export async function clearAllTodos(userId: string, ids: string[]) {
  if (ids.length === 0) return
  // Firestore writeBatch 한도 500개 → 청크 분할
  for (let i = 0; i < ids.length; i += 500) {
    const batch = writeBatch(db)
    ids.slice(i, i + 500).forEach((id) => batch.delete(ref(userId, id)))
    await batch.commit()
  }
}
