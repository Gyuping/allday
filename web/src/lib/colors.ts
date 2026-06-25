// 캘린더 일정에서 선택할 수 있는 프리셋 색상 목록
// ColorPicker 컴포넌트와 각 모달에서 공통으로 사용한다.
// as const로 선언해 각 색상이 string이 아닌 리터럴 타입으로 추론된다.
export const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
] as const
