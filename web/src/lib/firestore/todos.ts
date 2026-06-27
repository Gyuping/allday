// Firestore 할일 CRUD
// 경로: users/{userId}/todos/{todoId}
import {
  collection, doc, onSnapshot,
  setDoc, updateDoc, deleteDoc, writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Todo } from '@/types'

const col = (userId: string) => collection(db, 'users', userId, 'todos')
const ref = (userId: string, id: string) => doc(db, 'users', userId, 'todos', id)

export function subscribeTodos(userId: string, callback: (todos: Todo[]) => void) {
  return onSnapshot(col(userId), (snap) => {
    const todos = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Todo))
    callback(todos)
  })
}

const clean = (obj: object) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))

export const addTodo    = (userId: string, todo: Todo) =>
  setDoc(ref(userId, todo.id), clean(todo))

export const updateTodo = (userId: string, id: string, data: Partial<Todo>) =>
  updateDoc(ref(userId, id), clean(data) as Record<string, unknown>)

export const deleteTodo = (userId: string, id: string) =>
  deleteDoc(ref(userId, id))

// 전체 삭제 — batch로 한 번에 처리
export async function clearAllTodos(userId: string, ids: string[]) {
  const batch = writeBatch(db)
  ids.forEach((id) => batch.delete(ref(userId, id)))
  await batch.commit()
}
