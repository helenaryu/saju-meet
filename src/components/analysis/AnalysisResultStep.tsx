"use client"

import React from 'react'

interface ProfileData {
  nickname: string
  gender: string
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

interface AnalysisResultStepProps {
  uploadedImage: string | null
  profileData: ProfileData
  faceReadingResults: AnalysisResult[]
  sajuResults: AnalysisResult[]
  onLogout: () => void
  localUser: any
  onProfileSetup: () => void  // 프로필 설정 콜백 추가
}

export default function AnalysisResultStep({
  uploadedImage,
  profileData,
  faceReadingResults,
  sajuResults,
  onLogout,
  localUser,
  onProfileSetup  // props에 추가
}: AnalysisResultStepProps) {
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
      
      <div className="max-w-4xl mx-auto">
        {/* 상단 요약 카드 영역 */}
        <div className="bg-white/10 rounded-3xl p-8 mb-8 text-center">
          <div className="flex items-center justify-center mb-6">
            {uploadedImage && (
              <img 
                src={uploadedImage} 
                alt="프로필" 
                className="w-24 h-24 rounded-full object-cover border-4 border-amber-400"
              />
            )}
          </div>
          <h1 className="text-3xl font-bold text-amber-400 mb-4">{profileData.nickname || "사용자"}</h1>
          <div className="text-gray-300 mb-4">
            {profileData.gender === "male" ? "남성" : profileData.gender === "female" ? "여성" : ""} • {profileData.birthDate}
          </div>
          
          {/* 관상 키워드 배지들 */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {faceReadingResults.slice(0, 5).map((result, index) => (
              <span key={index} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-400">
                {result.keyword}
              </span>
            ))}
          </div>
          {/* 사주 키워드 배지들 */}
          <div className="flex flex-wrap justify-center gap-2">
            {sajuResults.slice(0, 5).map((result, index) => (
              <span key={index} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-400">
                {result.keyword}
              </span>
            ))}
          </div>
        </div>

        {/* 감성적 연애 리포트 */}
        <div className="bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-pink-400/30 rounded-3xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-amber-400 mb-2">💕 연애 리포트</h2>
            <p className="text-gray-400 italic">당신만을 위한 특별한 이야기</p>
          </div>
          
          <div className="text-lg text-white leading-relaxed">
            {faceReadingResults && faceReadingResults.length > 0 && sajuResults && sajuResults.length > 0 ? (
              <div className="space-y-8">
                {/* 메인 스토리 */}
                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl p-8 border border-pink-400/30">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-3xl">✨</div>
                    <div>
                      <h3 className="text-xl font-semibold text-pink-300 mb-3">당신의 연애 이야기</h3>
                      <div className="space-y-4 text-gray-200 leading-relaxed text-lg">
                        <p>
                          {faceReadingResults.find(r => r.description)?.description || 
                           `${profileData.nickname || "당신"}님의 얼굴을 보는 순간, 마치 따뜻한 봄날 햇살처럼 부드럽고 포근한 기운이 느껴집니다. 마치 오랫동안 기다려온 봄날처럼, 당신의 존재 자체가 주변 사람들에게 안도감과 따뜻함을 선사하는 것 같아요.`}
                        </p>
                        
                        <p>
                          연애 초반에는 마치 아직 피지 않은 꽃봉오리처럼 조심스럽게 다가가지만, 한번 마음을 열면 그 안에서 피어나는 사랑은 정말 아름답습니다. 상대방의 감정에 깊이 공감하는 능력은 마치 상대방의 마음을 읽는 마법사 같아요. 상대방이 슬플 때는 함께 슬퍼하고, 기쁠 때는 함께 기뻐하며, 그 순간순간을 진심으로 공유하려고 노력하는 사람입니다.
                        </p>
                        
                        <p>
                          위기 상황에서는 마치 어려운 퍼즐을 함께 맞추려는 것처럼, 상대방을 이해하려고 노력하고 함께 해결책을 찾아가는 스타일이에요. &ldquo;우리 함께 해결해보자&rdquo;라는 마음가짐으로, 문제를 피하지 않고 정면으로 맞서는 용기와 지혜를 가지고 있습니다.
                        </p>
                        
                        <p>
                          당신의 사랑은 마치 깊은 숲속의 맑은 샘물처럼, 시간이 지날수록 더욱 깊어지고 맑아집니다. 한번 마음을 열면 그 사랑은 변함없이 지속되며, 상대방에게 안전한 항구가 되어주는 사람입니다. 이런 당신을 만난 사람은 정말 행운아라고 할 수 있어요.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 관상 해석 - 시각적 분석 */}
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-8 border border-green-400/30">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-3xl">👁️</div>
                    <div>
                      <h3 className="text-xl font-semibold text-green-300 mb-3">관상 해석</h3>
                      <div className="space-y-4 text-gray-200 leading-relaxed">
                        <p>
                          당신의 얼굴을 동양 철학의 오행 관상학으로 바라보니, 정말 아름다운 운명의 지도가 펼쳐져 있어요. 이마(화火)에서 느껴지는 정신적 성향은 연애에서도 깊이 있는 사고와 이상을 추구하는 모습을 보여줍니다.
                        </p>
                        <p>
                          눈 아래(목木)의 생동감은 사랑에 대한 생명력과 열정이 넘치는 것을 말해주고, 뺨(토土)의 넉넉함은 연애에서의 안정성과 조화 능력을 보여줍니다. 인중(금金)의 형태는 연애에서의 의지력과 숨겨진 강인함을, 턱(수水)은 연애에서의 지혜와 성숙함을 나타냅니다.
                        </p>
                        <p>
                          각 부위가 단순한 외모가 아닌 삶의 이야기와 운명의 흐름을 담고 있어, 상대방과의 깊이 있는 교감을 이끌어낼 수 있는 분입니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 사주 해석 */}
                <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl p-8 border border-blue-400/30">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-3xl">🔮</div>
                    <div>
                      <h3 className="text-xl font-semibold text-blue-300 mb-3">사주 해석</h3>
                      <div className="space-y-4 text-gray-200 leading-relaxed">
                        <p>
                          사주를 보니, 당신은 감정을 솔직하게 표현하는 성향을 타고 태어나셨어요. 연애에서 주도적으로 이끌어가는 스타일은 아니지만, 상대방의 감정에 깊이 공감하고 함께 성장하려는 마음이 강합니다.
                        </p>
                        <p>
                          새로운 경험을 추구하는 성격이라 연애에서도 항상 새로운 시도와 도전을 즐기시는 분이에요. 이런 특성은 파트너와의 관계를 더욱 풍부하고 흥미롭게 만들어줄 거예요.
                        </p>
                        <p>
                          특히 감정적 교감과 지적 대화를 중시하며, 서로의 꿈과 목표를 공유할 수 있는 사람과 만나면 운명적인 사랑을 경험할 수 있을 거예요.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 이상형 제안 */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-purple-400/30">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-3xl">💝</div>
                    <div>
                      <h3 className="text-xl font-semibold text-purple-300 mb-3">이상형 제안</h3>
                      <div className="space-y-4 text-gray-200 leading-relaxed">
                        <p>
                          당신과 가장 잘 맞는 사람은 당신의 따뜻함을 진심으로 이해하고 함께 성장할 수 있는 파트너예요. 감정적 교감과 지적 대화를 중시하며, 서로의 꿈과 목표를 공유할 수 있는 사람과 만나면 운명적인 사랑을 경험할 수 있을 거예요.
                        </p>
                        <p>
                          특히 당신의 공감 능력을 진가로 알아주고, 함께 새로운 모험을 떠날 준비가 된 사람이 이상적입니다. 당신의 연애 감정이 가장 잘 피어나는 조합은 어떤지, 성별에 따른 연애에서의 보완점과 시너지 효과를 구체적으로 설명해드릴게요.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                분석 결과를 불러오는 중입니다...
              </div>
            )}
          </div>
        </div>

        {/* 하단 액션 버튼들 */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onProfileSetup}
              className="bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-bold transition-colors"
            >
              프로필 설정하기
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors"
            >
              다시 분석하기
            </button>
          </div>
          
          <p className="text-gray-400 text-sm">
            프로필을 설정하면 이상형 매칭과 더 많은 서비스를 이용할 수 있어요!
          </p>
        </div>
      </div>
    </div>
  )
}
