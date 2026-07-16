'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer'
import LoginScreen from './LoginScreen'
import Providers from './Providers'
import Sidebar from './Sidebar'
import BottomTabBar from './BottomTabBar'
import ToastContainer from './Toast'
import ErrorBoundary from './ErrorBoundary'
import OfflineIndicator from './OfflineIndicator'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  usePomodoroTimer()

  // 8초 이상 로딩 중이면 에러 안내 표시
  const [loadTimedOut, setLoadTimedOut] = useState(false)
  useEffect(() => {
    if (!loading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadTimedOut(false)
      return
    }
    const id = setTimeout(() => setLoadTimedOut(true), 8000)
    return () => clearTimeout(id)
  }, [loading])

  if (loading) {
    if (loadTimedOut) {
      return (
        <div className="flex w-full min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 text-center p-8">
          <p className="text-neutral-400 text-sm">앱을 불러오지 못했어요.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-xl bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-100 transition-colors"
          >
            다시 시도
          </button>
        </div>
      )
    }
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-neutral-950">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <LoginScreen />

  return (
    <Providers>
      <OfflineIndicator />
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <BottomTabBar />
      <ToastContainer />
    </Providers>
  )
}
