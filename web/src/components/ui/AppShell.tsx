'use client'

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
