'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, RefreshCw, ChevronUp } from 'lucide-react'
import { NAV_ITEMS } from '@/constants/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout, signInWithGoogle } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  const handleSwitchAccount = async () => {
    setShowMenu(false)
    await logout()
    await signInWithGoogle()
  }

  const handleLogout = async () => {
    setShowMenu(false)
    await logout()
  }

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-neutral-900 text-white border-r border-neutral-800 shrink-0">
      <div className="px-6 py-6 border-b border-neutral-800">
        <Link
          href="/"
          className="text-2xl tracking-[-0.03em] select-none hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'var(--font-logo)' }}
        >
          <span className="text-white">My All</span>
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            ~Day
          </span>
        </Link>
      </div>

      <nav className="flex flex-col gap-1 p-3 mt-2 flex-1">
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

      <div className="p-3 border-t border-neutral-800 relative">
        {showMenu && (
          <div className="absolute bottom-16 left-3 right-3 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl overflow-hidden z-50">
            <button
              onClick={handleSwitchAccount}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-700 transition-colors"
            >
              <RefreshCw size={14} />
              계정 전환
            </button>
            <div className="h-px bg-neutral-700" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-neutral-700 transition-colors"
            >
              <LogOut size={14} />
              로그아웃
            </button>
          </div>
        )}

        <button
          onClick={() => setShowMenu((v) => !v)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          {user?.photoURL
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={user.photoURL} alt="프로필" className="w-7 h-7 rounded-full shrink-0" />
            : <div className="w-7 h-7 rounded-full bg-indigo-500 shrink-0 flex items-center justify-center text-xs font-bold">
                {user?.displayName?.[0] ?? '?'}
              </div>
          }
          <span className="text-xs text-neutral-400 truncate flex-1 text-left">
            {user?.displayName ?? user?.email}
          </span>
          <ChevronUp
            size={14}
            className={`text-neutral-600 shrink-0 transition-transform ${showMenu ? '' : 'rotate-180'}`}
          />
        </button>
      </div>
    </aside>
  )
}
