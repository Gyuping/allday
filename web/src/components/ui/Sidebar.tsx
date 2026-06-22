'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, CheckSquare, Timer } from 'lucide-react'

const NAV_ITEMS = [
  { label: '대시보드', href: '/', icon: LayoutDashboard },
  { label: '캘린더', href: '/calendar', icon: CalendarDays },
  { label: 'To-Do', href: '/todo', icon: CheckSquare },
  { label: '타이머', href: '/pomodoro', icon: Timer },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-neutral-900 text-white border-r border-neutral-800 shrink-0">
      <div className="px-6 py-6 border-b border-neutral-800">
        <span
          className="text-2xl tracking-[-0.03em] select-none"
          style={{ fontFamily: 'var(--font-logo)' }}
        >
          <span className="text-white">My All</span>
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            ~Day
          </span>
        </span>
      </div>

      <nav className="flex flex-col gap-1 p-3 mt-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-white text-neutral-900'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
