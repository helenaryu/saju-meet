"use client"

import React from 'react'
import FaceReadingVisual from './FaceReadingVisual'
import SajuReadingVisual from './SajuReadingVisual'
import { ProfileData } from '@/types'

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

  // 관상 포인트 데이터 생성 - 6개 부위로 수정
  const generateFacePoints = () => {
    const isMale = getGender(profileData.gender) === 'male'
    
    return [
      {
        id: 'forehead',
        x: isMale ? 45 : 55,
        y: 15,
        label: '이마',
        analysis: '정신적 성향과 이상을 추구하는 마음',
        category: 'forehead' as const
      },
      {
        id: 'eyes',
        x: isMale ? 45 : 55,
        y: 35,
        label: '눈',
        analysis: '직관적이고 감성적인 성향',
        category: 'eyes' as const
      },
      {
        id: 'nose',
        x: isMale ? 45 : 55,
        y: 55,
        label: '코',
        analysis: '의지력과 리더십',
        category: 'nose' as const
      },
      {
        id: 'mouth',
        x: isMale ? 45 : 55,
        y: 75,
        label: '입',
        analysis: '소통 능력과 감정 표현',
        category: 'mouth' as const
      },
      {
        id: 'ears',
        x: isMale ? 25 : 75,
        y: 35,
        label: '귀',
        analysis: '듣는 능력과 이해력',
        category: 'ears' as const
      },
      {
        id: 'chin',
        x: isMale ? 45 : 55,
        y: 90,
        label: '턱',
        analysis: '지혜와 성숙함',
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

        {/* 총합 관상/사주 분석 요약 - 관상 분석 리포트 위로 이동 */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-3xl p-8 mb-8 border border-amber-400/30">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-amber-300 mb-2">📊 총합 관상/사주 분석</h2>
            <p className="text-gray-400 italic">두 분석을 종합한 핵심 요약</p>
          </div>
          
          <div className="text-center text-gray-200 leading-relaxed text-lg">
            <p className="mb-4">
              관상 분석 결과, 당신은 {getGender(profileData.gender) === 'male' ? '균형 잡힌 얼굴 형태로 감정과 이성의 조화가 잘 이루어진 성향' : '부드럽고 조화로운 얼굴 형태로 따뜻하고 포용력 있는 성향'}을 가지고 있습니다. 
              사주 분석에서는 {sajuResults.length > 0 ? sajuResults[0].keyword : '창의성'}과 {sajuResults.length > 1 ? sajuResults[1].keyword : '성장'}의 기운이 강하게 나타나고 있어, 
              연애에서도 이러한 특성을 잘 활용할 수 있을 것입니다.
            </p>
            <p>
              두 분석을 종합하면, 당신은 상대방과의 깊이 있는 교감을 추구하며, 함께 성장해나가는 관계를 만드는 데 탁월한 능력을 가지고 있습니다. 
              특히 감정적 안정성과 지적 교류를 모두 중시하는 균형 잡힌 연애 스타일을 가지고 있어, 
              장기적인 관계 형성에 매우 적합한 성향을 보여줍니다.
            </p>
          </div>
        </div>

        {/* 관상 분석 섹션 */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl p-8 mb-8 border border-green-400/30">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-300 mb-2">👁️ 관상 분석 리포트</h2>
            <p className="text-gray-400 italic">AI가 분석한 당신의 얼굴이 전하는 마법 같은 메시지</p>
          </div>
          
          <FaceReadingVisual 
            gender={getGender(profileData.gender)}
            facePoints={generateFacePoints()}
            className="mb-6"
          />
          
          {/* 부위별 관상 분석 - 6개 부위, 더 길고 감성적으로 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* 이마 */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🧠</div>
                <h4 className="text-xl font-semibold text-green-300">이마</h4>
              </div>
              <div className="space-y-3 text-gray-200 text-base leading-relaxed">
                <p>당신의 이마는 마치 넓은 하늘을 담고 있는 것처럼 광활하고 깊이 있는 정신세계를 보여줍니다. 이마의 형태가 말하는 것은 당신이 단순한 현실에 만족하지 않고, 더 큰 꿈과 이상을 추구하는 마음을 가지고 있다는 것입니다.</p>
                <p>관상학적으로 볼 때, 이마는 정신적 성향과 야망을 나타내는 부위입니다. 당신의 이마가 보여주는 것은 권력이나 성취에 대한 건강한 욕구와, 연애에서도 정신적으로 깊이 있는 관계를 추구한다는 의미입니다. 상대방과의 대화에서도 단순한 감정 교류가 아닌, 함께 성장할 수 있는 깊이 있는 소통을 중시하는 성향을 가지고 있습니다.</p>
                <p>이러한 특성은 연애에서 큰 강점이 되어, 상대방에게 지적 자극과 함께 영감을 줄 수 있는 능력을 가지고 있습니다. 당신과 함께 있으면 상대방도 더 큰 꿈을 꿀 수 있게 되고, 함께 미래를 그려나갈 수 있는 힘을 얻게 됩니다.</p>
              </div>
            </div>

            {/* 눈 */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">👀</div>
                <h4 className="text-xl font-semibold text-green-300">눈</h4>
              </div>
              <div className="space-y-3 text-gray-200 text-base leading-relaxed">
                <p>당신의 눈은 마치 밤하늘의 별처럼 깊고 신비로운 빛을 발하고 있습니다. 눈은 마음의 창이라 하여 감정과 직관을 나타내는 부위인데, 당신의 눈이 보여주는 것은 직관적이고 감성적인 성향을 가지고 있다는 것입니다.</p>
                <p>관상학적으로 볼 때, 눈은 감정 표현의 풍부함과 직관력의 강함을 나타냅니다. 당신의 눈이 말하는 것은 상대방의 마음을 깊이 이해하고 공감할 수 있는 능력이 뛰어나다는 의미입니다. 연애에서도 상대방의 감정 상태를 정확하게 파악하고, 적절한 위로와 공감을 제공할 수 있는 특별한 재능을 가지고 있습니다.</p>
                <p>이러한 특성은 연애에서 큰 매력이 되어, 상대방이 당신과 함께 있으면 진심으로 이해받고 있다는 느낌을 받게 됩니다. 당신의 따뜻한 시선과 공감 능력은 상대방에게 안전감과 위로를 제공하며, 깊이 있는 감정적 교감을 가능하게 합니다.</p>
              </div>
            </div>

            {/* 코 */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">👃</div>
                <h4 className="text-xl font-semibold text-green-300">코</h4>
              </div>
              <div className="space-y-3 text-gray-200 text-base leading-relaxed">
                <p>당신의 코는 마치 산봉우리처럼 당당하고 강인한 의지를 보여줍니다. 코는 관상학에서 의지력과 리더십을 나타내는 중요한 부위로, 당신의 코가 말하는 것은 강한 의지와 결단력을 가지고 있다는 것입니다.</p>
                <p>관상학적으로 볼 때, 코는 의지의 강함과 리더십의 품질을 나타냅니다. 당신의 코가 보여주는 것은 연애에서도 명확한 기준과 원칙을 가지고 있다는 의미입니다. 상대방과의 관계에서도 진정성과 신뢰를 중시하며, 한번 마음을 정하면 깊이 있게 관계를 발전시켜나가는 성향을 가지고 있습니다.</p>
                <p>이러한 특성은 연애에서 안정감을 제공하며, 상대방에게 신뢰할 수 있는 파트너라는 느낌을 줍니다. 당신과 함께 있으면 상대방도 더욱 자신감을 가지고 관계에 임할 수 있게 되고, 함께 미래를 향해 나아갈 수 있는 힘을 얻게 됩니다.</p>
              </div>
            </div>

            {/* 입 */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">👄</div>
                <h4 className="text-xl font-semibold text-green-300">입</h4>
              </div>
              <div className="space-y-3 text-gray-200 text-base leading-relaxed">
                <p>당신의 입은 마치 아름다운 꽃처럼 따뜻하고 매력적인 에너지를 발산하고 있습니다. 입은 관상학에서 소통 능력과 감정 표현을 나타내는 부위로, 당신의 입이 말하는 것은 뛰어난 소통 능력과 따뜻한 감정 표현을 가지고 있다는 것입니다.</p>
                <p>관상학적으로 볼 때, 입은 소통의 품질과 감정 표현의 방식을 나타냅니다. 당신의 입이 보여주는 것은 연애에서도 상대방과의 대화를 통해 깊이 있는 교감을 나눌 수 있다는 의미입니다. 단순한 말이 아닌, 마음을 담은 소통을 통해 상대방의 마음을 움직일 수 있는 특별한 재능을 가지고 있습니다.</p>
                <p>이러한 특성은 연애에서 큰 매력이 되어, 상대방이 당신과 함께 있으면 대화가 즐겁고 의미 있다는 느낌을 받게 됩니다. 당신의 따뜻한 말과 공감 능력은 상대방에게 위로와 기쁨을 제공하며, 함께 있을 때마다 새로운 발견과 깨달음을 얻게 합니다.</p>
              </div>
            </div>

            {/* 귀 */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">👂</div>
                <h4 className="text-xl font-semibold text-green-300">귀</h4>
              </div>
              <div className="space-y-3 text-gray-200 text-base leading-relaxed">
                <p>당신의 귀는 마치 깊은 숲속의 고요함을 담고 있는 것처럼 조용하고 집중력 있는 듣기 능력을 보여줍니다. 귀는 관상학에서 듣는 능력과 이해력을 나타내는 부위로, 당신의 귀가 말하는 것은 상대방의 말을 진심으로 듣고 이해할 수 있는 능력이 뛰어나다는 것입니다.</p>
                <p>관상학적으로 볼 때, 귀는 듣기의 품질과 이해의 깊이를 나타냅니다. 당신의 귀가 보여주는 것은 연애에서도 상대방의 마음을 깊이 이해하고 공감할 수 있다는 의미입니다. 단순히 듣는 것이 아닌, 상대방의 감정과 생각을 진심으로 이해하려는 노력을 기울이는 특별한 재능을 가지고 있습니다.</p>
                <p>이러한 특성은 연애에서 큰 강점이 되어, 상대방이 당신과 함께 있으면 진심으로 이해받고 있다는 느낌을 받게 됩니다. 당신의 따뜻한 듣기 능력과 공감 능력은 상대방에게 안전감과 위로를 제공하며, 함께 있을 때마다 더욱 깊이 있는 관계를 만들어갈 수 있습니다.</p>
              </div>
            </div>

            {/* 턱 */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🦴</div>
                <h4 className="text-xl font-semibold text-green-300">턱</h4>
              </div>
              <div className="space-y-3 text-gray-200 text-base leading-relaxed">
                <p>당신의 턱은 마치 오랜 세월을 견뎌온 바위처럼 견고하고 지혜로운 성숙함을 보여줍니다. 턱은 관상학에서 지혜와 성숙함을 나타내는 부위로, 당신의 턱이 말하는 것은 나이에 비해 깊이 있는 지혜와 성숙한 사고를 가지고 있다는 것입니다.</p>
                <p>관상학적으로 볼 때, 턱은 지혜의 깊이와 성숙의 정도를 나타냅니다. 당신의 턱이 보여주는 것은 연애에서도 성숙하고 현명한 판단을 할 수 있다는 의미입니다. 감정에만 치우치지 않고, 이성과 감정의 균형을 잘 맞추며 관계를 발전시켜나가는 특별한 재능을 가지고 있습니다.</p>
                <p>이러한 특성은 연애에서 안정감과 신뢰를 제공하며, 상대방에게 성숙하고 믿을 수 있는 파트너라는 느낌을 줍니다. 당신과 함께 있으면 상대방도 더욱 성숙한 사랑을 배우게 되고, 함께 성장해나갈 수 있는 지혜를 얻게 됩니다.</p>
              </div>
            </div>
          </div>

          {/* 주요 키워드 섹션 */}
          <div className="mt-6 text-center">
            <h4 className="text-lg font-semibold text-green-300 mb-3">🌟 주요 키워드</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {faceReadingResults.slice(0, 5).map((result, index) => (
                <span key={index} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-400">
                  {result.keyword}
                </span>
              ))}
            </div>
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
          
          {/* 사주 키워드 상세 설명 - 더 상세하게 */}
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
            <p className="text-gray-400 italic">관상과 사주가 만나 전하는 마법 같은 연애 이야기</p>
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
              <h3 className="text-xl font-semibold text-pink-300 mb-4 flex items-center gap-2">
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
          
          {/* 연애 조언 - 더 상세하고 감성적으로 */}
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
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 shadow-lg"
            >
              🔄 다시하기
            </button>
            
            <button
              onClick={onProfileSetup}
              className="bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 shadow-lg"
            >
              🎯 프로필 등록하기
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
