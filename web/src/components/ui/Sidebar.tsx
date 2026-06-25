'use client'

// 데스크톱 전용 좌측 사이드바 네비게이션 (md 이상에서만 표시)
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/constants/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-neutral-900 text-white border-r border-neutral-800 shrink-0">
      {/* 로고 영역 */}
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
          // href가 '/'이면 정확히 일치해야 활성 상태 (캘린더가 '/'를 포함하지 않도록)
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
