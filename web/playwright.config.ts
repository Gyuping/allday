import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    // 1. 로그인 → storageState 저장
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },
    // 2. 저장된 auth 상태로 실제 테스트 실행
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth.json',
      },
      dependencies: ['setup'],
    },
  ],

  // E2E 전용 Next.js 개발 서버 — Firebase Emulator를 가리키도록 env 오버라이드
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'localhost',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'allday-test',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'allday-test.appspot.com',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456789',
      NEXT_PUBLIC_FIREBASE_APP_ID: '1:123456789:web:testtest',
      NEXT_PUBLIC_USE_FIREBASE_EMULATOR: 'true',
      HOLIDAY_API_SERVICE_KEY: '',
      NEXT_PUBLIC_SENTRY_DSN: '',
      SENTRY_AUTH_TOKEN: '',
      SENTRY_ORG: '',
      SENTRY_PROJECT: '',
    },
  },
})
