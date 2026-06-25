'use client'

import { useState, useMemo } from 'react'
import { X, Plus, ChevronRight, ChevronLeft, Trash2, Check, Bell } from 'lucide-react'
import { useCalendarStore } from '@/store/calendarStore'
import { useTodoStore } from '@/store/todoStore'
import { formatDateLabel, parseDateStr, getEventsForDate } from '@/lib/date'
import { CATEGORIES, getCategoryById } from '@/lib/categories'
import type { CalendarEvent } from '@/types'
import ColorPicker from './ColorPicker'
import { REMINDER_OPTIONS } from '@/constants/reminders'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'
import CheckIcon from '@/components/ui/CheckIcon'

type View = 'list' | 'add' | { type: 'edit'; event: CalendarEvent }

type Props = {
  date: string
  holidayName?: string
  initialEvent?: CalendarEvent
  startAdd?: boolean
  startTime?: string
  endTime?: string
  onClose: () => void
}

function EventForm({
  initialTitle = '',
  initialDate,
  initialStartTime = '',
  initialEndTime = '',
  initialColor = '#ef4444',
  initialReminder,
  initialCategory,
  submitLabel,
  onSubmit,
  onCancel,
  onDelete,
}: {
  initialTitle?: string
  initialDate: string
  initialStartTime?: string
  initialEndTime?: string
  initialColor?: string
  initialReminder?: number
  initialCategory?: string
  submitLabel: string
  onSubmit: (data: { title: string; date: string; startTime: string; endTime: string; color: string; reminder: number | undefined; category: string | undefined }) => void
  onCancel: () => void
  onDelete?: () => void
}) {
  const { request: requestNotification } = useNotificationPermission()
  const [title, setTitle] = useState(initialTitle)
  const [date, setDate] = useState(initialDate)
  const [startTime, setStartTime] = useState(initialStartTime)
  const [endTime, setEndTime] = useState(initialEndTime)
  const [color, setColor] = useState(initialColor)
  const [reminder, setReminder] = useState<number | undefined>(initialReminder)
  const [category, setCategory] = useState<string | undefined>(initialCategory)
  const [titleError, setTitleError] = useState(false)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!title.trim()) { setTitleError(true); return }
        onSubmit({ title: title.trim(), date, startTime, endTime, color, reminder, category })
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

