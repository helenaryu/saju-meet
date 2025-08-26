"use client"

import React from 'react'

interface AuthLoadingStepProps {
  provider: "google" | "kakao" | null
  onCancel: () => void
}

export default function AuthLoadingStep({ provider, onCancel }: AuthLoadingStepProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-amber-400 mx-auto mb-6"></div>
        <h1 className="text-3xl font-bold text-amber-400 mb-4">
          {provider === "google" ? "Google" : "카카오"} 회원가입 진행 중
        </h1>
        <p className="text-xl text-white mb-6">
          {provider === "google" ? "Google" : "카카오"}에서 인증을 진행하고 있습니다.
        </p>
        <div className="bg-white/10 rounded-2xl p-6">
          <p className="text-white/80 text-sm">
            팝업 창이 열렸다면 인증을 완료해주세요.
          </p>
          <p className="text-white/60 text-xs mt-2">
            팝업이 차단된 경우 브라우저 설정을 확인해주세요.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-amber-400 hover:text-amber-300 text-sm transition-colors mt-6"
        >
          취소하고 돌아가기
        </button>
      </div>
    </div>
  )
}
