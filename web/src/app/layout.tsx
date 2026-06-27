// 앱 전체 레이아웃 — 모든 페이지를 감싸는 루트 컴포넌트
import type { Metadata } from 'next'
import { Geist, Space_Grotesk } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/ui/Sidebar'
import BottomTabBar from '@/components/ui/BottomTabBar'
import Providers from '@/components/ui/Providers'
import { AuthProvider } from '@/contexts/AuthContext'
import AppShell from '@/components/ui/AppShell'

// fallback: 폰트 로드 실패 시(Windows 네트워크 오류 등) 시스템 폰트로 대체
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-logo',
  weight: ['400', '600', '700'],  // 다양한 굵기 — Mac/Windows 렌더링 차이 완화
  fallback: ['Segoe UI', 'system-ui', 'sans-serif'],
})

export const metadata: Metadata = {
  title: 'AllDay',
  description: '캘린더, 할 일, 뽀모도로 타이머를 한 곳에',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geist.variable} ${spaceGrotesk.variable}`}>
      <body className="flex min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
