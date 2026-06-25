// 공통 Input 컴포넌트 — 앱 전체의 텍스트 입력 스타일을 통일한다.
// label prop을 넘기면 라벨도 같이 렌더링된다.
// forwardRef를 사용해 부모에서 ref로 포커스 제어가 가능하다.
import { forwardRef } from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, className = '', ...props }, ref) => (
  <div className={label ? 'flex flex-col gap-1.5' : undefined}>
    {label && <label className="text-xs text-neutral-400">{label}</label>}
    <input
      ref={ref}
      className={`w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors ${className}`}
      {...props}
    />
  </div>
))

Input.displayName = 'Input'
export default Input
