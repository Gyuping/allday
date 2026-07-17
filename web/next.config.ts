import type { NextConfig } from "next";
import type { Compiler } from "webpack";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://lh3.googleusercontent.com",
  "font-src 'self'",
  // Firebase Auth + Firestore + 공휴일 API + Sentry
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://apis.data.go.kr https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
  // Firebase Auth가 인증 지속성을 위해 *.firebaseapp.com iframe을 사용
  "frame-src https://*.firebaseapp.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

// Node.js v22+ on Windows: NextTraceEntryPointsPlugin이 readlink를 호출할 때
// 비심볼릭 파일에 EINVAL 대신 EISDIR을 반환 — 플러그인이 EISDIR은 처리하지 않아 빌드 실패.
// inputFileSystem.readlink를 가로채 EISDIR → EINVAL로 변환한다.
class PatchReadlinkPlugin {
  apply(compiler: Compiler) {
    const ifs = compiler.inputFileSystem
    if (!ifs?.readlink) return
    const marker = ifs as typeof ifs & { __rl_patched?: boolean }
    if (marker.__rl_patched) return
    marker.__rl_patched = true

    // ReadlinkFs의 4개 오버로드를 단순 unknown 시그니처로 캐스팅 — 오버로드 불일치 회피
    const callRL = ifs.readlink.bind(ifs) as unknown as (
      path: unknown, optOrCb: unknown, cb?: unknown
    ) => void

    const fixErr = (err: NodeJS.ErrnoException | null, path: string): NodeJS.ErrnoException | null => {
      if (err?.code !== 'EISDIR') return err
      return Object.assign(new Error(`EINVAL: invalid argument, readlink '${path}'`), {
        code: 'EINVAL', syscall: 'readlink', path,
      } as NodeJS.ErrnoException)
    }

    ifs.readlink = (function(path: unknown, optOrCb: unknown, cb?: unknown) {
      const pathStr = String(path)
      if (typeof optOrCb === 'function') {
        callRL(path, (err: NodeJS.ErrnoException | null, v?: string) =>
          (optOrCb as (e: NodeJS.ErrnoException | null, v?: string) => void)(fixErr(err, pathStr), v)
        )
      } else if (cb !== undefined) {
        callRL(path, optOrCb, (err: NodeJS.ErrnoException | null, v?: string) =>
          (cb as (e: NodeJS.ErrnoException | null, v?: string) => void)(fixErr(err, pathStr), v)
        )
      }
    }) as unknown as typeof ifs.readlink
  }
}

const nextConfig: NextConfig = {
  // Firebase SDK를 서버 번들에서 제외 — SSR 빌드 시 auth/invalid-api-key 오류 방지
  serverExternalPackages: ['firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore'],
  webpack: (config) => {
    // Windows에서 webpack이 일반 파일을 symlink로 오인하는 버그 방지
    config.resolve.symlinks = false
    config.cache = false
    config.plugins = config.plugins ?? []
    config.plugins.push(new PatchReadlinkPlugin())
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
