'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useCalendarStore } from '@/store/calendarStore'

const PRESET_COLORS = [
  // 레드 계열
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  // 그린 계열
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  // 블루 계열
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  // 퍼플/핑크 계열
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  // 라이트 톤
  '#fca5a5', '#fdba74', '#86efac', '#67e8f9',
  // 다크 톤
  '#b91c1c', '#15803d', '#1d4ed8', '#7c3aed',
]

type Props = {
  date: string
  onClose: () => void
}

export default function EventModal({ date, onClose }: Props) {
  const { addEvent } = useCalendarStore()
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState(date)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addEvent({
      id: crypto.randomUUID(),
      title: title.trim(),
      date: eventDate,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      color,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">일정 추가</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
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

          <div>
            <label className="text-xs text-neutral-400 mb-1.5 block">날짜</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-neutral-500 transition-colors [color-scheme:dark]"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-neutral-400 mb-1.5 block">시작 시간</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-neutral-500 transition-colors [color-scheme:dark]"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-neutral-400 mb-1.5 block">종료 시간</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-neutral-500 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 mb-2 block">색상</label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 2px #171717, 0 0 0 4px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
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
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
