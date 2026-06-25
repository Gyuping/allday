// 앱 전체 레이아웃 — 모든 페이지를 감싸는 루트 컴포넌트
// Sidebar(데스크톱 좌측), BottomTabBar(모바일 하단), Providers(전역 훅)를 배치한다.
import type { Metadata } from 'next'
import { Geist, Space_Grotesk } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/ui/Sidebar'
import BottomTabBar from '@/components/ui/BottomTabBar'
import Providers from '@/components/ui/Providers'

// 본문 폰트
const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

// 로고(MyAll~Day)에 사용하는 폰트
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
        <Providers>
          <Sidebar />
          {/* pb-16: 모바일에서 하단탭 높이만큼 여백, md 이상에서는 제거 */}
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            {children}
          </main>
          <BottomTabBar />
        </Providers>
      </body>
    </html>
  )
}
