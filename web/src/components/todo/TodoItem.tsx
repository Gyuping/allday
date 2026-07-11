'use client'

import { Trash2, Pencil } from 'lucide-react'
import type { Todo } from '@/types'
import { PRIORITY_CONFIG } from '@/lib/priorities'
import CheckIcon from '@/components/ui/CheckIcon'

type Props = {
  todo: Todo
  onToggle: () => void
  onDelete: () => void
  onEdit: () => void
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {
  const p = PRIORITY_CONFIG[todo.priority]

  // 마감일이 오늘보다 이전이면 기한 초과 (완료된 항목은 표시 안 함)
  // toLocaleDateString('sv-SE') — 시스템 타임존 기준 YYYY-MM-DD (toISOString은 UTC라 자정 근처 오차 발생)
  const isOverdue = !todo.completed && todo.dueDate && todo.dueDate < new Date().toLocaleDateString('sv-SE')

  return (
    <div
      onDoubleClick={() => !todo.completed && onEdit()}
      className={`group flex items-start gap-3 bg-neutral-900 border rounded-xl px-4 py-3.5 transition-colors cursor-default ${
        todo.completed ? 'border-neutral-800/60 opacity-60' : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      {/* 우선순위 색상 바 (좌측) */}
      <div className={`w-1 rounded-full shrink-0 self-stretch ${p.bar}`} />

      {/* 완료 체크박스 */}
      <button
        onClick={onToggle}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
          todo.completed ? 'bg-emerald-500 border-emerald-500' : 'border-neutral-600 hover:border-neutral-400'
        }`}
      >
        {todo.completed && <CheckIcon />}
      </button>

      {/* 할일 내용 영역 */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${todo.completed ? 'line-through text-neutral-500' : 'text-neutral-100'}`}>
          {todo.title}
        </p>
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
          {todo.dueDate && (
            <span className={`text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-neutral-500'}`}>
              {isOverdue ? '⚠ ' : ''}{todo.dueDate}
            </span>
          )}
          <span className={`text-xs ${p.text}`}>{p.label}</span>
          {todo.tags?.map((tag) => (
            <span key={tag} className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-md">#{tag}</span>
          ))}
        </div>
      </div>

      {/* 액션 버튼 — 마우스 기기: hover 시 표시 / 터치 기기: 항상 표시 */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 shrink-0 transition-opacity">
        {!todo.completed && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            className="p-1.5 rounded-lg text-neutral-600 hover:text-blue-400 hover:bg-neutral-800 transition-colors"
          >
            <Pencil size={14} />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-neutral-800 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
