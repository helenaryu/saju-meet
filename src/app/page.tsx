"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { AppStep, ProfileData, SajuData } from "@/types"
import { FACE_READING_KEYWORDS, SAJU_KEYWORDS, IDEAL_TYPE_KEYWORDS } from "@/constants/data"
import { useSearchParams, useRouter } from "next/navigation"
import { sajuService } from "@/lib/api/saju"

// 분리된 컴포넌트들 import
import OnboardingStep from "@/components/auth/OnboardingStep"
import LoginStep from "@/components/auth/LoginStep"
import SignupStep from "@/components/auth/SignupStep"
import AuthLoadingStep from "@/components/auth/AuthLoadingStep"
import IntegratedAnalysisInput from "@/components/analysis/IntegratedAnalysisInput"
import AnalysisLoadingStep from "@/components/analysis/AnalysisLoadingStep"
import AnalysisResultStep from "@/components/analysis/AnalysisResultStep"
import ProfileRegistrationStep from "@/components/profile/ProfileRegistrationStep"

function FaceReadingAppContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<AppStep>("onboarding")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(3)
  const [faceReadingResults, setFaceReadingResults] = useState<Array<{ keyword: string; description: string }>>([])
  const [sajuResults, setSajuResults] = useState<Array<{ keyword: string; description: string }>>([])
  const [isSajuAnalyzing, setIsSajuAnalyzing] = useState(false)
  const [sajuProgress, setSajuProgress] = useState(3)

  const [integratedAnalysisStep, setIntegratedAnalysisStep] = useState<"input" | "analyzing" | "result">(
    "input",
  )

  const [profileData, setProfileData] = useState<ProfileData>({
    nickname: "",
    gender: "male", // 기본값을 남성으로 설정
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
  const [sajuErrors, setSajuErrors] = useState<Record<string, string>>({})
  const [selectedIdealKeywords, setSelectedIdealKeywords] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})




  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authProvider, setAuthProvider] = useState<"google" | "kakao" | null>(null)

  // Supabase 관련 상태
  const [supabase, setSupabase] = useState<any>(null)
  const [supabaseAvailable, setSupabaseAvailable] = useState(false)
  
  // 로컬 인증 상태 (Supabase 없이도 작동)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [localUser, setLocalUser] = useState<any>(null)

  // Supabase 초기화 (클라이언트 사이드에서만)
  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        const { supabase: supabaseClient, isSupabaseAvailable } = await import('@/lib/supabase')
        setSupabase(supabaseClient)
        setSupabaseAvailable(isSupabaseAvailable())
      } catch (error) {
        console.log('Supabase 초기화 실패:', error)
        setSupabaseAvailable(false)
      }
    }

    initializeSupabase()
  }, [])





  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 파일 크기 검증 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.')
        return
      }
      
      // 파일 타입 검증
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('지원하지 않는 이미지 형식입니다. JPEG, PNG, WebP만 지원합니다.')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        if (imageData) {
          setUploadedImage(imageData)
          // 사진 업로드만 하고 분석은 하지 않음 (통합 분석 버튼에서 처리)
        } else {
          alert('이미지 파일을 읽을 수 없습니다.')
        }
      }
      reader.onerror = () => {
        alert('이미지 파일 읽기 중 오류가 발생했습니다.')
      }
      reader.readAsDataURL(file)
    }
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
      if (!response.ok) {
        throw new Error(`이미지 로드 실패: ${response.status}`)
      }
      const blob = await response.blob()
      if (blob.size === 0) {
        throw new Error('이미지 파일이 비어있습니다.')
      }
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
        const errorText = await apiResponse.text()
        console.error('API 응답 오류:', apiResponse.status, errorText)
        throw new Error(`API 호출에 실패했습니다. (${apiResponse.status})`)
      }

      let result
      try {
        result = await apiResponse.json()
      } catch (jsonError) {
        console.error('JSON 파싱 오류:', jsonError)
        throw new Error('서버 응답을 처리할 수 없습니다.')
      }
      
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
        
        console.log('통합 분석 완료:', result.data)
        
        // 결과 페이지로 이동
        setIntegratedAnalysisStep("result")
      } else {
        throw new Error(result.error || '분석에 실패했습니다.')
      }

    } catch (error) {
      console.error('통합 분석 중 오류:', error)
      
      // 오류 발생 시 더미 데이터 사용
      const shuffledFace = [...FACE_READING_KEYWORDS].sort(() => 0.5 - Math.random())
      const selectedFace = shuffledFace.slice(0, Math.floor(Math.random() * 3) + 3)
      setFaceReadingResults(selectedFace)
      
      const shuffledSaju = [...SAJU_KEYWORDS].sort(() => 0.5 - Math.random())
      const selectedSaju = shuffledSaju.slice(0, Math.floor(Math.random() * 3) + 3)
      setSajuResults(selectedSaju)
      
      // 결과 페이지로 이동
      setIntegratedAnalysisStep("result")
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  const startAnalysisWithImage = async (imageData: string) => {
    setIsAnalyzing(true)
    setAnalysisProgress(3)

    try {
      // 이미지 파일을 File 객체로 변환
      const response = await fetch(imageData)
      if (!response.ok) {
        throw new Error(`이미지 로드 실패: ${response.status}`)
      }
      const blob = await response.blob()
      if (blob.size === 0) {
        throw new Error('이미지 파일이 비어있습니다.')
      }
      const imageFile = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' })

      // FormData 생성 (기본값 사용)
      const formData = new FormData()
      formData.append('imageFile', imageFile)

      // API 호출
      const apiResponse = await fetch('/api/analysis', {
        method: 'POST',
        body: formData
      })

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text()
        console.error('API 응답 오류:', apiResponse.status, errorText)
        throw new Error(`API 호출에 실패했습니다. (${apiResponse.status})`)
      }

      let result
      try {
        result = await apiResponse.json()
      } catch (jsonError) {
        console.error('JSON 파싱 오류:', jsonError)
        throw new Error('서버 응답을 처리할 수 없습니다.')
      }
      
      if (result.success) {
        // API 결과를 상태에 저장
        setFaceReadingResults(result.data.faceReading.keywords.map((keyword: string) => ({
          keyword,
          description: result.data.faceReading.interpretation
        })))
        
        console.log('관상 분석 완료:', result.data)
      } else {
        throw new Error(result.error || '분석에 실패했습니다.')
      }

    } catch (error) {
      console.error('분석 중 오류:', error)
      
      // 오류 발생 시 기존 더미 데이터 사용
      const shuffled = [...FACE_READING_KEYWORDS].sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, Math.floor(Math.random() * 3) + 3)
      setFaceReadingResults(selected)
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(0)
      // 사진 분석 완료 후 바로 사주 입력 단계로 진행
      setIntegratedAnalysisStep("input")
    }
  }

  const startAnalysis = async () => {
    if (!uploadedImage) {
      throw new Error('사진이 업로드되지 않았습니다.')
    }
    await startAnalysisWithImage(uploadedImage)
  }

  const startSajuAnalysis = async () => {
    setIsSajuAnalyzing(true)
    setSajuProgress(3)
    // 사주 분석 시작 시 로딩 화면으로 이동
    setIntegratedAnalysisStep("analyzing")

    try {
      // 사주 데이터 검증 (생년월일만 필수)
      if (!sajuData.birthDate) {
        throw new Error('생년월일을 입력해주세요.')
      }

      // 사주 분석 API 호출 (클라이언트 사이드에서 직접 호출)
      const sajuResult = await sajuService.analyzeSaju({
        birthDate: sajuData.birthDate,
        birthTime: sajuData.birthTime || '00:00', // 출생 시간이 없으면 자정으로 설정
        birthPlace: sajuData.birthPlace
      })

      // 사주 결과를 상태에 저장
      setSajuResults(sajuResult.keywords.map((keyword: string) => ({
        keyword,
        description: sajuResult.personality
      })))

      console.log('사주 분석 완료:', sajuResult)

    } catch (error) {
      console.error('사주 분석 중 오류:', error)
      
      // 오류 발생 시 기존 더미 데이터 사용
      const shuffled = [...SAJU_KEYWORDS].sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, Math.floor(Math.random() * 3) + 3)
      setSajuResults(selected)
    } finally {
      setIsSajuAnalyzing(false)
      setSajuProgress(0)
      // 사주 분석 완료 후 바로 결과 단계로 진행
      setIntegratedAnalysisStep("result")
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleSajuInputChange = (field: string, value: string) => {
    setSajuData((prev) => ({ ...prev, [field]: value }))
    if (sajuErrors[field]) {
      setSajuErrors((prev) => ({ ...prev, [field]: "" }))
    }
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

  const validateSajuData = () => {
    const newErrors: Record<string, string> = {}

    if (!sajuData.birthDate) newErrors.birthDate = "생년월일을 입력해주세요"
    if (!sajuData.birthTime) newErrors.birthTime = "태어난 시각을 입력해주세요"
    if (!sajuData.birthPlace) newErrors.birthPlace = "태어난 지역을 선택해주세요"

    setSajuErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleIdealTypeToggle = (keyword: string) => {
    setSelectedIdealKeywords((prev) => {
      if (prev.includes(keyword)) {
        return prev.filter((k) => k !== keyword)
      } else if (prev.length < 3) {
        return [...prev, keyword]
      }
      return prev
    })
  }

  useEffect(() => {
    if (currentStep === "profile" && sajuData.birthDate && sajuData.birthTime) {
      setProfileData((prev) => ({
        ...prev,
        birthDate: sajuData.birthDate || prev.birthDate,
        birthTime: sajuData.birthTime || prev.birthTime,
      }))
    }
  }, [currentStep, sajuData.birthDate, sajuData.birthTime])

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
            setAdditionalPhotos((prev) => [...prev, ...newPhotos].slice(0, 5)) // 최대 5장까지
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeAdditionalPhoto = (index: number) => {
    setAdditionalPhotos((prev) => prev.filter((_, i) => i !== index))
  }



  // URL 파라미터 감지하여 상태 업데이트 (간소화)
  useEffect(() => {
    if (!searchParams) return
    
    const auth = searchParams.get('auth')
    
    console.log('URL 파라미터 확인:', { auth })
    
    if (auth === 'error') {
      const reason = searchParams.get('reason')
      alert(`인증에 실패했습니다: ${reason || '알 수 없는 오류'}`)
      setIsAuthenticating(false)
      setAuthProvider(null)
      // URL 파라미터 정리
      window.history.replaceState({}, '', '/')
    }
  }, [searchParams, router])

  // Supabase 세션 확인 함수
  const checkSupabaseSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('세션 확인 오류:', error)
        return
      }

      if (session) {
        console.log('Supabase 세션 확인됨:', session.user.email)
        
        // Supabase 사용자 정보를 로컬 상태에 저장
        const user = {
          id: session.user.id,
          email: session.user.email || '',
          nickname: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '사용자',
          createdAt: session.user.created_at || new Date().toISOString()
        }
        
        setLocalUser(user)
        setIsLoggedIn(true)
        localStorage.setItem('localUser', JSON.stringify(user))
        
        // integrated-analysis로 이동
        setCurrentStep('integrated-analysis')
        setIntegratedAnalysisStep('input')
      } else {
        console.log('Supabase 세션 없음')
        // 세션이 없으면 onboarding으로 유지
        setCurrentStep('onboarding')
      }
    } catch (error) {
      console.error('세션 확인 예외:', error)
      setCurrentStep('onboarding')
    }
  }, [supabase])

  // 페이지 초기 로딩 시 로그인 상태 확인
  useEffect(() => {
    // 로컬 사용자 정보가 있으면 integrated-analysis로 이동
    if (localUser || isLoggedIn) {
      setCurrentStep('integrated-analysis')
      setIntegratedAnalysisStep('input')
      return
    }

    // Supabase가 설정되어 있으면 세션 확인
    if (supabaseAvailable && supabase) {
      checkSupabaseSession()
    } else {
      // Supabase가 없으면 onboarding으로 유지
      setCurrentStep('onboarding')
    }
  }, [supabaseAvailable, supabase, localUser, isLoggedIn, checkSupabaseSession])

  // 로컬 인증 상태 (Supabase 없이도 작동)
  const handleLocalLogin = (email: string, password: string) => {
    // 간단한 로컬 인증 (실제로는 더 안전한 방식 사용)
    if (email && password) {
      const user = {
        id: 'local_user_' + Date.now(),
        email: email,
        nickname: email.split('@')[0],
        createdAt: new Date().toISOString()
      }
      
      setLocalUser(user)
      setIsLoggedIn(true)
      localStorage.setItem('localUser', JSON.stringify(user))
      
             // 로그인 성공 후 integrated-analysis로 이동
       setCurrentStep('integrated-analysis')
       setIntegratedAnalysisStep('input')
    }
  }

  // 로컬 로그아웃 함수
  const handleLocalLogout = () => {
    setLocalUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('localUser')
    setCurrentStep('onboarding')
  }

  // 로컬 사용자 정보 복원 (페이지 새로고침 시)
  useEffect(() => {
    const savedUser = localStorage.getItem('localUser')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
                 setLocalUser(user)
         setIsLoggedIn(true)
         setCurrentStep('integrated-analysis')
         setIntegratedAnalysisStep('input')
      } catch (error) {
        console.error('저장된 사용자 정보 파싱 오류:', error)
        localStorage.removeItem('localUser')
      }
    }
  }, [])

  // OAuth 인증 함수들 (Supabase가 설정된 경우에만)
  const handleGoogleSignUp = async () => {
    if (!supabaseAvailable || !supabase) {
      // Supabase가 없으면 로컬 인증으로 대체
      const email = prompt('이메일을 입력해주세요:')
      const password = prompt('비밀번호를 입력해주세요:')
      if (email && password) {
        handleLocalLogin(email, password)
      }
      return
    }

    setIsAuthenticating(true)
    setAuthProvider("google")
    
    try {
      if (!supabase?.auth?.signInWithOAuth) {
        throw new Error('Supabase auth가 초기화되지 않았습니다.')
      }

      // 절대 URL 사용하여 localhost 리다이렉트 방지
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
        (process.env.NODE_ENV === 'production' ? 'https://saju-meet.vercel.app' : 'http://localhost:3000')
      
      // 디버깅을 위한 로그
      console.log('🔧 OAuth 리다이렉트 URL 설정:')
      console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
      console.log('NODE_ENV:', process.env.NODE_ENV)
      console.log('계산된 baseUrl:', baseUrl)
      console.log('최종 redirectTo:', `${baseUrl}/auth/callback`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google' as const,
        options: {
          redirectTo: `${baseUrl}/auth/callback`
        }
      })
      
      if (error) {
        console.error('Google 로그인 오류:', error)
        alert('Google 로그인에 실패했습니다.')
        setIsAuthenticating(false)
        setAuthProvider(null)
      } else {
        console.log('Google 로그인 성공:', data)
        // 팝업이 열리면 상태는 유지, 콜백에서 처리
      }
    } catch (error) {
      console.error('Google 로그인 예외:', error)
      alert('Google 로그인 중 오류가 발생했습니다.')
      setIsAuthenticating(false)
      setAuthProvider(null)
    }
  }

  const handleKakaoSignUp = async () => {
    if (!supabaseAvailable || !supabase) {
      // Supabase가 없으면 로컬 인증으로 대체
      const email = prompt('이메일을 입력해주세요:')
      const password = prompt('비밀번호를 입력해주세요:')
      if (email && password) {
        handleLocalLogin(email, password)
      }
      return
    }

    setIsAuthenticating(true)
    setAuthProvider("kakao")
    
    try {
      if (!supabase?.auth?.signInWithOAuth) {
        throw new Error('Supabase auth가 초기화되지 않았습니다.')
      }

      // 절대 URL 사용하여 localhost 리다이렉트 방지
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
        (process.env.NODE_ENV === 'production' ? 'https://saju-meet.vercel.app' : 'http://localhost:3000')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao' as const,
        options: {
          redirectTo: `${baseUrl}/auth/callback`
        }
      })
      
      if (error) {
        console.error('Kakao 로그인 오류:', error)
        alert('Kakao 로그인에 실패했습니다.')
        setIsAuthenticating(false)
        setAuthProvider(null)
      } else {
        console.log('Kakao 로그인 성공:', data)
        // 팝업이 열리면 상태는 유지, 콜백에서 처리
      }
    } catch (error) {
      console.error('Kakao 로그인 예외:', error)
      alert('Kakao 로그인 중 오류가 발생했습니다.')
      setIsAuthenticating(false)
      setAuthProvider(null)
    }
  }

  // 로그아웃 함수 (Supabase가 설정된 경우에만)
  const handleLogout = async () => {
    if (!supabaseAvailable || !supabase) {
      // Supabase가 없으면 로컬 로그아웃
      handleLocalLogout()
      return
    }

    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('로그아웃 오류:', error)
        alert('로그아웃에 실패했습니다.')
      } else {
        console.log('로그아웃 성공')
        // 로그아웃 후 onboarding으로 이동
        setCurrentStep('onboarding')
        // URL 파라미터 제거
        window.history.replaceState({}, '', '/')
      }
    } catch (error) {
      console.error('로그아웃 예외:', error)
      alert('로그아웃 중 오류가 발생했습니다.')
    }
  }

  // 온보딩 단계
  if (currentStep === "onboarding") {
    return <OnboardingStep onStart={() => setCurrentStep("login")} />
  }

  // 로그인 단계
  if (currentStep === "login") {
    return (
      <LoginStep
        onLogin={handleLocalLogin}
        onGoogleLogin={handleGoogleSignUp}
        onKakaoLogin={handleKakaoSignUp}
        onSwitchToSignup={() => setCurrentStep("signup")}
      />
    )
  }

  // 회원가입 단계
  if (currentStep === "signup") {
    return (
      <SignupStep
        onSignup={handleLocalLogin}
        onGoogleSignup={handleGoogleSignUp}
        onKakaoSignup={handleKakaoSignUp}
        onSwitchToLogin={() => setCurrentStep("login")}
      />
    )
  }

  // OAuth 인증 중 화면
  if (isAuthenticating) {
    return (
      <AuthLoadingStep
        provider={authProvider}
        onCancel={() => {
          setIsAuthenticating(false)
          setAuthProvider(null)
        }}
      />
    )
  }

  // 통합 분석 단계별 화면 렌더링
  if (currentStep === "integrated-analysis") {
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
          onLogout={handleLocalLogout}
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
          onLogout={handleLocalLogout}
          localUser={localUser}
          onProfileSetup={() => setCurrentStep("profile")}
        />
      )
    }
  }

  // 프로필 설정 완료 처리
  const handleProfileComplete = () => {
    // 프로필 데이터 검증
    if (!profileData.nickname || !profileData.gender || !profileData.birthDate || !profileData.region || !profileData.job) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    // 프로필 완료 후 홈으로 이동
    setCurrentStep("home")
    
    // 로컬 스토리지에 프로필 데이터 저장 (선택사항)
    localStorage.setItem('sajuMeetProfile', JSON.stringify(profileData))
    localStorage.setItem('sajuMeetAdditionalPhotos', JSON.stringify(additionalPhotos))
    localStorage.setItem('sajuMeetIdealKeywords', JSON.stringify(selectedIdealKeywords))
  }

  // 프로필 설정 단계
  if (currentStep === "profile") {
    return (
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
        onBack={() => {
          setCurrentStep("integrated-analysis")
          setIntegratedAnalysisStep("result")
        }}
        IDEAL_TYPE_KEYWORDS={IDEAL_TYPE_KEYWORDS}
      />
    )
  }

  // 홈/대시보드 단계 (프로필 완료 후) - 별도 페이지로 이동
  if (currentStep === "home") {
    router.push('/home')
    return null
  }

  // 이상형 매칭 단계 - 별도 페이지로 이동
  if (currentStep === "ideal-match") {
    router.push('/ideal-match')
    return null
  }

  return null
}

export default function FaceReadingApp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FaceReadingAppContent />
    </Suspense>
  )
}
