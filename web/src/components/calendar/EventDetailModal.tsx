'use client'

import { useState } from 'react'
import { X, Trash2, Pencil, Check } from 'lucide-react'
import { useCalendarStore } from '@/store/calendarStore'
import type { CalendarEvent } from '@/types'
import ColorPicker from './ColorPicker'
import { parseDateStr } from '@/lib/date'

type Props = {
  event: CalendarEvent
  onClose: () => void
}

export default function EventDetailModal({ event, onClose }: Props) {
  const { updateEvent, deleteEvent } = useCalendarStore()
  const [isEditing, setIsEditing] = useState(false)

  const [title, setTitle] = useState(event.title)
  const [date, setDate] = useState(event.date)
  const [startTime, setStartTime] = useState(event.startTime ?? '')
  const [endTime, setEndTime] = useState(event.endTime ?? '')
  const [color, setColor] = useState(event.color ?? '#6366f1')

  const { year, month, day } = parseDateStr(event.date)
  const dateLabel = `${year}년 ${month}월 ${day}일`

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    updateEvent(event.id, {
      title: title.trim(),
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      color,
    })
    setIsEditing(false)
  }

  const handleDelete = () => {
    deleteEvent(event.id)
    onClose()
  }

  const handleCancelEdit = () => {
    setTitle(event.title)
    setDate(event.date)
    setStartTime(event.startTime ?? '')
    setEndTime(event.endTime ?? '')
    setColor(event.color ?? '#6366f1')
    setIsEditing(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-neutral-300">
            {isEditing ? '일정 수정' : '일정 상세'}
          </h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {isEditing ? (
          /* ── 편집 모드 ── */
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-neutral-400 mb-1.5 block">제목</label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-neutral-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-400 mb-1.5 block">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
              <ColorPicker value={color} onChange={setColor} />
            </div>

            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-neutral-800 text-neutral-400 hover:bg-neutral-700 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-lg text-sm font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check size={15} />
                저장
              </button>
            </div>
          </form>
        ) : (
          /* ── 상세 보기 모드 ── */
          <>
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-3 h-3 rounded-full shrink-0 mt-1"
                style={{ backgroundColor: event.color ?? '#6366f1' }}
              />
              <p className="text-base font-semibold leading-snug">{event.title}</p>
            </div>

            <div className="flex flex-col gap-2 mb-6 pl-6 text-sm text-neutral-400">
              <span>{dateLabel}</span>
              {(event.startTime || event.endTime) && (
                <span>
                  {event.startTime ?? ''}
                  {event.startTime && event.endTime ? ' – ' : ''}
                  {event.endTime ?? ''}
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-lg text-sm font-medium bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-colors"
              >
                <Trash2 size={15} />
                삭제
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-lg text-sm font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                <Pencil size={15} />
                수정
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
