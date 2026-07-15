import type { Todo } from '@/types'

export const PRIORITY_CONFIG: Record<
  Todo['priority'],
  { label: string; text: string; bar: string; color: string }
> = {
  high:   { label: '높음', text: 'text-red-400',    bar: 'bg-red-500',     color: 'bg-red-500'    },
  medium: { label: '보통', text: 'text-yellow-400', bar: 'bg-yellow-500',  color: 'bg-yellow-500' },
  low:    { label: '낮음', text: 'text-neutral-500', bar: 'bg-neutral-600', color: 'bg-neutral-600' },
}

export const PRIORITY_OPTIONS = (
  Object.entries(PRIORITY_CONFIG) as [Todo['priority'], typeof PRIORITY_CONFIG[Todo['priority']]][]
).map(([value, cfg]) => ({ value, label: cfg.label, color: cfg.color }))
