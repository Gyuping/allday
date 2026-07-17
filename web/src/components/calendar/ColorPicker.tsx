'use client'

import { useState, useRef, useCallback } from 'react'
import { PRESET_COLORS } from '@/lib/colors'
import { useColorLabelStore } from '@/store/colorLabelStore'

type Props = {
  value: string                   // 현재 선택된 색상
  onChange: (color: string) => void
}

export default function ColorPicker({ value, onChange }: Props) {
  const { labels, setLabel } = useColorLabelStore()
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDoubleClick = useCallback((color: string) => {
    setDraft(labels[color] ?? '')
    setEditing(color)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [labels])

  // 빈 문자열 저장 = 라벨 제거
  const handleLabelSave = useCallback(() => {
    if (editing) {
      setLabel(editing, draft.trim())
      setEditing(null)
    }
  }, [editing, draft, setLabel])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-neutral-400">색상</label>
        <span className="text-[10px] text-neutral-600">더블클릭 → 이름 설정</span>
      </div>
      <div className="grid grid-cols-8 gap-2">
        {PRESET_COLORS.map((c) => {
          const label = labels[c]
          return (
            <div key={c} className="flex flex-col items-center gap-1">
              <button
                type="button"
                title={label ? `${label} (더블클릭으로 편집)` : '더블클릭으로 이름 설정'}
                onClick={() => onChange(c)}
                onDoubleClick={() => handleDoubleClick(c)}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none relative"
                style={{
                  backgroundColor: c,
                  // 선택된 색상은 이중 링으로 강조 (안쪽: 배경색, 바깥쪽: 해당 색상)
                  boxShadow: value === c ? `0 0 0 2px #171717, 0 0 0 4px ${c}` : 'none',
                }}
              />
              {label && (
                <span className="text-[9px] text-neutral-500 text-center leading-tight max-w-[28px] truncate">
                  {label}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* 라벨 편집 입력창 — 더블클릭 시에만 표시 */}
      {editing && (
        <div className="mt-3 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: editing }} />
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLabelSave()
              if (e.key === 'Escape') setEditing(null)
            }}
            onBlur={handleLabelSave}
            placeholder="색상 이름 입력 (예: 병원)"
            className="flex-1 text-xs bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
            maxLength={10}
          />
          <button type="button" onClick={handleLabelSave}
            className="text-xs text-neutral-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors">
            저장
          </button>
        </div>
      )}
    </div>
  )
}
