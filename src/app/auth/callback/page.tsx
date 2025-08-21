"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('인증 오류:', error)
          router.push('/')
          return
        }

        if (data.session) {
          console.log('인증 성공:', data.session)
          // 인증 성공 후 integrated-analysis로 이동
          router.push('/?step=integrated-analysis&auth=success')
        } else {
          console.log('인증 세션 없음')
          // 세션이 없으면 로그아웃 처리
          await supabase.auth.signOut()
          router.push('/?auth=error')
        }
      } catch (error) {
        console.error('콜백 처리 오류:', error)
        router.push('/')
      }
    }

    handleAuthCallback()
  }, [router])

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
