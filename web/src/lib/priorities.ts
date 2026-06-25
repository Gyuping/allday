// 할일 우선순위 설정을 한 곳에서 관리
// 색상, 텍스트 클래스 등을 여러 컴포넌트에서 반복 정의하지 않도록 여기에 모아둔다.
import type { Todo } from '@/types'

// 우선순위별 표시 설정 (label: UI 텍스트, text: 글자 색상, bar: 좌측 막대 색, color: 배경 색)
export const PRIORITY_CONFIG: Record<
  Todo['priority'],
  { label: string; text: string; bar: string; color: string }
> = {
  high:   { label: '높음', text: 'text-red-400',    bar: 'bg-red-500',     color: 'bg-red-500'    },
  medium: { label: '보통', text: 'text-yellow-400', bar: 'bg-yellow-500',  color: 'bg-yellow-500' },
  low:    { label: '낮음', text: 'text-neutral-500', bar: 'bg-neutral-600', color: 'bg-neutral-600' },
}

// 우선순위 선택 버튼에 사용하는 배열 형태로 변환
// Object.entries로 키-값을 꺼낸 뒤 { value, label, color } 형태로 가공한다.
export const PRIORITY_OPTIONS = (
  Object.entries(PRIORITY_CONFIG) as [Todo['priority'], typeof PRIORITY_CONFIG[Todo['priority']]][]
).map(([value, cfg]) => ({ value, label: cfg.label, color: cfg.color }))
