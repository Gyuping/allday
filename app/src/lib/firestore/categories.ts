import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  onSnapshot, getDocs, query, where, writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { DEFAULT_CATEGORIES } from '@/lib/categories'
import type { Category } from '@/lib/categories'

const col = (uid: string) => collection(db, 'users', uid, 'categories')
const ref = (uid: string, id: string) => doc(db, 'users', uid, 'categories', id)

async function seedDefaultCategories(uid: string) {
  const batch = writeBatch(db)
  DEFAULT_CATEGORIES.forEach((cat) => batch.set(ref(uid, cat.id), cat))
  await batch.commit()
}

export function subscribeCategories(
  uid: string,
  callback: (cats: Category[]) => void,
  onError?: (e: Error) => void
) {
  return onSnapshot(
    col(uid),
    async (snap) => {
      if (snap.empty) {
        try { await seedDefaultCategories(uid) } catch (e) { onError?.(e as Error) }
        return
      }
      callback(snap.docs.map((d) => d.data() as Category))
    },
    (e) => { console.error('[subscribeCategories]', e); onError?.(e) }
  )
}

export async function addCategory(uid: string, cat: Category) {
  await setDoc(ref(uid, cat.id), cat)
}

export async function updateCategory(uid: string, id: string, data: Partial<Omit<Category, 'id'>>) {
  await updateDoc(ref(uid, id), data as Record<string, unknown>)
}

export async function getEventCountByCategory(uid: string, catId: string): Promise<number> {
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'calendar'), where('category', '==', catId))
  )
  return snap.size
}

export async function deleteCategoryWithMigration(uid: string, catId: string, targetCatId: string) {
  const evSnap = await getDocs(
    query(collection(db, 'users', uid, 'calendar'), where('category', '==', catId))
  )
  if (!evSnap.empty) {
    const CHUNK = 500
    for (let i = 0; i < evSnap.docs.length; i += CHUNK) {
      const batch = writeBatch(db)
      evSnap.docs.slice(i, i + CHUNK).forEach((d) => batch.update(d.ref, { category: targetCatId }))
      await batch.commit()
    }
  }
  await deleteDoc(ref(uid, catId))
}
