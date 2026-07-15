export type ReminderOption = { label: string; value: number | undefined }

export const REMINDER_OPTIONS: ReminderOption[] = [
  { label: '없음',     value: undefined },
  { label: '10분 전',  value: 10        },
  { label: '30분 전',  value: 30        },
  { label: '1시간 전', value: 60        },
  { label: '하루 전',  value: 1440      },  // 1440분 = 24시간
]
