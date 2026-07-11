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
  const [draggingId,  setDraggingId]  = useState<string | null>(null)
  const [dropOverDate, setDropOverDate] = useState<string | null>(null)

  // ── 드래그 핵심 로직용 ref (stale closure 없이 항상 최신값) ──
  const drag = useRef<{ eventId: string; dropDate: string | null } | null>(null)

  // ── 날짜 범위 선택용 ref / state ──
  const [selStart,   setSelStart]   = useState<string | null>(null)
  const [selCurrent, setSelCurrent] = useState<string | null>(null)
  const isSelecting  = useRef(false)
  const didDrag      = useRef(false)
  // selStart/selCurrent를 ref로도 미러링 — [] 의존성 effect에서 최신값 읽기 위해
  const selStartRef  = useRef<string | null>(null)
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

  // ── window 이벤트 — 마운트 시 한 번만 등록 ──
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!drag.current) return

      // 모든 칩이 pointer-events:none 상태 → elementFromPoint가 셀을 반환
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      let node = el
      while (node && !node.dataset?.date) node = node.parentElement as HTMLElement | null
      const date = node?.dataset?.date ?? null

      if (date !== drag.current.dropDate) {
        drag.current.dropDate = date
        setDropOverDate(date)
      }
    }

    const onMouseUp = () => {
      // ── 이벤트 드래그 완료 ──
      if (drag.current) {
        const { eventId, dropDate } = drag.current
        drag.current = null
        setDraggingId(null)
        setDropOverDate(null)
        if (eventId && dropDate) cbRef.current.onEventDrop(eventId, dropDate)
        return
      }

      // ── 날짜 범위 선택 완료 ──
      if (!isSelecting.current) return
      // ref에서 읽어야 최신값 (stale closure 방지)
      const start   = selStartRef.current
      const current = selCurrentRef.current
      const wasDrag = didDrag.current
      isSelecting.current = false
      didDrag.current     = false
      selStartRef.current  = null
      selCurrentRef.current = null
      setSelStart(null)
      setSelCurrent(null)

      if (!start || !current) return
      if (start === current && !wasDrag) {
        cbRef.current.onDayClick(start)
      } else {
        cbRef.current.onRangeSelect(start, current)
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
    }
  }, [])

  // selStart/selCurrent 변경 직후 ref에 동기화 (mouseup handler에서 최신값 읽기 위해)
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

  // 주(week) 단위 이벤트 슬롯 — 같은 주 안에서 이벤트가 항상 같은 행에 표시되도록 순서를 고정
  const weekEventSlots = useMemo(() => {
    const slotMap = new Map<string, number>() // `${weekIdx}-${eventId}` → slot
    const totalWeeks = Math.ceil(cells.length / 7)
    for (let w = 0; w < totalWeeks; w++) {
      const weekDates = cells
        .slice(w * 7, (w + 1) * 7)
        .flatMap((day) => (day !== null ? [toDateStr(year, month, day)] : []))
      const seen = new Map<string, CalendarEvent>()
      weekDates.forEach((d) => (eventsByDate[d] ?? []).forEach((ev) => seen.set(ev.id, ev)))
      // 다중날짜 우선, 그 다음 시작일 오름차순, 그 다음 종료일 내림차순(긴 일정 우선)
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

          const dateStr       = toDateStr(year, month, day)
          const isToday       = dateStr === today
          const isSelected    = selectedSet.has(dateStr)
          const isDropOver    = dropOverDate === dateStr
          const colIdx        = idx % 7
          const isSun         = colIdx === 0
          const isSat         = colIdx === 6
          const holidayName   = holidays[dateStr]
          const isHolidayColor = isSun || isSat || !!holidayName

          const weekIdx = Math.floor(idx / 7)

          // 이 날에 있는 이벤트를 슬롯 번호로 매핑
          const slotToEv = new Map<number, CalendarEvent>()
          ;(eventsByDate[dateStr] ?? []).forEach((ev) => {
            const s = weekEventSlots.get(`${weekIdx}-${ev.id}`)
            if (s !== undefined && s < MAX_EVENTS_DESKTOP) slotToEv.set(s, ev)
          })
          // 이 날의 최고 슬롯 번호까지 배열 생성 (빈 슬롯은 null → 투명 공간으로 렌더)
          const maxSlot = slotToEv.size > 0 ? Math.max(...slotToEv.keys()) : -1
          const slots: (CalendarEvent | null)[] = Array.from(
            { length: maxSlot + 1 }, (_, i) => slotToEv.get(i) ?? null
          )
          const hiddenCount = (eventsByDate[dateStr] ?? []).length - slotToEv.size
          // 모바일 도트용 (슬롯 순서 유지)
          const dayEvents = [...(eventsByDate[dateStr] ?? [])].sort((a, b) => {
            const sA = weekEventSlots.get(`${weekIdx}-${a.id}`) ?? 999
            const sB = weekEventSlots.get(`${weekIdx}-${b.id}`) ?? 999
            return sA - sB
          })

          return (
            <div
              key={dateStr}
              data-date={dateStr}
              onMouseDown={(e) => {
                if (e.button !== 0) return
                if ((e.target as HTMLElement).closest('[data-event-chip]')) return
                e.preventDefault()
                isSelecting.current   = true
                didDrag.current       = false
                selStartRef.current   = dateStr
                selCurrentRef.current = dateStr
                setSelStart(dateStr)
                setSelCurrent(dateStr)
              }}
              onMouseEnter={() => {
                if (drag.current) return
                if (!isSelecting.current) return
                if (selCurrentRef.current !== dateStr) didDrag.current = true
                selCurrentRef.current = dateStr
                setSelCurrent(dateStr)
              }}
              className={`border-r border-b border-neutral-700 min-h-20 md:min-h-24 p-1 cursor-pointer bg-neutral-900 transition-colors group relative ${
                isSelected  ? 'bg-indigo-500/20 ring-1 ring-inset ring-indigo-500/50'
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
                    onMouseDown={(e) => e.stopPropagation()}
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
                    // 빈 슬롯 — chip과 동일한 높이로 다음 이벤트 위치 유지
                    return <div key={`spacer-${slotIdx}`} className="block text-[11px] leading-4 py-0.5 min-h-[18px] pointer-events-none">&nbsp;</div>
                  }
                  const isMulti    = !!ev.endDate
                  const isSegStart = !isMulti || ev.date === dateStr || colIdx === 0
                  const isSegEnd   = !isMulti || ev.endDate === dateStr || colIdx === 6
                  const isDragging = draggingId === ev.id

                  // 셀 패딩(4px) + 우측 border(1px) = 5px를 width calc()로 확장 → 셀 경계에서 바가 끊기지 않음
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
                      onMouseDown={(e) => {
                        if (e.button !== 0) return
                        e.stopPropagation()
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
                        onMouseDown={(e) => e.stopPropagation()}
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
