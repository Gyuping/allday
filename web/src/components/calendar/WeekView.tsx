'use client'

// 주간 캘린더 뷰 — 7일을 가로로 나열하고 시간대별로 이벤트를 표시한다.
// - 마우스/터치 드래그로 시작~끝 시간을 선택해 일정 추가 가능
// - 15분 단위 스냅으로 정렬됨
// - 종일 이벤트(startTime 없음)는 상단 별도 영역에 표시
import { useMemo, useRef, useState, useCallback, useEffect, Fragment } from 'react'
import { toDateStr } from '@/lib/date'
import type { CalendarEvent } from '@/types'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const HOUR_HEIGHT = 64
const SNAP = 15 // 분 단위 스냅

type Props = {
  weekStart: Date
  events: CalendarEvent[]
  holidays: Record<string, string>
  onDayClick: (date: string) => void
  onEventClick: (event: CalendarEvent) => void
  onSlotClick: (date: string, startTime: string, endTime: string) => void
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })
}

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
  const clamped = Math.max(0, Math.min(1439, minutes))
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`
}

interface DragState {
  date: string
  startMin: number
  currentMin: number
}

export default function WeekView({ weekStart, events, holidays, onDayClick, onEventClick, onSlotClick }: Props) {
  const today = useMemo(() => {
    const t = new Date()
    return toDateStr(t.getFullYear(), t.getMonth(), t.getDate())
  }, [])

  const days      = useMemo(() => getWeekDays(weekStart), [weekStart])
  const dateStrs  = useMemo(() => days.map((d) => toDateStr(d.getFullYear(), d.getMonth(), d.getDate())), [days])
  const colRefs   = useRef<(HTMLDivElement | null)[]>([])
  const drag      = useRef<DragState | null>(null)
  const [dragPreview, setDragPreview] = useState<DragState | null>(null)

  const eventsByDate = useMemo(() => {
    const map: Record<string, { timed: CalendarEvent[]; allDay: CalendarEvent[] }> = {}
    dateStrs.forEach((d) => { map[d] = { timed: [], allDay: [] } })
    events.forEach((ev) => {
      const dates = ev.endDate
        ? dateStrs.filter((d) => d >= ev.date && d <= ev.endDate!)
        : dateStrs.filter((d) => d === ev.date)
      dates.forEach((d) => {
        if (map[d]) {
          if (ev.startTime) map[d].timed.push(ev)
          else map[d].allDay.push(ev)
        }
      })
    })
    return map
  }, [events, dateStrs])

  const hasAllDay = useMemo(
    () => dateStrs.some((d) => eventsByDate[d]?.allDay.length > 0),
    [dateStrs, eventsByDate]
  )

  // Y 위치 → 분 변환 (컬럼 기준)
  const yToMinutes = useCallback((colEl: HTMLDivElement, clientY: number): number => {
    const rect = colEl.getBoundingClientRect()
    const y = Math.max(0, clientY - rect.top)
    return pxToMinutes(y)
  }, [])

  // PointerEvent로 통합 — Mac 트랙패드/Windows 마우스/터치스크린 모두 처리
  const handlePointerDown = useCallback((dateStr: string, colIdx: number, e: React.PointerEvent) => {
    if (!e.isPrimary) return  // 멀티터치 무시
    if ((e.target as HTMLElement).closest('[data-event]')) return
    e.preventDefault()
    // setPointerCapture: 드래그 중 포인터가 요소 밖으로 나가도 이벤트 유지 (Mac/Windows 공통)
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
    const colEl = colRefs.current[colIdx]
    if (!colEl) return
    const startMin = yToMinutes(colEl, e.clientY)
    drag.current = { date: dateStr, startMin, currentMin: startMin + SNAP }
    setDragPreview({ date: dateStr, startMin, currentMin: startMin + SNAP })
  }, [yToMinutes])

  const finishDrag = useCallback(() => {
    if (!drag.current) return
    const { date, startMin, currentMin } = drag.current
    const lo = Math.min(startMin, currentMin)
    const hi = Math.max(startMin, currentMin)
    const start = toTimeStr(lo)
    const end   = toTimeStr(hi < lo + SNAP ? lo + SNAP : hi)
    drag.current = null
    setDragPreview(null)
    onSlotClick(date, start, end)
  }, [onSlotClick])

  // iOS Safari: pointercancel 발생 시 드래그 상태만 초기화 (onSlotClick 호출 안 함)
  const cancelDrag = useCallback(() => {
    if (!drag.current) return
    drag.current = null
    setDragPreview(null)
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!e.isPrimary || !drag.current) return
      const colIdx = dateStrs.indexOf(drag.current.date)
      const colEl = colRefs.current[colIdx]
      if (!colEl) return
      drag.current.currentMin = yToMinutes(colEl, e.clientY)
      setDragPreview({ ...drag.current })
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', finishDrag)
    window.addEventListener('pointercancel', cancelDrag)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', finishDrag)
      window.removeEventListener('pointercancel', cancelDrag)
    }
  }, [dateStrs, yToMinutes, finishDrag, cancelDrag])

  return (
    <div className="flex flex-col flex-1 overflow-hidden border border-neutral-800 rounded-xl">
      {/* 요일 헤더 */}
      <div className="flex shrink-0 border-b border-neutral-800 bg-neutral-900">
        <div className="w-14 shrink-0" />
        {days.map((day, i) => {
          const dateStr = dateStrs[i]
          const isToday = dateStr === today
          const isSun = day.getDay() === 0
          const isSat = day.getDay() === 6
          const holiday = holidays[dateStr]
          return (
            <div
              key={dateStr}
              className="flex-1 flex flex-col items-center py-2 border-l border-neutral-800 cursor-pointer hover:bg-neutral-800/50 transition-colors"
              onClick={() => onDayClick(dateStr)}
            >
              <span className={`text-xs font-medium ${isSun ? 'text-red-400' : isSat ? 'text-blue-400' : 'text-neutral-500'}`}>
                {WEEKDAYS[day.getDay()]}
              </span>
              <div className={`w-8 h-8 flex items-center justify-center rounded-full mt-0.5 text-sm font-bold transition-colors ${
                isToday ? 'bg-blue-500 text-white' : 'text-neutral-200 hover:bg-neutral-700'
              }`}>
                {day.getDate()}
              </div>
              {holiday && <span className="text-[10px] text-red-400 mt-0.5 truncate px-1 max-w-full">{holiday}</span>}
            </div>
          )
        })}
      </div>

      {/* 종일 이벤트 */}
      {hasAllDay && (
        <div className="flex shrink-0 border-b border-neutral-800 bg-neutral-900/50 min-h-[32px]">
          <div className="w-14 shrink-0 flex items-center justify-end pr-2">
            <span className="text-[10px] text-neutral-600">종일</span>
          </div>
          {dateStrs.map((dateStr) => (
            <div key={dateStr} className="flex-1 border-l border-neutral-800 px-0.5 py-1 flex flex-col gap-0.5">
              {eventsByDate[dateStr]?.allDay.map((ev) => (
                <div
                  key={ev.id}
                  data-event
                  onClick={(e) => { e.stopPropagation(); onEventClick(ev) }}
                  className="text-[11px] font-medium px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: `${ev.color ?? '#6366f1'}33`, color: ev.color ?? '#818cf8' }}
                >
                  {ev.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 시간 그리드 */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: HOUR_HEIGHT * 24 }}>
          {/* 시간 레이블 */}
          <div className="w-14 shrink-0 relative select-none">
            {HOURS.map((h) => (
              <Fragment key={h}>
                <div
                  className="absolute right-2 text-[10px] text-neutral-500 -translate-y-2"
                  style={{ top: h * HOUR_HEIGHT }}
                >
                  {h === 0 ? '' : `${String(h).padStart(2, '0')}:00`}
                </div>
                <div
                  className="absolute right-2 text-[9px] text-neutral-700 -translate-y-2"
                  style={{ top: h * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                >
                  {`${String(h).padStart(2, '0')}:30`}
                </div>
              </Fragment>
            ))}
          </div>

          {/* 날짜 컬럼 */}
          {dateStrs.map((dateStr, colIdx) => {
            const timedEvents = eventsByDate[dateStr]?.timed ?? []
            const isPreviewCol = dragPreview?.date === dateStr
            const previewTop = isPreviewCol
              ? minutesToPx(Math.min(dragPreview!.startMin, dragPreview!.currentMin))
              : 0
            const previewH = isPreviewCol
              ? minutesToPx(Math.abs(dragPreview!.currentMin - dragPreview!.startMin))
              : 0

            return (
              <div
                key={dateStr}
                ref={(el) => { colRefs.current[colIdx] = el }}
                className="flex-1 border-l border-neutral-800 relative select-none"
                style={{ cursor: dragPreview ? 'ns-resize' : 'crosshair' }}
                onPointerDown={(e) => handlePointerDown(dateStr, colIdx, e)}
              >
                {/* 시간 구분선 */}
                {HOURS.map((h) => (
                  <div key={h} className="absolute left-0 right-0 border-t border-neutral-800/60" style={{ top: h * HOUR_HEIGHT }} />
                ))}
                {HOURS.map((h) => (
                  <div key={`${h}-h`} className="absolute left-0 right-0 border-t border-neutral-800/30 border-dashed" style={{ top: h * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
                ))}

                {/* 드래그 프리뷰 */}
                {isPreviewCol && previewH > 0 && (
                  <div
                    className="absolute left-0.5 right-0.5 rounded-md pointer-events-none z-10 border border-blue-400/60"
                    style={{
                      top: previewTop,
                      height: Math.max(previewH, 8),
                      backgroundColor: 'rgba(96,165,250,0.15)',
                    }}
                  >
                    <p className="text-[10px] text-blue-300 font-semibold px-1 pt-0.5 leading-tight">
                      {toTimeStr(Math.min(dragPreview!.startMin, dragPreview!.currentMin))}
                      {' → '}
                      {toTimeStr(Math.max(dragPreview!.startMin, dragPreview!.currentMin))}
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
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev) }}
                      className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden z-20"
                      style={{
                        top,
                        height,
                        backgroundColor: `${ev.color ?? '#6366f1'}33`,
                        borderLeft: `3px solid ${ev.color ?? '#6366f1'}`,
                      }}
                    >
                      <p className="text-[11px] font-semibold truncate" style={{ color: ev.color ?? '#818cf8' }}>
                        {ev.title}
                      </p>
                      {height > 30 && (
                        <p className="text-[10px] text-neutral-400">
                          {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ''}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
