"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [supabase, setSupabase] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        console.log('🔧 Supabase 초기화 시작...')
        setDebugInfo('Supabase 초기화 중...')
        
        const { supabase: supabaseClient, handleAuthWithoutSupabase } = await import('@/lib/supabase')
        
        if (!supabaseClient) {
          console.error('❌ Supabase 클라이언트가 null입니다')
          setError('Supabase 설정이 완료되지 않았습니다.')
          setDebugInfo('Supabase 클라이언트가 null - 환경 변수 확인 필요')
          
          // 임시 인증 처리 - 코드가 있으면 성공으로 간주
          const code = searchParams?.get('code')
          if (code) {
            console.log('OAuth 코드가 있으므로 임시 인증 성공으로 처리')
            setTimeout(() => {
              // Vercel URL 사용
              const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saju-meet.vercel.app'
              
              // 디버깅을 위한 로그
              console.log('🔧 콜백 리다이렉트 URL 설정:')
              console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
              console.log('NODE_ENV:', process.env.NODE_ENV)
              console.log('계산된 baseUrl:', baseUrl)
              console.log('최종 리다이렉트 URL:', `${baseUrl}/integrated-analysis?auth=temp`)
              
              window.location.href = `${baseUrl}/integrated-analysis?auth=temp`
            }, 2000)
          } else {
            setTimeout(() => {
              router.push('/?auth=error&reason=no_supabase')
            }, 3000)
          }
          return
        }
        
        console.log('✅ Supabase 클라이언트 초기화 성공')
        setSupabase(supabaseClient)
        setDebugInfo('Supabase 클라이언트 초기화 완료')
      } catch (error) {
        console.error('❌ Supabase 초기화 실패:', error)
        setError('인증 시스템 초기화에 실패했습니다.')
        setDebugInfo(`초기화 오류: ${error}`)
        return
      }
    }

    initializeSupabase()
  }, [router, searchParams])

  useEffect(() => {
    if (!supabase) {
      console.log('Supabase가 아직 초기화되지 않음, 잠시 대기...')
      return
    }

    const handleAuthCallback = async () => {
      try {
        console.log('🔄 인증 콜백 처리 시작...')
        setDebugInfo('인증 콜백 처리 중...')
        
        // URL 파라미터 확인
        if (!searchParams) {
          console.error('❌ searchParams가 null입니다')
          setError('URL 파라미터를 읽을 수 없습니다.')
          setDebugInfo('searchParams null')
          setTimeout(() => {
            router.push('/?auth=error&reason=no_params')
          }, 3000)
          return
        }
        
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        console.log('📋 URL 파라미터:', { code, errorParam, errorDescription })
        
        if (errorParam) {
          console.error('❌ OAuth 에러:', errorParam, errorDescription)
          setError(`인증 오류: ${errorDescription || errorParam}`)
          setDebugInfo(`OAuth 에러: ${errorParam}`)
          setTimeout(() => {
            router.push('/?auth=error&reason=' + encodeURIComponent(errorDescription || errorParam))
          }, 3000)
          return
        }

        if (!code) {
          console.error('❌ 인증 코드가 없습니다')
          setError('인증 코드가 없습니다.')
          setDebugInfo('인증 코드 없음')
          setTimeout(() => {
            router.push('/?auth=error&reason=no_code')
          }, 3000)
          return
        }

        // 세션 확인
        console.log('🔍 세션 확인 중...')
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ 인증 오류:', error)
          setError('인증 처리 중 오류가 발생했습니다.')
          setDebugInfo(`세션 오류: ${error.message}`)
          setTimeout(() => {
            router.push('/?auth=error')
          }, 3000)
          return
        }

        console.log('📊 세션 데이터:', data)
        
        if (data.session) {
          console.log('✅ 인증 성공:', data.session)
          setDebugInfo('인증 성공 - integrated-analysis로 이동')
          // 인증 성공 후 integrated-analysis로 이동
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saju-meet.vercel.app'
          
          // 디버깅을 위한 로그
          console.log('🔧 인증 성공 후 리다이렉트 URL 설정:')
          console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
          console.log('NODE_ENV:', process.env.NODE_ENV)
          console.log('계산된 baseUrl:', baseUrl)
          console.log('최종 리다이렉트 URL:', `${baseUrl}/integrated-analysis`)
          
          window.location.href = `${baseUrl}/integrated-analysis`
        } else {
          console.log('⚠️ 인증 세션 없음')
          setDebugInfo('세션 없음 - 로그아웃 처리')
          // 세션이 없으면 로그아웃 처리
          await supabase.auth.signOut()
          setError('인증 세션이 만료되었습니다.')
          setTimeout(() => {
            router.push('/?auth=error&reason=session_expired')
          }, 3000)
        }
      } catch (error) {
        console.error('❌ 콜백 처리 오류:', error)
        setError('인증 처리 중 예상치 못한 오류가 발생했습니다.')
        setDebugInfo(`예상치 못한 오류: ${error}`)
        setTimeout(() => {
          router.push('/?auth=error')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [supabase, router, searchParams])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">인증 오류</h1>
          <p className="text-white mb-4">{error}</p>
          {debugInfo && (
            <div className="bg-red-900/20 p-3 rounded-lg mb-4">
              <p className="text-red-300 text-sm font-mono">{debugInfo}</p>
            </div>
          )}
          <p className="text-gray-400 text-sm">잠시 후 메인 페이지로 이동합니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-amber-400 mb-4">인증 처리 중...</h1>
        <p className="text-white mb-4">잠시만 기다려주세요.</p>
        {debugInfo && (
          <div className="bg-blue-900/20 p-3 rounded-lg">
            <p className="text-blue-300 text-sm font-mono">{debugInfo}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-amber-400 mb-4">로딩 중...</h1>
          <p className="text-white">잠시만 기다려주세요.</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
