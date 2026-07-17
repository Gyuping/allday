import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const year = new URL(request.url).searchParams.get('year')
  if (!year) return NextResponse.json({ error: 'year required' }, { status: 400 })

  const yearNum = Number(year)
  if (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > 2100) {
    return NextResponse.json({ error: 'year must be an integer between 1900 and 2100' }, { status: 400 })
  }

  const serviceKey = process.env.HOLIDAY_API_SERVICE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'HOLIDAY_API_SERVICE_KEY not set' }, { status: 500 })
  }

  // 인코딩 키(이미 %xx 형태)를 넣었으면 그대로, 디코딩 키를 넣었으면 인코딩
  const encodedKey = serviceKey.includes('%') ? serviceKey : encodeURIComponent(serviceKey)

  const url =
    `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo` +
    `?serviceKey=${encodedKey}&solYear=${year}&numOfRows=100&_type=json`

  let res: Response
  try {
    res = await fetch(url, {
      next:   { revalidate: 60 * 60 * 24 },
      signal: AbortSignal.timeout(10_000),
    })
  } catch (e) {
    console.error('[holidays] fetch error:', e)
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 })
  }

  const text = await res.text()

  if (!res.ok) {
    console.error(`[holidays] upstream ${res.status}:`, text.slice(0, 300))
    return NextResponse.json({ error: `upstream ${res.status}`, detail: text.slice(0, 200) }, { status: 502 })
  }

  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    // XML 오류 응답 (인증 실패 등) → 내용 로깅 후 빈 객체 반환
    console.error('[holidays] non-JSON response:', text.slice(0, 300))
    return NextResponse.json({ error: 'invalid response', detail: text.slice(0, 200) }, { status: 502 })
  }

  const raw = (json as Record<string, unknown> & {
    response?: { body?: { items?: { item?: unknown } } }
  })?.response?.body?.items?.item

  if (!raw || raw === null) return NextResponse.json({})

  const items: Array<{ locdate: number; dateName: string }> = Array.isArray(raw)
    ? raw.filter((item) => item != null)
    : [raw as { locdate: number; dateName: string }]

  const holidays: Record<string, string> = {}
  for (const item of items) {
    const d = String(item.locdate)
    const dateStr = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
    holidays[dateStr] = item.dateName
  }

  return NextResponse.json(holidays, {
    headers: {
      // s-maxage: Vercel CDN 캐시 (같은 연도 반복 요청 시 Function 미호출)
      // stale-while-revalidate: 만료 후 최대 7일간 stale 응답 제공하며 백그라운드 갱신
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
