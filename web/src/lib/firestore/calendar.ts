// Firestore 캘린더 이벤트 CRUD
// 경로: users/{userId}/calendar/{eventId}
import {
  collection, doc, onSnapshot,
  setDoc, updateDoc, deleteDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CalendarEvent } from '@/types'

const col = (userId: string) => collection(db, 'users', userId, 'calendar')
const ref = (userId: string, id: string) => doc(db, 'users', userId, 'calendar', id)

// 실시간 구독 — 변경될 때마다 callback 호출
export function subscribeCalendar(userId: string, callback: (events: CalendarEvent[]) => void) {
  return onSnapshot(col(userId), (snap) => {
    const events = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEvent))
    callback(events)
  })
}

export const addCalendarEvent    = (userId: string, event: CalendarEvent) =>
  setDoc(ref(userId, event.id), event)

export const updateCalendarEvent = (userId: string, id: string, data: Partial<CalendarEvent>) =>
  updateDoc(ref(userId, id), data as Record<string, unknown>)

export const deleteCalendarEvent = (userId: string, id: string) =>
  deleteDoc(ref(userId, id))
