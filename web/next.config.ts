import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  // Firebase SDK를 서버 번들에서 제외 — SSR 빌드 시 auth/invalid-api-key 오류 방지
  serverExternalPackages: ['firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore'],
  webpack: (config) => {
    // Windows에서 webpack이 일반 파일을 symlink로 오인하는 버그 방지
    config.resolve.symlinks = false
    return config
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // 소스맵을 Sentry에 업로드해서 원본 코드로 에러 위치 확인 가능
  sourcemaps: {
    disable: false,
  },

  // 빌드 로그 출력 최소화
  silent: true,

  // 자동 instrumentation 비활성화 — 수동 설정 사용
  autoInstrumentServerFunctions: false,
})
