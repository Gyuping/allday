'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, CheckSquare, Timer } from 'lucide-react'

const NAV_ITEMS = [
  { label: '홈', href: '/', icon: LayoutDashboard },
  { label: '캘린더', href: '/calendar', icon: CalendarDays },
  { label: 'To-Do', href: '/todo', icon: CheckSquare },
  { label: '타이머', href: '/pomodoro', icon: Timer },
]

export default function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-800 flex">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center flex-1 py-2 gap-0.5 text-xs font-medium transition-colors ${
              active ? 'text-white' : 'text-neutral-500'
            }`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
