import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  
  // 환경별 기본 URL 설정
  const getBaseUrl = () => {
    // Vercel 환경에서는 환경 변수 사용
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL
    }
    
    // 프로덕션 환경에서는 Vercel 도메인 사용
    if (process.env.NODE_ENV === 'production') {
      return 'https://saju-meet.vercel.app'
    }
    
    // 개발 환경에서는 localhost 사용
    return 'http://localhost:3000'
  }
  
  // OAuth 코드가 있는 경우 즉시 콜백 페이지로 리다이렉트
  if (pathname === '/' && searchParams.get('code')) {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    const baseUrl = getBaseUrl()
    
    // 에러가 있는 경우
    if (error) {
      return NextResponse.redirect(new URL(`/?auth=error&reason=${encodeURIComponent(errorDescription || error)}`, baseUrl))
    }
    
    // 성공적인 OAuth 콜백인 경우
    if (code) {
      return NextResponse.redirect(new URL(`/auth/callback?code=${code}`, baseUrl))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
