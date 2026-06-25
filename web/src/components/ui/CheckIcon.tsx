// 체크마크(✓) SVG 아이콘 컴포넌트
// TodoItem, DayDetailModal 등 여러 곳에서 동일한 SVG가 반복되어 분리했다.
type Props = { size?: number; color?: string }

export default function CheckIcon({ size = 10, color = 'white' }: Props) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 10 8" fill="none">
      <path d="M1 4L3.5 6.5L9 1" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
