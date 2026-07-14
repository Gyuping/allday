// 전역 Window 인터페이스 확장
// E2E 테스트(Playwright)에서 사용하는 헬퍼와 Firebase Emulator 연결 플래그
interface Window {
  /** Playwright E2E 테스트 전용 — Emulator 모드에서만 노출 */
  __testSignIn?: (email: string, password: string) => Promise<void>
  /** Firebase Emulator 중복 연결 방지 플래그 */
  __fbEmuConnected?: boolean
}
