import {
  collection, doc, onSnapshot,
  setDoc, updateDoc, deleteDoc, writeBatch, deleteField,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Todo } from '@/types'

const col = (uid: string) => collection(db, 'users', uid, 'todos')
const ref = (uid: string, id: string) => doc(db, 'users', uid, 'todos', id)

function cleanForSet(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))
}

function cleanForUpdate(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === undefined ? deleteField() : v])
  )
}

export function subscribeTodos(
  uid: string,
  callback: (todos: Todo[]) => void,
  onError?: (e: Error) => void
) {
  return onSnapshot(
    col(uid),
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Todo)))
    },
    (e) => { console.error('[subscribeTodos]', e); onError?.(e) }
  )
}

export const addTodo = (uid: string, todo: Todo) => {
  const { id, ...rest } = todo
  return setDoc(ref(uid, id), cleanForSet(rest as Record<string, unknown>))
}

export const updateTodo = (uid: string, id: string, data: Partial<Todo>) =>
  updateDoc(ref(uid, id), cleanForUpdate(data as Record<string, unknown>))

export const deleteTodo = (uid: string, id: string) =>
  deleteDoc(ref(uid, id))

export async function clearAllTodos(uid: string, ids: string[]) {
  if (ids.length === 0) return
  for (let i = 0; i < ids.length; i += 500) {
    const batch = writeBatch(db)
    ids.slice(i, i + 500).forEach((id) => batch.delete(ref(uid, id)))
    await batch.commit()
  }
}
