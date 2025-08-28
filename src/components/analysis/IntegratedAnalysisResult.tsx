"use client"

import React from 'react'
import FaceReadingVisual from './FaceReadingVisual'
import SajuReadingVisual from './SajuReadingVisual'

interface ProfileData {
  nickname: string
  gender: 'male' | 'female'
  birthDate: string
  birthTime: string
  region: string
  height: string
  bodyType: string
  job: string
  education: string
  school: string
  introduction: string
  idealKeywords: string[]
}

interface AnalysisResult {
  keyword: string
  description: string
}

interface IntegratedAnalysisResultProps {
  uploadedImage: string | null
  profileData: ProfileData
  faceReadingResults: AnalysisResult[]
  sajuResults: AnalysisResult[]
  onLogout: () => void
  localUser: any
  onProfileSetup: () => void
}

export default function IntegratedAnalysisResult({
  uploadedImage,
  profileData,
  faceReadingResults,
  sajuResults,
  onLogout,
  localUser,
  onProfileSetup
}: IntegratedAnalysisResultProps) {
  
  // 성별 변환 함수
  const getGender = (gender: string): 'male' | 'female' => {
    if (gender === 'male' || gender === '남성') return 'male'
    if (gender === 'female' || gender === '여성') return 'female'
    return 'male' // 기본값
  }

  // 관상 포인트 데이터 생성
  const generateFacePoints = () => {
    const isMale = getGender(profileData.gender) === 'male'
    
    return [
      {
        id: 'forehead',
        x: isMale ? 45 : 55,
        y: 15,
        label: '이마',
        analysis: faceReadingResults.find(r => r.keyword.includes('이마') || r.keyword.includes('정신'))?.description || '정신적 성향과 이상을 추구하는 마음',
        category: 'forehead' as const
      },
      {
        id: 'left-eye',
        x: isMale ? 35 : 45,
        y: 35,
        label: '왼쪽 눈',
        analysis: faceReadingResults.find(r => r.keyword.includes('눈') || r.keyword.includes('직관'))?.description || '직관적이고 감성적인 성향',
        category: 'eyes' as const
      },
      {
        id: 'right-eye',
        x: isMale ? 55 : 65,
        y: 35,
        label: '오른쪽 눈',
        analysis: faceReadingResults.find(r => r.keyword.includes('눈') || r.keyword.includes('논리'))?.description || '논리적이고 분석적인 성향',
        category: 'eyes' as const
      },
      {
        id: 'nose',
        x: isMale ? 45 : 55,
        y: 55,
        label: '코',
        analysis: faceReadingResults.find(r => r.keyword.includes('코') || r.keyword.includes('의지'))?.description || '의지력과 리더십',
        category: 'nose' as const
      },
      {
        id: 'mouth',
        x: isMale ? 45 : 55,
        y: 75,
        label: '입',
        analysis: faceReadingResults.find(r => r.keyword.includes('입') || r.keyword.includes('소통'))?.description || '소통 능력과 감정 표현',
        category: 'mouth' as const
      },
      {
        id: 'left-cheek',
        x: isMale ? 25 : 35,
        y: 55,
        label: '왼쪽 뺨',
        analysis: faceReadingResults.find(r => r.keyword.includes('뺨') || r.keyword.includes('감정'))?.description || '감정적 안정성',
        category: 'cheeks' as const
      },
      {
        id: 'right-cheek',
        x: isMale ? 65 : 75,
        y: 55,
        label: '오른쪽 뺨',
        analysis: faceReadingResults.find(r => r.keyword.includes('뺨') || r.keyword.includes('사회'))?.description || '사회적 적응력',
        category: 'cheeks' as const
      },
      {
        id: 'chin',
        x: isMale ? 45 : 55,
        y: 90,
        label: '턱',
        analysis: faceReadingResults.find(r => r.keyword.includes('턱') || r.keyword.includes('지혜'))?.description || '지혜와 성숙함',
        category: 'chin' as const
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6 overflow-y-auto">
      {/* 로그인 상태 표시 */}
      {localUser && (
        <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
          <span className="text-amber-400">
            {localUser?.nickname || '사용자'}님 환영합니다!
          </span>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
          >
            로그아웃
          </button>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto">
        {/* 상단 요약 카드 영역 */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-3xl p-8 mb-8 text-center border border-amber-400/30">
          <div className="flex items-center justify-center mb-6">
            {uploadedImage && (
              <img 
                src={uploadedImage} 
                alt="프로필" 
                className="w-24 h-24 rounded-full object-cover border-4 border-amber-400 shadow-lg"
              />
            )}
          </div>
          <h1 className="text-4xl font-bold text-amber-400 mb-4">
            ✨ {profileData.nickname || "사용자"}님의 운명 분석 ✨
          </h1>
          <div className="text-gray-300 mb-4 text-lg">
            {profileData.gender === "male" ? "남성" : profileData.gender === "female" ? "여성" : ""} • {profileData.birthDate}
          </div>
          
          {/* 키워드 배지들 */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {faceReadingResults.slice(0, 4).map((result, index) => (
              <span key={index} className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm border border-green-400 shadow-lg">
                🌟 {result.keyword}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {sajuResults.slice(0, 4).map((result, index) => (
              <span key={index} className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm border border-blue-400 shadow-lg">
                🔮 {result.keyword}
              </span>
            ))}
          </div>
        </div>

        {/* 관상 분석 섹션 */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl p-8 mb-8 border border-green-400/30">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-300 mb-2">👁️ 관상 분석 리포트</h2>
            <p className="text-gray-400 italic">AI가 분석한 당신의 얼굴이 전하는 메시지</p>
          </div>
          
          <FaceReadingVisual 
            gender={getGender(profileData.gender)}
            facePoints={generateFacePoints()}
            className="mb-6"
          />
          
          {/* 관상 키워드 상세 설명 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {faceReadingResults.map((result, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">✨</div>
                  <h4 className="text-lg font-semibold text-green-300">{result.keyword}</h4>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">{result.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 사주 분석 섹션 */}
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl p-8 mb-8 border border-blue-400/30">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-300 mb-2">🔮 사주 분석 리포트</h2>
            <p className="text-gray-400 italic">생년월일시가 말하는 당신의 운명 이야기</p>
          </div>
          
          <SajuReadingVisual 
            birthDate={profileData.birthDate}
            birthTime={profileData.birthTime}
            birthPlace={profileData.region}
            sajuKeywords={sajuResults.map(r => r.keyword)}
            className="mb-6"
          />
          
          {/* 사주 키워드 상세 설명 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {sajuResults.map((result, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">🔮</div>
                  <h4 className="text-lg font-semibold text-blue-300">{result.keyword}</h4>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">{result.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 통합 연애 분석 */}
        <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl p-8 mb-8 border border-pink-400/30">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-pink-300 mb-2">💕 통합 연애 분석</h2>
            <p className="text-gray-400 italic">관상과 사주가 만나 전하는 연애 이야기</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 연애 성향 */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-pink-300 mb-4 flex items-center gap-2">
                💝 연애 성향
              </h3>
              <div className="space-y-3 text-gray-200">
                <p>• {getGender(profileData.gender) === 'male' ? '남성' : '여성'}다운 매력과 부드러운 감성을 동시에 가지고 있어요</p>
                <p>• 상대방의 감정에 깊이 공감하는 능력이 뛰어나요</p>
                <p>• 연애에서 진정성과 깊이를 추구하는 스타일이에요</p>
                <p>• 감정적 교감과 지적 대화를 모두 중시해요</p>
              </div>
            </div>
            
            {/* 이상형 */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-purple-300 mb-4 flex items-center gap-2">
                🎯 이상형 제안
              </h3>
              <div className="space-y-3 text-gray-200">
                <p>• 당신의 따뜻함을 진심으로 이해해주는 사람</p>
                <p>• 함께 성장할 수 있는 파트너</p>
                <p>• 감정적 교감과 지적 대화를 중시하는 사람</p>
                <p>• 새로운 모험을 떠날 준비가 된 사람</p>
              </div>
            </div>
          </div>
          
          {/* 연애 조언 */}
          <div className="mt-8 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl p-6 border border-pink-400/30">
            <h3 className="text-xl font-semibold text-pink-300 mb-4 text-center">💡 연애 조언</h3>
            <div className="text-center text-gray-200 leading-relaxed">
              <p className="mb-3">
                당신의 관상과 사주가 만나 전하는 메시지는 "진정성 있는 사랑"입니다. 
                상대방의 마음을 진심으로 이해하고, 함께 성장해나가는 관계를 만들어가세요.
              </p>
              <p>
                때로는 조심스럽게 다가가지만, 한번 마음을 열면 그 안에서 피어나는 사랑은 정말 아름답습니다. 
                당신의 따뜻함과 공감 능력은 상대방에게 안전한 항구가 되어줄 거예요. ✨
              </p>
            </div>
          </div>
        </div>

        {/* 하단 액션 버튼들 */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onProfileSetup}
              className="bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 shadow-lg"
            >
              🎯 프로필 설정하기
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 shadow-lg"
            >
              🔄 다시 분석하기
            </button>
          </div>
          
          <p className="text-gray-400 text-sm">
            프로필을 설정하면 이상형 매칭과 더 많은 서비스를 이용할 수 있어요! 💫
          </p>
        </div>
      </div>
    </div>
  )
}
