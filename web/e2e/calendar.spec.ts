/**
 * 캘린더 E2E 테스트
 *
 * 각 테스트는 globalSetup에서 Firestore 초기화 후 실행되므로
 * 이전 테스트의 데이터가 남아있지 않다.
 */
import { test, expect } from '@playwright/test'

// 테스트 날짜 — 오늘 (YYYY-MM-DD)
const today = new Date().toLocaleDateString('sv-SE')

test.describe('캘린더', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calendar')
    // 월간 뷰 렌더링 대기
    await page.waitForSelector(`[data-date="${today}"]`)
  })

  test('일정 추가 → 캘린더에 표시됨', async ({ page }) => {
    // 오늘 날짜 셀 클릭 → DayDetailModal 열림
    await page.click(`[data-date="${today}"]`)

    // 목록 뷰에서 "일정 추가" 버튼 클릭 → EventForm 표시
    await page.getByRole('button', { name: '일정 추가' }).click()

    // 제목 입력 (label "제목"으로 접근)
    await page.getByLabel('제목').fill('E2E 테스트 일정')

    // "추가" 버튼으로 저장
    await page.getByRole('button', { name: '추가' }).click()

    // 모달이 닫히고 캘린더 셀에 이벤트 칩이 나타남
    await expect(
      page.locator(`[data-date="${today}"] [data-event-chip="true"]`).first()
    ).toBeVisible()
  })

  test('일정 수정 → 변경된 제목이 표시됨', async ({ page }) => {
    // 먼저 일정 추가
    await page.click(`[data-date="${today}"]`)
    await page.getByRole('button', { name: '일정 추가' }).click()
    await page.getByLabel('제목').fill('수정 전 제목')
    await page.getByRole('button', { name: '추가' }).click()

    // 추가된 일정 칩 클릭 → 목록 뷰에서 일정 항목 클릭 → 수정 뷰
    await page.locator(`[data-date="${today}"] [data-event-chip="true"]`).first().click()
    await page.getByText('수정 전 제목').click()

    // 제목 변경
    await page.getByLabel('제목').fill('수정 후 제목')
    await page.getByRole('button', { name: '저장' }).click()

    // 수정된 제목이 캘린더에 표시됨
    await expect(page.locator(`[data-date="${today}"]`).getByText('수정 후 제목')).toBeVisible()
  })

  test('주간 뷰로 전환', async ({ page }) => {
    await page.getByRole('button', { name: '주' }).click()
    // 주간 뷰 특유의 시간 컬럼 확인 (00:00 라벨)
    await expect(page.getByText('00:00').first()).toBeVisible()
  })
})
