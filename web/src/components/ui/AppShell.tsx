'use client'

// 로그인 여부에 따라 앱 본체 또는 로그인 화면을 보여주는 셸
import { useAuth } from '@/contexts/AuthContext'
import LoginScreen from './LoginScreen'
import Providers from './Providers'
import Sidebar from './Sidebar'
import BottomTabBar from './BottomTabBar'
import ToastContainer from './Toast'
import ErrorBoundary from './ErrorBoundary'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-neutral-950">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <LoginScreen />

  return (
    <Providers>
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {/* 페이지 내부 에러를 잡아 흰 화면 방지 */}
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <BottomTabBar />
      <ToastContainer />
    </Providers>
  )
}
