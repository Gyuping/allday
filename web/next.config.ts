import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Firebase SDK를 서버 번들에서 제외 — SSR 빌드 시 auth/invalid-api-key 오류 방지
  serverExternalPackages: ['firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore'],
};

export default nextConfig;
