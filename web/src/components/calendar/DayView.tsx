'use client'

// 일간 캘린더 뷰 — 하루의 시간대별 일정을 세로로 표시한다.
// - 마우스/터치 드래그로 시작~끝 시간 선택해 일정 추가
// - 현재 시각 빨간 선으로 표시
// - 종일 이벤트는 상단 별도 영역에 표시
import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { toDateStr } from '@/lib/date'
import type { CalendarEvent } from '@/types'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 64
const SNAP = 15

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}
function minutesToPx(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT
}
function pxToMinutes(px: number): number {
  return Math.round(((px / HOUR_HEIGHT) * 60) / SNAP) * SNAP
}
function toTimeStr(minutes: number): string {
  const c = Math.max(0, Math.min(1439, minutes))
  return `${String(Math.floor(c / 60)).padStart(2, '0')}:${String(c % 60).padStart(2, '0')}`
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

type Props = {
  date: Date
  events: CalendarEvent[]
  holidays: Record<string, string>
  onEventClick: (event: CalendarEvent) => void
  onSlotClick: (date: string, startTime: string, endTime: string) => void
}

export default function DayView({ date, events, holidays, onEventClick, onSlotClick }: Props) {
  const todayStr = useMemo(() => {
    const t = new Date()
    return toDateStr(t.getFullYear(), t.getMonth(), t.getDate())
  }, [])

  const dateStr  = toDateStr(date.getFullYear(), date.getMonth(), date.getDate())
  const isToday  = dateStr === todayStr
  const weekday  = WEEKDAYS[date.getDay()]
  const isSun    = date.getDay() === 0
  const isSat    = date.getDay() === 6
  const holiday  = holidays[dateStr]

  // 현재 시각 위치 (분 단위)
  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date()
    return n.getHours() * 60 + n.getMinutes()
  })
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date()
      setNowMinutes(n.getHours() * 60 + n.getMinutes())
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  // 이 날짜의 이벤트 — 한 번만 필터링해서 timed/allDay로 분리
  const { timedEvents, allDayEvents } = useMemo(() => {
    const inRange = events.filter((e) =>
      e.endDate ? e.date <= dateStr && dateStr <= e.endDate : e.date === dateStr
    )
    return {
      timedEvents:  inRange.filter((e) => !!e.startTime),
      allDayEvents: inRange.filter((e) => !e.startTime),
    }
  }, [events, dateStr])

  // 드래그 상태
  const colRef = useRef<HTMLDivElement>(null)
  const drag   = useRef<{ startMin: number; currentMin: number } | null>(null)
  const [dragPreview, setDragPreview] = useState<{ startMin: number; currentMin: number } | null>(null)

  const yToMinutes = useCallback((clientY: number) => {
    if (!colRef.current) return 0
    const rect = colRef.current.getBoundingClientRect()
    return pxToMinutes(Math.max(0, clientY - rect.top))
  }, [])

  const finishDrag = useCallback(() => {
    if (!drag.current) return
    const { startMin, currentMin } = drag.current
    const lo = Math.min(startMin, currentMin)
    const hi = Math.max(startMin, currentMin)
    const start = toTimeStr(lo)
    const end   = toTimeStr(hi < lo + SNAP ? lo + SNAP : hi)
    drag.current = null
    setDragPreview(null)
    onSlotClick(dateStr, start, end)
  }, [dateStr, onSlotClick])

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!e.isPrimary || !drag.current) return
      drag.current.currentMin = yToMinutes(e.clientY)
      setDragPreview({ ...drag.current })
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', finishDrag)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', finishDrag)
    }
  }, [yToMinutes, finishDrag])

  return (
    <div className="flex flex-col flex-1 overflow-hidden border border-neutral-800 rounded-xl">

      {/* 날짜 헤더 */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-800 bg-neutral-900 shrink-0">
        <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center ${isToday ? 'bg-blue-500' : 'bg-neutral-800'}`}>
          <span className={`text-[10px] font-semibold ${isSun ? 'text-red-400' : isSat ? 'text-blue-300' : isToday ? 'text-white/70' : 'text-neutral-500'}`}>
            {weekday}
          </span>
          <span className={`text-xl font-bold leading-none ${isToday ? 'text-white' : 'text-neutral-100'}`}>
            {date.getDate()}
          </span>
        </div>
        <div>
          <p className="text-base font-semibold text-neutral-100">
            {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일
          </p>
          {holiday && <p className="text-xs text-red-400 mt-0.5">{holiday}</p>}
          {timedEvents.length + allDayEvents.length === 0
            ? <p className="text-xs text-neutral-600 mt-0.5">일정 없음</p>
            : <p className="text-xs text-neutral-500 mt-0.5">일정 {timedEvents.length + allDayEvents.length}개</p>
          }
        </div>
      </div>

      {/* 종일 이벤트 */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-neutral-800 bg-neutral-900/50 shrink-0 min-h-[36px]">
          <div className="w-16 flex items-center justify-end pr-3 shrink-0">
            <span className="text-[10px] text-neutral-600">종일</span>
          </div>
          <div className="flex-1 px-1 py-1 flex flex-col gap-0.5">
            {allDayEvents.map((ev) => (
              <div
                key={ev.id}
                data-event
                onClick={() => onEventClick(ev)}
                className="text-[12px] font-medium px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: `${ev.color ?? '#6366f1'}33`, color: ev.color ?? '#818cf8' }}
              >
                {ev.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 시간 그리드 */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: HOUR_HEIGHT * 24 }}>

          {/* 시간 레이블 */}
          <div className="w-16 shrink-0 relative select-none">
            {HOURS.map((h) => (
              <div key={h}>
                <div
                  className="absolute right-3 text-[10px] text-neutral-500 -translate-y-2"
                  style={{ top: h * HOUR_HEIGHT }}
                >
                  {h === 0 ? '' : `${String(h).padStart(2, '0')}:00`}
                </div>
                <div
                  className="absolute right-3 text-[9px] text-neutral-700 -translate-y-2"
                  style={{ top: h * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                >
                  {`${String(h).padStart(2, '0')}:30`}
                </div>
              </div>
            ))}
          </div>

          {/* 이벤트 컬럼 */}
          <div
            ref={colRef}
            className="flex-1 border-l border-neutral-800 relative select-none"
            style={{ cursor: drag.current ? 'ns-resize' : 'crosshair' }}
            onPointerDown={(e) => {
              if (!e.isPrimary) return
              if ((e.target as HTMLElement).closest('[data-event]')) return
              e.preventDefault()
              ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
              const startMin = yToMinutes(e.clientY)
              drag.current = { startMin, currentMin: startMin + SNAP }
              setDragPreview({ startMin, currentMin: startMin + SNAP })
            }}
          >
            {/* 시간 구분선 */}
            {HOURS.map((h) => (
              <div key={h}>
                <div className="absolute left-0 right-0 border-t border-neutral-800/60" style={{ top: h * HOUR_HEIGHT }} />
                <div className="absolute left-0 right-0 border-t border-neutral-800/30 border-dashed" style={{ top: h * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
              </div>
            ))}

            {/* 현재 시각 표시선 (오늘만) */}
            {isToday && (
              <div
                className="absolute left-0 right-0 flex items-center z-30 pointer-events-none"
                style={{ top: minutesToPx(nowMinutes) }}
              >
                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
                <div className="flex-1 border-t border-red-500" />
              </div>
            )}

            {/* 드래그 프리뷰 */}
            {dragPreview && (
              <div
                className="absolute left-1 right-1 rounded-lg pointer-events-none z-10 border border-blue-400/60"
                style={{
                  top: minutesToPx(Math.min(dragPreview.startMin, dragPreview.currentMin)),
                  height: Math.max(minutesToPx(Math.abs(dragPreview.currentMin - dragPreview.startMin)), 8),
                  backgroundColor: 'rgba(96,165,250,0.15)',
                }}
              >
                <p className="text-[10px] text-blue-300 font-semibold px-2 pt-1">
                  {toTimeStr(Math.min(dragPreview.startMin, dragPreview.currentMin))}
                  {' → '}
                  {toTimeStr(Math.max(dragPreview.startMin, dragPreview.currentMin))}
                </p>
              </div>
            )}

            {/* 이벤트 */}
            {timedEvents.map((ev) => {
              if (!ev.startTime) return null
              const startMin = timeToMinutes(ev.startTime)
              const rawEnd   = ev.endTime ? timeToMinutes(ev.endTime) : NaN
              const endMin   = isNaN(rawEnd) || rawEnd <= startMin ? startMin + 60 : rawEnd
              const top      = minutesToPx(startMin)
              const height   = Math.max(minutesToPx(endMin - startMin), HOUR_HEIGHT / 2)
              return (
                <div
                  key={ev.id}
                  data-event
                  onClick={() => onEventClick(ev)}
                  className="absolute left-1 right-1 rounded-lg px-2.5 py-1 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden z-20"
                  style={{
                    top,
                    height,
                    backgroundColor: `${ev.color ?? '#6366f1'}33`,
                    borderLeft: `3px solid ${ev.color ?? '#6366f1'}`,
                  }}
                >
                  <p className="text-[12px] font-semibold truncate" style={{ color: ev.color ?? '#818cf8' }}>
                    {ev.title}
                  </p>
                  {height > 36 && (
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ''}
                    </p>
                  )}
                  {height > 60 && ev.description && (
                    <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">{ev.description}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
