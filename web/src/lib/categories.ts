// 캘린더 일정에 붙일 수 있는 카테고리 목록
// 카테고리를 추가하려면 CATEGORIES 배열에 항목을 추가하면 된다.

export type Category = {
  id: string
  label: string
  color: string  // 16진수 색상 코드
}

export const CATEGORIES: Category[] = [
  { id: 'work',     label: '업무', color: '#3b82f6' },
  { id: 'personal', label: '개인', color: '#a855f7' },
  { id: 'study',    label: '학습', color: '#f59e0b' },
  { id: 'health',   label: '건강', color: '#22c55e' },
  { id: 'other',    label: '기타', color: '#6b7280' },
]

// id로 카테고리 객체를 찾아 반환 (없으면 undefined)
export function getCategoryById(id: string | undefined): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}
