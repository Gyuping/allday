// 캘린더 일정의 미리 알림을 실행하는 커스텀 훅
// Providers.tsx에서 앱 전체에 한 번만 마운트된다.
import { useEffect, useRef } from 'react'
import { useCalendarStore } from '@/store/calendarStore'
import { parseDateStr } from '@/lib/date'

export function useEventReminders() {
  const { events } = useCalendarStore()
  // 같은 알림이 두 번 발송되지 않도록 이미 발송한 키를 기록한다.
  // 키 형식: `이벤트id:날짜:리마인더분수`
  const fired = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return

    const check = () => {
      if (Notification.permission !== 'granted') return

      const now = new Date()

      for (const ev of events) {
        if (ev.reminder == null || !ev.startTime) continue

        // startTime 형식 검증 — 잘못된 값이 들어오면 NaN이 되어 날짜 계산이 망가지므로 건너뜀
        const timeMatch = ev.startTime.match(/^(\d{1,2}):(\d{2})$/)
        if (!timeMatch) continue

        const { year: yr, month: mo, day: dy } = parseDateStr(ev.date)
        const [, h, m] = timeMatch.map(Number)
        const eventTime = new Date(yr, mo - 1, dy, h, m, 0, 0)
        if (isNaN(eventTime.getTime())) continue

        // 알림을 보낼 시각 = 일정 시작 - reminder분
        const notifyAt = new Date(eventTime.getTime() - ev.reminder * 60_000)
        const diffMs = now.getTime() - notifyAt.getTime()

        // 알림 시각으로부터 0~60초 이내일 때만 발송 (30초 간격으로 체크하므로 60초 여유)
        if (diffMs >= 0 && diffMs < 60_000) {
          const key = `${ev.id}:${ev.date}:${ev.reminder}`
          if (!fired.current.has(key)) {
            fired.current.add(key)

            const hours = Math.floor(ev.reminder / 60)
            const mins  = ev.reminder % 60
            const timeLabel =
              ev.reminder < 60   ? `${ev.reminder}분 전`
              : ev.reminder < 1440
                ? mins === 0 ? `${hours}시간 전` : `${hours}시간 ${mins}분 전`
              : '하루 전'

            const body = `${timeLabel} - ${ev.startTime} 시작`
            new Notification(ev.title, { body, icon: '/favicon.ico', tag: key })
          }
        }
      }
    }

    check()  // 마운트 직후 즉시 한 번 체크
    const id = setInterval(check, 30_000)  // 이후 30초마다 반복
    return () => clearInterval(id)
  }, [events])
}
