'use client'

import { useState } from 'react'

type Props = {
  value: string
  onChange: (v: string) => void
}

// 네이티브 time input의 빈 값 표시가 플랫폼마다 달라
// Windows Chrome: "--:--", Mac Safari: "오전 12:00" 등으로 불일치
// 포커스 없고 값이 없을 때 항상 "--:--"로 표시해 통일
export default function TimeInput({ value, onChange }: Props) {
  const [focused, setFocused] = useState(false)
  const showPlaceholder = !value && !focused

  return (
    <div className="relative">
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-neutral-500 transition-colors [color-scheme:dark] ${
          showPlaceholder ? '[&::-webkit-datetime-edit]:opacity-0' : ''
        }`}
      />
      {showPlaceholder && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center px-3 text-sm text-neutral-500 pointer-events-none select-none"
        >
          --:--
        </span>
      )}
    </div>
  )
}
