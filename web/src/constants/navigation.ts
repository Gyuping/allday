// 앱 네비게이션 항목 목록
// Sidebar(데스크톱)와 BottomTabBar(모바일) 양쪽에서 이 파일을 공유한다.
// label: 사이드바에 표시할 이름, mobileLabel: 하단탭에 표시할 짧은 이름
import { LayoutDashboard, CalendarDays, CheckSquare, Timer } from 'lucide-react'

export const NAV_ITEMS = [
  { label: '대시보드', mobileLabel: '홈',      href: '/',         icon: LayoutDashboard },
  { label: '캘린더',   mobileLabel: '캘린더',  href: '/calendar', icon: CalendarDays    },
  { label: 'To-Do',    mobileLabel: 'To-Do',   href: '/todo',     icon: CheckSquare     },
  { label: '타이머',   mobileLabel: '타이머',  href: '/pomodoro', icon: Timer           },
]
