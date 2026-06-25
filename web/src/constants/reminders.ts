// 일정 알림 옵션 목록
// DayDetailModal과 RangeAddModal에서 공통으로 사용한다.
// value는 '일정 시작 몇 분 전'을 의미하며, undefined는 알림 없음을 뜻한다.

export type ReminderOption = { label: string; value: number | undefined }

export const REMINDER_OPTIONS: ReminderOption[] = [
  { label: '없음',     value: undefined },
  { label: '10분 전',  value: 10        },
  { label: '30분 전',  value: 30        },
  { label: '1시간 전', value: 60        },
  { label: '하루 전',  value: 1440      },  // 1440분 = 24시간
]
