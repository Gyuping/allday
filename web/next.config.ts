import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://lh3.googleusercontent.com",
  "font-src 'self'",
  // Firebase Auth + Firestore + 공휴일 API
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://apis.data.go.kr",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig: NextConfig = {
  // Firebase SDK를 서버 번들에서 제외 — SSR 빌드 시 auth/invalid-api-key 오류 방지
  serverExternalPackages: ['firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore'],
  webpack: (config) => {
    // Windows에서 webpack이 일반 파일을 symlink로 오인하는 버그 방지
    config.resolve.symlinks = false
    return config
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Content-Security-Policy',  value: CSP },
        ],
      },
    ]
  },
};

export default nextConfig;
