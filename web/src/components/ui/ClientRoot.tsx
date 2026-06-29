'use client'

// Firebase를 사용하는 모든 코드를 감싸는 클라이언트 전용 컴포넌트
// layout.tsx에서 ssr: false로 dynamic import해 서버 번들에서 완전히 제외
import { AuthProvider } from '@/contexts/AuthContext'
import AppShell from '@/components/ui/AppShell'

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  )
}
