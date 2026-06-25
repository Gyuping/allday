'use client'

// 앱 전체에 걸쳐 한 번만 실행해야 하는 전역 사이드이펙트를 모아둔 컴포넌트
// layout.tsx에서 최상위에 감싸져 있어 앱이 켜질 때 딱 한 번 마운트된다.
import { useEffect } from 'react'
import { useEventReminders } from '@/hooks/useEventReminders'
import { useTodoStore } from '@/store/todoStore'

export default function Providers({ children }: { children: React.ReactNode }) {
  // 30초마다 일정 알림 시간을 체크 (훅 내부에서 interval 설정)
  useEventReminders()

  const resetExpiredCompleted = useTodoStore((s) => s.resetExpiredCompleted)

  // 앱이 처음 켜질 때 하루 지난 완료 항목을 미완료로 되돌린다.
  useEffect(() => {
    resetExpiredCompleted()
  }, [resetExpiredCompleted])

  return <>{children}</>
}
