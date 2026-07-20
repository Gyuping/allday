export type CalendarEvent = {
  id: string
  title: string
  date: string
  endDate?: string
  startTime?: string
  endTime?: string
  description?: string
  color?: string
  reminder?: number
  category?: string
}

export type Todo = {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
  completedAt?: string
  archived?: boolean
  tags?: string[]
}

export type PomodoroSettings = {
  workMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  sessionsBeforeLongBreak: number
}

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak'

export type TodoFilter = 'all' | 'active' | 'completed'

export type TodoSort = 'createdAt' | 'dueDate' | 'priority'
