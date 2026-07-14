'use client'

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore'

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
  _db   = getFirestore(_app)

  // E2E 테스트 환경에서 Firebase Emulator에 연결
  // HMR 재평가 시 중복 연결 방지를 위해 window 플래그 사용
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    const w = window as typeof window & { __fbEmuConnected?: boolean }
    if (!w.__fbEmuConnected) {
      w.__fbEmuConnected = true
      connectAuthEmulator(_auth, 'http://127.0.0.1:9099', { disableWarnings: true })
      connectFirestoreEmulator(_db, '127.0.0.1', 8080)
    }
  }
}

export const auth = _auth!
export const db   = _db!
