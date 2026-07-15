'use client'

import { useState } from 'react'
import { Trash2, Check } from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'
import { REMINDER_OPTIONS } from '@/constants/reminders'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'
import ColorPicker from './ColorPicker'
import TimeInput from '@/components/ui/TimeInput'

export type EventFormData = {
  title: string
  date: string
  endDate: string
  startTime: string
  endTime: string
  color: string
  reminder: number | undefined
  category: string | undefined
}

type Props = {
  initialTitle?: string
  initialDate: string
  initialEndDate?: string
  initialStartTime?: string
  initialEndTime?: string
  initialColor?: string
  initialReminder?: number
  initialCategory?: string
  submitLabel: string
  onSubmit: (data: EventFormData) => void
  onCancel: () => void
  onDelete?: () => void
}

export default function EventForm({
  initialTitle = '',
  initialDate,
  initialEndDate = '',
  initialStartTime = '',
  initialEndTime = '',
  initialColor = '#ef4444',
  initialReminder,
  initialCategory,
  submitLabel,
  onSubmit,
  onCancel,
  onDelete,
}: Props) {
  const { request: requestNotification } = useNotificationPermission()
  const [title, setTitle]       = useState(initialTitle)
  const [date, setDate]         = useState(initialDate)
  const [endDate, setEndDate]   = useState(initialEndDate)
  const [startTime, setStartTime] = useState(initialStartTime)
  const [endTime, setEndTime]   = useState(initialEndTime)
  const [color, setColor]       = useState(initialColor)
  const [reminder, setReminder] = useState<number | undefined>(initialReminder)
  const [category, setCategory] = useState<string | undefined>(initialCategory)
  const [titleError, setTitleError] = useState(false)
  const endDateError = endDate && endDate < date

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!title.trim()) { setTitleError(true); return }
        if (endDate && endDate < date) return
        onSubmit({ title: title.trim(), date, endDate, startTime, endTime, color, reminder, category })
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="text-xs text-neutral-400 mb-1.5 block">제목</label>
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setTitleError(false) }}
          placeholder="일정 제목을 입력하세요"
          className={`w-full bg-neutral-800 border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors ${
            titleError ? 'border-red-500 focus:border-red-400' : 'border-neutral-700 focus:border-neutral-500'
          }`}
        />
        {titleError && <p className="text-xs text-red-400 mt-1">제목을 입력해주세요.</p>}
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

      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <label className="text-xs text-neutral-400 mb-1.5 block">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate('') }}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-neutral-500 transition-colors [color-scheme:dark]"
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-xs text-neutral-400 mb-1.5 block">종료일 (선택)</label>
          <input
            type="date"
            value={endDate}
            min={date}
            onChange={(e) => setEndDate(e.target.value)}
            className={`w-full bg-neutral-800 border rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-neutral-500 transition-colors [color-scheme:dark] ${
              endDateError ? 'border-red-500' : 'border-neutral-700'
            }`}
          />
          {endDateError && <p className="text-xs text-red-400 mt-1">종료일이 시작일보다 이전입니다.</p>}
        </div>
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

      <ColorPicker value={color} onChange={setColor} />

      <div className="flex gap-2 mt-1">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
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
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
