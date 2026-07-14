/**
 * Auth Setup — 'setup' 프로젝트에서 실행
 *
 * window.__testSignIn 을 통해 Emulator에 로그인하고
 * IndexedDB(Firebase Auth 토큰)를 포함한 storageState를 e2e/.auth.json 에 저장한다.
 * 이후 모든 테스트는 이 파일을 재사용해서 로그인 과정을 건너뛴다.
 */
import { test as setup } from '@playwright/test'

const TEST_EMAIL    = 'test@allday.com'
const TEST_PASSWORD = 'testpass123'

setup('authenticate', async ({ page }) => {
  await page.goto('/')

  // AuthContext가 마운트되면서 window.__testSignIn 이 등록될 때까지 대기
  await page.waitForFunction(
    () => typeof window.__testSignIn === 'function',
    { timeout: 15_000 }
  )

  // Emulator 이메일 로그인 실행
  await page.evaluate(
    ([email, pw]) => window.__testSignIn!(email, pw),
    [TEST_EMAIL, TEST_PASSWORD] as [string, string]
  )

  // 로그인 완료 확인 — 사이드바의 캘린더 링크가 나타나면 인증된 상태
  await page.waitForSelector('a[href="/calendar"]', { timeout: 15_000 })

  // IndexedDB(Firebase 토큰)를 포함한 전체 스토리지 상태 저장
  await page.context().storageState({ path: 'e2e/.auth.json' })
})
