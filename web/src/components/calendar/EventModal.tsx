'use client'

// 간단한 일정 추가 모달 — 제목, 날짜, 시간, 색상만 입력한다.
// 카테고리/알림 등 더 많은 옵션이 필요하면 DayDetailModal을 사용한다.
import { useState } from 'react'
import { X } from 'lucide-react'
import { useCalendarStore } from '@/store/calendarStore'
import ColorPicker from './ColorPicker'
import { PRESET_COLORS } from '@/lib/colors'

type Props = {
  date: string   // 기본으로 선택된 날짜 (YYYY-MM-DD)
  onClose: () => void
}

export default function EventModal({ date, onClose }: Props) {
  const { addEvent } = useCalendarStore()
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState(date)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [color, setColor] = useState<string>(PRESET_COLORS[0])
  const [titleError, setTitleError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setTitleError(true); return }
    await addEvent({
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
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
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
              onChange={(e) => { setTitle(e.target.value); setTitleError(false) }}
              placeholder="일정 제목을 입력하세요"
              className={`w-full bg-neutral-800 border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors ${
                titleError ? 'border-red-500 focus:border-red-400' : 'border-neutral-700 focus:border-neutral-500'
              }`}
            />
            {titleError && <p className="text-xs text-red-400 mt-1">제목을 입력해주세요.</p>}
          </div>

          <div>
            <label className="text-xs text-neutral-400 mb-1.5 block">날짜</label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-neutral-500 transition-colors [color-scheme:dark]"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-neutral-400 mb-1.5 block">시작 시간</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-neutral-500 transition-colors [color-scheme:dark]"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-neutral-400 mb-1.5 block">종료 시간</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-neutral-500 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          <ColorPicker value={color} onChange={setColor} />

          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-neutral-800 text-neutral-400 hover:bg-neutral-700 transition-colors">
              취소
            </button>
            <button type="submit" disabled={!title.trim()}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
