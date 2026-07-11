'use client'

// 대시보드 홈 페이지 — 오늘의 일정, 할일, 포모도로 현황을 한눈에 보여준다.
// 각 섹션에서 클릭/완료 처리도 바로 가능하다.
import { useMemo } from 'react'
import Link from 'next/link'
import { CalendarDays, CheckSquare, Timer, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useCalendarStore } from '@/store/calendarStore'
import { useTodoStore } from '@/store/todoStore'
import { usePomodoroStore } from '@/store/pomodoroStore'
import { toDateStr } from '@/lib/date'
import { MONTH_NAMES } from '@/constants/calendar'
import { PRIORITY_CONFIG } from '@/lib/priorities'
import CheckIcon from '@/components/ui/CheckIcon'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
const PHASE_LABEL: Record<string, string> = { work: '집중', shortBreak: '짧은 휴식', longBreak: '긴 휴식' }

export default function DashboardPage() {
  const today = useMemo(() => new Date(), [])
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())

  const events = useCalendarStore((s) => s.events)
  const todos = useTodoStore((s) => s.todos)
  const toggleTodo = useTodoStore((s) => s.toggleTodo)
  const { sessionCount, phase, isRunning } = usePomodoroStore()

  const todayEvents = useMemo(
    () => events
      .filter((e) => e.date <= todayStr && (e.endDate ?? e.date) >= todayStr)
      .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? '')),
    [events, todayStr]
  )

  const pendingTodos = useMemo(
    () => todos.filter((t) => !t.completed).slice(0, 5),
    [todos]
  )

  const completedTodos = useMemo(
    () => todos.filter((t) => t.completed).slice(0, 5),
    [todos]
  )

  const completedCount = useMemo(
    () => todos.filter((t) => t.completed).length,
    [todos]
  )

  const dateLabel = `${today.getFullYear()}년 ${MONTH_NAMES[today.getMonth()]} ${today.getDate()}일`
  const dayLabel = DAY_NAMES[today.getDay()]

  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col gap-6">

      {/* 헤더 */}
      <div>
        <p className="text-neutral-500 text-sm">{dateLabel} ({dayLabel})</p>
        <h1 className="text-2xl font-bold mt-0.5">안녕하세요 👋</h1>
      </div>

      {/* 오늘의 일정 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-neutral-300">오늘의 일정</h2>
            {todayEvents.length > 0 && (
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">{todayEvents.length}</span>
            )}
          </div>
          <Link href="/calendar" className="flex items-center gap-0.5 text-xs text-neutral-500 hover:text-white transition-colors">
            전체 보기 <ChevronRight size={13} />
          </Link>
        </div>

        {todayEvents.length === 0 ? (
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-5 text-center text-neutral-600 text-sm">
            오늘 일정이 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {todayEvents.map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ev.color ?? '#6366f1' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ev.title}</p>
                  {ev.startTime && (
                    <p className="text-xs text-neutral-500 mt-0.5">{ev.startTime}{ev.endTime ? ` — ${ev.endTime}` : ''}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 할일 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-neutral-300">할일</h2>
            {todos.length > 0 && (
              <span className="text-xs text-neutral-500">{completedCount}/{todos.length} 완료</span>
            )}
          </div>
          <Link href="/todo" className="flex items-center gap-0.5 text-xs text-neutral-500 hover:text-white transition-colors">
            전체 보기 <ChevronRight size={13} />
          </Link>
        </div>

        {pendingTodos.length === 0 ? (
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-5 text-center text-neutral-600 text-sm">
            {todos.length === 0 ? '할일이 없습니다.' : '모든 할일을 완료했어요! 🎉'}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingTodos.map((todo) => (
              <div
                key={todo.id}
                className="group flex items-center gap-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-4 py-3 transition-colors cursor-pointer"
                onClick={() => { toggleTodo(todo.id).catch(() => {}) }}
              >
                <div className="w-5 h-5 rounded-full border-2 border-neutral-600 group-hover:border-emerald-500 flex items-center justify-center transition-colors shrink-0">
                  <CheckCircle2 size={12} className="text-neutral-700 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate group-hover:text-neutral-300 transition-colors">{todo.title}</p>
                  {todo.dueDate && (
                    <p className="text-xs text-neutral-500 mt-0.5">마감 {todo.dueDate}</p>
                  )}
                </div>
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_CONFIG[todo.priority].color}`} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 완료된 할일 */}
      {completedTodos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-neutral-600" />
              <h2 className="text-sm font-semibold text-neutral-500">완료</h2>
              <span className="text-xs text-neutral-600">{completedCount}개</span>
            </div>
            <Link href="/todo" className="flex items-center gap-0.5 text-xs text-neutral-600 hover:text-white transition-colors">
              전체 보기 <ChevronRight size={13} />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {completedTodos.map((todo) => (
              <div
                key={todo.id}
                className="group flex items-center gap-3 rounded-xl bg-neutral-900/60 border border-neutral-800/60 px-4 py-3 opacity-60 hover:opacity-80 transition-opacity cursor-pointer"
                onClick={() => { toggleTodo(todo.id).catch(() => {}) }}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <CheckIcon />
                </div>
                <p className="text-sm text-neutral-500 line-through truncate flex-1">{todo.title}</p>
                {todo.completedAt && (
                  <span className="text-xs text-neutral-700 shrink-0">{todo.completedAt}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 포모도로 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-sky-400" />
            <h2 className="text-sm font-semibold text-neutral-300">포모도로</h2>
          </div>
          <Link href="/pomodoro" className="flex items-center gap-0.5 text-xs text-neutral-500 hover:text-white transition-colors">
            타이머 열기 <ChevronRight size={13} />
          </Link>
        </div>

        <div className="rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-neutral-400">오늘 완료한 세션</p>
            <p className="text-2xl font-bold mt-0.5">{sessionCount}<span className="text-sm font-normal text-neutral-500 ml-1">회</span></p>
          </div>
          {isRunning && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {PHASE_LABEL[phase]} 중
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
