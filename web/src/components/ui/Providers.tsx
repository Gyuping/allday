'use client'

import { useEventReminders } from '@/hooks/useEventReminders'

export default function Providers({ children }: { children: React.ReactNode }) {
  useEventReminders()
  return <>{children}</>
}
