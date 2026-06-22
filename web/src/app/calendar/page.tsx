'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, Plus } from 'lucide-react'
import CalendarGrid from '@/components/calendar/CalendarGrid'
import DayDetailModal from '@/components/calendar/DayDetailModal'
import RangeAddModal from '@/components/calendar/RangeAddModal'
import MonthPicker from '@/components/calendar/MonthPicker'
import { useCalendarStore } from '@/store/calendarStore'
import { useHolidays } from '@/hooks/useHolidays'
import { toDateStr } from '@/lib/date'
import { CATEGORIES } from '@/lib/categories'
import type { CalendarEvent } from '@/types'

const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

type DayModal = { date: string; initialEvent?: CalendarEvent; startAdd?: boolean } | null

export default function CalendarPage() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [dayModal, setDayModal] = useState<DayModal>(null)
  const [rangeModal, setRangeModal] = useState<{ start: string; end: string } | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { events, updateEvent } = useCalendarStore()
  const holidays = useHolidays(viewYear)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
    else setViewMonth((m) => m + 1)
  }
  const goToToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }

  const filteredEvents = activeCategory
    ? events.filter((e) => e.category === activeCategory)
    : events

  return (
    <div className="flex flex-col h-screen p-4 md:p-6 gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowPicker((v) => !v)}
              className="flex items-center gap-1.5 group"
            >
              <h1 className="text-xl font-bold group-hover:text-neutral-300 transition-colors">
                {viewYear}년 {MONTH_NAMES[viewMonth]}
              </h1>
              <ChevronDown
                size={17}
                className={`text-neutral-500 group-hover:text-neutral-300 transition-all ${showPicker ? 'rotate-180' : ''}`}
              />
            </button>

            {showPicker && (
              <MonthPicker
                year={viewYear}
                month={viewMonth}
                onSelect={(y, m) => { setViewYear(y); setViewMonth(m) }}
                onClose={() => setShowPicker(false)}
              />
            )}
          </div>

          <button
            onClick={goToToday}
            className="text-xs px-2.5 py-1 rounded-md border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
          >
            오늘
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() =>
              setDayModal({
                date: toDateStr(today.getFullYear(), today.getMonth(), today.getDate()),
                startAdd: true,
              })
            }
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
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeCategory === null
              ? 'bg-white text-neutral-900'
              : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          전체
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-white text-neutral-900'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
            {cat.label}
          </button>
        ))}
      </div>

      <CalendarGrid
        year={viewYear}
        month={viewMonth}
        events={filteredEvents}
        holidays={holidays}
        onDayClick={(date) => setDayModal({ date })}
        onEventClick={(ev) => setDayModal({ date: ev.date })}
        onEventDrop={(eventId, newDate) => updateEvent(eventId, { date: newDate })}
        onRangeSelect={(start, end) => setRangeModal({ start, end })}
      />

      {dayModal && (
        <DayDetailModal
          date={dayModal.date}
          holidayName={holidays[dayModal.date]}
          initialEvent={dayModal.initialEvent}
          startAdd={dayModal.startAdd}
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
