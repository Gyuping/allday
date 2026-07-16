'use client'

import { AlertCircle } from 'lucide-react'

type Props = { message: string; onRetry: () => void }

export default function FetchErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center p-8">
      <AlertCircle size={32} className="text-red-400" />
      <p className="text-sm text-neutral-400">{message}</p>
      <button
        onClick={onRetry}
        className="px-5 py-2 rounded-xl bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-100 transition-colors"
      >
        다시 시도
      </button>
    </div>
  )
}
