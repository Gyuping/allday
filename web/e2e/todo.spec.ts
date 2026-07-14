import { test, expect } from '@playwright/test'

test.describe('할일', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todo')
    // 페이지 로딩 대기
    await page.waitForSelector('h1')
  })

  test('할일 추가 → 목록에 표시됨', async ({ page }) => {
    await page.getByRole('button', { name: '할일 추가' }).click()
    await page.getByPlaceholder('무엇을 해야 하나요?').fill('E2E 테스트 할일')
    await page.getByRole('button', { name: '추가' }).click()

    await expect(page.getByText('E2E 테스트 할일')).toBeVisible()
  })

  test('할일 추가 → 새로고침 후에도 유지됨 (Firestore 저장 확인)', async ({ page }) => {
    await page.getByRole('button', { name: '할일 추가' }).click()
    await page.getByPlaceholder('무엇을 해야 하나요?').fill('저장 확인 할일')
    await page.getByRole('button', { name: '추가' }).click()
    await page.waitForSelector('text=저장 확인 할일')

    // 새로고침
    await page.reload()
    await page.waitForSelector('h1')

    // Firestore에서 불러온 데이터가 표시됨
    await expect(page.getByText('저장 확인 할일')).toBeVisible()
  })

  test('완료 체크 → 완료 섹션으로 이동', async ({ page }) => {
    // 할일 추가
    await page.getByRole('button', { name: '할일 추가' }).click()
    await page.getByPlaceholder('무엇을 해야 하나요?').fill('완료 테스트 할일')
    await page.getByRole('button', { name: '추가' }).click()
    await page.waitForSelector('text=완료 테스트 할일')

    // 완료 체크 버튼 클릭
    await page.getByRole('button', { name: '완료 체크' }).click()

    // 완료 구분선 표시 확인
    await expect(page.getByText(/완료 \d+개/)).toBeVisible()
  })

  test('할일 삭제 → 목록에서 사라짐', async ({ page }) => {
    // 할일 추가
    await page.getByRole('button', { name: '할일 추가' }).click()
    await page.getByPlaceholder('무엇을 해야 하나요?').fill('삭제 테스트 할일')
    await page.getByRole('button', { name: '추가' }).click()
    await page.waitForSelector('text=삭제 테스트 할일')

    // 삭제 버튼 — 마우스 hover 후 클릭 (hover 시에만 표시되는 버튼)
    await page.getByText('삭제 테스트 할일').hover()
    await page.getByRole('button', { name: '삭제' }).click()

    await expect(page.getByText('삭제 테스트 할일')).not.toBeVisible()
  })
})
