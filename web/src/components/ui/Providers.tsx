'use client'

// 앱 전체 전역 사이드이펙트 — 로그인 시 Firestore 실시간 구독 시작
import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCalendarStore } from '@/store/calendarStore'
import { useTodoStore } from '@/store/todoStore'
import { subscribeCalendar } from '@/lib/firestore/calendar'
import { subscribeTodos } from '@/lib/firestore/todos'
import { useEventReminders } from '@/hooks/useEventReminders'

export default function Providers({ children }: { children: React.ReactNode }) {
  useEventReminders()

  const { user } = useAuth()
  const { setUserId: setCalendarUserId, setEvents } = useCalendarStore()
  const { setUserId: setTodoUserId, setTodos, resetExpiredCompleted } = useTodoStore()

  useEffect(() => {
    if (!user) {
      // 로그아웃 시 로컬 데이터 초기화
      setCalendarUserId(null)
      setTodoUserId(null)
      setEvents([])
      setTodos([])
      return
    }

    // 로그인 시 userId 설정 + Firestore 실시간 구독 시작
    setCalendarUserId(user.uid)
    setTodoUserId(user.uid)

    const unsubCalendar = subscribeCalendar(user.uid, setEvents)
    const unsubTodos    = subscribeTodos(user.uid, (todos) => {
      setTodos(todos)
    })

    // 앱 시작 시 하루 지난 완료 항목 초기화
    resetExpiredCompleted()

    // 자정이 지나면 자동으로 완료 항목 초기화
    const scheduleReset = () => {
      const now = new Date()
      const msUntilMidnight =
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()
      return setTimeout(() => { resetExpiredCompleted(); scheduleReset() }, msUntilMidnight)
    }
    const timer = scheduleReset()

    return () => {
      unsubCalendar()
      unsubTodos()
      clearTimeout(timer)
    }
  }, [user])

  return <>{children}</>
}
