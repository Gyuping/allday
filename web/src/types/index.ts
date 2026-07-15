import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export type CalendarEvent = {
  id: string
  title: string
  date: string       // 시작일 (YYYY-MM-DD 형식)
  endDate?: string   // 종료일 — 여러 날에 걸친 일정일 때만 존재
  startTime?: string // 시작 시각 (HH:mm), 없으면 종일 일정으로 취급
  endTime?: string
  description?: string
  color?: string     // 16진수 색상 코드 (예: '#ef4444')
  reminder?: number  // 몇 분 전에 알림을 보낼지 (undefined = 알림 없음)
  category?: string  // 카테고리 id — src/lib/categories.ts 참고
}

export type Todo = {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string      // 마감일 (YYYY-MM-DD)
  createdAt: string     // 생성일시 (ISO 문자열)
  completedAt?: string  // 완료한 날짜 (YYYY-MM-DD) — 캘린더에 기록용
  archived?: boolean    // true면 To-Do 목록에서 숨김 (캘린더 점은 유지)
  tags?: string[]       // 소문자 태그 목록
}

export type PomodoroSettings = {
  workMinutes: number              // 집중 시간 (분)
  shortBreakMinutes: number        // 짧은 휴식 (분)
  longBreakMinutes: number         // 긴 휴식 (분)
  sessionsBeforeLongBreak: number  // 긴 휴식 전 집중 횟수
}

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak'

export type TodoFilter = 'all' | 'active' | 'completed'

export type TodoSort = 'createdAt' | 'dueDate' | 'priority'
