'use client'

// 클래스 컴포넌트 필수: componentDidCatch는 class에서만 사용 가능
import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
          <p className="text-4xl">⚠️</p>
          <div>
            <p className="text-base font-semibold text-neutral-200">문제가 발생했어요</p>
            <p className="text-sm text-neutral-500 mt-1">페이지를 새로고침하면 해결될 수 있어요.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-xl bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-100 transition-colors"
          >
            새로고침
          </button>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-neutral-700 max-w-sm break-all">{this.state.message}</p>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
