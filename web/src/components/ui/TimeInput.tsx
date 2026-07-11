'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

type Option = { value: string; label: string }

type Props = {
  value: string   // "HH:MM" 또는 ""
  onChange: (v: string) => void
}

type SelectProps = {
  value: string
  options: Option[]
  placeholder: string
  onChange: (v: string) => void
  side: 'left' | 'right'
}

// 네이티브 select 드롭다운은 OS가 렌더링해서 CSS로 다크 스타일 불가
// → 커스텀 드롭다운으로 완전 대체
function TimeSelect({ value, options, placeholder, onChange, side }: SelectProps) {
  const [open, setOpen]    = useState(false)
  const containerRef       = useRef<HTMLDivElement>(null)
  const selectedRef        = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [open])

  useEffect(() => {
    if (open) selectedRef.current?.scrollIntoView({ block: 'nearest' })
  }, [open])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      {/* 트리거 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-1 py-2.5 pr-2 text-sm outline-none rounded-md hover:bg-white/5 transition-colors ${
          side === 'left' ? 'pl-3' : 'pl-2'
        } ${value ? 'text-white' : 'text-neutral-500'}`}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-neutral-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 드롭다운 */}
      {open && (
        <ul className="absolute z-[100] top-[calc(100%+4px)] left-0 right-0 max-h-52 overflow-y-auto bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl py-1">
          <li>
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm text-neutral-500 hover:bg-white/5 transition-colors"
            >
              {placeholder}
            </button>
          </li>
          {options.map((o) => (
            <li key={o.value}>
              <button
                ref={o.value === value ? selectedRef : null}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  o.value === value
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function TimeInput({ value, onChange }: Props) {
  const h = value ? value.split(':')[0] : ''
  const m = value ? value.split(':')[1] : ''

  const minuteOptions = (() => {
    const opts = MINUTES.map((min) => ({ value: min, label: `${Number(min)}분` }))
    if (m && !MINUTES.includes(m)) {
      opts.push({ value: m, label: `${Number(m)}분` })
      opts.sort((a, b) => Number(a.value) - Number(b.value))
    }
    return opts
  })()

  const hourOptions = HOURS.map((hr) => ({ value: hr, label: `${Number(hr)}시` }))

  const handleHour = (newH: string) => {
    if (!newH) { onChange(''); return }
    onChange(`${newH}:${m || '00'}`)
  }

  const handleMinute = (newM: string) => {
    if (!newM) { onChange(''); return }
    onChange(`${h || '00'}:${newM}`)
  }

  return (
    <div className="flex items-center w-full bg-neutral-800 border border-neutral-700 rounded-lg transition-colors focus-within:border-neutral-500">
      <TimeSelect value={h} options={hourOptions} placeholder="--시" onChange={handleHour} side="left" />
      <span className="text-neutral-700 text-sm select-none shrink-0">:</span>
      <TimeSelect value={m} options={minuteOptions} placeholder="--분" onChange={handleMinute} side="right" />
    </div>
  )
}
