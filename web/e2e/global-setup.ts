/**
 * Playwright globalSetup — 모든 테스트 전에 한 번 실행
 *
 * 1. Firebase Auth/Firestore Emulator가 실행 중인지 확인
 * 2. 테스트용 사용자 계정을 Emulator에 생성
 *
 * 사전 조건: 다른 터미널에서 `npm run emulator` 를 먼저 실행해야 한다.
 */

const AUTH_EMULATOR  = 'http://127.0.0.1:9099'
const FS_EMULATOR    = 'http://127.0.0.1:8080'
const PROJECT_ID     = 'allday-test'
const TEST_EMAIL     = 'test@allday.com'
const TEST_PASSWORD  = 'testpass123'

export default async function globalSetup(): Promise<void> {
  // 1. Emulator 실행 확인
  try {
    const res = await fetch(
      `${AUTH_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/config`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (!res.ok) throw new Error('not ready')
  } catch {
    throw new Error(
      '\n\n❌ Firebase Emulator가 실행되지 않았습니다.\n' +
      '다른 터미널에서 먼저 실행하세요:\n\n' +
      '  npm run emulator\n\n' +
      '(firebase-tools 미설치 시: npm install -g firebase-tools)\n'
    )
  }

  // 2. Firestore 데이터 초기화 (깨끗한 상태로 시작)
  await fetch(
    `${FS_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' }
  ).catch(() => { /* 첫 실행 시 없을 수 있음 */ })

  // 3. 기존 Auth 유저 모두 삭제
  await fetch(
    `${AUTH_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/accounts`,
    { method: 'DELETE' }
  )

  // 4. 테스트 유저 생성 (Emulator에서 email/password 인증은 항상 사용 가능)
  const createRes = await fetch(
    `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=test-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        returnSecureToken: false,
      }),
    }
  )

  if (!createRes.ok) {
    const body = await createRes.text()
    throw new Error(`테스트 유저 생성 실패: ${body}`)
  }
}
