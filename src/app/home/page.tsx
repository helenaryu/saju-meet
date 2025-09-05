"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileData } from '@/types'
import { dummyMatches } from '@/constants/data'

export default function HomePage() {
  const router = useRouter()
  const [localUser, setLocalUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([])
  const [selectedIdealKeywords, setSelectedIdealKeywords] = useState<string[]>([])

  // 페이지 로드 시 사용자 정보 확인
  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const savedUser = localStorage.getItem('localUser')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setLocalUser(user)
        
        // 저장된 프로필 데이터가 있으면 불러오기
        const savedProfile = localStorage.getItem('sajuMeetProfile')
        if (savedProfile) {
          const profile = JSON.parse(savedProfile)
          setProfileData(profile)
        }
        
        // 저장된 추가 사진이 있으면 불러오기
        const savedPhotos = localStorage.getItem('sajuMeetAdditionalPhotos')
        if (savedPhotos) {
          const photos = JSON.parse(savedPhotos)
          setAdditionalPhotos(photos)
        }
        
        // 저장된 이상형 키워드가 있으면 불러오기
        const savedKeywords = localStorage.getItem('sajuMeetIdealKeywords')
        if (savedKeywords) {
          const keywords = JSON.parse(savedKeywords)
          setSelectedIdealKeywords(keywords)
        }
        
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

  const handleLogout = () => {
    localStorage.removeItem('localUser')
    localStorage.removeItem('sajuMeetProfile')
    localStorage.removeItem('sajuMeetAdditionalPhotos')
    localStorage.removeItem('sajuMeetIdealKeywords')
    router.push('/')
  }

  const handleIdealMatch = () => {
    router.push('/ideal-match')
  }

  const handleEditProfile = () => {
    router.push('/profile')
  }

  const handleNewAnalysis = () => {
    router.push('/integrated-analysis')
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
          <h1 className="text-3xl font-bold text-amber-400">🎉 프로필 설정 완료!</h1>
          <div className="flex items-center gap-4">
            <span className="text-amber-400">
              {localUser?.nickname || '사용자'}님 환영합니다!
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 환영 메시지 */}
        <div className="bg-white/10 rounded-3xl p-8 mb-8 text-center">
          <div className="text-6xl mb-4">🎊</div>
          <h2 className="text-2xl font-bold text-amber-400 mb-4">
            {profileData?.nickname || localUser?.nickname || '사용자'}님의 프로필이 성공적으로 설정되었습니다!
          </h2>
          <p className="text-gray-300 text-lg">
            이제 이상형 매칭과 더 많은 서비스를 이용할 수 있어요.
          </p>
        </div>

        {/* 서비스 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 이상형 매칭 */}
          <div 
            onClick={handleIdealMatch}
            className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-400/30 rounded-2xl p-6 text-center hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="text-4xl mb-4">💕</div>
            <h3 className="text-xl font-bold text-pink-300 mb-2">이상형 매칭</h3>
            <p className="text-gray-300 text-sm">
              AI가 분석한 궁합을 바탕으로 이상형을 찾아보세요
            </p>
          </div>

          {/* 프로필 관리 */}
          <div 
            onClick={handleEditProfile}
            className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/30 rounded-2xl p-6 text-center hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-bold text-blue-300 mb-2">프로필 관리</h3>
            <p className="text-gray-300 text-sm">
              프로필 정보를 수정하고 관리하세요
            </p>
          </div>

          {/* 새로운 분석 */}
          <div 
            onClick={handleNewAnalysis}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl p-6 text-center hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="text-4xl mb-4">🔮</div>
            <h3 className="text-xl font-bold text-green-300 mb-2">새로운 분석</h3>
            <p className="text-gray-300 text-sm">
              새로운 사진으로 다시 분석해보세요
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

