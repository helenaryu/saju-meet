"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [supabase, setSupabase] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        const { supabase: supabaseClient } = await import('@/lib/supabase')
        setSupabase(supabaseClient)
      } catch (error) {
        console.error('Supabase 초기화 실패:', error)
        setError('인증 시스템 초기화에 실패했습니다.')
        return
      }
    }

    initializeSupabase()
  }, [])

  useEffect(() => {
    if (!supabase) return

    const handleAuthCallback = async () => {
      try {
        // URL 파라미터에서 에러 확인
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (errorParam) {
          console.error('OAuth 에러:', errorParam, errorDescription)
          setError(`인증 오류: ${errorDescription || errorParam}`)
          setTimeout(() => {
            router.push('/?auth=error&reason=' + encodeURIComponent(errorDescription || errorParam))
          }, 3000)
          return
        }

        // 세션 확인
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('인증 오류:', error)
          setError('인증 처리 중 오류가 발생했습니다.')
          setTimeout(() => {
            router.push('/?auth=error')
          }, 3000)
          return
        }

        if (data.session) {
          console.log('인증 성공:', data.session)
          // 인증 성공 후 integrated-analysis로 이동
          router.push('/integrated-analysis')
        } else {
          console.log('인증 세션 없음')
          // 세션이 없으면 로그아웃 처리
          await supabase.auth.signOut()
          setError('인증 세션이 만료되었습니다.')
          setTimeout(() => {
            router.push('/?auth=error&reason=session_expired')
          }, 3000)
        }
      } catch (error) {
        console.error('콜백 처리 오류:', error)
        setError('인증 처리 중 예상치 못한 오류가 발생했습니다.')
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
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">인증 오류</h1>
          <p className="text-white mb-4">{error}</p>
          <p className="text-gray-400 text-sm">잠시 후 메인 페이지로 이동합니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-amber-400 mb-4">인증 처리 중...</h1>
        <p className="text-white">잠시만 기다려주세요.</p>
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
