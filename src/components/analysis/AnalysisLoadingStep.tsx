"use client"

import React from 'react'

export default function AnalysisLoadingStep() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-amber-400 mb-8">관상과 사주 통합 분석 중</h1>
        <div className="bg-white/10 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-xl text-white">AI가 관상과 사주를 종합적으로 분석하고 있습니다</p>
        </div>
      </div>
    </div>
  )
}
