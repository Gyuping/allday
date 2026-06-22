'use client'

import { useState, useEffect } from 'react'
import { FALLBACK_HOLIDAYS_2026 } from '@/lib/holidays'

type HolidayMap = Record<string, string>

// 세션 내 연도별 캐시 (페이지 이동해도 재요청 안 함)
const cache: Record<number, HolidayMap> = {
  2026: FALLBACK_HOLIDAYS_2026, // 초기값: API 응답 전까지 폴백 사용
}

export function useHolidays(year: number): HolidayMap {
  const [holidays, setHolidays] = useState<HolidayMap>(cache[year] ?? {})

  useEffect(() => {
    if (cache[year] && year !== 2026) {
      // 2026 외 연도는 캐시 히트 시 재요청 없음
      setHolidays(cache[year])
      return
    }

    // 2026은 API 응답으로 폴백을 덮어쓰고, 나머지는 처음 요청
    fetch(`/api/holidays?year=${year}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json() as Promise<HolidayMap>
      })
      .then((data) => {
        if ('error' in data) return // API 키 미설정 등 → 폴백 유지
        cache[year] = data
        setHolidays(data)
      })
      .catch(() => {
        // 네트워크 오류 등 → 현재 상태 유지 (2026이면 폴백)
      })
  }, [year])

  return holidays
}
