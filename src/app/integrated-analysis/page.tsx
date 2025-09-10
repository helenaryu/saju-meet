"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import IntegratedAnalysisInput from '@/components/analysis/IntegratedAnalysisInput'
import AnalysisLoadingStep from '@/components/analysis/AnalysisLoadingStep'
import AnalysisResultStep from '@/components/analysis/AnalysisResultStep'
import { ProfileData, SajuData, FaceReadingKeyword, SajuKeyword } from '@/types'

export default function IntegratedAnalysisPage() {
  const router = useRouter()
  const [integratedAnalysisStep, setIntegratedAnalysisStep] = useState<"input" | "analyzing" | "result">("input")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [faceReadingResults, setFaceReadingResults] = useState<FaceReadingKeyword[]>([])
  const [sajuResults, setSajuResults] = useState<SajuKeyword[]>([])
  const [ohaengData, setOhaengData] = useState<{
    labels: string[];
    data: number[];
    descriptions: string[];
    personalTraits: string[];
    colors: string[];
    overallInterpretation?: string;
  } | undefined>(undefined)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(3)
  const [isSajuAnalyzing, setIsSajuAnalyzing] = useState(false)
  const [sajuProgress, setSajuProgress] = useState(3)

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

  const [sajuData, setSajuData] = useState<SajuData>({
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    birthPlaceDetail: "",
  })

  const [localUser, setLocalUser] = useState<any>(null)

  // Supabase 세션 확인 (선택사항)
  const checkSupabaseSession = useCallback(async () => {
    try {
      const { supabase } = await import('@/lib/supabase')
      if (supabase) {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (session && !localUser) {
          // Supabase 세션이 있지만 로컬 사용자 정보가 없는 경우
          const user = {
            id: session.user.id,
            email: session.user.email || '',
            nickname: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '사용자',
            createdAt: session.user.created_at || new Date().toISOString()
          }
          setLocalUser(user)
          localStorage.setItem('localUser', JSON.stringify(user))
        }
      }
    } catch (error) {
      console.log('Supabase 세션 확인 실패:', error)
    }
  }, [localUser])

  // 페이지 로드 시 사용자 정보 확인
  useEffect(() => {
    // URL 파라미터에서 임시 인증 확인
    const urlParams = new URLSearchParams(window.location.search)
    const isTempAuth = urlParams.get('auth') === 'temp'
    
    if (isTempAuth) {
      // 임시 인증 상태 - 테스트용 사용자 정보 생성
      const tempUser = {
        id: 'temp-user-' + Date.now(),
        email: 'temp@example.com',
        nickname: '테스트 사용자',
        createdAt: new Date().toISOString()
      }
      setLocalUser(tempUser)
      localStorage.setItem('localUser', JSON.stringify(tempUser))
      console.log('✅ 임시 인증으로 접근 - 테스트 모드')
      return
    }
    
    // 로컬 스토리지에서 사용자 정보 확인
    const savedUser = localStorage.getItem('localUser')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setLocalUser(user)
        
        // 프로필 완료 상태 확인
        const isProfileComplete = localStorage.getItem('sajuMeetProfileComplete')
        if (isProfileComplete === 'true') {
          console.log('✅ 프로필이 이미 완료됨 - 홈으로 리다이렉트')
          router.push('/home')
          return
        }
        
        // 저장된 프로필 데이터 불러오기
        const savedProfile = localStorage.getItem('sajuMeetProfile')
        if (savedProfile) {
          const profile = JSON.parse(savedProfile)
          setProfileData(profile)
        }
        
        // 저장된 사주 데이터 불러오기
        const savedSajuData = localStorage.getItem('sajuMeetSajuData')
        if (savedSajuData) {
          const saju = JSON.parse(savedSajuData)
          setSajuData(saju)
        }
        
      } catch (error) {
        console.error('저장된 사용자 정보 파싱 오류:', error)
        localStorage.removeItem('localUser')
        // 사용자 정보가 없으면 로그인 페이지로 리다이렉트
        router.push('/')
        return
      }
    } else {
      // 사용자 정보가 없으면 로그인 페이지로 리다이렉트
      router.push('/')
      return
    }

    checkSupabaseSession()
  }, [router, checkSupabaseSession]) // localUser 의존성 제거

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setUploadedImage(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    const newProfileData = { ...profileData, [field]: value }
    setProfileData(newProfileData)
    // localStorage에 저장
    localStorage.setItem('sajuMeetProfile', JSON.stringify(newProfileData))
  }

  const handleSajuInputChange = (field: string, value: string) => {
    const newSajuData = { ...sajuData, [field]: value }
    setSajuData(newSajuData)
    // localStorage에 저장
    localStorage.setItem('sajuMeetSajuData', JSON.stringify(newSajuData))
  }

  const startIntegratedAnalysis = async () => {
    if (!uploadedImage || !sajuData.birthDate) {
      alert('사진과 생년월일을 모두 입력해주세요.')
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(3)
    setIntegratedAnalysisStep("analyzing")

    try {
      // 이미지 파일을 File 객체로 변환
      const response = await fetch(uploadedImage)
      const blob = await response.blob()
      const imageFile = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' })

      // FormData 생성
      const formData = new FormData()
      formData.append('imageFile', imageFile)
      formData.append('nickname', localUser?.nickname || '사용자')
      formData.append('gender', '미지정')
      formData.append('birthDate', sajuData.birthDate)
      formData.append('birthTime', sajuData.birthTime || '00:00')

      // API 호출
      const apiResponse = await fetch('/api/analysis', {
        method: 'POST',
        body: formData
      })

      if (!apiResponse.ok) {
        throw new Error('API 호출에 실패했습니다.')
      }

      const result = await apiResponse.json()
      
      if (result.success) {
        // 관상 결과 저장
        setFaceReadingResults(result.data.faceReading.keywords.map((keyword: string) => ({
          keyword,
          description: result.data.faceReading.interpretation
        })))
        
        // 사주 결과 저장
        setSajuResults(result.data.saju.keywords.map((keyword: string) => ({
          keyword,
          description: result.data.saju.personality
        })))
        
        // 오행 결과 저장
        console.log('🔍 API Response Debug:');
        console.log('  - result.data:', result.data);
        console.log('  - result.data.ohaeng:', result.data.ohaeng);
        
        if (result.data.ohaeng) {
          console.log('✅ Setting ohaeng data:', result.data.ohaeng);
          setOhaengData({
            labels: result.data.ohaeng.labels,
            data: result.data.ohaeng.data,
            descriptions: result.data.ohaeng.descriptions,
            personalTraits: result.data.ohaeng.personalTraits,
            colors: result.data.ohaeng.colors,
            overallInterpretation: result.data.ohaeng.overallInterpretation
          })
        } else {
          console.log('❌ No ohaeng data in API response');
        }
        
        console.log('통합 분석 완료:', result.data)
        
        // 결과 페이지로 이동
        setIntegratedAnalysisStep("result")
      } else {
        throw new Error(result.error || '분석에 실패했습니다.')
      }

    } catch (error) {
      console.error('❌ 통합 분석 중 오류:', error)
      console.log('🔄 Using fallback data due to error');
      
      // 오류 발생 시 더미 데이터 사용
      const { FACE_READING_KEYWORDS, SAJU_KEYWORDS } = await import('@/constants/data')
      const shuffledFace = [...FACE_READING_KEYWORDS].sort(() => 0.5 - Math.random())
      const selectedFace = shuffledFace.slice(0, Math.floor(Math.random() * 3) + 3)
      setFaceReadingResults(selectedFace.map(item => ({
        keyword: item.keyword,
        description: '관상 분석 결과입니다.'
      })))
      
      const shuffledSaju = [...SAJU_KEYWORDS].sort(() => 0.5 - Math.random())
      const selectedSaju = shuffledSaju.slice(0, Math.floor(Math.random() * 3) + 3)
      setSajuResults(selectedSaju.map(item => ({
        keyword: item.keyword,
        description: '사주 분석 결과입니다.'
      })))

      // 오행 데이터는 API에서 생성되므로 여기서는 설정하지 않음
      // (API가 실패한 경우 기본값으로 처리)
      
      // 결과 페이지로 이동
      setIntegratedAnalysisStep("result")
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('localUser')
    localStorage.removeItem('sajuMeetProfile')
    localStorage.removeItem('sajuMeetAdditionalPhotos')
    localStorage.removeItem('sajuMeetIdealKeywords')
    localStorage.removeItem('sajuMeetProfileComplete')
    localStorage.removeItem('sajuMeetSajuData')
    router.push('/')
  }

  const handleProfileSetup = () => {
    // 현재 입력된 데이터를 localStorage에 저장
    localStorage.setItem('sajuMeetProfile', JSON.stringify(profileData))
    localStorage.setItem('sajuMeetSajuData', JSON.stringify(sajuData))
    
    router.push('/profile')
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

  // 통합 분석 단계별 화면 렌더링
  if (integratedAnalysisStep === "input") {
    return (
      <IntegratedAnalysisInput
        uploadedImage={uploadedImage}
        profileData={profileData}
        sajuData={sajuData}
        onPhotoUpload={handlePhotoUpload}
        onProfileDataChange={handleInputChange}
        onSajuDataChange={handleSajuInputChange}
        onStartAnalysis={startIntegratedAnalysis}
        onLogout={handleLogout}
        localUser={localUser}
      />
    )
  }

  if (integratedAnalysisStep === "analyzing") {
    return <AnalysisLoadingStep />
  }

  if (integratedAnalysisStep === "result") {
    return (
      <AnalysisResultStep
        uploadedImage={uploadedImage}
        profileData={profileData}
        faceReadingResults={faceReadingResults}
        sajuResults={sajuResults}
        ohaengData={ohaengData}
        onLogout={handleLogout}
        localUser={localUser}
        onProfileSetup={handleProfileSetup}
      />
    )
  }

  return null
}
