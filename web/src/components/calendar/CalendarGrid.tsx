'use client'

import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react'
import { toDateStr, todayStr, getDateRange } from '@/lib/date'
import type { CalendarEvent } from '@/types'

const WEEKDAYS        = ['일', '월', '화', '수', '목', '금', '토']
const MAX_EVENTS_DESKTOP = 4
const MAX_EVENTS_MOBILE  = 4

type Props = {
  year: number
  month: number
  events: CalendarEvent[]
  holidays: Record<string, string>
  completedTodoDates?: Set<string>
  onDayClick: (dateStr: string) => void
  onDayDoubleClick: (dateStr: string) => void
  onEventClick: (event: CalendarEvent) => void
  onEventDrop: (eventId: string, newDate: string) => void
  onRangeSelect: (startDate: string, endDate: string) => void
}

export default function CalendarGrid({
  year, month, events, holidays, completedTodoDates,
  onDayClick, onDayDoubleClick, onEventClick, onEventDrop, onRangeSelect,
}: Props) {
  const today = todayStr()

  // ── 시각적 피드백용 state ──
  const [draggingId,   setDraggingId]  = useState<string | null>(null)
  const [dropOverDate, setDropOverDate] = useState<string | null>(null)

  // ── 드래그 핵심 로직용 ref ──
  const drag = useRef<{ eventId: string; dropDate: string | null } | null>(null)

  // ── 날짜 범위 선택용 ref / state ──
  const [selStart,   setSelStart]   = useState<string | null>(null)
  const [selCurrent, setSelCurrent] = useState<string | null>(null)
  const isSelecting   = useRef(false)
  const didDrag       = useRef(false)
  const selStartRef   = useRef<string | null>(null)
  const selCurrentRef = useRef<string | null>(null)

  // 콜백 ref — useEffect 의존성 없이 항상 최신 콜백을 사용
  const cbRef = useRef({ onDayClick, onDayDoubleClick, onEventDrop, onRangeSelect })
  useLayoutEffect(() => {
    cbRef.current = { onDayClick, onDayDoubleClick, onEventDrop, onRangeSelect }
  })

  const selectedSet = useMemo(() => {
    if (!selStart || !selCurrent) return new Set<string>()
    return new Set(getDateRange(selStart, selCurrent))
  }, [selStart, selCurrent])

  // ── window 포인터 이벤트 — 마우스/터치/펜 통합 ──
  useEffect(() => {
    // clientX/Y 기준으로 data-date 속성을 가진 셀 탐색
    const dateAtPoint = (x: number, y: number): string | null => {
      const el = document.elementFromPoint(x, y) as HTMLElement | null
      let node = el
      while (node && !node.dataset?.date) node = node.parentElement as HTMLElement | null
      return node?.dataset?.date ?? null
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!e.isPrimary) return

      // 이벤트 드래그 중
      if (drag.current) {
        const date = dateAtPoint(e.clientX, e.clientY)
        if (date !== drag.current.dropDate) {
          drag.current.dropDate = date
          setDropOverDate(date)
        }
        return
      }

      // 날짜 범위 선택 중 — onMouseEnter 대신 pointermove+elementFromPoint 사용 (터치 지원)
      if (!isSelecting.current) return
      const date = dateAtPoint(e.clientX, e.clientY)
      if (date && date !== selCurrentRef.current) {
        didDrag.current       = true
        selCurrentRef.current = date
        setSelCurrent(date)
      }
    }

    // pointerup + pointercancel 통합 처리
    // iOS Safari는 터치를 취소할 때 pointerup 대신 pointercancel을 발생시킴
    const onPointerEnd = (e: PointerEvent) => {
      if (!e.isPrimary) return

      // 이벤트 드래그 완료 (pointercancel 시엔 드롭 미적용)
      if (drag.current) {
        const { eventId, dropDate } = drag.current
        drag.current = null
        setDraggingId(null)
        setDropOverDate(null)
        if (e.type === 'pointerup' && eventId && dropDate) {
          cbRef.current.onEventDrop(eventId, dropDate)
        }
        return
      }

      // 날짜 범위 선택 완료 — pointercancel이어도 드래그가 있었으면 모달 표시
      if (!isSelecting.current) return
      const start   = selStartRef.current
      const current = selCurrentRef.current
      const wasDrag = didDrag.current
      isSelecting.current   = false
      didDrag.current       = false
      selStartRef.current   = null
      selCurrentRef.current = null
      setSelStart(null)
      setSelCurrent(null)

      if (!start || !current) return
      if (start === current && !wasDrag) {
        if (e.type === 'pointerup') cbRef.current.onDayClick(start)
      } else {
        cbRef.current.onRangeSelect(start, current)
      }
    }

    window.addEventListener('pointermove',  onPointerMove)
    window.addEventListener('pointerup',    onPointerEnd)
    window.addEventListener('pointercancel', onPointerEnd)
    return () => {
      window.removeEventListener('pointermove',  onPointerMove)
      window.removeEventListener('pointerup',    onPointerEnd)
      window.removeEventListener('pointercancel', onPointerEnd)
    }
  }, [])

  useLayoutEffect(() => {
    selStartRef.current   = selStart
    selCurrentRef.current = selCurrent
  }, [selStart, selCurrent])

  const cells = useMemo(() => {
    const firstDayOfWeek = new Date(year, month, 1).getDay()
    const daysInMonth    = new Date(year, month + 1, 0).getDate()
    const result: (number | null)[] = [
      ...Array<null>(firstDayOfWeek).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [year, month])

  const eventsByDate = useMemo(() =>
    events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
      const dates = e.endDate ? getDateRange(e.date, e.endDate) : [e.date]
      dates.forEach((d) => { if (!acc[d]) acc[d] = []; acc[d].push(e) })
      return acc
    }, {}),
    [events]
  )

  const weekEventSlots = useMemo(() => {
    const slotMap = new Map<string, number>()
    const totalWeeks = Math.ceil(cells.length / 7)
    for (let w = 0; w < totalWeeks; w++) {
      const weekDates = cells
        .slice(w * 7, (w + 1) * 7)
        .flatMap((day) => (day !== null ? [toDateStr(year, month, day)] : []))
      const seen = new Map<string, CalendarEvent>()
      weekDates.forEach((d) => (eventsByDate[d] ?? []).forEach((ev) => seen.set(ev.id, ev)))
      const sorted = [...seen.values()].sort((a, b) => {
        const aM = !!a.endDate, bM = !!b.endDate
        if (aM !== bM) return aM ? -1 : 1
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return (b.endDate ?? b.date).localeCompare(a.endDate ?? a.date)
      })
      sorted.forEach((ev, i) => slotMap.set(`${w}-${ev.id}`, i))
    }
    return slotMap
  }, [cells, eventsByDate, year, month])

  return (
    <div className="flex flex-col flex-1 select-none">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-neutral-700">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={`text-center text-xs font-medium py-2.5 ${
            i === 0 ? 'text-rose-400' : i === 6 ? 'text-sky-400' : 'text-neutral-500'
          }`}>{d}</div>
        ))}
      </div>

      {/* 날짜 셀 */}
      <div className="grid grid-cols-7 border-l border-t border-neutral-700 flex-1">
        {cells.map((day, idx) => {
          if (day === null) return (
            <div key={`empty-${idx}`} className="border-r border-b border-neutral-700 min-h-20 md:min-h-24 bg-neutral-950" />
          )

          const dateStr        = toDateStr(year, month, day)
          const isToday        = dateStr === today
          const isSelected     = selectedSet.has(dateStr)
          const isDropOver     = dropOverDate === dateStr
          const colIdx         = idx % 7
          const isSun          = colIdx === 0
          const isSat          = colIdx === 6
          const holidayName    = holidays[dateStr]
          const isHolidayColor = isSun || isSat || !!holidayName
          const weekIdx        = Math.floor(idx / 7)

          const slotToEv = new Map<number, CalendarEvent>()
          ;(eventsByDate[dateStr] ?? []).forEach((ev) => {
            const s = weekEventSlots.get(`${weekIdx}-${ev.id}`)
            if (s !== undefined && s < MAX_EVENTS_DESKTOP) slotToEv.set(s, ev)
          })
          const maxSlot = slotToEv.size > 0 ? Math.max(...slotToEv.keys()) : -1
          const slots: (CalendarEvent | null)[] = Array.from(
            { length: maxSlot + 1 }, (_, i) => slotToEv.get(i) ?? null
          )
          const hiddenCount = (eventsByDate[dateStr] ?? []).length - slotToEv.size
          const dayEvents = [...(eventsByDate[dateStr] ?? [])].sort((a, b) => {
            const sA = weekEventSlots.get(`${weekIdx}-${a.id}`) ?? 999
            const sB = weekEventSlots.get(`${weekIdx}-${b.id}`) ?? 999
            return sA - sB
          })

          return (
            <div
              key={dateStr}
              data-date={dateStr}
              onPointerDown={(e) => {
                if (!e.isPrimary) return
                if ((e.target as HTMLElement).closest('[data-event-chip]')) return
                e.preventDefault()
                isSelecting.current   = true
                didDrag.current       = false
                selStartRef.current   = dateStr
                selCurrentRef.current = dateStr
                setSelStart(dateStr)
                setSelCurrent(dateStr)
              }}
              className={`border-r border-b border-neutral-700 min-h-20 md:min-h-24 p-1 cursor-pointer bg-neutral-900 transition-colors group relative ${
                isSelected   ? 'bg-indigo-500/20 ring-1 ring-inset ring-indigo-500/50'
                : isDropOver ? 'bg-blue-500/20 ring-2 ring-inset ring-blue-400 z-[5]'
                : 'hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-start justify-between p-0.5 mb-0.5 gap-1">
                <div className="flex-1 min-w-0 pt-0.5">
                  {holidayName && (
                    <span className="text-sm md:text-base leading-tight text-rose-400 font-medium truncate block">
                      {holidayName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {completedTodoDates?.has(dateStr) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-80" />
                  )}
                  <span
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onDayDoubleClick(dateStr) }}
                    className={`text-sm w-7 h-7 md:text-base md:w-8 md:h-8 flex items-center justify-center rounded-full font-semibold transition-colors cursor-pointer hover:ring-2 hover:ring-white/30 ${
                      isToday ? 'bg-white text-neutral-900'
                      : isHolidayColor ? 'text-rose-400 group-hover:text-rose-300'
                      : 'text-neutral-400 group-hover:text-white'
                    }`}
                  >{day}</span>
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                {slots.map((ev, slotIdx) => {
                  if (ev === null) {
                    return <div key={`spacer-${slotIdx}`} className="block text-[11px] leading-4 py-0.5 min-h-[18px] pointer-events-none">&nbsp;</div>
                  }
                  const isMulti    = !!ev.endDate
                  const isSegStart = !isMulti || ev.date === dateStr || colIdx === 0
                  const isSegEnd   = !isMulti || ev.endDate === dateStr || colIdx === 6
                  const isDragging = draggingId === ev.id

                  let barClasses: string
                  if (!isMulti || (isSegStart && isSegEnd)) barClasses = 'rounded-[4px] px-1.5'
                  else if (isSegStart) barClasses = 'rounded-l-[4px] rounded-r-none pl-1.5 pr-0 w-[calc(100%+5px)]'
                  else if (isSegEnd)   barClasses = 'rounded-r-[4px] rounded-l-none pr-1.5 pl-0 -ml-1 w-[calc(100%+4px)]'
                  else                 barClasses = 'rounded-none px-0 -ml-1 w-[calc(100%+9px)]'

                  const stackClass = isDragging ? 'relative z-[20] opacity-40' : isMulti ? 'relative z-[10]' : ''

                  return (
                    <div
                      key={ev.id}
                      data-event-chip="true"
                      onPointerDown={(e) => {
                        if (!e.isPrimary) return
                        e.stopPropagation()
                        ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
                        drag.current = { eventId: ev.id, dropDate: null }
                        setDraggingId(ev.id)
                      }}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev) }}
                      className={`block text-[11px] leading-4 py-0.5 min-h-[18px] text-white font-medium transition-all hover:brightness-110 cursor-grab ${stackClass} ${barClasses}`}
                      style={{
                        backgroundColor: ev.color ?? '#6366f1',
                        pointerEvents: draggingId ? 'none' : undefined,
                      }}
                      title={ev.title}
                    >
                      {isSegStart ? (
                        <span className="block truncate">
                          {ev.startTime && <span className="opacity-75 mr-1">{ev.startTime}</span>}
                          {ev.title}
                        </span>
                      ) : <span>&nbsp;</span>}
                    </div>
                  )
                })}

                {hiddenCount > 0 && (
                  <div className="hidden md:block text-[11px] text-neutral-500 px-1.5">
                    +{hiddenCount}
                  </div>
                )}

                {dayEvents.length > 0 && (
                  <div className="flex md:hidden gap-0.5 px-0.5 mt-0.5 flex-wrap">
                    {dayEvents.slice(0, MAX_EVENTS_MOBILE).map((ev) => (
                      <div
                        key={ev.id}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onEventClick(ev) }}
                        className="w-1.5 h-1.5 rounded-full shrink-0 cursor-pointer"
                        style={{ backgroundColor: ev.color ?? '#6366f1' }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
