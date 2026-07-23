'use client'

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'
import {
  getFirestore, initializeFirestore,
  persistentLocalCache, persistentSingleTabManager, memoryLocalCache,
  connectFirestoreEmulator, type Firestore,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY    ?? '',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID  ?? '',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET      ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
}

let _app: FirebaseApp | undefined
let _auth: Auth | undefined
let _db: Firestore | undefined

if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
  _app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  _auth = getAuth(_app)

  const isEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
  if (isEmulator) {
    // 에뮬레이터 환경에서는 IndexedDB 캐시 없이 기본 Firestore 사용
    _db = getFirestore(_app)
  } else {
    // Safari: IndexedDB 멀티탭 잠금에서 hang이 빈번 → 메모리 캐시(IndexedDB 미사용)
    // 그 외: 단일탭 IndexedDB 캐시 — 크로스탭 잠금 없이 오프라인 지원
    // (persistentMultipleTabManager → persistentSingleTabManager로 변경: 락 경쟁 제거)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome|Chromium/.test(navigator.userAgent)

    // HMR 재평가 시 initializeFirestore 중복 호출 방지 — 이미 초기화됐으면 getFirestore로 fallback
    try {
      _db = initializeFirestore(_app, {
        localCache: isSafari
          ? memoryLocalCache()
          : persistentLocalCache({ tabManager: persistentSingleTabManager({}) }),
      })
    } catch {
      _db = getFirestore(_app)
    }
  }

  // E2E 테스트 환경에서 Firebase Emulator에 연결
  // HMR 재평가 시 중복 연결 방지를 위해 window 플래그 사용
  if (isEmulator) {
    const w = window as typeof window & { __fbEmuConnected?: boolean }
    if (!w.__fbEmuConnected) {
      w.__fbEmuConnected = true
      connectAuthEmulator(_auth, 'http://127.0.0.1:9099', { disableWarnings: true })
      connectFirestoreEmulator(_db, '127.0.0.1', 8080)
    }
  }
}

// 클라이언트 전용 — 모든 호출부에서 if (!auth) / if (!db) 가드 필수
export const auth = _auth!
export const db   = _db!
