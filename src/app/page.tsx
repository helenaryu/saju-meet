"use client"

import { useState, useEffect, Suspense } from "react"
import { AppStep, ProfileData, SajuData, ChatMessage } from "@/types"
import { FACE_READING_KEYWORDS, SAJU_KEYWORDS, IDEAL_TYPE_KEYWORDS, dummyMatches, dummyAnalysisReport } from "@/constants/data"
import { useSearchParams } from "next/navigation"
import { sajuService } from "@/lib/api/saju"

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

  const [integratedAnalysisStep, setIntegratedAnalysisStep] = useState<"photo" | "saju" | "analyzing" | "result">(
    "photo",
  )

  const [profileData, setProfileData] = useState<ProfileData>({
    nickname: "",
    gender: "",
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
        // 사진 업로드 후 즉시 분석 단계로 이동
        setIntegratedAnalysisStep("analyzing")
        // uploadedImage 상태가 설정된 후 startAnalysis 호출
        setTimeout(() => {
          startAnalysisWithImage(imageData)
        }, 100)
      }
      reader.readAsDataURL(file)
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
      setIntegratedAnalysisStep("saju")
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
      // integrated-analysis 단계에서는 photo 단계로 자동 이동
      setIntegratedAnalysisStep('photo')
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
      setIntegratedAnalysisStep('photo')
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
        setIntegratedAnalysisStep('photo')
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

  if (currentStep === "onboarding") {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
        {/* 장식적 패턴 */}
        <div className="absolute top-8 left-8 w-12 h-12 border-2 border-amber-400/30 border-dashed rounded-lg"></div>
        <div className="absolute top-8 right-8 w-12 h-12 border-2 border-amber-400/30 border-dashed rounded-lg"></div>
        <div className="absolute bottom-8 left-8 w-12 h-12 border-2 border-amber-400/30 border-dashed rounded-lg"></div>
        <div className="absolute bottom-8 right-8 w-12 h-12 border-2 border-amber-400/30 border-dashed rounded-lg"></div>

        {/* 메인 컨텐츠 */}
        <div className="text-center max-w-4xl mx-auto">
          {/* 서비스 소개 카드 */}
          <div className="relative mb-12">
            <div className="flex items-center justify-center mb-8">
              {/* 모바일 기기 1 */}
              <div className="relative transform -rotate-12 mr-8">
                <div className="w-64 h-96 bg-white rounded-3xl p-4 shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 flex flex-col">
                    <div className="text-amber-400 text-lg font-bold mb-4">관상 분석</div>
                    <div className="flex-1 flex flex-col justify-center space-y-3">
                      <div className="bg-amber-400/20 rounded-lg p-3">
                        <div className="text-amber-400 text-sm font-semibold">눈</div>
                        <div className="text-white text-xs">따뜻하고 감성적</div>
                      </div>
                      <div className="bg-amber-400/20 rounded-lg p-3">
                        <div className="text-amber-400 text-sm font-semibold">코</div>
                        <div className="text-white text-xs">의지가 강함</div>
                      </div>
                      <div className="bg-amber-400/20 rounded-lg p-3">
                        <div className="text-amber-400 text-sm font-semibold">입</div>
                        <div className="text-white text-xs">소통 능력 우수</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모바일 기기 2 */}
              <div className="relative transform rotate-6">
                <div className="w-64 h-96 bg-white rounded-3xl p-4 shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 flex flex-col">
                    <div className="text-amber-400 text-lg font-bold mb-4">사주 분석</div>
                    <div className="flex-1 flex flex-col justify-center items-center space-y-4">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/30 flex items-center justify-center">
                        <div className="text-amber-400 text-2xl">🌟</div>
                      </div>
                      <div className="text-center">
                        <div className="text-amber-400 font-semibold mb-2">연애운 상승</div>
                        <div className="text-white text-sm">이상적인 만남 예정</div>
                      </div>
                      <button className="bg-amber-400 text-black px-6 py-2 rounded-full text-sm font-semibold">
                        START
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 서비스 설명 텍스트 */}
            <div className="text-right">
              <h2 className="text-2xl font-bold text-white mb-2">오로지 당신만을 위한</h2>
              <h1 className="text-4xl font-bold text-amber-400 mb-4">세상에 단 하나뿐인 관상 사주 매칭</h1>
              <h3 className="text-3xl font-bold text-amber-400">관상은 과학이다</h3>
            </div>
          </div>

          {/* 시작 버튼 */}
          <button
            onClick={() => {
              console.log('운명 찾기 시작 버튼 클릭됨')
              setCurrentStep("login")
              console.log('currentStep을 login으로 설정함')
            }}
            className="bg-amber-400 hover:bg-amber-500 text-black px-12 py-4 rounded-full text-xl font-bold transition-colors shadow-lg"
          >
            운명 찾기 시작
          </button>
        </div>

        {/* 점선 테두리 */}
        <div className="absolute inset-4 border-2 border-amber-400/20 border-dashed rounded-3xl pointer-events-none"></div>
      </div>
    )
  }

  if (currentStep === "signup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-amber-400 mb-8">회원가입</h1>
          
          <div className="bg-white/10 rounded-2xl p-8 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-left text-white mb-2">이메일</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                  placeholder="이메일을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-left text-white mb-2">비밀번호</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
              <div>
                <label className="block text-left text-white mb-2">비밀번호 확인</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                  placeholder="비밀번호를 다시 입력하세요"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              // 간단한 유효성 검사 (실제로는 더 엄격하게)
              const email = document.querySelector('input[type="email"]') as HTMLInputElement
              const password = document.querySelector('input[type="password"]') as HTMLInputElement
              
              if (!email?.value || !password?.value) {
                alert('이메일과 비밀번호를 모두 입력해주세요.')
                return
              }
              
              // 로컬 회원가입 처리
              handleLocalLogin(email.value, password.value)
            }}
            className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors mb-4 w-full"
          >
            회원가입 완료
          </button>



          <div className="text-center space-y-4">
            <button
              onClick={() => setCurrentStep("login")}
              className="text-amber-400 hover:text-amber-300 text-sm transition-colors block w-full"
            >
              이미 계정이 있으신가요? 로그인하기
            </button>
            
            <div className="text-center">
              <span className="text-white/60 text-sm">또는</span>
            </div>
            
            <button
              onClick={handleGoogleSignUp}
              className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-3 rounded-full text-lg font-semibold transition-colors mb-3 w-full flex items-center justify-center"
            >
              <span className="mr-2">🔍</span>
              Google로 회원가입
            </button>

            <button
              onClick={handleKakaoSignUp}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-full text-lg font-semibold transition-colors w-full flex items-center justify-center"
            >
              <span className="mr-2">💬</span>
              카카오로 회원가입
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-amber-400 mb-8">로그인</h1>
          
          <div className="bg-white/10 rounded-2xl p-8 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-left text-white mb-2">이메일</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                  placeholder="이메일을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-left text-white mb-2">비밀번호</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              // 간단한 유효성 검사
              const email = document.querySelector('input[type="email"]') as HTMLInputElement
              const password = document.querySelector('input[type="password"]') as HTMLInputElement
              
              if (!email?.value || !password?.value) {
                alert('이메일과 비밀번호를 모두 입력해주세요.')
                return
              }
              
              // 로컬 로그인 처리
              handleLocalLogin(email.value, password.value)
            }}
            className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors mb-4 w-full"
          >
            로그인
          </button>

          <div className="text-center space-y-4">
            <button
              onClick={() => setCurrentStep("signup")}
              className="text-amber-400 hover:text-amber-300 text-sm transition-colors block w-full"
            >
              계정이 없으신가요? 회원가입하기
            </button>
            
            <div className="text-center">
              <span className="text-white/60 text-sm">또는</span>
            </div>
            
            <button
              onClick={handleGoogleSignUp}
              className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-3 rounded-full text-lg font-semibold transition-colors mb-3 w-full flex items-center justify-center"
            >
              <span className="mr-2">🔍</span>
              Google로 로그인
            </button>

            <button
              onClick={handleKakaoSignUp}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-full text-lg font-semibold transition-colors w-full flex items-center justify-center"
            >
              <span className="mr-2">💬</span>
              카카오로 로그인
            </button>
          </div>
        </div>
      </div>
    )
  }

  // OAuth 인증 중 화면
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-amber-400 mx-auto mb-6"></div>
          <h1 className="text-3xl font-bold text-amber-400 mb-4">
            {authProvider === "google" ? "Google" : "카카오"} 회원가입 진행 중
          </h1>
          <p className="text-xl text-white mb-6">
            {authProvider === "google" ? "Google" : "카카오"}에서 인증을 진행하고 있습니다.
          </p>
          <div className="bg-white/10 rounded-2xl p-6">
            <p className="text-white/80 text-sm">
              팝업 창이 열렸다면 인증을 완료해주세요.
            </p>
            <p className="text-white/60 text-xs mt-2">
              팝업이 차단된 경우 브라우저 설정을 확인해주세요.
            </p>
          </div>
          <button
            onClick={() => {
              setIsAuthenticating(false)
              setAuthProvider(null)
            }}
            className="text-amber-400 hover:text-amber-300 text-sm transition-colors mt-6"
          >
            취소하고 돌아가기
          </button>
        </div>
      </div>
    )
  }

  // 프로필 등록 페이지
  if (currentStep === "profile") {
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
                    onChange={(e) => handleInputChange("nickname", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                    placeholder="닉네임을 입력하세요"
                  />
                  {errors.nickname && <p className="text-red-400 text-sm mt-1">{errors.nickname}</p>}
                </div>
                
                <div>
                  <label className="block text-white mb-2">성별 *</label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
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
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                  />
                  {errors.birthDate && <p className="text-red-400 text-sm mt-1">{errors.birthDate}</p>}
                </div>
                
                <div>
                  <label className="block text-white mb-2">출생 시간</label>
                  <select
                    value={profileData.birthTime}
                    onChange={(e) => handleInputChange("birthTime", e.target.value)}
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
                    onChange={(e) => handleInputChange("region", e.target.value)}
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
                    onChange={(e) => handleInputChange("height", e.target.value)}
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
                    onChange={(e) => handleInputChange("bodyType", e.target.value)}
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
                    onChange={(e) => handleInputChange("job", e.target.value)}
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
                  onChange={(e) => handleInputChange("education", e.target.value)}
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
                  onChange={(e) => handleInputChange("introduction", e.target.value)}
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
                    onChange={handleAdditionalPhotoUpload}
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
                            onClick={() => removeAdditionalPhoto(index)}
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
                      onClick={() => handleIdealTypeToggle(keyword)}
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
                onClick={() => setCurrentStep("integrated-analysis")}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-full text-lg font-bold transition-colors border border-white/30"
              >
                뒤로 가기
              </button>
              <button
                onClick={() => {
                  if (validateProfile()) {
                    setCurrentStep("home") // 바로 매칭 결과 페이지로 이동
                    setIntegratedAnalysisStep("photo") // 상태 초기화로 리포트 화면 렌더링 방지
                  }
                }}
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

  // 홈 화면 (매칭 결과 페이지) - currentStep을 먼저 체크
  if (currentStep === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-amber-400 mb-8 text-center">💕 이상형 매칭</h1>
          <p className="text-xl text-white mb-8 text-center">AI가 당신과 잘 맞는 사람들을 찾았습니다!</p>
          
          {/* 매칭 결과 표시 */}
          <div className="space-y-6">
            {dummyMatches.map((match, index) => (
              <div key={index} className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* 프로필 사진 */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl">
                      👤
                    </div>
                  </div>
                  
                  {/* 프로필 정보 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-2xl font-bold text-amber-400">{match.name}</h3>
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {match.totalCompatibility}% 궁합
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-white mb-1"><span className="text-amber-400 font-semibold">나이:</span> {match.age}세</p>
                        <p className="text-white mb-1"><span className="text-amber-400 font-semibold">직업:</span> {match.job}</p>
                        <p className="text-white mb-1"><span className="text-amber-400 font-semibold">지역:</span> {match.region}</p>
                      </div>
                      <div>
                        <p className="text-white mb-1"><span className="text-amber-400 font-semibold">키:</span> {match.height}</p>
                        <p className="text-white mb-1"><span className="text-amber-400 font-semibold">학력:</span> {match.education}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4">{match.introduction}</p>
                    
                    {/* 궁합 분석 */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-500/20 rounded-lg p-3">
                        <p className="text-green-400 font-semibold mb-1">관상 궁합</p>
                        <p className="text-white text-sm">{match.faceAnalysis}</p>
                      </div>
                      <div className="bg-blue-500/20 rounded-lg p-3">
                        <p className="text-blue-400 font-semibold mb-1">사주 궁합</p>
                        <p className="text-white text-sm">{match.sajuAnalysis}</p>
                      </div>
                    </div>
                    
                    {/* 키워드 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {match.keywords.map((keyword, idx) => (
                        <span key={idx} className="bg-amber-400/20 text-amber-400 px-2 py-1 rounded-full text-xs border border-amber-400">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* 액션 버튼 */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => {
                      setSelectedUser(match)
                      setCurrentStep("other-profile")
                    }}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-bold transition-colors border border-white/30"
                  >
                    프로필 자세히 보기
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(match)
                      initializeChatMessages(match.name)
                      setCurrentStep("dm-chat")
                    }}
                    className="flex-1 bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-full font-bold transition-colors"
                  >
                    💬 메시지 보내기
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* 하단 버튼 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => setCurrentStep("my-profile")}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-bold transition-colors border border-white/30"
            >
              나의 프로필 보기
            </button>
            <button
              onClick={() => alert("더 많은 매칭 결과를 보려면 프리미엄 서비스를 이용해주세요!")}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-4 rounded-full text-lg font-bold transition-colors"
            >
              더 많은 매칭 보기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 프로필 자세히 보기 페이지
  if (currentStep === "other-profile" && selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <button
              onClick={() => setCurrentStep("home")}
              className="absolute left-6 top-6 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-semibold transition-colors border border-white/30"
            >
              ← 뒤로 가기
            </button>
            <h1 className="text-4xl font-bold text-amber-400">{selectedUser.name}님의 프로필</h1>
            <p className="text-xl text-white mt-2">더 자세한 정보를 확인해보세요</p>
          </div>

          {/* 프로필 사진 섹션 */}
          <div className="bg-white/10 rounded-2xl p-8 mb-8 text-center">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-8xl mx-auto mb-6">
              👤
            </div>
            <div className="bg-green-500 text-white px-6 py-2 rounded-full text-lg font-bold inline-block">
              {selectedUser.totalCompatibility}% 궁합
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="bg-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-6">기본 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-amber-400 font-semibold mb-2">나이</label>
                  <p className="text-white text-lg">{selectedUser.age}세</p>
                </div>
                <div>
                  <label className="block text-amber-400 font-semibold mb-2">직업</label>
                  <p className="text-white text-lg">{selectedUser.job}</p>
                </div>
                <div>
                  <label className="block text-amber-400 font-semibold mb-2">지역</label>
                  <p className="text-white text-lg">{selectedUser.region}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-amber-400 font-semibold mb-2">키</label>
                  <p className="text-white text-lg">{selectedUser.height}</p>
                </div>
                <div>
                  <label className="block text-amber-400 font-semibold mb-2">학력</label>
                  <p className="text-white text-lg">{selectedUser.education}</p>
                </div>
                <div>
                  <label className="block text-amber-400 font-semibold mb-2">체형</label>
                  <p className="text-white text-lg">{selectedUser.bodyType || "정보 없음"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 자기소개 */}
          <div className="bg-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-6">자기소개</h2>
            <p className="text-white text-lg leading-relaxed">{selectedUser.introduction}</p>
          </div>

          {/* 궁합 분석 상세 */}
          <div className="bg-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-6">궁합 분석</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-500/20 rounded-xl p-6 border border-green-400/30">
                <h3 className="text-xl font-bold text-green-400 mb-4">관상 궁합</h3>
                <p className="text-white leading-relaxed">{selectedUser.faceAnalysis}</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 font-semibold">궁합도</span>
                    <span className="text-white font-bold">85%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-6 border border-blue-400/30">
                <h3 className="text-xl font-bold text-blue-400 mb-4">사주 궁합</h3>
                <p className="text-white leading-relaxed">{selectedUser.sajuAnalysis}</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400 font-semibold">궁합도</span>
                    <span className="text-white font-bold">78%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 키워드 */}
          <div className="bg-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-6">성향 키워드</h2>
            <div className="flex flex-wrap gap-3">
              {selectedUser.keywords.map((keyword: string, idx: number) => (
                <span key={idx} className="bg-amber-400/20 text-amber-400 px-4 py-2 rounded-full text-sm font-semibold border border-amber-400">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentStep("home")}
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-full text-lg font-bold transition-colors border border-white/30"
            >
              매칭 목록으로
            </button>
            <button
              onClick={() => {
                initializeChatMessages(selectedUser.name)
                setCurrentStep("dm-chat")
              }}
              className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors"
            >
              💬 메시지 보내기
            </button>
          </div>

          {/* 상대방 관상 분석 */}
          <div className="bg-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-6">🎭 {selectedUser.name}님의 관상 분석</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-500/20 rounded-xl p-6 border border-green-400/30">
                <h3 className="text-xl font-bold text-green-400 mb-4">눈의 특징</h3>
                <p className="text-white leading-relaxed">큰 눈과 긴 속눈썹으로 감정 표현이 풍부하고 직관력이 뛰어납니다. 눈꼬리가 살짝 올라간 형태로 자신감 있고 리더십을 가진 인상을 줍니다.</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 font-semibold">직관력</span>
                    <span className="text-white font-bold">92%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-6 border border-blue-400/30">
                <h3 className="text-xl font-bold text-blue-400 mb-4">입의 특징</h3>
                <p className="text-white leading-relaxed">입꼬리가 올라간 미소는 긍정적이고 친근한 성격을 나타냅니다. 말씀이 많고 대화를 즐기며, 타인과의 소통에 능숙합니다.</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400 font-semibold">소통력</span>
                    <span className="text-white font-bold">88%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-500/20 rounded-xl p-6 border border-purple-400/30">
                <h3 className="text-xl font-bold text-purple-400 mb-4">이마와 턱</h3>
                <p className="text-white leading-relaxed">넓은 이마는 지적 능력과 창의성을, 각진 턱은 의지력과 결단력을 나타냅니다. 문제 해결 능력이 뛰어나고 목표 달성에 집중하는 성향입니다.</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-400 font-semibold">지적 능력</span>
                    <span className="text-white font-bold">85%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-orange-500/20 rounded-xl p-6 border border-orange-400/30">
                <h3 className="text-xl font-bold text-orange-400 mb-4">코와 귀</h3>
                <p className="text-white leading-relaxed">직선적인 코는 정직하고 솔직한 성격을, 귀의 위치는 균형 잡힌 판단력을 나타냅니다. 감정적이기보다는 이성적으로 상황을 분석합니다.</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-orange-400 font-semibold">판단력</span>
                    <span className="text-white font-bold">90%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-orange-400 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 상대방 사주 분석 */}
          <div className="bg-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-6">🔮 {selectedUser.name}님의 사주 분석</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-red-500/20 rounded-xl p-6 border border-red-400/30">
                <h3 className="text-xl font-bold text-red-400 mb-4">일간 (日干) - {selectedUser.name}님의 본성</h3>
                <p className="text-white leading-relaxed">일간이 강한 편으로 독립적이고 자주적인 성격입니다. 리더십이 뛰어나며, 자신의 의견을 명확하게 표현하는 성향이 있습니다.</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-400 font-semibold">독립성</span>
                    <span className="text-white font-bold">87%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-red-400 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-500/20 rounded-xl p-6 border border-yellow-400/30">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">오행 균형</h3>
                <p className="text-white leading-relaxed">목(木)과 화(火)의 기운이 강하여 창의적이고 열정적인 성격입니다. 새로운 아이디어를 추구하며, 변화를 두려워하지 않는 도전 정신을 가지고 있습니다.</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-400 font-semibold">창의성</span>
                    <span className="text-white font-bold">91%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '91%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-indigo-500/20 rounded-xl p-6 border border-indigo-400/30">
              <h3 className="text-xl font-bold text-indigo-400 mb-4">대운과 세운</h3>
              <p className="text-white leading-relaxed">현재 20대 후반~30대 초반으로 인연과 관계에 대한 관심이 높아지는 시기입니다. 특히 올해는 새로운 만남과 관계 형성에 좋은 기운이 있으며, 진정한 사랑을 찾을 수 있는 기회가 많습니다.</p>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-indigo-400 font-semibold">인연운</span>
                  <span className="text-white font-bold">89%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-indigo-400 h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* 나와의 궁합 분석 */}
          <div className="bg-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-6">💕 나와의 궁합 분석</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-pink-500/20 rounded-xl p-6 border border-pink-400/30">
                <h3 className="text-xl font-bold text-pink-400 mb-4">전체 궁합도</h3>
                <div className="text-center">
                  <div className="text-6xl font-bold text-pink-400 mb-4">{selectedUser.totalCompatibility}%</div>
                  <p className="text-white text-lg">매우 좋은 궁합입니다!</p>
                  <p className="text-gray-300 mt-2">서로를 이해하고 보완하는 관계가 될 수 있습니다.</p>
                </div>
              </div>
              <div className="bg-cyan-500/20 rounded-xl p-6 border border-cyan-400/30">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">궁합 유형</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white">관상 궁합</span>
                    <span className="text-cyan-400 font-bold">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">사주 궁합</span>
                    <span className="text-cyan-400 font-bold">78%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">성격 궁합</span>
                    <span className="text-cyan-400 font-bold">82%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">가치관 궁합</span>
                    <span className="text-cyan-400 font-bold">88%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 상세 궁합 분석 */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-400/30">
                <h3 className="text-xl font-bold text-green-400 mb-4">🎯 궁합의 장점</h3>
                <ul className="space-y-2 text-white">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>서로의 강점을 인정하고 보완하는 관계</span>
          </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>대화가 잘 통하고 이해가 빠름</span>
          </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>함께 성장할 수 있는 동반자 관계</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>감정적 안정감을 제공하는 관계</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-400/30">
                <h3 className="text-xl font-bold text-orange-400 mb-4">⚠️ 주의사항</h3>
                <ul className="space-y-2 text-white">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">!</span>
                    <span>서로의 독립성을 존중하는 것이 중요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">!</span>
                    <span>의견 차이가 있을 때는 대화로 해결</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">!</span>
                    <span>서로의 공간과 시간을 인정하기</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-400/30">
                <h3 className="text-xl font-bold text-purple-400 mb-4">💡 관계 발전 방향</h3>
                <p className="text-white leading-relaxed mb-4">
                  두 사람은 서로를 이해하고 보완하는 관계로 발전할 수 있습니다. 
                  {selectedUser.name}님의 창의성과 직관력은 당신의 안정성과 균형감과 잘 맞으며, 
                  함께하면 더 큰 시너지를 낼 수 있는 조합입니다.
                </p>
                <div className="text-center">
                  <div className="inline-block bg-purple-500 text-white px-6 py-2 rounded-full font-semibold">
                    🚀 관계 발전 가능성: 매우 높음
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 메시지 페이지 (dm-chat)
  if (currentStep === "dm-chat" && selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
        {/* 헤더 */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentStep("other-profile")}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-semibold transition-colors border border-white/30"
            >
              ← 뒤로 가기
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl">
                👤
              </div>
              <div>
                <h2 className="text-xl font-bold text-amber-400">{selectedUser.name}</h2>
                <p className="text-sm text-gray-300">궁합도 {selectedUser.totalCompatibility}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                    message.sender === "me"
                      ? "bg-amber-400 text-black rounded-br-md"
                      : "bg-white/20 text-white rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <div className={`flex items-center justify-between mt-2 text-xs ${
                    message.sender === "me" ? "text-black/70" : "text-gray-300"
                  }`}>
                    <span>
                      {message.timestamp.toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {message.sender === "me" && (
                      <span className="flex items-center gap-1">
                        {message.isRead ? "읽음" : "전송됨"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 메시지 입력 영역 */}
        <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={`${selectedUser.name}님에게 메시지를 보내세요...`}
                  className="w-full px-4 py-3 rounded-full bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none placeholder-gray-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-500 text-black px-4 py-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed"
                >
                  전송
                </button>
        </div>
            </div>
            
            {/* 빠른 메시지 버튼들 */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                "안녕하세요! 😊",
                "프로필 보고 연락드렸어요",
                "시간 되실 때 대화해요",
                "궁합 분석이 신기했어요",
                "커피 한 잔 어떠세요? ☕"
              ].map((quickMessage, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setNewMessage(quickMessage)
                    // 자동으로 전송
                    setTimeout(() => {
                      setNewMessage(quickMessage)
                      sendMessage()
                    }, 100)
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-full text-sm font-medium transition-colors border border-white/30"
                >
                  {quickMessage}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 나의 프로필 페이지
  if (currentStep === "my-profile") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-400">내 프로필</h1>
            <p className="text-xl text-white mt-2">프로필을 관리하고 연애운을 확인해보세요</p>
          </div>

          {/* 프로필 수정 섹션 */}
          <div className="bg-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-6">프로필 정보 수정</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-amber-400 font-semibold mb-2">닉네임</label>
                <input
                  type="text"
                  value={profileData.nickname}
                  onChange={(e) => handleInputChange("nickname", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                  placeholder="닉네임을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-amber-400 font-semibold mb-2">성별</label>
                <select
                  value={profileData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                >
                  <option value="">선택하세요</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>
              <div>
                <label className="block text-amber-400 font-semibold mb-2">생년월일</label>
                <input
                  type="date"
                  value={profileData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-amber-400 font-semibold mb-2">지역</label>
                <input
                  type="text"
                  value={profileData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                  placeholder="지역을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-amber-400 font-semibold mb-2">키</label>
                <input
                  type="text"
                  value={profileData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                  placeholder="키를 입력하세요"
                />
              </div>
              <div>
                <label className="block text-amber-400 font-semibold mb-2">체형</label>
                <select
                  value={profileData.bodyType}
                  onChange={(e) => handleInputChange("bodyType", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                >
                  <option value="">선택하세요</option>
                  <option value="slim">마른 편</option>
                  <option value="normal">보통</option>
                  <option value="chubby">통통한 편</option>
                  <option value="muscular">근육질</option>
                </select>
              </div>
              <div>
                <label className="block text-amber-400 font-semibold mb-2">직업</label>
                <input
                  type="text"
                  value={profileData.job}
                  onChange={(e) => handleInputChange("job", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                  placeholder="직업을 입력하세요"
                />
    </div>
              <div>
                <label className="block text-amber-400 font-semibold mb-2">학력</label>
                <select
                  value={profileData.education}
                  onChange={(e) => handleInputChange("education", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                >
                  <option value="">선택하세요</option>
                  <option value="high-school">고등학교</option>
                  <option value="college">대학교</option>
                  <option value="graduate">대학원</option>
                  <option value="other">기타</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-amber-400 font-semibold mb-2">자기소개</label>
              <textarea
                value={profileData.introduction}
                                  onChange={(e) => handleInputChange("introduction", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none resize-none"
                placeholder="자신을 소개해주세요"
              />
            </div>
            <div className="mt-6">
              <label className="block text-amber-400 font-semibold mb-2">이상형 키워드</label>
              <div className="flex flex-wrap gap-2">
                {profileData.idealKeywords.map((keyword, index) => (
                  <span key={index} className="bg-amber-400/20 text-amber-400 px-3 py-1 rounded-full text-sm border border-amber-400 flex items-center gap-2">
                    {keyword}
                    <button
                      onClick={() => {
                        const newKeywords = profileData.idealKeywords.filter((_, i) => i !== index)
                        handleInputChange("idealKeywords", newKeywords)
                      }}
                      className="text-amber-400 hover:text-amber-300 text-lg"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="키워드 추가"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      const newKeywords = [...profileData.idealKeywords, e.currentTarget.value.trim()]
                      handleInputChange("idealKeywords", newKeywords)
                      e.currentTarget.value = ""
                    }
                  }}
                  className="bg-white/20 text-white px-3 py-1 rounded-full text-sm border border-white/30 focus:border-amber-400 focus:outline-none placeholder-gray-400"
                />
              </div>
            </div>
            <div className="flex justify-center mt-8">
              <button
                onClick={() => {
                  // 프로필 저장 로직
                  alert("프로필이 저장되었습니다!")
                }}
                className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors"
              >
                프로필 저장
              </button>
            </div>
          </div>

          {/* 일별 연애운 분석 */}
          <div className="bg-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-6">🔮 오늘의 연애운</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-500/20 rounded-xl p-6 border border-green-400/30">
                <h3 className="text-xl font-bold text-green-400 mb-4">관상 기반 연애운</h3>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-green-400 mb-2">85%</div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-green-400 h-3 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <p className="text-white leading-relaxed mb-4">
                  오늘은 눈빛이 특히 매력적으로 보이는 날입니다. 
                  큰 눈과 긴 속눈썹의 에너지가 최고조에 달해 상대방의 마음을 쉽게 사로잡을 수 있습니다.
                </p>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>✓ 새로운 만남의 기회가 많음</p>
                  <p>✓ 기존 관계에서 깊이 있는 대화 가능</p>
                  <p>✓ 직관력이 뛰어나 상대방의 마음을 잘 읽음</p>
                </div>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-6 border border-blue-400/30">
                <h3 className="text-xl font-bold text-blue-400 mb-4">사주 기반 연애운</h3>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-blue-400 mb-2">78%</div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-blue-400 h-3 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <p className="text-white leading-relaxed mb-4">
                  목(木)과 화(火)의 기운이 조화를 이루어 창의적이고 열정적인 만남이 기대됩니다. 
                  특히 오후 2시~4시 사이에 좋은 기운이 집중됩니다.
                </p>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>✓ 창의적인 데이트 아이디어 제안</p>
                  <p>✓ 열정적인 감정 표현으로 관계 발전</p>
                  <p>✓ 새로운 취미나 활동을 통한 만남</p>
                </div>
              </div>
            </div>
            
            {/* 상세 운세 분석 */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-400/30">
              <h3 className="text-xl font-bold text-purple-400 mb-4">💕 오늘의 연애 조언</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">🕐</div>
                  <p className="text-white font-semibold">최적 시간</p>
                  <p className="text-gray-300 text-sm">오후 2시~4시</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">📍</div>
                  <p className="text-white font-semibold">추천 장소</p>
                  <p className="text-gray-300 text-sm">카페, 공원, 문화공간</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🎨</div>
                  <p className="text-white font-semibold">활동 추천</p>
                  <p className="text-gray-300 text-sm">창의적 활동, 대화</p>
                </div>
              </div>
              <p className="text-white leading-relaxed text-center">
                오늘은 관상과 사주가 모두 좋은 기운을 보이고 있어 연애에 매우 유리한 날입니다. 
                적극적으로 만남을 추구하고, 창의적인 아이디어로 상대방을 놀라게 해보세요!
              </p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-center">
            <button
              onClick={() => setCurrentStep("home")}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-full text-lg font-bold transition-colors"
            >
              매칭 목록으로
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 통합 분석 단계별 화면 렌더링
  if (integratedAnalysisStep === "photo") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
        {/* 로그인 상태 표시 */}
        {(isLoggedIn || localUser) && (
          <div className="absolute top-6 right-6 flex items-center gap-4">
            <span className="text-amber-400">
              {localUser?.nickname || '사용자'}님 환영합니다!
            </span>
            <button
              onClick={handleLocalLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              로그아웃
            </button>
          </div>
        )}
        
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-amber-400 mb-8">관상 분석 시작</h1>
          <p className="text-xl text-white mb-8">정면 얼굴 사진을 업로드해주세요</p>
          
          <div className="bg-white/10 rounded-2xl p-8 mb-8">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors cursor-pointer inline-block"
            >
              사진 선택하기
            </label>
          </div>

          <button
            onClick={() => setIntegratedAnalysisStep("saju")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors"
          >
            사주 분석으로 건너뛰기
          </button>
        </div>
      </div>
    )
  }

  if (integratedAnalysisStep === "saju") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
        {/* 로그인 상태 표시 */}
        {(isLoggedIn || localUser) && (
          <div className="absolute top-6 right-6 flex items-center gap-4">
            <span className="text-amber-400">
              {localUser?.nickname || '사용자'}님 환영합니다!
            </span>
            <button
              onClick={handleLocalLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              로그아웃
            </button>
          </div>
        )}
        
        <div className="text-center max-w-2xl mx-auto">
          {/* 관상 분석 완료 결과 표시 */}
          <div className="bg-green-500/20 border border-green-400 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-400 mb-4">🎉 관상 분석 완료!</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faceReadingResults.map((result, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-amber-400 mb-2">{result.keyword}</h3>
                  <p className="text-sm text-gray-300">{result.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-amber-400 mb-8">사주 분석</h1>
          <p className="text-xl text-white mb-8">생년월일과 출생 시간을 입력해주세요</p>
          
          <div className="bg-white/10 rounded-2xl p-8 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-left text-white mb-2">생년월일</label>
                <input
                  type="date"
                  value={sajuData.birthDate}
                  onChange={(e) => handleSajuInputChange("birthDate", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-left text-white mb-2">출생 시간</label>
                <select
                  value={sajuData.birthTime}
                  onChange={(e) => handleSajuInputChange("birthTime", e.target.value)}
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
          </div>

          <button
            onClick={() => startSajuAnalysis()}
            className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors"
          >
            사주 분석 시작
          </button>
        </div>
      </div>
    )
  }

  if (integratedAnalysisStep === "analyzing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-amber-400 mb-8">관상과 사주 통합 분석 중</h1>
          <div className="bg-white/10 rounded-2xl p-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p className="text-xl text-white">AI가 관상과 사주를 종합적으로 분석하고 있습니다</p>
          </div>
        </div>
      </div>
    )
  }

  if (integratedAnalysisStep === "result") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6 overflow-y-auto">
        {/* 로그인 상태 표시 */}
        {(isLoggedIn || localUser) && (
          <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
            <span className="text-amber-400">
              {localUser?.nickname || '사용자'}님 환영합니다!
            </span>
            <button
              onClick={handleLocalLogout}
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

          {/* 연애 스타일 요약 텍스트 */}
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-pink-400 mb-4 text-center">💕 연애 스타일</h2>
            <p className="text-lg text-white leading-relaxed text-center whitespace-pre-line">
              {`${profileData.nickname || "당신"}은 ${faceReadingResults.map(r => r.keyword).slice(0, 3).join(", ")}한 특성을 가진 ${sajuResults.map(r => r.keyword).slice(0, 2).join(", ")}한 연애 스타일입니다. 

감정을 솔직하게 표현하고 상대방과의 깊은 소통을 중시하며, 한번 마음을 열면 진심으로 사랑하는 타입입니다. 

당신의 ${faceReadingResults.find(r => r.keyword.includes("직관") || r.keyword.includes("감정"))?.keyword || "직관적인"} 특성은 연애에서 상대방의 마음을 잘 읽어내는 능력을 선사합니다.`}
            </p>
          </div>

          {/* 관상 분석 섹션 */}
          <div className="bg-green-500/20 border border-green-400 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">👁️ 관상 분석</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faceReadingResults.map((result, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-400 mb-2 text-lg">
                    {index === 0 ? "👁️ 눈의 특징" : 
                     index === 1 ? "👄 입의 특징" : 
                     index === 2 ? "🧠 이마/턱" : 
                     index === 3 ? "👃 코/귀" : "✨ 전체 인상"}
                  </h3>
                  <p className="text-gray-300">{result.description || result.keyword}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-300 italic">
                &ldquo;전체적으로 균형 잡힌 인상으로, 자신감 있고 신뢰할 수 있는 매력을 가지고 있습니다.&rdquo;
              </p>
            </div>
          </div>

          {/* 사주 분석 섹션 */}
          <div className="bg-blue-500/20 border border-blue-400 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">🔮 사주 분석</h2>
            
            {/* 사주 키워드 표시 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">사주 성향 키워드</h3>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {sajuResults.map((result, index) => (
                  <div key={index} className="bg-white/20 rounded-lg px-4 py-2">
                    <span className="text-amber-400 font-semibold">{result.keyword}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-300 leading-relaxed">
                {`${profileData.nickname || "당신"}의 사주는 ${sajuResults.map(r => r.keyword).slice(0, 3).join(", ")}한 특성을 보여줍니다. 
                ${sajuResults.find(r => r.description)?.description || "감정을 솔직하게 표현하고 상대방과의 깊은 소통을 중시하는 연애 스타일입니다."}`}
              </p>
            </div>
          </div>

          {/* 이상형 제안 섹션 */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">🌈 이상형 제안</h2>
            <p className="text-lg text-white leading-relaxed text-center mb-6">
              {`${profileData.nickname || "당신"}과 어울리는 이상형은 ${faceReadingResults.find(r => r.keyword.includes("직관") || r.keyword.includes("감정"))?.keyword || "직관적인"} 특성을 가진 사람입니다. 

상대방의 마음을 잘 이해하고 공감할 수 있는 능력이 뛰어나며, ${sajuResults.find(r => r.keyword.includes("소통") || r.keyword.includes("감정"))?.keyword || "감정 표현이 풍부한"} 스타일과 잘 맞습니다.`}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["정서 안정형", "리스너형", "한결같은 스타일", "감정 표현형", "소통 능력자"].map((keyword, index) => (
                <span key={index} className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm border border-yellow-400">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* 하단 CTA 버튼 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => alert("리포트 저장 기능은 준비 중입니다!")}
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-full text-lg font-bold transition-colors border border-white/30"
            >
              리포트 저장하기
            </button>
            <button
              onClick={() => setCurrentStep("profile")}
              className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors"
            >
              이상형 찾으러 가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 실제 매칭 페이지
  if (currentStep === "ideal-match") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-amber-400 mb-8 text-center">💕 이상형 매칭</h1>
          <p className="text-xl text-white mb-8 text-center">AI가 당신과 잘 맞는 사람들을 찾았습니다!</p>
          
          {/* 매칭 결과 표시 */}
          <div className="space-y-6">
            {dummyMatches.map((match, index) => (
              <div key={index} className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* 프로필 사진 */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl">
                      👤
                    </div>
                  </div>
                  
                  {/* 프로필 정보 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-2xl font-bold text-amber-400">{match.name}</h3>
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {match.totalCompatibility}% 궁합
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-white mb-1"><span className="text-amber-400 font-semibold">나이:</span> {match.age}세</p>
                        <p className="text-white mb-1"><span className="text-amber-400 font-semibold">직업:</span> {match.job}</p>
                        <p className="text-white mb-1"><span className="text-amber-400 font-semibold">지역:</span> {match.region}</p>
                      </div>
                      <div>
                        <p className="text-white mb-1"><span className="text-amber-400 font-semibold">키:</span> {match.height}</p>
                        <p className="text-white mb-1"><span className="text-amber-400 font-semibold">학력:</span> {match.education}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4">{match.introduction}</p>
                    
                    {/* 궁합 분석 */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-500/20 rounded-lg p-3">
                        <p className="text-green-400 font-semibold mb-1">관상 궁합</p>
                        <p className="text-white text-sm">{match.faceAnalysis}</p>
                      </div>
                      <div className="bg-blue-500/20 rounded-lg p-3">
                        <p className="text-blue-400 font-semibold mb-1">사주 궁합</p>
                        <p className="text-white text-sm">{match.sajuAnalysis}</p>
                      </div>
                    </div>
                    
                    {/* 키워드 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {match.keywords.map((keyword, idx) => (
                        <span key={idx} className="bg-amber-400/20 text-amber-400 px-2 py-1 rounded-full text-xs border border-amber-400">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* 액션 버튼 */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => {
                      setSelectedUser(match)
                      setCurrentStep("other-profile")
                    }}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-bold transition-colors border border-white/30"
                  >
                    프로필 자세히 보기
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(match)
                      initializeChatMessages(match.name)
                      setCurrentStep("dm-chat")
                    }}
                    className="flex-1 bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-full font-bold transition-colors"
                  >
                    💬 메시지 보내기
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* 하단 버튼 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => setCurrentStep("onboarding")}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-bold transition-colors border border-white/30"
            >
              처음으로
            </button>
            <button
              onClick={() => alert("더 많은 매칭 결과를 보려면 프리미엄 서비스를 이용해주세요!")}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-4 rounded-full text-lg font-bold transition-colors"
            >
              더 많은 매칭 보기
            </button>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <h1>관상은 과학이다</h1>
    </div>
  )
}

export default function FaceReadingApp() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-xl">로딩 중...</p>
        </div>
      </div>
    }>
      <FaceReadingAppContent />
    </Suspense>
  )
}
