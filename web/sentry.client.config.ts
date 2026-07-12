import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 에러 샘플링 — 프로덕션에서 100%
  tracesSampleRate: 1.0,

  // 세션 리플레이 — 무료 플랜 기준 에러 발생 시 100%, 일반 세션 10%
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,  // 텍스트 마스킹 끔 (개인정보가 없으면 false가 더 유용)
      blockAllMedia: false,
    }),
  ],

  // 개발 환경에서는 콘솔 출력만, 실제 전송 안 함
  enabled: process.env.NODE_ENV === 'production',
})
