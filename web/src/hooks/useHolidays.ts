'use client'

import { useState, useEffect } from 'react'
import { FALLBACK_HOLIDAYS_2026 } from '@/lib/holidays'

type HolidayMap = Record<string, string>

// 세션 내 연도별 캐시 — API 응답 후 덮어씀
// API 미응답 시 폴백 데이터(2026)를 기본값으로 사용
const cache: Record<number, HolidayMap> = {
  2026: FALLBACK_HOLIDAYS_2026,
}
// 이미 API 요청을 보낸 연도 — 중복 요청 방지
const fetched = new Set<number>()

export function useHolidays(year: number): HolidayMap {
  const [holidays, setHolidays] = useState<HolidayMap>(cache[year] ?? {})

  useEffect(() => {
    // 이미 API 응답을 받은 연도는 재요청 안 함
    if (fetched.has(year)) {
      setHolidays(cache[year] ?? {})
      return
    }

    fetched.add(year)
    fetch(`/api/holidays?year=${year}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json() as Promise<HolidayMap>
      })
      .then((data) => {
        if ('error' in data) return  // API 키 미설정 등 → 폴백 유지
        cache[year] = data
        setHolidays(data)
      })
      .catch(() => {
        // 네트워크 오류 → 폴백 유지, 다음 마운트 때 재시도 가능하도록 fetched에서 제거
        fetched.delete(year)
      })
  }, [year])

  return holidays
}
