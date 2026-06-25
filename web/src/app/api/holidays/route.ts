// 공휴일 API 서버사이드 라우트 (/api/holidays?year=2026)
// 공공데이터포털의 공휴일 API를 호출해 { 날짜: 이름 } 형태로 변환해서 반환한다.
// API 키가 없거나 실패해도 빈 객체를 반환하므로 클라이언트는 폴백 데이터를 사용한다.
// HOLIDAY_API_SERVICE_KEY 환경변수가 필요하다 (.env.local에 설정)
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const year = new URL(request.url).searchParams.get('year')
  if (!year) return NextResponse.json({ error: 'year required' }, { status: 400 })

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
    res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } })
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

  return NextResponse.json(holidays)
}
