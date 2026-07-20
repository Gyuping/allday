import { initializeApp, getApps, getApp } from 'firebase/app'
import { initializeAuth, getAuth, type Auth } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            'AIzaSyCXIWcG5wdpxFkdDWDHgix1aHKRRqR2HNw',
  authDomain:        'allday-ec1a9.firebaseapp.com',
  projectId:         'allday-ec1a9',
  storageBucket:     'allday-ec1a9.firebasestorage.app',
  messagingSenderId: '908860944655',
  appId:             '1:908860944655:web:5c3a6c35b28433f1cb0e7a',
}

// getReactNativePersistence: TS6 브라우저 타입에 없음, Metro RN 번들엔 있음
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getReactNativePersistence } = require('firebase/auth') as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => unknown
}

let auth: Auth

if (getApps().length === 0) {
  const app = initializeApp(firebaseConfig)
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage) as never,
  })
} else {
  auth = getAuth(getApp())
}

const app = getApps()[0]
export { auth }
export const db = getFirestore(app)
