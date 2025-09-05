"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProfileRegistrationStep from '@/components/profile/ProfileRegistrationStep'
import CompatibilityReport from '@/components/profile/CompatibilityReport'
import { ProfileData } from '@/types'
import { IDEAL_TYPE_KEYWORDS } from '@/constants/data'

export default function ProfilePage() {
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData>({
    nickname: "",
    gender: "male",
    birthDate: "",
    birthTime: "",
    region: "",
    height: "",
    bodyType: "",
    job: "",
    education: "",
    school: "",
    introduction: "",
    idealKeywords: [],
  })
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([])
  const [selectedIdealKeywords, setSelectedIdealKeywords] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [localUser, setLocalUser] = useState<any>(null)
  const [showCompatibilityReport, setShowCompatibilityReport] = useState(false)
  const [otherUser, setOtherUser] = useState<any>(null)

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
        
        // 저장된 사주 데이터가 있으면 프로필에 반영
        const savedSajuData = localStorage.getItem('sajuMeetSajuData')
        if (savedSajuData) {
          const sajuData = JSON.parse(savedSajuData)
          setProfileData(prev => ({
            ...prev,
            birthDate: sajuData.birthDate || prev.birthDate,
            birthTime: sajuData.birthTime || prev.birthTime,
            // 사주 데이터의 출생지 정보를 지역으로 매핑할 수 있다면 추가
            // region: sajuData.birthPlace || prev.region,
          }))
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

  const handleInputChange = (field: string, value: any) => {
    const newProfileData = { ...profileData, [field]: value }
    setProfileData(newProfileData)
    // localStorage에 저장
    localStorage.setItem('sajuMeetProfile', JSON.stringify(newProfileData))
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleAdditionalPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newPhotos: string[] = []
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          newPhotos.push(result)
          if (newPhotos.length === files.length) {
            const updatedPhotos = [...additionalPhotos, ...newPhotos].slice(0, 5) // 최대 5장까지
            setAdditionalPhotos(updatedPhotos)
            // localStorage에 저장
            localStorage.setItem('sajuMeetAdditionalPhotos', JSON.stringify(updatedPhotos))
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeAdditionalPhoto = (index: number) => {
    const updatedPhotos = additionalPhotos.filter((_, i) => i !== index)
    setAdditionalPhotos(updatedPhotos)
    // localStorage에 저장
    localStorage.setItem('sajuMeetAdditionalPhotos', JSON.stringify(updatedPhotos))
  }

  const handleIdealTypeToggle = (keyword: string) => {
    setSelectedIdealKeywords((prev) => {
      let updatedKeywords
      if (prev.includes(keyword)) {
        updatedKeywords = prev.filter((k) => k !== keyword)
      } else if (prev.length < 3) {
        updatedKeywords = [...prev, keyword]
      } else {
        updatedKeywords = prev
      }
      
      // localStorage에 저장
      localStorage.setItem('sajuMeetIdealKeywords', JSON.stringify(updatedKeywords))
      return updatedKeywords
    })
  }

  const validateProfile = () => {
    const newErrors: Record<string, string> = {}

    if (!profileData.nickname.trim()) newErrors.nickname = "닉네임을 입력해주세요"
    if (!profileData.gender) newErrors.gender = "성별을 선택해주세요"
    if (!profileData.birthDate) newErrors.birthDate = "생년월일을 입력해주세요"
    if (!profileData.region) newErrors.region = "거주 지역을 선택해주세요"
    if (!profileData.height) newErrors.height = "키를 입력해주세요"
    if (!profileData.bodyType) newErrors.bodyType = "체형을 선택해주세요"
    if (!profileData.job.trim()) newErrors.job = "직업을 입력해주세요"
    if (!profileData.education) newErrors.education = "학력을 선택해주세요"
    if (profileData.introduction.length > 1000) newErrors.introduction = "자기소개는 최대 1000자까지 입력 가능합니다"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileComplete = () => {
    // 프로필 데이터 검증
    if (!validateProfile()) {
      return
    }

    // 프로필 완료 후 홈으로 이동
    router.push('/home')
    
    // 로컬 스토리지에 프로필 데이터 저장
    localStorage.setItem('sajuMeetProfile', JSON.stringify(profileData))
    localStorage.setItem('sajuMeetAdditionalPhotos', JSON.stringify(additionalPhotos))
    localStorage.setItem('sajuMeetIdealKeywords', JSON.stringify(selectedIdealKeywords))
  }

  const handleBack = () => {
    router.push('/integrated-analysis')
  }

  const handleCompatibilityAnalysis = () => {
    // 임시로 더미 사용자 데이터 사용 (실제로는 매칭된 사용자 데이터 사용)
    const dummyOtherUser = {
      nickname: "상대방",
      gender: "female",
      birthDate: "1995-06-15",
      faceKeywords: ["감성적", "직관적", "친근함"],
      sajuKeywords: ["창의적", "성장지향적", "리더십"]
    }
    
    setOtherUser(dummyOtherUser)
    setShowCompatibilityReport(true)
  }

  const closeCompatibilityReport = () => {
    setShowCompatibilityReport(false)
    setOtherUser(null)
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
    <>
      <ProfileRegistrationStep
        profileData={profileData}
        additionalPhotos={additionalPhotos}
        selectedIdealKeywords={selectedIdealKeywords}
        errors={errors}
        onInputChange={handleInputChange}
        onAdditionalPhotoUpload={handleAdditionalPhotoUpload}
        onRemoveAdditionalPhoto={removeAdditionalPhoto}
        onIdealTypeToggle={handleIdealTypeToggle}
        onValidateAndProceed={handleProfileComplete}
        onBack={handleBack}
        onCompatibilityAnalysis={handleCompatibilityAnalysis}
        IDEAL_TYPE_KEYWORDS={IDEAL_TYPE_KEYWORDS}
      />
      
      {showCompatibilityReport && otherUser && (
        <CompatibilityReport
          user1={{
            nickname: profileData.nickname,
            gender: profileData.gender,
            birthDate: profileData.birthDate,
            faceKeywords: [], // 실제로는 저장된 관상 키워드 사용
            sajuKeywords: [] // 실제로는 저장된 사주 키워드 사용
          }}
          user2={otherUser}
          onClose={closeCompatibilityReport}
        />
      )}
    </>
  )
}
