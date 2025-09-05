"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { dummyMatches } from '@/constants/data'

export default function IdealMatchPage() {
  const router = useRouter()
  const [localUser, setLocalUser] = useState<any>(null)
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // 페이지 로드 시 사용자 정보 확인
  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const savedUser = localStorage.getItem('localUser')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setLocalUser(user)
      } catch (error) {
        console.error('저장된 사용자 정보 파싱 오류:', error)
        localStorage.removeItem('localUser')
        router.push('/')
        return
      }
    } else {
      // 사용자 정보가 없으면 로그인 페이지로 리다이렉트
      router.push('/')
      return
    }
  }, [router])

  const handleBackToHome = () => {
    router.push('/home')
  }

  const handleViewProfile = (match: any) => {
    setSelectedProfile(match)
    setShowProfileModal(true)
  }

  const handleStartChat = (match: any) => {
    router.push(`/chat/${match.id}`)
  }

  const closeProfileModal = () => {
    setShowProfileModal(false)
    setSelectedProfile(null)
  }

  // 로딩 중이거나 사용자 정보가 없는 경우
  if (!localUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-amber-400 mb-4">사용자 정보 확인 중...</h1>
          <p className="text-white">잠시만 기다려주세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amber-400">💕 이상형 매칭</h1>
          <div className="flex items-center gap-4">
            <span className="text-amber-400">
              {localUser?.nickname || '사용자'}님
            </span>
            <button
              onClick={handleBackToHome}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              홈으로
            </button>
          </div>
        </div>

        {/* 매칭 설명 */}
        <div className="bg-white/10 rounded-3xl p-8 mb-8 text-center">
          <div className="text-6xl mb-4">🔮</div>
          <h2 className="text-2xl font-bold text-amber-400 mb-4">
            AI가 분석한 당신의 궁합
          </h2>
          <p className="text-gray-300 text-lg">
            관상과 사주 분석을 바탕으로 가장 잘 맞는 이상형을 찾아드려요.
          </p>
        </div>

        {/* 매칭 결과 (더미 데이터) */}
        <div className="space-y-6 mb-8">
          {dummyMatches.map((match, index) => (
            <div key={index} className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-6">
                {/* 프로필 사진 */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                    👤
                  </div>
                </div>
                
                {/* 매칭 정보 */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-amber-400">{match.name}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">{match.totalCompatibility}%</div>
                      <div className="text-sm text-gray-400">궁합도</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-400">관상 궁합:</span>
                      <span className="ml-2 text-green-400 font-semibold">{match.faceCompatibility}%</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">사주 궁합:</span>
                      <span className="ml-2 text-blue-400 font-semibold">{match.sajuCompatibility}%</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-3">
                    <span className="text-gray-400">나이:</span> {match.age}세 • 
                    <span className="text-gray-400 ml-2">직업:</span> {match.job} • 
                    <span className="text-gray-400 ml-2">지역:</span> {match.region}
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-3">
                    {match.introduction}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {match.keywords.map((keyword, idx) => (
                      <span key={idx} className="bg-amber-400/20 text-amber-300 px-2 py-1 rounded-full text-xs border border-amber-400/30">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* 액션 버튼 */}
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => handleStartChat(match)}
                  className="flex-1 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                >
                  💬 대화 시작하기
                </button>
                <button 
                  onClick={() => handleViewProfile(match)}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors border border-white/30"
                >
                  👁️ 프로필 보기
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 액션 버튼 */}
        <div className="text-center">
          <button
            onClick={handleBackToHome}
            className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>

      {/* 프로필 모달 */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-amber-400">프로필 상세</h3>
              <button
                onClick={closeProfileModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* 프로필 정보 */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                👤
              </div>
              <h4 className="text-xl font-bold text-amber-400 mb-2">{selectedProfile.name}</h4>
              <div className="text-3xl font-bold text-green-400 mb-2">{selectedProfile.totalCompatibility}%</div>
              <div className="text-sm text-gray-400 mb-4">전체 궁합도</div>
            </div>

            {/* 상세 정보 */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-sm text-gray-400 mb-1">관상 궁합</div>
                  <div className="text-lg font-bold text-green-400">{selectedProfile.faceCompatibility}%</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-sm text-gray-400 mb-1">사주 궁합</div>
                  <div className="text-lg font-bold text-blue-400">{selectedProfile.sajuCompatibility}%</div>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">기본 정보</div>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-400">나이:</span> {selectedProfile.age}세</div>
                  <div><span className="text-gray-400">직업:</span> {selectedProfile.job}</div>
                  <div><span className="text-gray-400">지역:</span> {selectedProfile.region}</div>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">자기소개</div>
                <div className="text-sm text-gray-300">{selectedProfile.introduction}</div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">키워드</div>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.keywords.map((keyword: string, idx: number) => (
                    <span key={idx} className="bg-amber-400/20 text-amber-300 px-2 py-1 rounded-full text-xs border border-amber-400/30">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 모달 액션 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => handleStartChat(selectedProfile)}
                className="flex-1 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white px-4 py-3 rounded-full text-sm font-semibold transition-colors"
              >
                💬 대화 시작하기
              </button>
              <button
                onClick={closeProfileModal}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-full text-sm font-semibold transition-colors border border-white/30"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

