'use client'

// 포모도로 설정 모달의 한 행 — 레이블 + (-/+) 버튼 + 값 표시
// 더블클릭하면 직접 숫자를 입력할 수 있다.
import { useState, useRef } from 'react'

// 분 단위 숫자를 '1시간 30분' 같은 형태로 변환
function toDisplay(minutes: number) {
  if (minutes < 60) return `${minutes}분`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`
}

// 입력 문자열을 분 단위 숫자로 파싱
// "1:30" → 90, "90" → 90, 잘못된 형식이면 null 반환
function parseDraft(raw: string): number | null {
  const trimmed = raw.trim()
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    const [h, m] = trimmed.split(':').map(Number)
    if (m > 59) return null
    return h * 60 + m
  }
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed)
  }
  return null
}

export default function SettingRow({ label, unit, value, min, max, onChange }: {
  label: string; unit: string; value: number
  min: number; max: number; onChange: (v: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function openEditor() {
    const h = Math.floor(value / 60)
    const m = value % 60
    setDraft(h > 0 ? `${h}:${String(m).padStart(2, '0')}` : String(value))
    setError(false)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  // 입력 완료 시 호출 — 파싱 실패하면 빨간 배경으로 표시 후 닫힘
  function commit() {
    const n = parseDraft(draft)
    if (n === null || isNaN(n)) {
      setError(true)
      setTimeout(() => setEditing(false), 600)
      return
    }
    onChange(Math.min(max, Math.max(min, n)))  // min/max 범위 안으로 클램프
    setEditing(false)
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-neutral-300">{label}</span>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          {/* 60분 이상이면 5분 단위, 이하면 1분 단위로 조절 */}
          <button type="button" onClick={() => onChange(Math.max(min, value - (unit === '회' ? 1 : value >= 60 ? 5 : 1)))}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors flex items-center justify-center text-lg leading-none">
            −
          </button>

          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => { setDraft(e.target.value); setError(false) }}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit()
                if (e.key === 'Escape') setEditing(false)
              }}
              className={`w-24 text-center text-sm font-semibold tabular-nums rounded-lg py-1 text-white focus:outline-none transition-colors ${
                error
                  ? 'bg-red-900/40 border border-red-500/60'
                  : 'bg-neutral-700 border border-neutral-500 focus:border-white/50'
              }`}
              placeholder={unit === '분' ? '분 또는 시:분' : '숫자'}
              maxLength={5}
            />
          ) : (
            <span
              onClick={openEditor}
              title="클릭으로 직접 입력 (예: 90 또는 1:30)"
              className="w-24 text-center text-sm font-semibold tabular-nums cursor-text hover:text-white transition-colors select-none"
            >
              {unit === '분' ? toDisplay(value) : `${value}${unit}`}
            </span>
          )}

          <button type="button" onClick={() => onChange(Math.min(max, value + (unit === '회' ? 1 : value >= 60 ? 5 : 1)))}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors flex items-center justify-center text-lg leading-none">
            +
          </button>
        </div>
        {editing && unit === '분' && (
          <span className="text-[10px] text-neutral-600">분 단위 숫자 또는 시:분 (예: 1:30)</span>
        )}
      </div>
    </div>
  )
}
