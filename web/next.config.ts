import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Firebase SDK를 서버 번들에서 제외 — SSR 빌드 시 auth/invalid-api-key 오류 방지
  serverExternalPackages: ['firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore'],
  webpack: (config) => {
    // Windows에서 webpack이 일반 파일을 symlink로 오인하는 버그 방지
    config.resolve.symlinks = false
    return config
  },
};

export default nextConfig;
