'use client'

// 네이티브 <input type="time">은 플랫폼마다 UI가 달라 select 기반으로 대체
// Windows: 시계 아이콘 + 드롭다운 / Mac Safari: 아이콘 없음 + 터치 이슈
const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

const SELECT_CLS = 'flex-1 min-w-0 bg-neutral-800 text-sm text-white py-2.5 outline-none cursor-pointer [color-scheme:dark]'

type Props = {
  value: string   // "HH:MM" 또는 ""
  onChange: (v: string) => void
}

export default function TimeInput({ value, onChange }: Props) {
  const h = value ? value.split(':')[0] : ''
  const m = value ? value.split(':')[1] : ''

  // 기존에 저장된 분 값이 5분 단위가 아닐 경우 목록에 추가
  const minuteOptions = m && !MINUTES.includes(m)
    ? [...MINUTES, m].sort((a, b) => Number(a) - Number(b))
    : MINUTES

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
      <select
        value={h}
        onChange={(e) => handleHour(e.target.value)}
        className={`${SELECT_CLS} pl-3 pr-1`}
      >
        <option value="">--시</option>
        {HOURS.map((hr) => (
          <option key={hr} value={hr}>{Number(hr)}시</option>
        ))}
      </select>
      <span className="text-neutral-600 text-sm select-none shrink-0 px-0.5">:</span>
      <select
        value={m}
        onChange={(e) => handleMinute(e.target.value)}
        className={`${SELECT_CLS} pl-1 pr-3`}
      >
        <option value="">--분</option>
        {minuteOptions.map((min) => (
          <option key={min} value={min}>{Number(min)}분</option>
        ))}
      </select>
    </div>
  )
}
