import type { Metadata } from 'next'
import { Geist, Space_Grotesk } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/ui/Sidebar'
import BottomTabBar from '@/components/ui/BottomTabBar'
import Providers from '@/components/ui/Providers'

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
        <Providers>
          <Sidebar />
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            {children}
          </main>
          <BottomTabBar />
        </Providers>
      </body>
    </html>
  )
}
