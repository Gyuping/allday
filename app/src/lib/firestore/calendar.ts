import {
  collection, doc, onSnapshot,
  setDoc, updateDoc, deleteDoc, deleteField,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CalendarEvent } from '@/types'

const col = (uid: string) => collection(db, 'users', uid, 'calendar')
const ref = (uid: string, id: string) => doc(db, 'users', uid, 'calendar', id)

function cleanForSet(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))
}

function cleanForUpdate(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === undefined ? deleteField() : v])
  )
}

export function subscribeCalendar(
  uid: string,
  callback: (events: CalendarEvent[]) => void,
  onError?: (e: Error) => void
) {
  return onSnapshot(
    col(uid),
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEvent)))
    },
    (e) => { console.error('[subscribeCalendar]', e); onError?.(e) }
  )
}

export const addCalendarEvent = (uid: string, event: CalendarEvent) => {
  const { id, ...rest } = event
  return setDoc(ref(uid, id), cleanForSet(rest as Record<string, unknown>))
}

export const updateCalendarEvent = (uid: string, id: string, data: Partial<CalendarEvent>) =>
  updateDoc(ref(uid, id), cleanForUpdate(data as Record<string, unknown>))

export const deleteCalendarEvent = (uid: string, id: string) =>
  deleteDoc(ref(uid, id))
