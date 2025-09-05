"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CompatibilityReport from '@/components/profile/CompatibilityReport'
import { ProfileData } from '@/types'

function OtherProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [otherUser, setOtherUser] = useState<any>(null)
  const [myProfile, setMyProfile] = useState<ProfileData | null>(null)
  const [showCompatibilityReport, setShowCompatibilityReport] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!searchParams) return
    
    // URL 파라미터에서 상대방 정보 가져오기
    const userId = searchParams.get('userId')
    const nickname = searchParams.get('nickname')
    
    if (!userId && !nickname) {
      // URL 파라미터가 없으면 홈으로 리다이렉트
      router.push('/home')
      return
    }

    // 내 프로필 정보 로드
    loadMyProfile()
    
    // 상대방 정보 로드 (실제로는 API에서 가져와야 함)
    loadOtherUser(userId, nickname)
  }, [searchParams, router])

  const loadMyProfile = () => {
    try {
      // 로컬 스토리지에서 내 프로필 정보 로드
      const savedProfile = localStorage.getItem('sajuMeetProfile')
      const savedSajuData = localStorage.getItem('sajuMeetSajuData')
      const savedFaceData = localStorage.getItem('sajuMeetFaceData')
      
      if (savedProfile) {
        const profile = JSON.parse(savedProfile)
        setMyProfile(profile)
      }
    } catch (error) {
      console.error('내 프로필 로드 오류:', error)
    }
  }

  const loadOtherUser = (userId: string | null, nickname: string | null) => {
    // 실제로는 API에서 상대방 정보를 가져와야 함
    // 현재는 더미 데이터 사용
    const dummyOtherUser = {
      id: userId || '1',
      nickname: nickname || '상대방',
      gender: 'female',
      birthDate: '1995-06-15',
      birthTime: '14:00',
      region: '서울',
      height: '165cm',
      bodyType: '보통 체형',
      job: '디자이너',
      education: '대학교 졸업',
      school: '홍익대학교',
      introduction: '안녕하세요! 새로운 사람들과의 만남을 좋아합니다. 함께 즐거운 시간을 보내고 싶어요.',
      idealKeywords: ['창의적', '유머러스', '성실한'],
      photos: [
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
      ],
      faceKeywords: ['감성적', '직관적', '친근함', '매력적'],
      sajuKeywords: ['창의적', '성장지향적', '리더십', '열정적'],
      faceAnalysis: {
        눈: '큰 눈으로 감정 표현이 풍부하고 직관력이 뛰어남',
        코: '직선적인 코로 정직하고 솔직한 성격',
        입: '입꼬리가 올라가 긍정적이고 친근함',
        이마: '넓은 이마로 지적 능력이 뛰어남',
        턱: '둥근 턱으로 부드럽고 친근함'
      },
      sajuAnalysis: {
        오행: {
          wood: 30,
          fire: 25,
          earth: 20,
          metal: 15,
          water: 10
        },
        해석: '목(木) 기운이 강하여 창의적이고 성장 지향적인 성격을 가지고 있습니다.'
      }
    }
    
    setOtherUser(dummyOtherUser)
    setLoading(false)
  }

  const handleCompatibilityAnalysis = () => {
    if (!myProfile || !otherUser) return
    
    setShowCompatibilityReport(true)
  }

  const closeCompatibilityReport = () => {
    setShowCompatibilityReport(false)
  }

  const handleBack = () => {
    router.back()
  }

  const handleChat = () => {
    // 채팅 페이지로 이동
    router.push(`/chat/${otherUser?.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-amber-400 mb-4">프로필 로딩 중...</h1>
          <p className="text-white">잠시만 기다려주세요.</p>
        </div>
      </div>
    )
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">프로필을 찾을 수 없습니다</h1>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* 헤더 */}
      <div className="sticky top-0 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-white hover:text-amber-400 transition-colors"
          >
            ← 뒤로
          </button>
          <h1 className="text-xl font-bold text-amber-400">{otherUser.nickname}님의 프로필</h1>
          <div className="w-8"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* 프로필 카드 */}
        <div className="bg-white/10 rounded-2xl p-8 mb-6">
          {/* 프로필 사진 */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={otherUser.photos[0]}
                alt={otherUser.nickname}
                className="w-32 h-32 rounded-full object-cover border-4 border-amber-400"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                ✓
              </div>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-amber-400 mb-2">{otherUser.nickname}</h2>
            <p className="text-white text-lg mb-4">{otherUser.introduction}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 rounded-lg p-3">
                <span className="text-gray-400">나이</span>
                <p className="text-white font-semibold">29세</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <span className="text-gray-400">키</span>
                <p className="text-white font-semibold">{otherUser.height}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <span className="text-gray-400">직업</span>
                <p className="text-white font-semibold">{otherUser.job}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <span className="text-gray-400">지역</span>
                <p className="text-white font-semibold">{otherUser.region}</p>
              </div>
            </div>
          </div>

          {/* 관상 키워드 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-amber-400 mb-3">관상 키워드</h3>
            <div className="flex flex-wrap gap-2">
              {otherUser.faceKeywords.map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-pink-500 text-white rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* 사주 키워드 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-amber-400 mb-3">사주 키워드</h3>
            <div className="flex flex-wrap gap-2">
              {otherUser.sajuKeywords.map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* 이상형 키워드 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-amber-400 mb-3">이상형 키워드</h3>
            <div className="flex flex-wrap gap-2">
              {otherUser.idealKeywords.map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* 추가 사진들 */}
          {otherUser.photos.length > 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-amber-400 mb-3">추가 사진</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {otherUser.photos.slice(1).map((photo: string, index: number) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`추가 사진 ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCompatibilityAnalysis}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              💕 궁합 분석하기
            </button>
            <button
              onClick={handleChat}
              className="flex-1 bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors"
            >
              💬 채팅하기
            </button>
          </div>
        </div>
      </div>

      {/* 궁합 분석 모달 */}
      {showCompatibilityReport && myProfile && (
        <CompatibilityReport
          user1={{
            nickname: myProfile.nickname,
            gender: myProfile.gender,
            birthDate: myProfile.birthDate,
            faceKeywords: [], // 실제로는 저장된 관상 키워드 사용
            sajuKeywords: [] // 실제로는 저장된 사주 키워드 사용
          }}
          user2={{
            nickname: otherUser.nickname,
            gender: otherUser.gender,
            birthDate: otherUser.birthDate,
            faceKeywords: otherUser.faceKeywords,
            sajuKeywords: otherUser.sajuKeywords
          }}
          onClose={closeCompatibilityReport}
        />
      )}
    </div>
  )
}

export default function OtherProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-amber-400 mb-4">로딩 중...</h1>
          <p className="text-white">잠시만 기다려주세요.</p>
        </div>
      </div>
    }>
      <OtherProfileContent />
    </Suspense>
  )
}
