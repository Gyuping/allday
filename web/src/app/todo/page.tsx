'use client'

// 할일 목록 페이지
// 필터(전체/진행중/완료), 정렬(최신/우선순위/마감일), 태그 필터를 지원한다.
// 완료된 항목은 항상 목록 아래쪽에 구분선과 함께 표시된다.
import { useState, useMemo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useTodoStore } from '@/store/todoStore'
import TodoItem from '@/components/todo/TodoItem'
import AddTodoModal from '@/components/todo/AddTodoModal'
import EditTodoModal from '@/components/todo/EditTodoModal'
import type { Todo, TodoFilter as Filter, TodoSort as Sort } from '@/types'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

const FILTER_TABS: { value: Filter; label: string }[] = [
  { value: 'all',       label: '전체' },
  { value: 'active',    label: '진행중' },
  { value: 'completed', label: '완료' },
]

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: 'createdAt', label: '최신순' },
  { value: 'priority',  label: '우선순위' },
  { value: 'dueDate',   label: '마감일순' },
]

export default function TodoPage() {
  const { todos, toggleTodo, deleteTodo, updateTodo, clearAll } = useTodoStore()
  const [confirmClear, setConfirmClear] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort]     = useState<Sort>('createdAt')
  const [showModal, setShowModal] = useState(false)
  const [editTodo, setEditTodo] = useState<Todo | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    todos.forEach((t) => t.tags?.forEach((tag) => set.add(tag)))
    return [...set]
  }, [todos])

  const { activeTodos, completedTodos, activeCount, completedCount } = useMemo(() => {
    let list = todos.filter((t) => {
      if (filter === 'active')    return !t.completed
      if (filter === 'completed') return t.completed
      return true
    })
    if (tagFilter) list = list.filter((t) => t.tags?.includes(tagFilter))

    list = [...list].sort((a, b) => {
      if (sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      if (sort === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate)
      }
      return b.createdAt.localeCompare(a.createdAt)
    })

    const activeTodos    = list.filter((t) => !t.completed)
    const completedTodos = list.filter((t) =>  t.completed)
    // 전체 카운트는 필터와 무관하게 todos 전체 기준
    const activeCount    = todos.reduce((n, t) => n + (t.completed ? 0 : 1), 0)
    const completedCount = todos.length - activeCount
    return { activeTodos, completedTodos, activeCount, completedCount }
  }, [todos, filter, sort, tagFilter])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">할일</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {activeCount}개 진행중 · {completedCount}개 완료
          </p>
        </div>
        {todos.length > 0 && (
          <div className="flex items-center gap-2">
            {confirmClear ? (
              <>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-2 rounded-xl text-sm bg-neutral-800 text-neutral-400 hover:bg-neutral-700 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => { clearAll(); setConfirmClear(false) }}
                  className="px-3 py-2 rounded-xl text-sm bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
                >
                  전체 삭제
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                title="전체 삭제"
              >
                <Trash2 size={17} />
              </button>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-100 transition-colors"
            >
              <Plus size={16} /> 할일 추가
            </button>
          </div>
        )}
      </div>

      {/* 필터 탭 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 p-1 bg-neutral-800/60 rounded-xl">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.value ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 정렬 */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-neutral-500 [color-scheme:dark]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* 태그 필터 */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setTagFilter(null)}
            className={`text-xs px-3 py-1 rounded-lg transition-colors ${
              tagFilter === null ? 'bg-white text-neutral-900' : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            전체
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                tagFilter === tag ? 'bg-white text-neutral-900' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* 목록 */}
      {activeTodos.length === 0 && completedTodos.length === 0 ? (
        <div className="text-center py-16 text-neutral-600">
          {todos.length === 0 ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-4xl">✅</p>
              <p className="text-sm">아직 할일이 없어요.</p>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-100 transition-colors"
              >
                <Plus size={16} /> 할일 추가하기
              </button>
            </div>
          ) : (
            <p className="text-sm">해당하는 할일이 없습니다.</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {activeTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => toggleTodo(todo.id)}
              onDelete={() => deleteTodo(todo.id)}
              onEdit={() => setEditTodo(todo)}
            />
          ))}

          {completedTodos.length > 0 && (
            <>
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-neutral-800" />
                <span className="text-xs text-neutral-600 shrink-0">
                  완료 {completedTodos.length}개
                </span>
                <div className="flex-1 h-px bg-neutral-800" />
              </div>
              {completedTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                  onEdit={() => setEditTodo(todo)}
                />
              ))}
            </>
          )}
        </div>
      )}

      {showModal && <AddTodoModal onClose={() => setShowModal(false)} />}
      {editTodo && (
        <EditTodoModal
          todo={editTodo}
          onSave={(updated) => updateTodo(editTodo.id, updated)}
          onClose={() => setEditTodo(null)}
        />
      )}
    </div>
  )
}