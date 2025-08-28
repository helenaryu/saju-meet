import { createClient } from '@supabase/supabase-js'

// 환경별 리다이렉트 URL 설정
const getRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    // 클라이언트 사이드
    const protocol = window.location.protocol
    const host = window.location.host
    return `${protocol}//${host}/auth/callback`
  }
  
  // 서버 사이드 - 환경 변수에서 가져오기
  const isProduction = process.env.NODE_ENV === 'production'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (isProduction ? 'https://saju-meet.vercel.app' : 'http://localhost:3000')
  
  return `${baseUrl}/auth/callback`
}

// Supabase 설정을 선택적으로 처리 - 새로운 환경 변수 우선 사용
const supabaseUrl = process.env.SUPABASE_SUPABASE_URL || 
                   process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL || 
                   process.env.NEXT_PUBLIC_SUPABASE_URL

const supabaseAnonKey = process.env.SUPABASE_SUPABASE_ANON_KEY || 
                        process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON || 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce'
      }
    })
  : null

// 서버 사이드에서 사용할 클라이언트 (service role key 사용)
export const createServerClient = () => {
  const supabaseUrl = process.env.SUPABASE_SUPABASE_URL || 
                     process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL || 
                     process.env.NEXT_PUBLIC_SUPABASE_URL
  
  const supabaseServiceKey = process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY || 
                            process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase 설정이 완료되지 않았습니다. 일부 기능이 제한될 수 있습니다.');
    return null
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Supabase 사용 가능 여부 확인
export const isSupabaseAvailable = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// 환경별 리다이렉트 URL 가져오기
export const getAuthRedirectUrl = () => {
  return getRedirectUrl()
}
