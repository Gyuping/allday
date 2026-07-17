'use client'

import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore'
import {
  deleteUser, reauthenticateWithPopup, GoogleAuthProvider,
  type User,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { db } from '@/lib/firebase'
import { useColorLabelStore } from '@/store/colorLabelStore'
import { usePomodoroStore, DEFAULT_SETTINGS } from '@/store/pomodoroStore'

const CHUNK = 500

async function deleteCollection(uid: string, name: string) {
  const snap = await getDocs(collection(db, 'users', uid, name))
  if (snap.empty) return
  for (let i = 0; i < snap.docs.length; i += CHUNK) {
    const batch = writeBatch(db)
    snap.docs.slice(i, i + CHUNK).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
}

export async function deleteFirestoreData(uid: string) {
  await deleteCollection(uid, 'calendar')
  await deleteCollection(uid, 'todos')
  await deleteCollection(uid, 'categories')
  // 상위 문서가 존재하면 삭제 (없으면 무해)
  await deleteDoc(doc(db, 'users', uid))
}

export function deleteLocalStorage(uid: string) {
  ;[
    `allday-color-labels:${uid}`,
    `allday-pomodoro:${uid}`,
    'allday-color-labels',
    'allday-pomodoro',
    'allay-pomodoro',
  ].forEach((key) => {
    try { localStorage.removeItem(key) } catch { /* ignore */ }
  })

  // localStorage 삭제만으로는 현재 페이지 세션의 Zustand 인메모리 상태가 유지됨
  // → 재로그인 후 이전 데이터가 화면에 남는 문제 방지를 위해 인메모리도 초기화
  try { useColorLabelStore.setState({ labels: {} }) } catch { /* ignore */ }
  try {
    usePomodoroStore.setState({
      settings: DEFAULT_SETTINGS,
      sessionCount: 0,
      phase: 'work',
      isRunning: false,
      secondsLeft: DEFAULT_SETTINGS.workMinutes * 60,
    })
  } catch { /* ignore */ }
}

// reauthenticateWithPopup은 다른 계정 선택 시 auth/user-mismatch를 자체 발생시키나
// uid 비교로 이중 검증
export async function reauthenticateGoogle(user: User): Promise<void> {
  const result = await reauthenticateWithPopup(user, new GoogleAuthProvider())
  if (result.user.uid !== user.uid) {
    throw new FirebaseError('auth/user-mismatch', '다른 Google 계정을 선택하셨어요.')
  }
}

export const deleteAuthAccount = (user: User) => deleteUser(user)
