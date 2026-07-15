'use client'

import { useState } from 'react'
import { X, Check, CalendarDays } from 'lucide-react'
import { useCalendarStore } from '@/store/calendarStore'
import { getDateRange, formatDateLabel } from '@/lib/date'
import { CATEGORIES } from '@/lib/categories'
import ColorPicker from './ColorPicker'
import { PRESET_COLORS } from '@/lib/colors'
import { REMINDER_OPTIONS } from '@/constants/reminders'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'
import TimeInput from '@/components/ui/TimeInput'

type Props = {
  startDate: string
  endDate: string
  onClose: () => void
}

export default function RangeAddModal({ startDate, endDate, onClose }: Props) {
  const { addEvent } = useCalendarStore()
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [color, setColor] = useState<string>(PRESET_COLORS[0])
  const [reminder, setReminder] = useState<number | undefined>(undefined)
  const [category, setCategory] = useState<string | undefined>(undefined)

  const { request: requestNotification } = useNotificationPermission()
  const dates = getDateRange(startDate, endDate)
  const isSameDay = dates.length === 1
  const rangeLabel = isSameDay
    ? formatDateLabel(dates[0])
    : `${formatDateLabel(dates[0])} – ${formatDateLabel(dates[dates.length - 1])}`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addEvent({
      id: crypto.randomUUID(),
      title: title.trim(),
      date: dates[0],
      endDate: dates.length > 1 ? dates[dates.length - 1] : undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      color,
      reminder,
      category,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <h2 className="text-base font-semibold">일정 추가</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {/* 날짜 범위 표시 */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-800 mb-4">
            <CalendarDays size={14} className="text-neutral-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-white font-medium truncate">{rangeLabel}</p>
              {!isSameDay && (
                <p className="text-xs text-neutral-500 mt-0.5">총 {dates.length}일 · 연속 일정으로 등록됩니다</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-neutral-400 mb-1.5 block">제목</label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="일정 제목을 입력하세요"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-neutral-500 transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1 min-w-0">
                <label className="text-xs text-neutral-400 mb-1.5 block">시작 시간</label>
                <TimeInput value={startTime} onChange={setStartTime} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs text-neutral-400 mb-1.5 block">종료 시간</label>
                <TimeInput value={endTime} onChange={setEndTime} />
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-400 mb-1.5 block">카테고리</label>
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(category === cat.id ? undefined : cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      category === cat.id
                        ? 'bg-white text-neutral-900'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-400 mb-1.5 block">미리 알림</label>
              <div className="flex gap-1.5 flex-wrap">
                {REMINDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={async () => {
                      setReminder(opt.value)
                      if (opt.value !== undefined) await requestNotification()
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      reminder === opt.value
                        ? 'bg-white text-neutral-900'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {reminder !== undefined && !startTime && (
                <p className="text-xs text-amber-400 mt-1.5">시작 시간을 설정해야 알림이 작동합니다</p>
              )}
            </div>

            <div>
              <ColorPicker value={color} onChange={setColor} />
            </div>

            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-neutral-800 text-neutral-400 hover:bg-neutral-700 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-lg text-sm font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check size={14} />
                추가
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
