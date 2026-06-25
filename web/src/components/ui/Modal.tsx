'use client'

// 공통 모달 래퍼 컴포넌트
// 배경 클릭 시 닫힘, 헤더(제목 + X 버튼) 포함
// 여러 모달이 같은 레이아웃을 쓰기 때문에 여기서 공통 부분을 처리한다.
import { X } from 'lucide-react'

type Props = {
  title: string
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string  // 기본값 'max-w-sm', 넓게 쓰려면 'max-w-md' 등 전달
}

export default function Modal({ title, onClose, children, maxWidth = 'max-w-sm' }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}  // 배경 클릭 시 닫기
    >
      <div
        className={`w-full ${maxWidth} bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl`}
        onClick={(e) => e.stopPropagation()}  // 모달 내부 클릭은 배경 클릭 이벤트로 전파되지 않게 막는다
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
