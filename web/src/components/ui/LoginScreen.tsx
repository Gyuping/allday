'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-neutral-950">
      <div className="flex flex-col items-center gap-8 p-10 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="text-center">
          <h1
            className="text-4xl tracking-[-0.03em] select-none mb-2"
            style={{ fontFamily: 'var(--font-logo)' }}
          >
            <span className="text-white">My All</span>
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              ~Day
            </span>
          </h1>
          <p className="text-sm text-neutral-500">캘린더 · 할일 · 포모도로를 한 곳에</p>
        </div>

        <div className="w-full h-px bg-neutral-800" />

        <div className="flex flex-col items-center gap-3 w-full">
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-neutral-900 font-semibold text-sm hover:bg-neutral-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            Google로 시작하기
          </button>
          <p className="text-xs text-neutral-600 text-center">
            로그인하면 모든 기기에서 데이터가 동기화돼요
          </p>
        </div>
      </div>
    </div>
  )
}
