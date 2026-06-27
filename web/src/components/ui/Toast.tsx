'use client'

// 화면 우측 하단에 떠오르는 토스트 알림 컴포넌트
import { useToastStore } from '@/store/toastStore'

const ICONS = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
}

const COLORS = {
  success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  error:   'bg-red-500/15 border-red-500/30 text-red-300',
  info:    'bg-neutral-800 border-neutral-700 text-neutral-300',
}

export default function ToastContainer() {
  const { toasts, remove } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl pointer-events-auto animate-in slide-in-from-right-4 duration-200 ${COLORS[t.type]}`}
          onClick={() => remove(t.id)}
        >
          <span className="text-base leading-none">{ICONS[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
