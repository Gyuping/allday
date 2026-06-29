// 앱 전체 레이아웃
// Firebase를 사용하는 ClientRoot는 ssr: false로 서버 번들에서 완전히 제외
import type { Metadata } from 'next'
import { Geist, Space_Grotesk } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-logo',
  weight: ['400', '600', '700'],
  fallback: ['Segoe UI', 'system-ui', 'sans-serif'],
})

// ssr: false — Firebase 전체가 서버 번들에서 제외됨
const ClientRoot = dynamic(() => import('@/components/ui/ClientRoot'), { ssr: false })

export const metadata: Metadata = {
  title: 'AllDay',
  description: '캘린더, 할 일, 뽀모도로 타이머를 한 곳에',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geist.variable} ${spaceGrotesk.variable}`}>
      <body className="flex min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  )
}
