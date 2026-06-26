'use client'

// 로그인 여부에 따라 앱 본체 또는 로그인 화면을 보여주는 셸
import { useAuth } from '@/contexts/AuthContext'
import LoginScreen from './LoginScreen'
import Providers from './Providers'
import Sidebar from './Sidebar'
import BottomTabBar from './BottomTabBar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  // 로그인 상태 확인 중 — 빈 화면 (깜빡임 방지)
  if (loading) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-neutral-950">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    )
  }

  // 비로그인 상태 — 로그인 화면
  if (!user) return <LoginScreen />

  // 로그인 상태 — 앱 본체
  return (
    <Providers>
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
      <BottomTabBar />
    </Providers>
  )
}
