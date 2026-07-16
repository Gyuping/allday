'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signInWithEmailAndPassword, getRedirectResult, signOut, GoogleAuthProvider, User } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth } from '@/lib/firebase'
import { toast } from '@/store/toastStore'

type AuthContextType = {
  user: User | null
  loading: boolean
  loginError: string | null
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)

  // E2E 테스트 환경에서만 Playwright가 직접 호출할 수 있는 로그인 헬퍼 노출
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR !== 'true' || !auth) return
    window.__testSignIn = (email, pw) =>
      signInWithEmailAndPassword(auth, email, pw).then(() => undefined)
    return () => { delete window.__testSignIn }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!auth) { setLoading(false); return }

    let unsubscribe: (() => void) | undefined

    // getRedirectResult 완료 후 onAuthStateChanged 구독
    // — 먼저 구독하면 리다이렉트 결과 처리 전에 user:null이 와서 로그인 화면이 깜빡임
    getRedirectResult(auth)
      .then((result) => { if (result?.user) setUser(result.user) })
      .catch((e: unknown) => {
        // 사용자가 직접 취소한 경우는 무시, 그 외는 에러 표시
        if (e instanceof FirebaseError && (
          e.code === 'auth/popup-closed-by-user' ||
          e.code === 'auth/cancelled-popup-request'
        )) return
        console.error('[getRedirectResult]', e)
      })
      .finally(() => {
        unsubscribe = onAuthStateChanged(auth, (u) => {
          setUser(u)
          setLoading(false)
        })
      })

    return () => { unsubscribe?.() }
  }, [])

  const signInWithGoogle = async () => {
    if (!auth) { setLoginError('Firebase가 초기화되지 않았어요. 잠시 후 다시 시도해주세요.'); return }
    setLoginError(null)
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (e) {
      if (!(e instanceof FirebaseError)) throw e
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return
      if (e.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider)
        return
      }
      setLoginError('로그인에 실패했어요. 잠시 후 다시 시도해주세요.')
      console.error('[signInWithGoogle]', e)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (e) {
      console.error('[logout]', e)
      toast.error('로그아웃 중 오류가 발생했어요. 다시 시도해주세요.')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginError, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
