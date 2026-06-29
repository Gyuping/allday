'use client'

import {
  collection, doc, onSnapshot,
  setDoc, updateDoc, deleteDoc, deleteField, FieldValue,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CalendarEvent } from '@/types'

const col = (userId: string) => collection(db, 'users', userId, 'calendar')
const ref = (userId: string, id: string) => doc(db, 'users', userId, 'calendar', id)

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

function cleanForSet(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))
}

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
