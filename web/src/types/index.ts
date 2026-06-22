export type NavItem = {
  label: string
  href: string
  icon: string
}

export type CalendarEvent = {
  id: string
  title: string
  date: string       // 시작일 (단일 일정이면 유일한 날짜)
  endDate?: string   // 종료일 (여러 날 일정일 때만)
  startTime?: string
  endTime?: string
  description?: string
  color?: string
  reminder?: number  // 이벤트 시작 몇 분 전에 알림 (undefined = 알림 없음)
  category?: string  // category id (see src/lib/categories.ts)
}

export type Todo = {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
}

export type PomodoroSettings = {
  workMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  sessionsBeforeLongBreak: number
}

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak'
