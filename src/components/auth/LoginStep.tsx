"use client"

import React from 'react'

interface LoginStepProps {
  onLogin: (email: string, password: string) => void
  onGoogleLogin: () => void
  onKakaoLogin: () => void
  onSwitchToSignup: () => void
}

export default function LoginStep({ onLogin, onGoogleLogin, onKakaoLogin, onSwitchToSignup }: LoginStepProps) {
  const handleSubmit = () => {
    const email = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value
    const password = (document.querySelector('input[type="password"]') as HTMLInputElement)?.value
    
    if (!email || !password) {
      alert('이메일과 비밀번호를 모두 입력해주세요.')
      return
    }
    
    onLogin(email, password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-amber-400 mb-8">로그인</h1>
        
        <div className="bg-white/10 rounded-2xl p-8 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-left text-white mb-2">이메일</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                placeholder="이메일을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-left text-white mb-2">비밀번호</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors mb-4 w-full"
        >
          로그인
        </button>

        <div className="text-center space-y-4">
          <button
            onClick={onSwitchToSignup}
            className="text-amber-400 hover:text-amber-300 text-sm transition-colors block w-full"
          >
            계정이 없으신가요? 회원가입하기
          </button>
          
          <div className="text-center">
            <span className="text-white/60 text-sm">또는</span>
          </div>
          
          <button
            onClick={onGoogleLogin}
            className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-3 rounded-full text-lg font-semibold transition-colors mb-3 w-full flex items-center justify-center"
          >
            <span className="mr-2">🔍</span>
            Google로 로그인
          </button>

          <button
            onClick={onKakaoLogin}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-full text-lg font-semibold transition-colors w-full flex items-center justify-center"
          >
            <span className="mr-2">💬</span>
            카카오로 로그인
          </button>
        </div>
      </div>
    </div>
  )
}
