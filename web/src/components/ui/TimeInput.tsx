'use client'

import { ChevronDown } from 'lucide-react'

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

type Props = {
  value: string   // "HH:MM" 또는 ""
  onChange: (v: string) => void
}

type SelectProps = {
  value: string
  options: { value: string; label: string }[]
  placeholder: string
  onChange: (v: string) => void
  side: 'left' | 'right'
}

function TimeSelect({ value, options, placeholder, onChange, side }: SelectProps) {
  return (
    <div className="relative flex-1 min-w-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none bg-neutral-800 text-sm py-2.5 pr-6 outline-none cursor-pointer [color-scheme:dark] ${
          side === 'left' ? 'pl-3' : 'pl-2'
        } ${!value ? 'text-neutral-500' : 'text-white'}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 shrink-0"
      />
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
    <div className="flex items-center w-full bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden transition-colors focus-within:border-neutral-500">
      <TimeSelect
        value={h}
        options={hourOptions}
        placeholder="--시"
        onChange={handleHour}
        side="left"
      />
      <span className="text-neutral-700 text-sm select-none shrink-0">:</span>
      <TimeSelect
        value={m}
        options={minuteOptions}
        placeholder="--분"
        onChange={handleMinute}
        side="right"
      />
    </div>
  )
}
