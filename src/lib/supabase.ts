import { createClient } from '@supabase/supabase-js'

// Supabase 설정을 선택적으로 처리
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// 서버 사이드에서 사용할 클라이언트 (service role key 사용)
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
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
