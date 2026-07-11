'use client'

import type { CalendarEvent } from '@/types'

const MAX_EVENTS_MOBILE = 4

export type CellSlotData = {
  slots: (CalendarEvent | null)[]
  hiddenCount: number
  dayEvents: CalendarEvent[]
}

type Props = {
  dateStr: string
  day: number
  isToday: boolean
  isSelected: boolean
  isDropOver: boolean
  colIdx: number
  holidayName: string | undefined
  completedTodoDates?: Set<string>
  slotData: CellSlotData
  draggingId: string | null
  onCellPointerDown: (dateStr: string, e: React.PointerEvent<HTMLDivElement>) => void
  onEventPointerDown: (eventId: string, e: React.PointerEvent<HTMLDivElement>) => void
  onEventClick: (ev: CalendarEvent) => void
  onDayDoubleClick: (dateStr: string) => void
}

export default function CalendarCell({
  dateStr, day, isToday, isSelected, isDropOver, colIdx,
  holidayName, completedTodoDates, slotData, draggingId,
  onCellPointerDown, onEventPointerDown, onEventClick, onDayDoubleClick,
}: Props) {
  const isSun          = colIdx === 0
  const isSat          = colIdx === 6
  const isHolidayColor = isSun || isSat || !!holidayName
  const { slots, hiddenCount, dayEvents } = slotData

  return (
    <div
      data-date={dateStr}
      onPointerDown={(e) => onCellPointerDown(dateStr, e)}
      className={`border-r border-b border-neutral-700 min-h-20 md:min-h-24 p-1 cursor-pointer bg-neutral-900 transition-colors group relative ${
        isSelected   ? 'bg-indigo-500/20 ring-1 ring-inset ring-indigo-500/50'
        : isDropOver ? 'bg-blue-500/20 ring-2 ring-inset ring-blue-400 z-[5]'
        : 'hover:bg-neutral-800/60'
      }`}
    >
      {/* 날짜 헤더 */}
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
              isToday          ? 'bg-white text-neutral-900'
              : isHolidayColor ? 'text-rose-400 group-hover:text-rose-300'
              : 'text-neutral-400 group-hover:text-white'
            }`}
          >{day}</span>
        </div>
      </div>

      {/* 이벤트 슬롯 (데스크톱) */}
      <div className="flex flex-col gap-0.5">
        {slots.map((ev, slotIdx) => {
          if (ev === null) {
            return (
              <div key={`spacer-${slotIdx}`} className="block text-[11px] leading-4 py-0.5 min-h-[18px] pointer-events-none">
                &nbsp;
              </div>
            )
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
              onPointerDown={(e) => onEventPointerDown(ev.id, e)}
              onClick={(e) => { e.stopPropagation(); onEventClick(ev) }}
              className={`block text-[11px] leading-4 py-0.5 min-h-[18px] text-white font-medium transition-all hover:brightness-110 cursor-grab ${stackClass} ${barClasses}`}
              style={{ backgroundColor: ev.color ?? '#6366f1', pointerEvents: draggingId ? 'none' : undefined }}
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
          <div className="hidden md:block text-[11px] text-neutral-500 px-1.5">+{hiddenCount}</div>
        )}

        {/* 이벤트 점 (모바일) */}
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
}
