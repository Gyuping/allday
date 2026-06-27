// Firestore 캘린더 이벤트 CRUD
// 경로: users/{userId}/calendar/{eventId}
import {
  collection, doc, onSnapshot,
  setDoc, updateDoc, deleteDoc, deleteField, FieldValue,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CalendarEvent } from '@/types'

const col = (userId: string) => collection(db, 'users', userId, 'calendar')
const ref = (userId: string, id: string) => doc(db, 'users', userId, 'calendar', id)

// error 콜백 추가 — 권한 오류 등 Firestore 에러를 호출자가 처리할 수 있도록
export function subscribeCalendar(
  userId: string,
  callback: (events: CalendarEvent[]) => void,
  onError?: (e: Error) => void
) {
  return onSnapshot(
    col(userId),
    (snap) => {
      const events = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarEvent))
      callback(events)
    },
    (e) => {
      console.error('[subscribeCalendar]', e)
      onError?.(e)
    }
  )
}

// setDoc용: undefined 필드는 아예 제외 (deleteField은 updateDoc에서만 유효)
function cleanForSet(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))
}

// updateDoc용: undefined 필드는 deleteField()로 명시적 삭제
function cleanForUpdate(obj: Record<string, unknown>): Record<string, unknown | FieldValue> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === undefined ? deleteField() : v])
  )
}

export const addCalendarEvent = (userId: string, event: CalendarEvent) => {
  const { id, ...rest } = event
  return setDoc(ref(userId, id), cleanForSet(rest as Record<string, unknown>))
}

export const updateCalendarEvent = (userId: string, id: string, data: Partial<CalendarEvent>) =>
  updateDoc(ref(userId, id), cleanForUpdate(data as Record<string, unknown>))

export const deleteCalendarEvent = (userId: string, id: string) =>
  deleteDoc(ref(userId, id))
