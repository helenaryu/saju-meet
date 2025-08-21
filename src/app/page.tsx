"use client"

import { useState, useEffect } from "react"
import { AppStep, ProfileData, SajuData, ChatMessage } from "@/types"
import { FACE_READING_KEYWORDS, SAJU_KEYWORDS, IDEAL_TYPE_KEYWORDS, dummyMatches } from "@/constants/data"

export default function FaceReadingApp() {
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
            onClick={() => setIntegratedAnalysisStep("photo")}
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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <h1>관상은 과학이다</h1>
    </div>
  )
}
