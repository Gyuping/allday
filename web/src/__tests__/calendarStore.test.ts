import { describe, it, expect, vi, beforeEach } from 'vitest'

// Firestore 함수 mock — 실제 DB 없이 store 로직만 테스트
vi.mock('@/lib/firestore/calendar', () => ({
  addCalendarEvent:    vi.fn().mockResolvedValue(undefined),
  updateCalendarEvent: vi.fn().mockResolvedValue(undefined),
  deleteCalendarEvent: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/store/toastStore', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

import { useCalendarStore } from '@/store/calendarStore'
import * as firestoreCalendar from '@/lib/firestore/calendar'
import type { CalendarEvent } from '@/types'

const makeEvent = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id:    'evt-1',
  title: '테스트 일정',
  date:  '2026-06-15',
  ...overrides,
})

beforeEach(() => {
  // 각 테스트 전 store 초기화
  useCalendarStore.setState({ events: [], userId: 'user-1', isLoading: false })
  vi.clearAllMocks()
})

describe('addEvent', () => {
  it('낙관적으로 이벤트를 즉시 추가한다', async () => {
    const event = makeEvent()
    await useCalendarStore.getState().addEvent(event)
    expect(useCalendarStore.getState().events).toHaveLength(1)
    expect(useCalendarStore.getState().events[0].id).toBe('evt-1')
  })

  it('Firestore에도 저장을 시도한다', async () => {
    await useCalendarStore.getState().addEvent(makeEvent())
    expect(firestoreCalendar.addCalendarEvent).toHaveBeenCalledWith('user-1', expect.objectContaining({ id: 'evt-1' }))
  })

  it('Firestore 실패 시 롤백된다', async () => {
    vi.mocked(firestoreCalendar.addCalendarEvent).mockRejectedValueOnce(new Error('network'))
    await useCalendarStore.getState().addEvent(makeEvent())
    expect(useCalendarStore.getState().events).toHaveLength(0)
  })

  it('userId가 없으면 아무것도 하지 않는다', async () => {
    useCalendarStore.setState({ userId: null })
    await useCalendarStore.getState().addEvent(makeEvent())
    expect(useCalendarStore.getState().events).toHaveLength(0)
    expect(firestoreCalendar.addCalendarEvent).not.toHaveBeenCalled()
  })

  it('여러 이벤트를 순서대로 추가한다', async () => {
    await useCalendarStore.getState().addEvent(makeEvent({ id: 'e1', title: '첫째' }))
    await useCalendarStore.getState().addEvent(makeEvent({ id: 'e2', title: '둘째' }))
    expect(useCalendarStore.getState().events).toHaveLength(2)
  })
})

describe('updateEvent', () => {
  beforeEach(async () => {
    await useCalendarStore.getState().addEvent(makeEvent())
  })

  it('이벤트를 즉시 수정한다', async () => {
    await useCalendarStore.getState().updateEvent('evt-1', { title: '수정된 제목' })
    expect(useCalendarStore.getState().events[0].title).toBe('수정된 제목')
  })

  it('Firestore 실패 시 원래 값으로 롤백된다', async () => {
    vi.mocked(firestoreCalendar.updateCalendarEvent).mockRejectedValueOnce(new Error('fail'))
    await useCalendarStore.getState().updateEvent('evt-1', { title: '수정된 제목' })
    expect(useCalendarStore.getState().events[0].title).toBe('테스트 일정')
  })

  it('존재하지 않는 이벤트는 무시한다', async () => {
    await useCalendarStore.getState().updateEvent('없는-id', { title: '변경' })
    expect(firestoreCalendar.updateCalendarEvent).not.toHaveBeenCalled()
  })
})

describe('deleteEvent', () => {
  beforeEach(async () => {
    await useCalendarStore.getState().addEvent(makeEvent())
  })

  it('이벤트를 즉시 삭제한다', async () => {
    await useCalendarStore.getState().deleteEvent('evt-1')
    expect(useCalendarStore.getState().events).toHaveLength(0)
  })

  it('Firestore 실패 시 이벤트를 복원한다', async () => {
    vi.mocked(firestoreCalendar.deleteCalendarEvent).mockRejectedValueOnce(new Error('fail'))
    await useCalendarStore.getState().deleteEvent('evt-1')
    expect(useCalendarStore.getState().events).toHaveLength(1)
  })

  it('존재하지 않는 이벤트 삭제는 무시한다', async () => {
    await useCalendarStore.getState().deleteEvent('없는-id')
    expect(useCalendarStore.getState().events).toHaveLength(1)
  })
})
