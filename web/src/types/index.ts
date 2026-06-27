// 앱 전체에서 사용하는 TypeScript 타입 정의 모음
// 새 타입이 필요하면 여기에 추가하고 import해서 사용

import type { LucideIcon } from 'lucide-react'

// 사이드바/하단탭에 표시할 네비게이션 항목
export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

// 캘린더 일정 하나를 나타내는 타입
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

// 할일(Todo) 하나를 나타내는 타입
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

// 포모도로 타이머 설정값
export type PomodoroSettings = {
  workMinutes: number              // 집중 시간 (분)
  shortBreakMinutes: number        // 짧은 휴식 (분)
  longBreakMinutes: number         // 긴 휴식 (분)
  sessionsBeforeLongBreak: number  // 긴 휴식 전 집중 횟수
}

// 포모도로 현재 단계
export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak'

// 할일 목록 필터 상태
export type TodoFilter = 'all' | 'active' | 'completed'

// 할일 목록 정렬 기준
export type TodoSort = 'createdAt' | 'dueDate' | 'priority'
