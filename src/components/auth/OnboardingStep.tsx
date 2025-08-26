"use client"

import React from 'react'

interface OnboardingStepProps {
  onStart: () => void
}

export default function OnboardingStep({ onStart }: OnboardingStepProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
      {/* 장식적 패턴 */}
      <div className="absolute top-8 left-8 w-12 h-12 border-2 border-amber-400/30 border-dashed rounded-lg"></div>
      <div className="absolute top-8 right-8 w-12 h-12 border-2 border-amber-400/30 border-dashed rounded-lg"></div>
      <div className="absolute bottom-8 left-8 w-12 h-12 border-2 border-amber-400/30 border-dashed rounded-lg"></div>
      <div className="absolute bottom-8 right-8 w-12 h-12 border-2 border-amber-400/30 border-dashed rounded-lg"></div>

      {/* 메인 컨텐츠 */}
      <div className="text-center max-w-4xl mx-auto">
        {/* 서비스 소개 카드 */}
        <div className="relative mb-12">
          <div className="flex items-center justify-center mb-8">
            {/* 모바일 기기 1 */}
            <div className="relative transform -rotate-12 mr-8">
              <div className="w-64 h-96 bg-white rounded-3xl p-4 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 flex flex-col">
                  <div className="text-amber-400 text-lg font-bold mb-4">관상 분석</div>
                  <div className="flex-1 flex flex-col justify-center space-y-3">
                    <div className="bg-amber-400/20 rounded-lg p-3">
                      <div className="text-amber-400 text-sm font-semibold">눈</div>
                      <div className="text-white text-xs">따뜻하고 감성적</div>
                    </div>
                    <div className="bg-amber-400/20 rounded-lg p-3">
                      <div className="text-amber-400 text-sm font-semibold">코</div>
                      <div className="text-white text-xs">의지가 강함</div>
                    </div>
                    <div className="bg-amber-400/20 rounded-lg p-3">
                      <div className="text-amber-400 text-sm font-semibold">입</div>
                      <div className="text-white text-xs">소통 능력 우수</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모바일 기기 2 */}
            <div className="relative transform rotate-6">
              <div className="w-64 h-96 bg-white rounded-3xl p-4 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 flex flex-col">
                  <div className="text-amber-400 text-lg font-bold mb-4">사주 분석</div>
                  <div className="flex-1 flex flex-col justify-center items-center space-y-4">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/30 flex items-center justify-center">
                      <div className="text-amber-400 text-2xl">🌟</div>
                    </div>
                    <div className="text-center">
                      <div className="text-amber-400 font-semibold mb-2">연애운 상승</div>
                      <div className="text-white text-sm">이상적인 만남 예정</div>
                    </div>
                    <button className="bg-amber-400 text-black px-6 py-2 rounded-full text-sm font-semibold">
                      START
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 서비스 설명 텍스트 */}
          <div className="text-right">
            <h2 className="text-2xl font-bold text-white mb-2">오로지 당신만을 위한</h2>
            <h1 className="text-4xl font-bold text-amber-400 mb-4">세상에 단 하나뿐인 관상 사주 매칭</h1>
            <h3 className="text-3xl font-bold text-amber-400">관상은 과학이다</h3>
          </div>
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={onStart}
          className="bg-amber-400 hover:bg-amber-500 text-black px-12 py-4 rounded-full text-xl font-bold transition-colors shadow-lg"
        >
          운명 찾기 시작
        </button>
      </div>

      {/* 점선 테두리 */}
      <div className="absolute inset-4 border-2 border-amber-400/20 border-dashed rounded-3xl pointer-events-none"></div>
    </div>
  )
}
