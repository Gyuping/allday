import { LayoutDashboard, CalendarDays, CheckSquare, Timer } from 'lucide-react'

export const NAV_ITEMS = [
  { label: '대시보드', mobileLabel: '홈',      href: '/',         icon: LayoutDashboard },
  { label: '캘린더',   mobileLabel: '캘린더',  href: '/calendar', icon: CalendarDays    },
  { label: 'To-Do',    mobileLabel: 'To-Do',   href: '/todo',     icon: CheckSquare     },
  { label: '타이머',   mobileLabel: '타이머',  href: '/pomodoro', icon: Timer           },
]
