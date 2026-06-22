import { useEffect, useRef } from 'react'
import { useCalendarStore } from '@/store/calendarStore'

export function useEventReminders() {
  const { events } = useCalendarStore()
  const fired = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return

    const check = () => {
      if (Notification.permission !== 'granted') return

      const now = new Date()

      for (const ev of events) {
        if (ev.reminder == null || !ev.startTime) continue

        const [yr, mo, dy] = ev.date.split('-').map(Number)
        const [h, m] = ev.startTime.split(':').map(Number)
        const eventTime = new Date(yr, mo - 1, dy, h, m, 0, 0)
        const notifyAt = new Date(eventTime.getTime() - ev.reminder * 60_000)
        const diffMs = now.getTime() - notifyAt.getTime()

        // 알림 시각으로부터 0~60초 이내에만 발송 (1분마다 체크 기준)
        if (diffMs >= 0 && diffMs < 60_000) {
          const key = `${ev.id}:${ev.date}:${ev.reminder}`
          if (!fired.current.has(key)) {
            fired.current.add(key)

            const timeLabel =
              ev.reminder < 60 ? `${ev.reminder}분 전`
              : ev.reminder < 1440 ? `${ev.reminder / 60}시간 전`
              : '하루 전'

            const body = `${timeLabel} - ${ev.startTime} 시작`

            new Notification(ev.title, { body, icon: '/favicon.ico', tag: key })
          }
        }
      }
    }

    check()
    const id = setInterval(check, 30_000)
    return () => clearInterval(id)
  }, [events])
}
