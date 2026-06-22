'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

type Props = {
  year: number
  month: number
  onSelect: (year: number, month: number) => void
  onClose: () => void
}

export default function MonthPicker({ year, month, onSelect, onClose }: Props) {
  const [pickerYear, setPickerYear] = useState(year)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-2 z-50 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-4 w-60"
    >
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setPickerYear((y) => y - 1)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-sm font-semibold text-white">{pickerYear}년</span>
        <button
          onClick={() => setPickerYear((y) => y + 1)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {MONTHS.map((label, i) => {
          const isSelected = pickerYear === year && i === month
          return (
            <button
              key={label}
              onClick={() => { onSelect(pickerYear, i); onClose() }}
              className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-white text-neutral-900'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
