import { useEffect, useRef } from 'react'
import { useCalendarStore } from '@/store/calendarStore'
import { parseDateStr } from '@/lib/date'
import type { CalendarEvent } from '@/types'

// 모듈 레벨 상수 — 매 렌더링마다 정규식 재컴파일 방지
const TIME_REGEX = /^\d{1,2}:\d{2}$/

export function useEventReminders() {
  const { events } = useCalendarStore()
  const fired = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return

    const candidates = events.filter(
      (e): e is CalendarEvent & { startTime: string; reminder: number } =>
        e.reminder != null && !!e.startTime && TIME_REGEX.test(e.startTime)
    )

    const check = () => {
      if (Notification.permission !== 'granted') return
      const now = new Date()

      for (const ev of candidates) {
        // 날짜 형식 검증 (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(ev.date)) continue
        const { year: yr, month: mo, day: dy } = parseDateStr(ev.date)
        if (mo < 1 || mo > 12 || dy < 1 || dy > 31) continue
        // 2월 30일 같은 논리적으로 잘못된 날짜 거르기
        if (new Date(yr, mo - 1, dy).getDate() !== dy) continue
        const [h, m] = ev.startTime.split(':').map(Number)
        const eventTime = new Date(yr, mo - 1, dy, h, m, 0, 0)
        if (isNaN(eventTime.getTime())) continue

        const notifyAt = new Date(eventTime.getTime() - ev.reminder * 60_000)
        const diffMs   = now.getTime() - notifyAt.getTime()

        if (diffMs >= 0 && diffMs < 60_000) {
          const key = `${ev.id}:${ev.date}:${ev.reminder}`
          if (!fired.current.has(key)) {
            fired.current.add(key)

            const hours = Math.floor(ev.reminder / 60)
            const mins  = ev.reminder % 60
            const timeLabel =
              ev.reminder < 60    ? `${ev.reminder}분 전`
              : ev.reminder < 1440
                ? mins === 0      ? `${hours}시간 전`
                                  : `${hours}시간 ${mins}분 전`
              : '하루 전'

            try {
              new Notification(ev.title, {
                body: `${timeLabel} - ${ev.startTime} 시작`,
                icon: '/favicon.ico',
                tag:  key,
              })
            } catch {
              // Notification 생성 실패 (권한 변경 등) — 무시
            }
          }
        }
      }
    }

    check()
    const id = setInterval(check, 30_000)
    return () => clearInterval(id)
  }, [events])
}
