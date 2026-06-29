// Firebase 초기화 — 클라이언트에서만 실행 (SSR 빌드 시 절대 실행 안 됨)
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY    ?? '',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID  ?? '',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET      ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
}

// 서버(SSR/빌드)에서는 초기화 건너뜀 — 클라이언트에서만 Firebase 사용
let _app: FirebaseApp | undefined
let _auth: Auth | undefined
let _db: Firestore | undefined

if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
  _app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  _auth = getAuth(_app)
  _db   = getFirestore(_app)
}

// 'use client' 컴포넌트에서만 사용되므로 런타임에 항상 초기화됨
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const auth = _auth!
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const db   = _db!
