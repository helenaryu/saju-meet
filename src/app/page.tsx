"use client"

import { useState, useEffect, Suspense } from "react"
import { AppStep, ProfileData, SajuData, ChatMessage } from "@/types"
import { FACE_READING_KEYWORDS, SAJU_KEYWORDS, IDEAL_TYPE_KEYWORDS, dummyMatches, dummyAnalysisReport } from "@/constants/data"
import { supabase } from "@/lib/supabase"
import { useSearchParams } from "next/navigation"

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
        setUploadedImage(e.target?.result as string)
        // 사진 업로드 후 즉시 분석 단계로 이동
        setIntegratedAnalysisStep("analyzing")
        startAnalysis()
      }
      reader.readAsDataURL(file)
    }
  }

  const startAnalysis = () => {
    setIsAnalyzing(true)
    setAnalysisProgress(3)

    const timer = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsAnalyzing(false)
          // 랜덤 관상 키워드 3-5개 생성
          const shuffled = [...FACE_READING_KEYWORDS].sort(() => 0.5 - Math.random())
          const selected = shuffled.slice(0, Math.floor(Math.random() * 3) + 3)
          setFaceReadingResults(selected)
          
          // 사진 분석 완료 후 바로 사주 입력 단계로 진행
          setIntegratedAnalysisStep("saju")
          
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startSajuAnalysis = () => {
    setIsSajuAnalyzing(true)
    setSajuProgress(3)

    const timer = setInterval(() => {
      setSajuProgress((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsSajuAnalyzing(false)
          // 랜덤 사주 키워드 3-5개 생성
          const shuffled = [...SAJU_KEYWORDS].sort(() => 0.5 - Math.random())
          const selected = shuffled.slice(0, Math.floor(Math.random() * 3) + 3)
          setSajuResults(selected)
          
          // 사주 분석 완료 후 바로 결과 단계로 진행
          setIntegratedAnalysisStep("result")
          
          return 0
        }
        return prev - 1
      })
    }, 1000)
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

  // 인증 상태 확인 및 초기화
  useEffect(() => {
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
  }, [])

  // OAuth 인증 함수들
  const handleGoogleSignUp = async () => {
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

  // 로그아웃 함수
  const handleLogout = async () => {
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
            onClick={() => setCurrentStep("signup")}
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
              
              // 회원가입 완료 후 바로 사진 업로드 페이지로 이동
              setCurrentStep("integrated-analysis")
              setIntegratedAnalysisStep("photo")
            }}
            className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors mb-4 w-full"
          >
            회원가입 완료
          </button>

          <div className="text-center mb-4">
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
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-full text-lg font-semibold transition-colors mb-4 w-full flex items-center justify-center"
          >
            <span className="mr-2">💬</span>
            카카오로 회원가입
          </button>

          <button
            onClick={() => setCurrentStep("login")}
            className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
          >
            이미 계정이 있으신가요? 로그인하기
          </button>
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
              
              // 로그인 완료 후 바로 사진 업로드 페이지로 이동
              setCurrentStep("integrated-analysis")
              setIntegratedAnalysisStep("photo")
            }}
            className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors mb-4 w-full"
          >
            로그인
          </button>

          <button
            onClick={() => setCurrentStep("signup")}
            className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
          >
            계정이 없으신가요? 회원가입하기
          </button>
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
                  <input
                    type="time"
                    value={profileData.birthTime}
                    onChange={(e) => handleInputChange("birthTime", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                  />
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
                onClick={() => {
                  if (validateProfile()) {
                    setCurrentStep("home")
                  }
                }}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors"
              >
                프로필 완료
              </button>
              <button
                onClick={() => setCurrentStep("integrated-analysis")}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-full text-lg font-bold transition-colors border border-white/30"
              >
                뒤로 가기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 통합 분석 단계별 화면 렌더링
  if (integratedAnalysisStep === "photo") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6">
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
                <input
                  type="time"
                  value={sajuData.birthTime}
                  onChange={(e) => handleSajuInputChange("birthTime", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-amber-400 focus:outline-none"
                />
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
          <h1 className="text-4xl font-bold text-amber-400 mb-8">AI가 관상 분석 중</h1>
          <div className="bg-white/10 rounded-2xl p-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p className="text-xl text-white">AI가 당신의 관상을 분석하고 있습니다</p>
          </div>
        </div>
      </div>
    )
  }

  if (integratedAnalysisStep === "result") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6 overflow-y-auto">
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
            <h1 className="text-3xl font-bold text-amber-400 mb-4">{dummyAnalysisReport.nickname}</h1>
            
            {/* 키워드 배지들 */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {dummyAnalysisReport.face_keywords.slice(0, 5).map((keyword, index) => (
                <span key={index} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-400">
                  {keyword}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {dummyAnalysisReport.saju_keywords.slice(0, 5).map((keyword, index) => (
                <span key={index} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-400">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* 연애 스타일 요약 텍스트 */}
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-pink-400 mb-4 text-center">💕 연애 스타일</h2>
            <p className="text-lg text-white leading-relaxed text-center whitespace-pre-line">
              {dummyAnalysisReport.love_style}
            </p>
          </div>

          {/* 관상 분석 섹션 */}
          <div className="bg-green-500/20 border border-green-400 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">👁️ 관상 분석</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(dummyAnalysisReport.face_analysis).map(([part, analysis]) => (
                <div key={part} className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-400 mb-2 text-lg">{part}</h3>
                  <p className="text-gray-300">{analysis}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-300 italic">
                "전체적으로 균형 잡힌 인상으로, 자신감 있고 신뢰할 수 있는 매력을 가지고 있습니다."
              </p>
            </div>
          </div>

          {/* 사주 분석 섹션 */}
          <div className="bg-blue-500/20 border border-blue-400 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">🔮 사주 분석</h2>
            
            {/* 오행 비율 시각화 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">오행 비율</h3>
              <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
                {Object.entries(dummyAnalysisReport.saju_analysis.오행).map(([element, value]) => (
                  <div key={element} className="text-center">
                    <div className="bg-white/20 rounded-lg p-2 mb-2">
                      <div className="text-2xl mb-1">
                        {element === "목" ? "🌳" : element === "화" ? "🔥" : element === "토" ? "🏔️" : element === "금" ? "⚔️" : "💧"}
                      </div>
                      <div className="text-lg font-bold text-amber-400">{value}</div>
                    </div>
                    <div className="text-sm text-gray-300">{element}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-300 leading-relaxed">
                {dummyAnalysisReport.saju_analysis.해석}
              </p>
            </div>
          </div>

          {/* 이상형 제안 섹션 */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">🌈 이상형 제안</h2>
            <p className="text-lg text-white leading-relaxed text-center mb-6">
              {dummyAnalysisReport.ideal_match.description}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {dummyAnalysisReport.ideal_match.keywords.map((keyword, index) => (
                <span key={index} className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm border border-yellow-400">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* 하단 CTA 버튼 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentStep("profile")}
              className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-full text-lg font-bold transition-colors"
            >
              이상형 찾으러 가기
            </button>
            <button
              onClick={() => alert("리포트 저장 기능은 준비 중입니다!")}
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-full text-lg font-bold transition-colors border border-white/30"
            >
              리포트 저장하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 홈 화면
  if (currentStep === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-amber-400 mb-8">🎉 프로필 등록 완료!</h1>
          <p className="text-xl text-white mb-8">이제 이상형을 찾아보세요!</p>
          
          <div className="bg-white/10 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-4">다음 단계</h2>
            <p className="text-white mb-6">프로필이 등록되었습니다. 매칭 서비스를 이용해보세요!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                onClick={() => setShowMatches(true)}
                className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-full font-bold transition-colors"
              >
                매칭 보기
              </button>
              <button
                onClick={() => setCurrentStep("onboarding")}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-bold transition-colors border border-white/30"
              >
                처음으로
              </button>
            </div>
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
