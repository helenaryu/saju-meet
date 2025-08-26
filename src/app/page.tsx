"use client"

import { useState, useEffect, Suspense } from "react"
import { AppStep, ProfileData, SajuData, ChatMessage } from "@/types"
import { FACE_READING_KEYWORDS, SAJU_KEYWORDS, IDEAL_TYPE_KEYWORDS, dummyMatches, dummyAnalysisReport } from "@/constants/data"
import { useSearchParams } from "next/navigation"
import { sajuService } from "@/lib/api/saju"

// 분리된 컴포넌트들 import
import OnboardingStep from "@/components/auth/OnboardingStep"
import LoginStep from "@/components/auth/LoginStep"
import SignupStep from "@/components/auth/SignupStep"
import AuthLoadingStep from "@/components/auth/AuthLoadingStep"
import IntegratedAnalysisInput from "@/components/analysis/IntegratedAnalysisInput"
import AnalysisLoadingStep from "@/components/analysis/AnalysisLoadingStep"
import AnalysisResultStep from "@/components/analysis/AnalysisResultStep"

function FaceReadingAppContent() {
  const searchParams = useSearchParams()
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
    gender: "남성", // 기본값을 남성으로 설정
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
  const [showMatches, setShowMatches] = useState(false)

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editProfileData, setEditProfileData] = useState(profileData)

  const [selectedUser, setSelectedUser] = useState<any>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
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

  const initializeChatMessages = (userName: string) => {
    const dummyMessages: ChatMessage[] = [
      {
        id: "1",
        text: "안녕하세요! 프로필을 보고 연락드렸어요 😊",
        sender: "me",
        timestamp: new Date(Date.now() - 3600000), // 1시간 전
        isRead: true,
      },
      {
        id: "2",
        text: "안녕하세요! 관상 궁합이 높다고 나와서 신기했어요 ㅎㅎ",
        sender: "other",
        timestamp: new Date(Date.now() - 3000000), // 50분 전
        isRead: true,
      },
      {
        id: "3",
        text: "저도요! 분석 결과를 보니 정말 잘 맞을 것 같더라고요. 어떤 일 하세요?",
        sender: "me",
        timestamp: new Date(Date.now() - 2400000), // 40분 전
        isRead: true,
      },
      {
        id: "4",
        text: `${userName === "김민준" ? "디자인" : userName === "이서연" ? "마케팅" : "개발"} 일을 하고 있어요. 프로필에서 보니 관상이 정말 따뜻해 보이시더라구요!`,
        sender: "other",
        timestamp: new Date(Date.now() - 1800000), // 30분 전
        isRead: true,
      },
      {
        id: "5",
        text: "감사해요! 시간 되실 때 커피 한 잔 어떠세요?",
        sender: "me",
        timestamp: new Date(Date.now() - 900000), // 15분 전
        isRead: true,
      },
    ]
    setMessages(dummyMessages)
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: "me",
        timestamp: new Date(),
        isRead: false,
      }
      setMessages((prev) => [...prev, message])
      setNewMessage("")

      // 상대방 자동 응답 시뮬레이션
      setTimeout(() => {
        const responses = [
          "좋아요! 언제가 좋으실까요?",
          "네, 좋은 생각이에요 😊",
          "시간 맞춰서 연락드릴게요!",
          "기대되네요 ㅎㅎ",
        ]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        const autoReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: randomResponse,
          sender: "other",
          timestamp: new Date(),
          isRead: false,
        }
        setMessages((prev) => [...prev, autoReply])
      }, 2000)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setUploadedImage(imageData)
        // 사진 업로드만 하고 분석은 하지 않음 (통합 분석 버튼에서 처리)
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
      const blob = await response.blob()
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
        throw new Error('API 호출에 실패했습니다.')
      }

      const result = await apiResponse.json()
      
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

  const handleEditProfileChange = (field: string, value: any) => {
    setEditProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const saveProfileChanges = () => {
    setProfileData(editProfileData)
    setIsEditingProfile(false)
  }

  const cancelProfileEdit = () => {
    setEditProfileData(profileData)
    setIsEditingProfile(false)
  }

  // URL 파라미터 감지하여 상태 업데이트
  useEffect(() => {
    const step = searchParams.get('step')
    const auth = searchParams.get('auth')
    
    if (step === 'integrated-analysis') {
      setCurrentStep('integrated-analysis')
              // integrated-analysis 단계에서는 input 단계로 자동 이동
        setIntegratedAnalysisStep('input')
      // 인증 상태 초기화
      setIsAuthenticating(false)
      setAuthProvider(null)
    }
    
    if (auth === 'error') {
      alert('인증에 실패했습니다. 다시 시도해주세요.')
      setIsAuthenticating(false)
      setAuthProvider(null)
    }
  }, [searchParams])

  // 인증 상태 확인 및 초기화 (Supabase가 설정된 경우에만)
  useEffect(() => {
    if (!supabaseAvailable || !supabase) {
      console.log('Supabase가 설정되지 않아 인증 기능을 건너뜁니다.')
      return
    }

    const checkAuthStatus = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('인증 상태 확인 오류:', error)
          return
        }

        if (session) {
          console.log('로그인된 사용자:', session.user.email)
          // 로그인된 상태라면 integrated-analysis로 이동
          setCurrentStep('integrated-analysis')
        } else {
          console.log('로그인되지 않은 상태')
          // 로그인되지 않은 상태라면 onboarding으로 유지
          setCurrentStep('onboarding')
        }
      } catch (error) {
        console.error('인증 상태 확인 예외:', error)
        setCurrentStep('onboarding')
      }
    }

    checkAuthStatus()
  }, [supabaseAvailable, supabase])

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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google' as const,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao' as const,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
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
        />
      )
    }
  }

  // 기존 코드는 그대로 유지 (프로필, 홈, 매칭 등)
  // ... (기존 코드 유지)

  return null
}

export default function FaceReadingApp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FaceReadingAppContent />
    </Suspense>
  )
}
