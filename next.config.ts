import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 환경에서 올바른 도메인 사용을 위한 설정
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.NODE_ENV === 'production' ? 'https://saju-meet.vercel.app' : 'http://localhost:3000')
  },
  
  // 리다이렉트 설정
  async redirects() {
    return [
      // OAuth 콜백 처리
      {
        source: '/',
        has: [
          {
            type: 'query',
            key: 'code',
          },
        ],
        destination: '/auth/callback',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
