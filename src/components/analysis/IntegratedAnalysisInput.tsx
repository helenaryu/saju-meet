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

interface SajuData {
  birthDate: string
  birthTime: string
  birthPlace: string
  birthPlaceDetail: string
}

interface IntegratedAnalysisInputProps {
  uploadedImage: string | null
  profileData: ProfileData
  sajuData: SajuData
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onProfileDataChange: (field: string, value: any) => void
  onSajuDataChange: (field: string, value: string) => void
  onStartAnalysis: () => void
  onLogout: () => void
  localUser: any
}

export default function IntegratedAnalysisInput({
  uploadedImage,
  profileData,
  sajuData,
  onPhotoUpload,
  onProfileDataChange,
  onSajuDataChange,
  onStartAnalysis,
  onLogout,
  localUser
}: IntegratedAnalysisInputProps) {
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
        <h1 className="text-4xl font-bold text-amber-400 mb-8 text-center">관상과 사주 통합 분석</h1>
        <p className="text-xl text-white mb-8 text-center">사진과 사주 정보를 입력하면 AI가 종합적으로 분석해드립니다</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 사진 업로드 */}
          <div className="bg-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-amber-400 mb-4">📸 관상 분석용 사진</h2>
            <p className="text-gray-300 mb-4">정면 얼굴 사진을 업로드해주세요</p>
            
            <div className="text-center">
              {uploadedImage ? (
                <div className="mb-4">
                  <img 
                    src={uploadedImage} 
                    alt="업로드된 사진" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-amber-400 mx-auto"
                  />
                  <button
                    onClick={() => onProfileDataChange("uploadedImage", null)}
                    className="text-red-400 text-sm mt-2 hover:text-red-300"
                  >
                    사진 변경하기
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-amber-400/50 rounded-lg p-8 mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-full text-lg font-semibold transition-colors cursor-pointer inline-block"
                  >
                    사진 선택하기
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 사주 정보 입력 */}
          <div className="bg-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">🔮 사주 분석 정보</h2>
            <p className="text-gray-300 mb-4">성별, 생년월일, 출생 시간을 입력해주세요</p>
            
            <div className="space-y-4">
              {/* 성별 선택 */}
              <div>
                <label className="block text-white mb-2">성별 *</label>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => onProfileDataChange("gender", '남성')}
                    className={`flex-1 px-4 py-3 rounded-lg transition-all border-2 ${
                      profileData.gender === '남성' 
                        ? 'bg-blue-500 text-white border-blue-400 shadow-lg' 
                        : 'bg-white/20 text-gray-300 border-white/30 hover:bg-white/30'
                    }`}
                  >
                    👨 남성
                  </button>
                  <button 
                    type="button"
                    onClick={() => onProfileDataChange("gender", '여성')}
                    className={`flex-1 px-4 py-3 rounded-lg transition-all border-2 ${
                      profileData.gender === '여성' 
                        ? 'bg-pink-500 text-white border-pink-400 shadow-lg' 
                        : 'bg-white/20 text-gray-300 border-white/30 hover:bg-white/30'
                    }`}
                  >
                    👩 여성
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-white mb-2">생년월일 *</label>
                <input
                  type="date"
                  value={sajuData.birthDate}
                  onChange={(e) => onSajuDataChange("birthDate", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-blue-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">출생 시간</label>
                <select
                  value={sajuData.birthTime}
                  onChange={(e) => onSajuDataChange("birthTime", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-blue-400 focus:outline-none"
                >
                  <option value="">없음</option>
                  <option value="00:00">자시 (23:00-01:00)</option>
                  <option value="02:00">축시 (01:00-03:00)</option>
                  <option value="04:00">인시 (03:00-05:00)</option>
                  <option value="06:00">묘시 (05:00-07:00)</option>
                  <option value="08:00">진시 (07:00-09:00)</option>
                  <option value="10:00">사시 (09:00-11:00)</option>
                  <option value="12:00">오시 (11:00-13:00)</option>
                  <option value="14:00">미시 (13:00-15:00)</option>
                  <option value="16:00">신시 (15:00-17:00)</option>
                  <option value="18:00">유시 (17:00-19:00)</option>
                  <option value="20:00">술시 (19:00-21:00)</option>
                  <option value="22:00">해시 (21:00-23:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">태어난 지역</label>
                <select
                  value={sajuData.birthPlace}
                  onChange={(e) => onSajuDataChange("birthPlace", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-blue-400 focus:outline-none"
                >
                  <option value="">지역 선택</option>
                  <option value="서울">서울</option>
                  <option value="경기">경기</option>
                  <option value="인천">인천</option>
                  <option value="부산">부산</option>
                  <option value="대구">대구</option>
                  <option value="광주">광주</option>
                  <option value="대전">대전</option>
                  <option value="울산">울산</option>
                  <option value="강원">강원</option>
                  <option value="충북">충북</option>
                  <option value="충남">충남</option>
                  <option value="전북">전북</option>
                  <option value="전남">전남</option>
                  <option value="경북">경북</option>
                  <option value="경남">경남</option>
                  <option value="제주">제주</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 통합 분석 시작 버튼 */}
        <div className="text-center mt-8">
          <button
            onClick={onStartAnalysis}
            disabled={!uploadedImage || !sajuData.birthDate || !profileData.gender}
            className={`px-12 py-4 rounded-full text-xl font-bold transition-colors ${
              uploadedImage && sajuData.birthDate && profileData.gender
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            🚀 AI 통합 분석 시작하기
          </button>
          
          {(!uploadedImage || !sajuData.birthDate || !profileData.gender) && (
            <p className="text-gray-400 text-sm mt-2">
              {!uploadedImage && !sajuData.birthDate && !profileData.gender ? '사진, 성별, 생년월일을 입력해주세요' :
               !uploadedImage ? '사진을 업로드해주세요' : 
               !profileData.gender ? '성별을 선택해주세요' : '생년월일을 입력해주세요'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
