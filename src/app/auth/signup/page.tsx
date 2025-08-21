"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const { signUp, signInWithOAuth } = useAuth()
  const router = useRouter()

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다')
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password)
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      // 이메일 확인 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    }
    
    setLoading(false)
  }

  const handleOAuthSignup = async (provider: 'google' | 'kakao' | 'naver') => {
    setLoading(true)
    setError(null)

    const { error } = await signInWithOAuth(provider)
    
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-amber-400 mb-4">회원가입 완료!</h1>
          <p className="text-gray-300 mb-6">
            입력하신 이메일로 확인 링크를 보냈습니다.<br />
            이메일을 확인하고 로그인해주세요.
          </p>
          <Link 
            href="/auth/login"
            className="text-amber-400 hover:text-amber-300 underline"
          >
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">회원가입</h1>
          <p className="text-gray-300">새로운 계정을 만들어보세요</p>
        </div>

        {/* OAuth 회원가입 버튼들 */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleOAuthSignup('kakao')}
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            카카오로 회원가입
          </button>
          
          <button
            onClick={() => handleOAuthSignup('naver')}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            네이버로 회원가입
          </button>
          
          <button
            onClick={() => handleOAuthSignup('google')}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            구글로 회원가입
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

        {/* 이메일 회원가입 폼 */}
        <form onSubmit={handleEmailSignup} className="space-y-4">
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
              minLength={6}
              className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none"
              placeholder="최소 6자 이상"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none"
              placeholder="비밀번호를 다시 입력하세요"
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
            {loading ? '회원가입 중...' : '회원가입'}
          </button>
        </form>

        {/* 링크들 */}
        <div className="text-center mt-6">
          <Link href="/auth/login" className="text-amber-400 hover:text-amber-300 text-sm">
            이미 계정이 있으신가요? 로그인
          </Link>
        </div>
      </div>
    </div>
  )
}
