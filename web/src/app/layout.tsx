import type { Metadata } from 'next'
import { Geist, Space_Grotesk } from 'next/font/google'
import './globals.css'
import ClientRoot from '@/components/ui/ClientRoot'

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
