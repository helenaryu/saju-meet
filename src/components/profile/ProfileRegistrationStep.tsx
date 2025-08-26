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

interface ProfileRegistrationStepProps {
  profileData: ProfileData
  additionalPhotos: string[]
  selectedIdealKeywords: string[]
  errors: Record<string, string>
  onInputChange: (field: string, value: any) => void
  onAdditionalPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveAdditionalPhoto: (index: number) => void
  onIdealTypeToggle: (keyword: string) => void
  onValidateAndProceed: () => void
  onBack: () => void
  IDEAL_TYPE_KEYWORDS: string[]
}

export default function ProfileRegistrationStep({
  profileData,
  additionalPhotos,
  selectedIdealKeywords,
  errors,
  onInputChange,
  onAdditionalPhotoUpload,
  onRemoveAdditionalPhoto,
  onIdealTypeToggle,
  onValidateAndProceed,
  onBack,
  IDEAL_TYPE_KEYWORDS
}: ProfileRegistrationStepProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-amber-400 mb-8 text-center">프로필 등록</h1>
        <p className="text-xl text-white mb-8 text-center">당신을 소개해주세요</p>
        
        <div className="bg-white/10 rounded-2xl p-8">
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">닉네임 *</label>
                <input
                  type="text"
                  value={profileData.nickname}
                  onChange={(e) => onInputChange("nickname", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                  placeholder="닉네임을 입력하세요"
                />
                {errors.nickname && <p className="text-red-400 text-sm mt-1">{errors.nickname}</p>}
              </div>
              
              <div>
                <label className="block text-white mb-2">성별 *</label>
                <select
                  value={profileData.gender}
                  onChange={(e) => onInputChange("gender", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                >
                  <option value="">성별 선택</option>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                </select>
                {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">생년월일 *</label>
                <input
                  type="date"
                  value={profileData.birthDate}
                  onChange={(e) => onInputChange("birthDate", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                />
                {errors.birthDate && <p className="text-red-400 text-sm mt-1">{errors.birthDate}</p>}
              </div>
              
              <div>
                <label className="block text-white mb-2">출생 시간</label>
                <select
                  value={profileData.birthTime}
                  onChange={(e) => onInputChange("birthTime", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">거주 지역 *</label>
                <select
                  value={profileData.region}
                  onChange={(e) => onInputChange("region", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
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
                {errors.region && <p className="text-red-400 text-sm mt-1">{errors.region}</p>}
              </div>
              
              <div>
                <label className="block text-white mb-2">키</label>
                <input
                  type="text"
                  value={profileData.height}
                  onChange={(e) => onInputChange("height", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                  placeholder="예: 170cm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">체형</label>
                <select
                  value={profileData.bodyType}
                  onChange={(e) => onInputChange("bodyType", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                >
                  <option value="">체형 선택</option>
                  <option value="마른 체형">마른 체형</option>
                  <option value="보통 체형">보통 체형</option>
                  <option value="통통한 체형">통통한 체형</option>
                  <option value="근육질 체형">근육질 체형</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white mb-2">직업 *</label>
                <input
                  type="text"
                  value={profileData.job}
                  onChange={(e) => onInputChange("job", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                  placeholder="직업을 입력하세요"
                />
                {errors.job && <p className="text-red-400 text-sm mt-1">{errors.job}</p>}
              </div>
            </div>

            <div>
              <label className="block text-white mb-2">학력</label>
              <select
                value={profileData.education}
                onChange={(e) => onInputChange("education", e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
              >
                <option value="">학력 선택</option>
                <option value="고등학교 졸업">고등학교 졸업</option>
                <option value="대학교 재학">대학교 재학</option>
                <option value="대학교 졸업">대학교 졸업</option>
                <option value="대학원 재학">대학원 재학</option>
                <option value="대학원 졸업">대학원 졸업</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">자기소개</label>
              <textarea
                value={profileData.introduction}
                onChange={(e) => onInputChange("introduction", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none resize-none"
                placeholder="자신을 소개해주세요 (최대 1000자)"
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {profileData.introduction.length}/1000
              </div>
            </div>

            {/* 추가 사진 업로드 */}
            <div>
              <label className="block text-white mb-2">추가 사진 (최대 5장)</label>
              <div className="bg-white/10 rounded-lg p-4 border-2 border-dashed border-white/30">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onAdditionalPhotoUpload}
                  className="hidden"
                  id="additional-photo-upload"
                />
                <label
                  htmlFor="additional-photo-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-white text-center mb-2">클릭하여 사진 추가</p>
                  <p className="text-gray-400 text-sm text-center">여러 장 선택 가능</p>
                </label>
              </div>
              
              {/* 업로드된 추가 사진들 */}
              {additionalPhotos.length > 0 && (
                <div className="mt-4">
                  <p className="text-white mb-2">업로드된 사진 ({additionalPhotos.length}/5)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {additionalPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`추가 사진 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => onRemoveAdditionalPhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 이상형 키워드 선택 */}
            <div>
              <label className="block text-white mb-2">이상형 키워드 (최대 3개)</label>
              <div className="flex flex-wrap gap-2">
                {IDEAL_TYPE_KEYWORDS.map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => onIdealTypeToggle(keyword)}
                    className={`px-3 py-2 rounded-full text-sm transition-colors ${
                      selectedIdealKeywords.includes(keyword)
                        ? "bg-amber-400 text-black"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                선택된 키워드: {selectedIdealKeywords.join(", ") || "없음"}
              </p>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={onBack}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-full text-lg font-bold transition-colors border border-white/30"
            >
              뒤로 가기
            </button>
            <button
              onClick={onValidateAndProceed}
              className="flex-1 bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors"
            >
              프로필 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
