'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-neutral-400 mb-4">예기치 않은 오류가 발생했습니다.</p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-white text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-100 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
}
