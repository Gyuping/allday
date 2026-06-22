export type Category = {
  id: string
  label: string
  color: string
}

export const CATEGORIES: Category[] = [
  { id: 'work',     label: '업무', color: '#3b82f6' },
  { id: 'personal', label: '개인', color: '#a855f7' },
  { id: 'study',    label: '학습', color: '#f59e0b' },
  { id: 'health',   label: '건강', color: '#22c55e' },
  { id: 'other',    label: '기타', color: '#6b7280' },
]

export function getCategoryById(id: string | undefined): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}
