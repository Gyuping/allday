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
    if (!auth) { setLoading(false); return }

    // 리다이렉트 로그인 완료 처리 (Safari/아이패드 팝업 차단 시)
    getRedirectResult(auth).catch(() => {})

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    if (!auth) { alert('Firebase가 초기화되지 않았습니다. 환경변수를 확인해주세요.'); return }
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (e) {
      if (!(e instanceof FirebaseError)) throw e
      if (e.code === 'auth/cancelled-popup-request' || e.code === 'auth/popup-closed-by-user') return
      // 팝업 차단 시 리다이렉트 방식으로 전환
      if (e.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider)
        return
      }
      throw e
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
