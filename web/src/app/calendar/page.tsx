'use client'

// 캘린더 페이지 — 월간/주간/일간 뷰 전환 가능
import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, Plus } from 'lucide-react'
import CalendarGrid from '@/components/calendar/CalendarGrid'
import WeekView from '@/components/calendar/WeekView'
import DayView from '@/components/calendar/DayView'
import DayDetailModal from '@/components/calendar/DayDetailModal'
import RangeAddModal from '@/components/calendar/RangeAddModal'
import MonthPicker from '@/components/calendar/MonthPicker'
import { useCalendarStore } from '@/store/calendarStore'
import { useTodoStore } from '@/store/todoStore'
import { useHolidays } from '@/hooks/useHolidays'
import { toDateStr } from '@/lib/date'
import { CATEGORIES } from '@/lib/categories'
import type { CalendarEvent } from '@/types'
import { MONTH_NAMES } from '@/constants/calendar'

type ViewMode = 'month' | 'week' | 'day'
type DayModal = { date: string; initialEvent?: CalendarEvent; startAdd?: boolean; startTime?: string; endTime?: string } | null

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

const VIEW_LABELS: Record<ViewMode, string> = { month: '월', week: '주', day: '일' }

export default function CalendarPage() {
  const today = useMemo(() => new Date(), [])
  const [viewMode, setViewMode]   = useState<ViewMode>('month')
  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today))
  const [viewDay, setViewDay]     = useState(() => new Date(today))
  const [dayModal, setDayModal]   = useState<DayModal>(null)
  const [rangeModal, setRangeModal] = useState<{ start: string; end: string } | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { events, updateEvent } = useCalendarStore()
  const todos = useTodoStore((s) => s.todos)
  const holidays = useHolidays(viewYear)

  // 완료 이력이 있는 날짜 집합 (현재 완료 상태와 무관하게 completedAt 기준)
  const completedTodoDates = useMemo(() => {
    const set = new Set<string>()
    todos.forEach((t) => { if (t.completedAt) set.add(t.completedAt) })
    return set
  }, [todos])

  // 월 이동
  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
    else setViewMonth((m) => m + 1)
  }

  // 주 이동
  const prevWeek = () => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })
  const nextWeek = () => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })

  // 일 이동
  const prevDay = () => setViewDay((d) => { const n = new Date(d); n.setDate(n.getDate() - 1); return n })
  const nextDay = () => setViewDay((d) => { const n = new Date(d); n.setDate(n.getDate() + 1); return n })

  const goToToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setWeekStart(getWeekStart(today))
    setViewDay(new Date(today))
  }

  const filteredEvents = useMemo(
    () => activeCategory ? events.filter((e) => e.category === activeCategory) : events,
    [events, activeCategory]
  )

  // 헤더 타이틀
  const headerTitle = useMemo(() => {
    if (viewMode === 'month') return `${viewYear}년 ${MONTH_NAMES[viewMonth]}`
    if (viewMode === 'day') {
      const m = viewDay.getMonth() + 1
      const d = viewDay.getDate()
      return `${viewDay.getFullYear()}년 ${m}월 ${d}일`
    }
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const sm = weekStart.getMonth() + 1
    const em = weekEnd.getMonth() + 1
    const sy = weekStart.getFullYear()
    const ey = weekEnd.getFullYear()
    if (sy !== ey) return `${sy}년 ${sm}월 ${weekStart.getDate()}일 - ${ey}년 ${em}월 ${weekEnd.getDate()}일`
    if (sm !== em) return `${sy}년 ${sm}월 ${weekStart.getDate()}일 - ${em}월 ${weekEnd.getDate()}일`
    return `${sy}년 ${sm}월 ${weekStart.getDate()}일 - ${weekEnd.getDate()}일`
  }, [viewMode, viewYear, viewMonth, weekStart, viewDay])

  const handlePrev = () => {
    if (viewMode === 'month') prevMonth()
    else if (viewMode === 'week') prevWeek()
    else prevDay()
  }
  const handleNext = () => {
    if (viewMode === 'month') nextMonth()
    else if (viewMode === 'week') nextWeek()
    else nextDay()
  }

  // 일간 뷰 클릭 시 해당 날짜로 이동
  const handleDayClick = (date: string) => {
    const [y, m, d] = date.split('-').map(Number)
    setViewDay(new Date(y, m - 1, d))
    setViewMode('day')
  }

  return (
    <div className="flex flex-col h-screen p-4 md:p-6 gap-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => viewMode === 'month' && setShowPicker((v) => !v)}
              className={`flex items-center gap-1.5 group ${viewMode !== 'month' ? 'cursor-default' : ''}`}
            >
              <h1 className="text-xl font-bold group-hover:text-neutral-300 transition-colors">
                {headerTitle}
              </h1>
              {viewMode === 'month' && (
                <ChevronDown size={17} className={`text-neutral-500 group-hover:text-neutral-300 transition-all ${showPicker ? 'rotate-180' : ''}`} />
              )}
            </button>
            {showPicker && viewMode === 'month' && (
              <MonthPicker
                year={viewYear} month={viewMonth}
                onSelect={(y, m) => { setViewYear(y); setViewMonth(m) }}
                onClose={() => setShowPicker(false)}
              />
            )}
          </div>

          <button onClick={goToToday} className="text-xs px-2.5 py-1 rounded-md border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors">
            오늘
          </button>

          {/* 뷰 전환 버튼 */}
          <div className="flex gap-0.5 p-0.5 bg-neutral-800/60 rounded-lg">
            {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === mode ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {VIEW_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={handlePrev} className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={handleNext} className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setDayModal({ date: toDateStr(today.getFullYear(), today.getMonth(), today.getDate()), startAdd: true })}
            className="ml-2 flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-white text-neutral-900 font-medium hover:bg-neutral-100 transition-colors"
          >
            <Plus size={15} />
            일정 추가
          </button>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${activeCategory === null ? 'bg-white text-neutral-900' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
        >
          전체
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${activeCategory === cat.id ? 'bg-white text-neutral-900' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* 뷰 렌더링 */}
      {viewMode === 'month' && (
        <CalendarGrid
          year={viewYear} month={viewMonth}
          events={filteredEvents}
          holidays={holidays}
          completedTodoDates={completedTodoDates}
          onDayClick={(date) => setDayModal({ date })}
          onDayDoubleClick={handleDayClick}
          onEventClick={(ev) => setDayModal({ date: ev.date })}
          onEventDrop={(eventId, newDate) => updateEvent(eventId, { date: newDate })}
          onRangeSelect={(start, end) => setRangeModal({ start, end })}
        />
      )}
      {viewMode === 'week' && (
        <WeekView
          weekStart={weekStart}
          events={filteredEvents}
          holidays={holidays}
          onDayClick={handleDayClick}
          onEventClick={(ev) => setDayModal({ date: ev.date })}
          onSlotClick={(date, startTime, endTime) => setDayModal({ date, startAdd: true, startTime, endTime })}
        />
      )}
      {viewMode === 'day' && (
        <DayView
          date={viewDay}
          events={filteredEvents}
          holidays={holidays}
          onEventClick={(ev) => setDayModal({ date: ev.date })}
          onSlotClick={(date, startTime, endTime) => setDayModal({ date, startAdd: true, startTime, endTime })}
        />
      )}

      {dayModal && (
        <DayDetailModal
          date={dayModal.date}
          holidayName={holidays[dayModal.date]}
          initialEvent={dayModal.initialEvent}
          startAdd={dayModal.startAdd}
          startTime={dayModal.startTime}
          endTime={dayModal.endTime}
          onClose={() => setDayModal(null)}
        />
      )}
      {rangeModal && (
        <RangeAddModal
          startDate={rangeModal.start}
          endDate={rangeModal.end}
          onClose={() => setRangeModal(null)}
        />
      )}
    </div>
  )
}
