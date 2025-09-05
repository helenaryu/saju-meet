"use client"

import { useState, useEffect, useCallback } from 'react'
import { CompatibilityResponse } from '@/types'

interface CompatibilityReportProps {
  user1: {
    nickname: string
    gender: string
    birthDate: string
    faceKeywords: string[]
    sajuKeywords: string[]
  }
  user2: {
    nickname: string
    gender: string
    birthDate: string
    faceKeywords: string[]
    sajuKeywords: string[]
  }
  onClose: () => void
}

export default function CompatibilityReport({ user1, user2, onClose }: CompatibilityReportProps) {
  const [compatibilityData, setCompatibilityData] = useState<CompatibilityResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeCompatibility = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/compatibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user1: {
            ...user1,
            faceAnalysis: null, // 실제로는 저장된 분석 데이터 사용
            sajuAnalysis: null
          },
          user2: {
            ...user2,
            faceAnalysis: null,
            sajuAnalysis: null
          }
        })
      })

      if (!response.ok) {
        throw new Error('궁합 분석에 실패했습니다.')
      }

      const result = await response.json()
      setCompatibilityData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [user1, user2])

  useEffect(() => {
    analyzeCompatibility()
  }, [analyzeCompatibility])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '매우 좋음'
    if (score >= 60) return '좋음'
    if (score >= 40) return '보통'
    return '주의 필요'
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-amber-400 mb-2">궁합 분석 중...</h2>
            <p className="text-white">잠시만 기다려주세요.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">분석 실패</h2>
            <p className="text-white mb-6">{error}</p>
            <div className="flex gap-4">
              <button
                onClick={analyzeCompatibility}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!compatibilityData) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-amber-400 mb-2">
                {user1.nickname} & {user2.nickname}
              </h2>
              <p className="text-white">궁합 분석 리포트</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* 전체 점수 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
              <span className={`text-4xl font-bold ${getScoreColor(compatibilityData.overallScore)}`}>
                {compatibilityData.overallScore}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">전체 궁합 점수</h3>
            <p className={`text-lg font-semibold ${getScoreColor(compatibilityData.overallScore)}`}>
              {getScoreLabel(compatibilityData.overallScore)}
            </p>
          </div>

          {/* 관상 궁합 */}
          <div className="bg-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-amber-400">관상 궁합</h3>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getScoreColor(compatibilityData.faceCompatibility.score)}`}>
                  {compatibilityData.faceCompatibility.score}
                </span>
                <span className="text-white">/ 100</span>
              </div>
            </div>
            <p className="text-white mb-4">{compatibilityData.faceCompatibility.analysis}</p>
            {compatibilityData.faceCompatibility.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {compatibilityData.faceCompatibility.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-amber-500 text-white rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 사주 궁합 */}
          <div className="bg-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-amber-400">사주 궁합</h3>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getScoreColor(compatibilityData.sajuCompatibility.score)}`}>
                  {compatibilityData.sajuCompatibility.score}
                </span>
                <span className="text-white">/ 100</span>
              </div>
            </div>
            <p className="text-white mb-4">{compatibilityData.sajuCompatibility.analysis}</p>
            {compatibilityData.sajuCompatibility.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {compatibilityData.sajuCompatibility.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 상세 분석 */}
          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-amber-400 mb-4">상세 분석</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">성격 매칭</h4>
                <p className="text-gray-300">{compatibilityData.detailedAnalysis.personalityMatch}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">관계 역학</h4>
                <p className="text-gray-300">{compatibilityData.detailedAnalysis.relationshipDynamics}</p>
              </div>

              {compatibilityData.detailedAnalysis.strengths.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-2">강점</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {compatibilityData.detailedAnalysis.strengths.map((strength, index) => (
                      <li key={index} className="text-gray-300">{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {compatibilityData.detailedAnalysis.challenges.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-orange-400 mb-2">주의사항</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {compatibilityData.detailedAnalysis.challenges.map((challenge, index) => (
                      <li key={index} className="text-gray-300">{challenge}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">조언</h4>
                <p className="text-gray-300">{compatibilityData.detailedAnalysis.advice}</p>
              </div>
            </div>
          </div>

          {/* Claude 분석 */}
          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-amber-400 mb-4">AI 궁합 분석</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">종합 리포트</h4>
                <p className="text-gray-300">{compatibilityData.claudeAnalysis.compatibilityReport}</p>
              </div>

              {compatibilityData.claudeAnalysis.recommendations.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">추천사항</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {compatibilityData.claudeAnalysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-gray-300">{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}

              {compatibilityData.claudeAnalysis.traditionalWisdom.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">전통 지혜</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {compatibilityData.claudeAnalysis.traditionalWisdom.map((wisdom, index) => (
                      <li key={index} className="text-gray-300 italic">{wisdom}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
