"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { signIn, signInWithOAuth } = useAuth()
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    } else {
      router.push('/profile')
    }
    
    setLoading(false)
  }

  const handleOAuthLogin = async (provider: 'google' | 'kakao' | 'naver') => {
    setLoading(true)
    setError(null)

    const { error } = await signInWithOAuth(provider)
    
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">로그인</h1>
          <p className="text-gray-300">관상 사주 매칭 서비스에 오신 것을 환영합니다</p>
        </div>

        {/* OAuth 로그인 버튼들 */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleOAuthLogin('kakao')}
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            카카오로 로그인
          </button>
          
          <button
            onClick={() => handleOAuthLogin('naver')}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            네이버로 로그인
          </button>
          
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            구글로 로그인
          </button>
        </div>

        {/* 구분선 */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900 text-gray-400">또는</span>
          </div>
        </div>

        {/* 이메일 로그인 폼 */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 링크들 */}
        <div className="text-center mt-6 space-y-2">
          <Link href="/auth/signup" className="text-amber-400 hover:text-amber-300 text-sm">
            계정이 없으신가요? 회원가입
          </Link>
          <br />
          <Link href="/auth/forgot-password" className="text-gray-400 hover:text-gray-300 text-sm">
            비밀번호를 잊으셨나요?
          </Link>
        </div>
      </div>
    </div>
  )
}
