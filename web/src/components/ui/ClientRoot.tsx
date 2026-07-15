'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import AppShell from '@/components/ui/AppShell'

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  )
}
