'use client'

// 할일 수정 모달 — 기존 값으로 미리 채워진 상태에서 편집한다.
import { useState, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import type { Todo } from '@/types'
import { PRIORITY_OPTIONS } from '@/lib/priorities'
import { useTagInput } from '@/hooks/useTagInput'
import Modal from '@/components/ui/Modal'

type Props = {
  todo: Todo
  onSave: (updated: Partial<Todo>) => void | Promise<void>
  onClose: () => void
}

export default function EditTodoModal({ todo, onSave, onClose }: Props) {
  const [title, setTitle]       = useState(todo.title)
  const [priority, setPriority] = useState(todo.priority)
  const [dueDate, setDueDate]   = useState(todo.dueDate ?? '')
  const { tags, tagInput, setTagInput, addTag, removeTag } = useTagInput(todo.tags ?? [])
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => { titleRef.current?.focus() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await onSave({ title: title.trim(), priority, dueDate: dueDate || undefined, tags: tags.length > 0 ? tags : undefined })
    onClose()
  }

  return (
    <Modal title="할일 수정" onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
        <input ref={titleRef} value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="무엇을 해야 하나요?"
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
        />

        <div>
          <label className="text-xs text-neutral-400 mb-2 block">우선순위</label>
          <div className="flex gap-2">
            {PRIORITY_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setPriority(opt.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  priority === opt.value ? 'bg-white text-neutral-900' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}>
                <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-neutral-400 mb-2 block">마감일 (선택)</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-500 transition-colors [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="text-xs text-neutral-400 mb-2 block">태그 (선택)</label>
          <div className="flex gap-2">
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder="태그 입력 후 Enter"
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
            />
            <button type="button" onClick={addTag} className="px-3 py-2.5 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors">
              <Plus size={16} />
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded-md">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-neutral-600 hover:text-white transition-colors">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-neutral-800 text-neutral-400 hover:bg-neutral-700 transition-colors">취소</button>
          <button type="submit" disabled={!title.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">저장</button>
        </div>
      </form>
    </Modal>
  )
}
