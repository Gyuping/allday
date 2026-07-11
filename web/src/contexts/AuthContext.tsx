'use client'

// 로그인 상태를 앱 전체에 공유하는 컨텍스트
// useAuth() 훅으로 어디서든 현재 유저 정보를 가져올 수 있다.
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, GoogleAuthProvider, User } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth } from '@/lib/firebase'

type AuthContextType = {
  user: User | null       // 로그인한 유저 (null이면 비로그인)
  loading: boolean        // 로그인 상태 확인 중
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!auth) { setLoading(false); return }

    let unsubscribe: (() => void) | undefined

    // getRedirectResult 완료 후 onAuthStateChanged 구독
    // — 먼저 구독하면 리다이렉트 결과 처리 전에 user:null이 와서 로그인 화면이 깜빡임
    getRedirectResult(auth)
      .then((result) => { if (result?.user) setUser(result.user) })
      .catch(() => {})
      .finally(() => {
        unsubscribe = onAuthStateChanged(auth, (u) => {
          setUser(u)
          setLoading(false)
        })
      })

    return () => { unsubscribe?.() }
  }, [])

  const signInWithGoogle = async () => {
    if (!auth) { alert('Firebase 초기화 실패'); return }
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
      alert('로그인 오류: ' + e.message)
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 컴포넌트에서 로그인 정보를 쓸 때 이 훅을 호출한다
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
