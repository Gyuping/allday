// 앱 전체 레이아웃 — 모든 페이지를 감싸는 루트 컴포넌트
import type { Metadata } from 'next'
import { Geist, Space_Grotesk } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/ui/Sidebar'
import BottomTabBar from '@/components/ui/BottomTabBar'
import Providers from '@/components/ui/Providers'
import { AuthProvider } from '@/contexts/AuthContext'
import AppShell from '@/components/ui/AppShell'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-logo',
  weight: ['700'],
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
