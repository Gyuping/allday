import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { subscribeCalendar } from '@/lib/firestore/calendar'
import { subscribeTodos } from '@/lib/firestore/todos'
import { subscribeCategories } from '@/lib/firestore/categories'
import { useCalendarStore } from '@/store/calendarStore'
import { useTodoStore } from '@/store/todoStore'
import { useCategoryStore } from '@/store/categoryStore'

export default function RootLayout() {
  const router   = useRouter()
  const segments = useSegments()

  // Firebase 구독 연결
  const { setUserId: setCalUid, setEvents, setSubscriptionFailed: calFailed } = useCalendarStore()
  const { setUserId: setTodoUid, setTodos, setSubscriptionFailed: todoFailed } = useTodoStore()
  const {
    setUserId: setCatUid, setCategories,
    setSubscriptionFailed: catFailed, retryToken,
  } = useCategoryStore()

  useEffect(() => {
    let unsubCal: (() => void) | undefined
    let unsubTodo: (() => void) | undefined
    let unsubCat: (() => void) | undefined

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      unsubCal?.()
      unsubTodo?.()
      unsubCat?.()

      if (user) {
        setCalUid(user.uid)
        setTodoUid(user.uid)
        setCatUid(user.uid)

        unsubCal  = subscribeCalendar(user.uid, setEvents, calFailed)
        unsubTodo = subscribeTodos(user.uid, setTodos, todoFailed)
        unsubCat  = subscribeCategories(user.uid, setCategories, catFailed)
      } else {
        setCalUid(null)
        setTodoUid(null)
        setCatUid(null)
        setEvents([])
        setTodos([])
        setCategories([])
      }

      // 인증 상태에 따라 라우팅
      const inAuthGroup = segments[0] === '(auth)'
      if (!user && !inAuthGroup) {
        router.replace('/(auth)/login')
      } else if (user && inAuthGroup) {
        router.replace('/(tabs)')
      }
    })

    return () => {
      unsubAuth()
      unsubCal?.()
      unsubTodo?.()
      unsubCat?.()
    }
  // retryToken 변경 시 재구독
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryToken])

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}
