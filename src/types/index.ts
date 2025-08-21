export type AppStep =
  | "onboarding"
  | "integrated-analysis"
  | "combined-result"
  | "profile"
  | "confirmation"
  | "home"
  | "my-profile"
  | "other-profile"
  | "dm-chat"

export interface FaceReadingKeyword {
  keyword: string
  description: string
}

export interface SajuKeyword {
  keyword: string
  description: string
}

export interface ProfileData {
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

export interface SajuData {
  birthDate: string
  birthTime: string
  birthPlace: string
  birthPlaceDetail: string
}

export interface MatchUser {
  name: string
  faceCompatibility: number
  sajuCompatibility: number
  totalCompatibility: number
  keywords: string[]
  age: number
  job: string
  region: string
  height: string
  education: string
  introduction: string
  photos: string[]
  faceKeywords: string[]
  sajuKeywords: string[]
  faceAnalysis: string
  sajuAnalysis: string
  totalAnalysis: string
}

export interface ChatMessage {
  id: string
  text: string
  sender: "me" | "other"
  timestamp: Date
  isRead: boolean
}
