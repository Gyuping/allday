'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { useCategoryStore } from '@/store/categoryStore'
import { getEventCountByCategory } from '@/lib/firestore/categories'
import { PRESET_COLORS } from '@/lib/colors'
import { toast } from '@/store/toastStore'
import type { Category } from '@/lib/categories'

type Draft = { label: string; color: string }
type DelConfirm = { id: string; label: string; count: number; targetId: string; targetLabel: string }

export default function CategoryManager() {
  const { categories, userId, addCategory, updateCategory, deleteCategory } = useCategoryStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>({ label: '', color: PRESET_COLORS[0] })
  const [addMode, setAddMode] = useState(false)
  const [addDraft, setAddDraft] = useState<Draft>({ label: '', color: PRESET_COLORS[0] })
  const [delConfirm, setDelConfirm] = useState<DelConfirm | null>(null)
  const [checking, setChecking] = useState(false)

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setDraft({ label: cat.label, color: cat.color })
    setAddMode(false)
  }

  const saveEdit = () => {
    if (!editingId || !draft.label.trim()) return
    updateCategory(editingId, { label: draft.label.trim(), color: draft.color })
    setEditingId(null)
  }

  const handleDeleteClick = async (cat: Category) => {
    if (categories.length <= 1) { toast.error('카테고리는 최소 1개 이상 있어야 해요.'); return }
    setChecking(true)
    try {
      const count = userId ? await getEventCountByCategory(userId, cat.id) : 0
      const target = categories.find((c) => c.id !== cat.id)!
      setDelConfirm({ id: cat.id, label: cat.label, count, targetId: target.id, targetLabel: target.label })
    } catch {
      toast.error('일정 수 확인에 실패했어요.')
    } finally {
      setChecking(false)
    }
  }

  const confirmDelete = () => {
    if (!delConfirm) return
    deleteCategory(delConfirm.id, delConfirm.targetId)
    setDelConfirm(null)
  }

  const handleAdd = () => {
    if (!addDraft.label.trim()) return
    addCategory({ id: crypto.randomUUID(), label: addDraft.label.trim(), color: addDraft.color })
    setAddDraft({ label: '', color: PRESET_COLORS[0] })
    setAddMode(false)
  }

  if (delConfirm) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-neutral-300">
          <span className="font-medium text-white">&apos;{delConfirm.label}&apos;</span> 카테고리를 삭제할까요?
          {delConfirm.count > 0 && (
            <> 이 카테고리를 쓰는 일정{' '}
              <span className="text-amber-400 font-medium">{delConfirm.count}개</span>가{' '}
              <span className="font-medium text-white">&apos;{delConfirm.targetLabel}&apos;</span>으로 자동 변경됩니다.
            </>
          )}
        </p>
        <div className="flex gap-2">
          <button onClick={() => setDelConfirm(null)}
            className="flex-1 py-2 rounded-xl bg-neutral-800 text-sm hover:bg-neutral-700 transition-colors">
            취소
          </button>
          <button onClick={confirmDelete}
            className="flex-1 py-2 rounded-xl bg-red-600 text-sm font-medium hover:bg-red-500 transition-colors">
            삭제
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {categories.map((cat) =>
        editingId === cat.id ? (
          <div key={cat.id} className="flex items-center gap-2 p-2 bg-neutral-800/70 rounded-xl">
            <ColorDots selected={draft.color} onSelect={(c) => setDraft((d) => ({ ...d, color: c }))} />
            <input
              autoFocus value={draft.label} maxLength={10}
              onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
              className="flex-1 min-w-0 text-sm bg-neutral-700 border border-neutral-600 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-neutral-500"
            />
            <button onClick={saveEdit} className="text-neutral-400 hover:text-white p-1 shrink-0"><Check size={14} /></button>
            <button onClick={() => setEditingId(null)} className="text-neutral-400 hover:text-white p-1 shrink-0"><X size={14} /></button>
          </div>
        ) : (
          <div key={cat.id} onDoubleClick={() => startEdit(cat)} className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-neutral-800/50 group cursor-default">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
            <span className="flex-1 text-sm text-neutral-300">{cat.label}</span>
            <button onClick={() => startEdit(cat)}
              className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-white p-1 transition-opacity shrink-0">
              <Pencil size={13} />
            </button>
            <button onClick={() => handleDeleteClick(cat)} disabled={checking}
              className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-1 transition-opacity disabled:opacity-50 shrink-0">
              <Trash2 size={13} />
            </button>
          </div>
        )
      )}

      {addMode ? (
        <div className="flex items-center gap-2 p-2 bg-neutral-800/70 rounded-xl mt-1">
          <ColorDots selected={addDraft.color} onSelect={(c) => setAddDraft((d) => ({ ...d, color: c }))} />
          <input
            autoFocus value={addDraft.label} maxLength={10} placeholder="카테고리 이름"
            onChange={(e) => setAddDraft((d) => ({ ...d, label: e.target.value }))}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAddMode(false) }}
            className="flex-1 min-w-0 text-sm bg-neutral-700 border border-neutral-600 rounded-lg px-2 py-1 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
          />
          <button onClick={handleAdd} className="text-neutral-400 hover:text-white p-1 shrink-0"><Check size={14} /></button>
          <button onClick={() => setAddMode(false)} className="text-neutral-400 hover:text-white p-1 shrink-0"><X size={14} /></button>
        </div>
      ) : (
        <button onClick={() => { setAddMode(true); setEditingId(null) }}
          className="flex items-center gap-2 px-2 py-2 mt-1 text-sm text-neutral-600 hover:text-neutral-300 transition-colors rounded-xl hover:bg-neutral-800/50">
          <Plus size={13} />
          카테고리 추가
        </button>
      )}
    </div>
  )
}

function ColorDots({ selected, onSelect }: { selected: string; onSelect: (c: string) => void }) {
  return (
    <div className="grid grid-cols-8 gap-1 shrink-0">
      {PRESET_COLORS.map((c) => (
        <button key={c} type="button" onClick={() => onSelect(c)}
          className="w-4 h-4 rounded-full transition-transform hover:scale-110"
          style={{ backgroundColor: c, boxShadow: selected === c ? `0 0 0 1.5px #171717, 0 0 0 2.5px ${c}` : 'none' }}
        />
      ))}
    </div>
  )
}
