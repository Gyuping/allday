'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCalendarStore } from '@/store/calendarStore'
import { useTodoStore } from '@/store/todoStore'
import { useCategoryStore } from '@/store/categoryStore'
import { useColorLabelStore } from '@/store/colorLabelStore'
import { usePomodoroStore, DEFAULT_SETTINGS } from '@/store/pomodoroStore'
import { subscribeCalendar } from '@/lib/firestore/calendar'
import { subscribeTodos } from '@/lib/firestore/todos'
import { subscribeCategories } from '@/lib/firestore/categories'
import { useEventReminders } from '@/hooks/useEventReminders'

function migrateUnscopedKey(oldKey: string, newKey: string) {
  try {
    if (!localStorage.getItem(newKey) && localStorage.getItem(oldKey)) {
      localStorage.setItem(newKey, localStorage.getItem(oldKey)!)
      localStorage.removeItem(oldKey)
    }
  } catch { /* 무시 */ }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  useEventReminders()

  const { user } = useAuth()
  const {
    setUserId: setCalendarUserId, setEvents,
    setLoading: setCalendarLoading, setFetchError: setCalendarError,
    setSubscriptionFailed: setCalendarFailed,
    retryToken: calRetryToken,
  } = useCalendarStore()
  const {
    setUserId: setTodoUserId, setTodos,
    setLoading: setTodoLoading, setFetchError: setTodoError,
    setSubscriptionFailed: setTodoFailed,
    retryToken: todoRetryToken,
  } = useTodoStore()
  const {
    setUserId: setCategoryUserId, setCategories,
    setLoading: setCategoryLoading, setFetchError: setCategoryError,
    setSubscriptionFailed: setCategoryFailed,
    retryToken: catRetryToken,
  } = useCategoryStore()

  const prevUidRef = useRef<string | null | undefined>(undefined)

  // Effect 1: 인증 상태 변경 처리 (구독 생성은 Effect 2, 3에서)
  useEffect(() => {
    const uid = user?.uid ?? null
    const prev = prevUidRef.current
    prevUidRef.current = uid

    if (!user) {
      if (prev !== undefined && prev !== null) {
        // 로그아웃: 메모리만 초기화 — localStorage는 보존해 재로그인 시 설정 복원
        useColorLabelStore.setState({ labels: {} })
        usePomodoroStore.setState({
          settings:    DEFAULT_SETTINGS,
          sessionCount: 0,
          isRunning:   false,
          phase:       'work',
          secondsLeft: DEFAULT_SETTINGS.workMinutes * 60,
        })
      }
      setCalendarUserId(null)
      setTodoUserId(null)
      setCategoryUserId(null)
      setEvents([])
      setTodos([])
      setCategories([])
      setCalendarLoading(false)
      setTodoLoading(false)
      setCategoryLoading(false)
      setCalendarError(false)
      setTodoError(false)
      setCategoryError(false)
      return
    }

    // UID별 키로 일회성 마이그레이션 (스코프 없는 기존 키 → UID 스코프 키)
    migrateUnscopedKey('allday-color-labels', `allday-color-labels:${uid}`)
    migrateUnscopedKey('allday-pomodoro',     `allday-pomodoro:${uid}`)

    // 이 사용자의 localStorage 공간으로 전환 후 rehydrate
    useColorLabelStore.persist.setOptions({ name: `allday-color-labels:${uid}` })
    useColorLabelStore.persist.rehydrate()

    usePomodoroStore.persist.setOptions({ name: `allday-pomodoro:${uid}` })
    usePomodoroStore.persist.rehydrate()

    setCalendarUserId(user.uid)
    setTodoUserId(user.uid)
    setCategoryUserId(user.uid)
    // 재로그인/계정 전환 시 로딩 상태로 리셋
    setCalendarLoading(true)
    setTodoLoading(true)
    setCategoryLoading(true)
    setCalendarError(false)
    setTodoError(false)
    setCategoryError(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Safari + IndexedDB persistentLocalCache hang 방어:
  // 첫 콜백(성공/에러)이 SUBSCRIPTION_TIMEOUT_MS 내에 안 오면 자동으로 실패 처리
  // → 사용자가 무한 스피너에 갇히는 것을 막고 재시도 UI로 전환
  const SUBSCRIPTION_TIMEOUT_MS = 12_000

  // Effect 2: 캘린더 구독 — user 변경 또는 재시도 토큰 변경 시 재구독
  useEffect(() => {
    if (!user) return
    const tid = setTimeout(() => setCalendarFailed(), SUBSCRIPTION_TIMEOUT_MS)
    const unsub = subscribeCalendar(
      user.uid,
      (events) => { clearTimeout(tid); setEvents(events) },
      (e) => { clearTimeout(tid); console.error('[calendar]', e); setCalendarFailed() }
    )
    return () => { clearTimeout(tid); try { unsub() } catch { /* 무시 */ } }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, calRetryToken])

  // Effect 3: 할일 구독 — user 변경 또는 재시도 토큰 변경 시 재구독
  useEffect(() => {
    if (!user) return
    const tid = setTimeout(() => setTodoFailed(), SUBSCRIPTION_TIMEOUT_MS)
    const unsub = subscribeTodos(
      user.uid,
      (todos) => { clearTimeout(tid); setTodos(todos) },
      (e) => { clearTimeout(tid); console.error('[todos]', e); setTodoFailed() }
    )
    return () => { clearTimeout(tid); try { unsub() } catch { /* 무시 */ } }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, todoRetryToken])

  // Effect 4: 카테고리 구독 — user 변경 또는 재시도 토큰 변경 시 재구독
  useEffect(() => {
    if (!user) return
    const tid = setTimeout(() => setCategoryFailed(), SUBSCRIPTION_TIMEOUT_MS)
    const unsub = subscribeCategories(
      user.uid,
      (cats) => { clearTimeout(tid); setCategories(cats) },
      (e) => { clearTimeout(tid); console.error('[categories]', e); setCategoryFailed() }
    )
    return () => { clearTimeout(tid); try { unsub() } catch { /* 무시 */ } }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, catRetryToken])

  return <>{children}</>
}
