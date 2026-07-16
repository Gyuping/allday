'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCalendarStore } from '@/store/calendarStore'
import { useTodoStore } from '@/store/todoStore'
import { useColorLabelStore } from '@/store/colorLabelStore'
import { usePomodoroStore, DEFAULT_SETTINGS } from '@/store/pomodoroStore'
import { subscribeCalendar } from '@/lib/firestore/calendar'
import { subscribeTodos } from '@/lib/firestore/todos'
import { useEventReminders } from '@/hooks/useEventReminders'
import { toast } from '@/store/toastStore'

export default function Providers({ children }: { children: React.ReactNode }) {
  useEventReminders()

  const { user } = useAuth()
  const { setUserId: setCalendarUserId, setEvents, setLoading: setCalendarLoading } = useCalendarStore()
  const { setUserId: setTodoUserId, setTodos, setLoading: setTodoLoading } = useTodoStore()

  // 이전 사용자 UID 추적 — 계정이 바뀌면 로컬 전용 스토어를 초기화해 계정 간 데이터 혼합 방지
  const prevUidRef = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    const uid = user?.uid ?? null
    const prev = prevUidRef.current
    prevUidRef.current = uid

    if (prev !== undefined && prev !== null && prev !== uid) {
      // 이전 계정이 있었는데 다른 계정(또는 로그아웃)으로 바뀐 경우 — localStorage 제거 및 메모리 리셋
      try { localStorage.removeItem('allday-color-labels') } catch { /* 무시 */ }
      try { localStorage.removeItem('allday-pomodoro') }    catch { /* 무시 */ }
      useColorLabelStore.setState({ labels: {} })
      usePomodoroStore.setState({
        settings:    DEFAULT_SETTINGS,
        sessionCount: 0,
        isRunning:   false,
        phase:       'work',
        secondsLeft: DEFAULT_SETTINGS.workMinutes * 60,
      })
    }

    if (!user) {
      setCalendarUserId(null)
      setTodoUserId(null)
      setEvents([])
      setTodos([])
      setCalendarLoading(false)
      setTodoLoading(false)
      return
    }

    setCalendarUserId(user.uid)
    setTodoUserId(user.uid)

    // Firestore 구독 실패 시 로딩 해제 — 안 하면 isLoading이 영원히 true
    const unsubCalendar = subscribeCalendar(
      user.uid,
      setEvents,
      (e) => { console.error('[calendar]', e); setCalendarLoading(false); toast.error('캘린더를 불러오지 못했어요.') }
    )
    const unsubTodos = subscribeTodos(
      user.uid,
      setTodos,
      (e) => { console.error('[todos]', e); setTodoLoading(false); toast.error('할일을 불러오지 못했어요.') }
    )

    return () => {
      // 각각 try-catch로 감싸 하나가 실패해도 나머지가 실행되도록 보장
      try { unsubCalendar() } catch { /* 무시 */ }
      try { unsubTodos() }    catch { /* 무시 */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return <>{children}</>
}