// ── 메인 컴포넌트 ────────────────────────────────────────────────────
export default function DayDetailModal({ date, holidayName, initialEvent, startAdd, startTime, endTime, onClose }: Props) {
  const { events, addEvent, updateEvent, deleteEvent } = useCalendarStore()
  const todos = useTodoStore((s) => s.todos)
  const completedTodos = useMemo(
    () => todos.filter((t) => t.completedAt === date),
    [todos, date]
  )

  const [view, setView] = useState<View>(
    initialEvent ? { type: 'edit', event: initialEvent }
    : startAdd   ? 'add'
    : 'list'
  )
  const [confirmAll, setConfirmAll] = useState(false)

  const { year, month, day } = parseDateStr(date)
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][new Date(year, month - 1, day).getDay()]
  const dateLabel = `${month}월 ${day}일 (${weekday})`

  // 여러 날 일정도 해당 날짜가 범위 안에 있으면 포함
  const dayEvents = useMemo(() =>
    getEventsForDate(events, date).sort((a, b) => {
      if (!!a.endDate !== !!b.endDate) return a.endDate ? -1 : 1
      return (a.startTime ?? '').localeCompare(b.startTime ?? '')
    }),
    [events, date]
  )

  const headerTitle =
    view === 'list' ? dateLabel
    : view === 'add' ? '일정 추가'
    : '일정 수정'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-800">
          {view !== 'list' && (
            <button
              onClick={() => setView('list')}
              className="p-1 rounded-lg text-neutral-500 hover:text-white transition-colors -ml-1"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <h2 className="text-base font-semibold shrink-0">{headerTitle}</h2>
            {view === 'list' && holidayName && (
              <span className="text-sm text-rose-400 font-medium truncate">{holidayName}</span>
            )}
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {/* ── 목록 뷰 ── */}
          {view === 'list' && (
            <div className="flex flex-col gap-3">
              {dayEvents.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-6">등록된 일정이 없습니다</p>
              ) : (
                <ul className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                  {dayEvents.map((ev) => (
                    <li
                      key={ev.id}
                      onClick={() => setView({ type: 'edit', event: ev })}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 cursor-pointer transition-colors group"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: ev.color ?? '#6366f1' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium truncate">{ev.title}</p>
                          {ev.category && (() => {
                            const cat = getCategoryById(ev.category)
                            return cat ? (
                              <span
                                className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                                style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                              >
                                {cat.label}
                              </span>
                            ) : null
                          })()}
                        </div>
                        {ev.endDate ? (
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {formatDateLabel(ev.date)} – {formatDateLabel(ev.endDate)}
                          </p>
                        ) : (ev.startTime || ev.endTime) && (
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {ev.startTime ?? ''}{ev.startTime && ev.endTime ? ' – ' : ''}{ev.endTime ?? ''}
                          </p>
                        )}
                      </div>
                      {ev.reminder !== undefined && (
                        <Bell size={12} className="text-neutral-500 shrink-0" />
                      )}
                      <ChevronRight size={14} className="text-neutral-600 group-hover:text-neutral-400 shrink-0" />
                    </li>
                  ))}
                </ul>
              )}

              {/* 완료한 할일 */}
              {completedTodos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-px bg-neutral-800" />
                    <span className="text-xs text-neutral-600 shrink-0">완료한 할일 {completedTodos.length}개</span>
                    <div className="flex-1 h-px bg-neutral-800" />
                  </div>
                  <ul className="flex flex-col gap-1">
                    {completedTodos.map((todo) => (
                      <li key={todo.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-neutral-800/50">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 shrink-0 flex items-center justify-center">
                          <CheckIcon size={8} />
                        </div>
                        <span className="text-sm text-neutral-500 line-through truncate">{todo.title}</span>
                        {todo.tags?.map((tag) => (
                          <span key={tag} className="text-[10px] bg-neutral-800 text-neutral-600 px-1.5 py-0.5 rounded shrink-0">#{tag}</span>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('add')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-dashed border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors"
                >
                  <Plus size={15} />
                  일정 추가
                </button>
                {dayEvents.length > 0 && (
                  confirmAll ? (
                    <>
                      <button
                        onClick={() => setConfirmAll(false)}
                        className="px-3 py-2.5 rounded-xl text-sm font-medium bg-neutral-800 text-neutral-400 hover:bg-neutral-700 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => {
                          dayEvents.forEach((ev) => deleteEvent(ev.id))
                          setConfirmAll(false)
                        }}
                        className="px-3 py-2.5 rounded-xl text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 transition-colors whitespace-nowrap"
                      >
                        전체 삭제
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmAll(true)}
                      title="이 날 일정 전체 삭제"
                      className="shrink-0 p-2.5 rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* ── 추가 뷰 ── */}
          {view === 'add' && (
            <EventForm
              initialDate={date}
              initialStartTime={startTime}
              initialEndTime={endTime}
              submitLabel="추가"
              onSubmit={(data) => {
                addEvent({
                  id: crypto.randomUUID(),
                  title: data.title,
                  date: data.date,
                  startTime: data.startTime || undefined,
                  endTime: data.endTime || undefined,
                  color: data.color,
                  reminder: data.reminder,
                  category: data.category,
                })
                setView('list')
              }}
              onCancel={() => setView('list')}
            />
          )}

          {/* ── 수정 뷰 ── */}
          {typeof view === 'object' && view.type === 'edit' && (
            <EventForm
              initialTitle={view.event.title}
              initialDate={view.event.date}
              initialStartTime={view.event.startTime}
              initialEndTime={view.event.endTime}
              initialColor={view.event.color}
              initialReminder={view.event.reminder}
              initialCategory={view.event.category}
              submitLabel="저장"
              onSubmit={(data) => {
                updateEvent(view.event.id, {
                  title: data.title,
                  date: data.date,
                  startTime: data.startTime || undefined,
                  endTime: data.endTime || undefined,
                  color: data.color,
                  reminder: data.reminder,
                  category: data.category,
                })
                setView('list')
              }}
              onCancel={() => setView('list')}
              onDelete={() => {
                deleteEvent(view.event.id)
                setView('list')
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
