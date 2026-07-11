'use client'

import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react'
import { toDateStr, todayStr, getDateRange } from '@/lib/date'
import type { CalendarEvent } from '@/types'
import CalendarCell, { type CellSlotData } from './CalendarCell'

const WEEKDAYS          = ['일', '월', '화', '수', '목', '금', '토']
const MAX_EVENTS_DESKTOP = 4

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

function buildSlotData(
  cellEvents: CalendarEvent[],
  weekIdx: number,
  weekEventSlots: Map<string, number>,
): CellSlotData {
  const slotToEv = new Map<number, CalendarEvent>()
  cellEvents.forEach((ev) => {
    const s = weekEventSlots.get(`${weekIdx}-${ev.id}`)
    if (s !== undefined && s < MAX_EVENTS_DESKTOP) slotToEv.set(s, ev)
  })
  const maxSlot = slotToEv.size > 0 ? Math.max(...slotToEv.keys()) : -1
  const slots: (CalendarEvent | null)[] = Array.from({ length: maxSlot + 1 }, (_, i) => slotToEv.get(i) ?? null)
  const hiddenCount = cellEvents.length - slotToEv.size
  const dayEvents = [...cellEvents].sort((a, b) => {
    const sA = weekEventSlots.get(`${weekIdx}-${a.id}`) ?? 999
    const sB = weekEventSlots.get(`${weekIdx}-${b.id}`) ?? 999
    return sA - sB
  })
  return { slots, hiddenCount, dayEvents }
}

export default function CalendarGrid({
  year, month, events, holidays, completedTodoDates,
  onDayClick, onDayDoubleClick, onEventClick, onEventDrop, onRangeSelect,
}: Props) {
  const today = todayStr()

  const [draggingId,   setDraggingId]  = useState<string | null>(null)
  const [dropOverDate, setDropOverDate] = useState<string | null>(null)
  const [selStart,     setSelStart]    = useState<string | null>(null)
  const [selCurrent,   setSelCurrent]  = useState<string | null>(null)

  const drag          = useRef<{ eventId: string; dropDate: string | null } | null>(null)
  const isSelecting   = useRef(false)
  const didDrag       = useRef(false)
  const selStartRef   = useRef<string | null>(null)
  const selCurrentRef = useRef<string | null>(null)
  const cbRef         = useRef({ onDayClick, onDayDoubleClick, onEventDrop, onRangeSelect })

  useLayoutEffect(() => { cbRef.current = { onDayClick, onDayDoubleClick, onEventDrop, onRangeSelect } })
  useLayoutEffect(() => {
    selStartRef.current   = selStart
    selCurrentRef.current = selCurrent
  }, [selStart, selCurrent])

  const selectedSet = useMemo(() => {
    if (!selStart || !selCurrent) return new Set<string>()
    return new Set(getDateRange(selStart, selCurrent))
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

  // window 포인터 이벤트 — 마우스/터치/펜 통합
  useEffect(() => {
    const dateAtPoint = (x: number, y: number): string | null => {
      const el = document.elementFromPoint(x, y) as HTMLElement | null
      let node = el
      while (node && !node.dataset?.date) node = node.parentElement as HTMLElement | null
      return node?.dataset?.date ?? null
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!e.isPrimary) return
      if (drag.current) {
        const date = dateAtPoint(e.clientX, e.clientY)
        if (date !== drag.current.dropDate) { drag.current.dropDate = date; setDropOverDate(date) }
        return
      }
      if (!isSelecting.current) return
      const date = dateAtPoint(e.clientX, e.clientY)
      if (date && date !== selCurrentRef.current) {
        didDrag.current = true
        selCurrentRef.current = date
        setSelCurrent(date)
      }
    }

    // pointerup + pointercancel 통합 처리
    // iOS Safari는 터치를 취소할 때 pointerup 대신 pointercancel을 발생시킴
    const onPointerEnd = (e: PointerEvent) => {
      if (!e.isPrimary) return
      if (drag.current) {
        const { eventId, dropDate } = drag.current
        drag.current = null
        setDraggingId(null)
        setDropOverDate(null)
        if (e.type === 'pointerup' && eventId && dropDate) cbRef.current.onEventDrop(eventId, dropDate)
        return
      }
      if (!isSelecting.current) return
      const start   = selStartRef.current
      const current = selCurrentRef.current
      const wasDrag = didDrag.current
      isSelecting.current = false
      didDrag.current     = false
      selStartRef.current = null
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

    window.addEventListener('pointermove',   onPointerMove)
    window.addEventListener('pointerup',     onPointerEnd)
    window.addEventListener('pointercancel', onPointerEnd)
    return () => {
      window.removeEventListener('pointermove',   onPointerMove)
      window.removeEventListener('pointerup',     onPointerEnd)
      window.removeEventListener('pointercancel', onPointerEnd)
    }
  }, [])

  const handleCellPointerDown = (dateStr: string, e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary) return
    if ((e.target as HTMLElement).closest('[data-event-chip]')) return
    e.preventDefault()
    isSelecting.current   = true
    didDrag.current       = false
    selStartRef.current   = dateStr
    selCurrentRef.current = dateStr
    setSelStart(dateStr)
    setSelCurrent(dateStr)
  }

  const handleEventPointerDown = (eventId: string, e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary) return
    e.stopPropagation()
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
    drag.current = { eventId, dropDate: null }
    setDraggingId(eventId)
  }

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
          const dateStr = toDateStr(year, month, day)
          const weekIdx = Math.floor(idx / 7)
          const slotData = buildSlotData(eventsByDate[dateStr] ?? [], weekIdx, weekEventSlots)

          return (
            <CalendarCell
              key={dateStr}
              dateStr={dateStr}
              day={day}
              isToday={dateStr === today}
              isSelected={selectedSet.has(dateStr)}
              isDropOver={dropOverDate === dateStr}
              colIdx={idx % 7}
              holidayName={holidays[dateStr]}
              completedTodoDates={completedTodoDates}
              slotData={slotData}
              draggingId={draggingId}
              onCellPointerDown={handleCellPointerDown}
              onEventPointerDown={handleEventPointerDown}
              onEventClick={onEventClick}
              onDayDoubleClick={onDayDoubleClick}
            />
          )
        })}
      </div>
    </div>
  )
}
