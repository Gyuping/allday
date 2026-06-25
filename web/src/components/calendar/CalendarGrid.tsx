'use client'

// 월간 캘린더 그리드 컴포넌트
// - 날짜 셀 클릭: 해당 날 일정 목록 열기
// - 이벤트 드래그앤드롭: 날짜 이동
// - 범위 드래그(빈 셀): 여러 날 일정 추가 모달 열기
// 데스크톱/모바일에서 다른 레이아웃으로 표시된다.
import { useState, useEffect, useRef, useMemo } from 'react'
import { toDateStr, todayStr, getDateRange } from '@/lib/date'
import type { CalendarEvent } from '@/types'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MAX_EVENTS_DESKTOP = 3  // 데스크톱 셀에 표시할 최대 이벤트 수
const MAX_EVENTS_MOBILE  = 4  // 모바일 셀에 표시할 최대 이벤트 수

type Props = {
  year: number
  month: number
  events: CalendarEvent[]
  holidays: Record<string, string>
  onDayClick: (dateStr: string) => void
  onEventClick: (event: CalendarEvent) => void
  onEventDrop: (eventId: string, newDate: string) => void
  onRangeSelect: (startDate: string, endDate: string) => void
}

export default function CalendarGrid({
  year, month, events, holidays, onDayClick, onEventClick, onEventDrop, onRangeSelect,
}: Props) {
  const today = todayStr()

  // ── 이벤트 드래그 상태 ──
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropOverDate, setDropOverDate] = useState<string | null>(null)

  // ── 날짜 범위 선택 상태 ──
  const [selStart, setSelStart] = useState<string | null>(null)
  const [selCurrent, setSelCurrent] = useState<string | null>(null)
  const isSelecting = useRef(false)
  const didDrag = useRef(false)

  const selectedSet = useMemo(() => {
    if (!selStart || !selCurrent) return new Set<string>()
    return new Set(getDateRange(selStart, selCurrent))
  }, [selStart, selCurrent])

  // 마우스를 그리드 밖에서 놓아도 범위 선택/클릭 처리가 되도록 window에 등록
  // selStart === selCurrent이고 드래그가 없으면 단순 클릭으로 판단한다.
  useEffect(() => {
    const onMouseUp = () => {
      if (!isSelecting.current) return
      if (selStart && selCurrent) {
        if (selStart === selCurrent && !didDrag.current) {
          onDayClick(selStart)
        } else {
          onRangeSelect(selStart, selCurrent)
        }
      }
      isSelecting.current = false
      didDrag.current = false
      setSelStart(null)
      setSelCurrent(null)
    }
    window.addEventListener('mouseup', onMouseUp)
    return () => window.removeEventListener('mouseup', onMouseUp)
  }, [selStart, selCurrent, onDayClick, onRangeSelect])

  // 해당 월의 첫 번째 날 요일과 총 날짜 수를 계산해 셀 배열을 만든다.
  // 첫 주 앞에 빈 셀(null)을 채워 요일이 맞도록 정렬한다.
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array<null>(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  // 날짜별로 이벤트를 그룹화 — 여러 날 일정은 범위 내 모든 날짜에 포함된다.
  // 렌더링마다 재계산하지 않도록 useMemo로 메모이제이션.
  const eventsByDate = useMemo(() =>
    events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
      const dates = e.endDate ? getDateRange(e.date, e.endDate) : [e.date]
      dates.forEach((d) => {
        if (!acc[d]) acc[d] = []
        acc[d].push(e)
      })
      return acc
    }, {}),
    [events]
  )

  return (
    <div className="flex flex-col flex-1 select-none">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-neutral-700">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-medium py-2.5 ${
              i === 0 ? 'text-rose-400' : i === 6 ? 'text-sky-400' : 'text-neutral-500'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 셀 */}
      <div className="grid grid-cols-7 border-l border-t border-neutral-700 flex-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="border-r border-b border-neutral-700 min-h-20 md:min-h-24 bg-neutral-950"
              />
            )
          }

          const dateStr = toDateStr(year, month, day)
          const isToday = dateStr === today
          const isSelected = selectedSet.has(dateStr)
          const isDropOver = dropOverDate === dateStr && !isSelecting.current
          const colIdx = idx % 7
          const isSun = colIdx === 0
          const isSat = colIdx === 6
          const holidayName = holidays[dateStr]
          const isHolidayColor = isSun || isSat || !!holidayName

          // 여러 날 일정 먼저 정렬
          const dayEvents = [...(eventsByDate[dateStr] ?? [])].sort((a, b) => {
            if (!!a.endDate !== !!b.endDate) return a.endDate ? -1 : 1
            return (a.startTime ?? '').localeCompare(b.startTime ?? '')
          })

          return (
            <div
              key={dateStr}
              // ── 범위 선택 마우스 이벤트 ──
              onMouseDown={(e) => {
                if (e.button !== 0) return
                const target = e.target as HTMLElement
                if (target.closest('[data-event-chip]')) return
                e.preventDefault()
                isSelecting.current = true
                didDrag.current = false
                setSelStart(dateStr)
                setSelCurrent(dateStr)
              }}
              onMouseEnter={() => {
                if (!isSelecting.current) return
                if (selCurrent !== dateStr) didDrag.current = true
                setSelCurrent(dateStr)
              }}
              // ── 이벤트 드롭 ──
              onDragOver={(e) => { e.preventDefault(); setDropOverDate(dateStr) }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropOverDate(null)
              }}
              onDrop={(e) => {
                e.preventDefault()
                const eventId = e.dataTransfer.getData('eventId')
                if (eventId) onEventDrop(eventId, dateStr)
                setDropOverDate(null)
              }}
              className={`border-r border-b border-neutral-700 min-h-20 md:min-h-24 p-1 cursor-pointer bg-neutral-900 transition-colors group relative ${
                isSelected
                  ? 'bg-indigo-500/20 ring-1 ring-inset ring-indigo-500/50'
                  : isDropOver
                  ? 'bg-neutral-700/70 ring-1 ring-inset ring-neutral-500 z-[5]'
                  : 'hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-start justify-between p-0.5 mb-0.5 gap-1">
                {/* 공휴일 이름 */}
                <div className="flex-1 min-w-0 pt-0.5">
                  {holidayName && (
                    <span className="text-sm md:text-base leading-tight text-rose-400 font-medium truncate block">
                      {holidayName}
                    </span>
                  )}
                </div>
                {/* 날짜 숫자 */}
                <span
                  className={`shrink-0 text-sm w-7 h-7 md:text-base md:w-8 md:h-8 flex items-center justify-center rounded-full font-semibold transition-colors ${
                    isToday
                      ? 'bg-white text-neutral-900'
                      : isHolidayColor
                      ? 'text-rose-400 group-hover:text-rose-300'
                      : 'text-neutral-400 group-hover:text-white'
                  }`}
                >
                  {day}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                {dayEvents.slice(0, MAX_EVENTS_DESKTOP).map((ev) => {
                  const isMulti = !!ev.endDate
                  // 이 셀이 이벤트 바의 시작/끝인지 판단 (주 경계도 시작/끝으로 처리)
                  const isSegStart = !isMulti || ev.date === dateStr || colIdx === 0
                  const isSegEnd = !isMulti || ev.endDate === dateStr || colIdx === 6

                  // 셀 위치에 따른 바 모양 클래스
                  // -mr/ml-[5px]: 패딩(4px) + border(1px) = 5px 을 상쇄해서 border 위까지 덮음
                  let barClasses: string
                  if (!isMulti || (isSegStart && isSegEnd)) {
                    barClasses = 'rounded-[4px] px-1.5'
                  } else if (isSegStart) {
                    barClasses = 'rounded-l-[4px] rounded-r-none pl-1.5 pr-0 -mr-[5px]'
                  } else if (isSegEnd) {
                    barClasses = 'rounded-r-[4px] rounded-l-none pr-1.5 pl-0 -ml-[5px]'
                  } else {
                    barClasses = 'rounded-none px-0 -mx-[5px]'
                  }

                  const isDragging = draggingId === ev.id
                  const stackClass = isDragging
                    ? 'relative z-[20] opacity-40'
                    : isMulti
                    ? 'relative z-[10]'
                    : ''

                  return (
                    <div
                      key={ev.id}
                      data-event-chip="true"
                      draggable={!isMulti}
                      onDragStart={!isMulti ? (e) => {
                        e.stopPropagation()
                        e.dataTransfer.setData('eventId', ev.id)
                        e.dataTransfer.effectAllowed = 'move'
                        setDraggingId(ev.id)
                      } : undefined}
                      onDragEnd={!isMulti ? () => { setDraggingId(null); setDropOverDate(null) } : undefined}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev) }}
                      className={`hidden md:block text-[11px] leading-4 py-0.5 text-white font-medium hover:brightness-110 transition-all ${
                        isMulti ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                      } ${stackClass} ${barClasses}`}
                      style={{ backgroundColor: ev.color ?? '#6366f1' }}
                      title={ev.title}
                    >
                      {isSegStart ? (
                        <span className="block truncate">
                          {ev.startTime && <span className="opacity-75 mr-1">{ev.startTime}</span>}
                          {ev.title}
                        </span>
                      ) : ' '}
                    </div>
                  )
                })}

                {dayEvents.length > 3 && (
                  <div className="hidden md:block text-[11px] text-neutral-500 px-1.5">
                    +{dayEvents.length - 3}
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
