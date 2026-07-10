'use client'

import { useState, useEffect } from 'react'
import { generateYearHolidays } from '@/lib/holidays'

type HolidayMap = Record<string, string>

// 공공데이터포털 API가 반환하지 않는 날 (제헌절 등) 을 API 응답에 추가
function withNationalDays(year: number, map: HolidayMap): HolidayMap {
  const result = { ...map }
  const key = `${year}-07-17`
  if (!result[key]) result[key] = '제헌절'
  return result
}

// 세션 내 연도별 캐시 — API 응답이 오면 덮어씀
const cache: Record<number, HolidayMap> = {}

function getFallback(year: number): HolidayMap {
  if (!cache[year]) cache[year] = generateYearHolidays(year)
  return cache[year]
}

const fetched = new Set<number>()

export function useHolidays(year: number): HolidayMap {
  const [holidays, setHolidays] = useState<HolidayMap>(() => getFallback(year))

  useEffect(() => {
    if (fetched.has(year)) {
      setHolidays(cache[year] ?? getFallback(year))
      return
    }

    fetched.add(year)
    fetch(`/api/holidays?year=${year}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json() as Promise<HolidayMap>
      })
      .then((data) => {
        if ('error' in data) return  // API 키 미설정 → 폴백 유지
        const merged = withNationalDays(year, data)
        cache[year] = merged
        setHolidays(merged)
      })
      .catch(() => {
        fetched.delete(year)
      })
  }, [year])

  return holidays
}
