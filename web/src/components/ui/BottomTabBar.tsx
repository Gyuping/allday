'use client'

// 모바일 전용 하단 탭바 (md 미만에서만 표시)
// Sidebar와 NAV_ITEMS를 공유하며 mobileLabel(짧은 이름)을 사용한다.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/constants/navigation'

export default function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-800 flex">
      {NAV_ITEMS.map(({ mobileLabel, href, icon: Icon }) => {
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
            <span>{mobileLabel}</span>
          </Link>
        )
      })}
    </nav>
  )
}
