import { createClient } from '@supabase/supabase-js'

// Vercel URL만 사용하는 리다이렉트 URL 설정
const getRedirectUrl = () => {
  // 항상 Vercel URL 사용 (localhost 제거)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saju-meet.vercel.app'
  return `${baseUrl}/auth/callback`
}

// Supabase 설정을 선택적으로 처리 - 새로운 환경 변수 우선 사용
const supabaseUrl = process.env.SUPABASE_SUPABASE_URL || 
                   process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL || 
                   process.env.NEXT_PUBLIC_SUPABASE_URL

const supabaseAnonKey = process.env.SUPABASE_SUPABASE_ANON_KEY || 
                        process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON || 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 디버깅을 위한 로그
if (typeof window !== 'undefined') {
  console.log('🔧 Supabase 설정 확인:')
  console.log('URL:', supabaseUrl ? '설정됨' : '설정되지 않음')
  console.log('Anon Key:', supabaseAnonKey ? '설정됨' : '설정되지 않음')
  console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('리다이렉트 URL:', getRedirectUrl())
}

// Supabase 클라이언트 생성 (설정이 없으면 null 반환)
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

// 임시 인증 처리 함수 (Supabase가 설정되지 않은 경우)
export const handleAuthWithoutSupabase = () => {
  console.log('⚠️ Supabase가 설정되지 않아 임시 인증 처리 중...')
  // 임시로 성공 상태를 시뮬레이션
  return {
    success: true,
    message: 'Supabase 설정이 필요합니다. 환경 변수를 확인해주세요.'
  }
}
