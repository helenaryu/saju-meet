import { FaceReadingKeyword, SajuKeyword, MatchUser, AnalysisReport } from '@/types'

// 관상 키워드 데이터
export const FACE_READING_KEYWORDS: FaceReadingKeyword[] = [
  { keyword: "밝은 인상", description: "긍정적이고 활기찬 에너지를 가지고 있어요" },
  { keyword: "외향적", description: "사교적이고 사람들과 어울리기를 좋아해요" },
  { keyword: "감성적", description: "섬세하고 따뜻한 마음을 가지고 있어요" },
  { keyword: "리더형", description: "카리스마가 있고 주도적인 성향이에요" },
  { keyword: "차분한", description: "안정적이고 신중한 판단력을 가지고 있어요" },
  { keyword: "유쾌한", description: "유머러스하고 재미있는 매력이 있어요" },
  { keyword: "진중함", description: "깊이 있고 신뢰할 수 있는 인상이에요" },
  { keyword: "귀여움", description: "사랑스럽고 친근한 매력을 가지고 있어요" },
  { keyword: "카리스마", description: "강한 존재감과 매력적인 아우라가 있어요" },
  { keyword: "부드러운", description: "온화하고 포용력이 있는 인상이에요" },
]

export const SAJU_KEYWORDS: SajuKeyword[] = [
  { keyword: "재물운", description: "금전적 성공과 안정된 경제력을 가져다줍니다" },
  { keyword: "인기운", description: "사람들에게 사랑받고 인기가 많은 운세입니다" },
  { keyword: "학업운", description: "학습 능력이 뛰어나고 지적 성취가 높습니다" },
  { keyword: "건강운", description: "체력이 좋고 건강한 삶을 유지할 수 있습니다" },
  { keyword: "연애운", description: "사랑에 있어서 좋은 기회와 만남이 많습니다" },
  { keyword: "사업운", description: "창업이나 사업에서 성공할 가능성이 높습니다" },
  { keyword: "예술운", description: "창작 활동과 예술적 재능이 뛰어납니다" },
  { keyword: "리더십", description: "타고난 지도력으로 조직을 이끄는 능력이 있습니다" },
  { keyword: "직감력", description: "뛰어난 직관력으로 올바른 판단을 내립니다" },
  { keyword: "소통력", description: "사람들과의 관계에서 뛰어난 소통 능력을 발휘합니다" },
]

export const IDEAL_TYPE_KEYWORDS = [
  "차분한 인상",
  "밝은 인상",
  "리더형",
  "유쾌한 분위기",
  "감성적",
  "외향적",
  "진중함",
  "귀여운 매력",
  "카리스마",
  "부드러운",
]

export const dummyMatches: MatchUser[] = [
  {
    id: "1",
    name: "김민지",
    faceCompatibility: 88,
    sajuCompatibility: 82,
    totalCompatibility: 85,
    keywords: ["차분한", "배려심", "소통능력"],
    age: 28,
    job: "마케터",
    region: "서울",
    height: "163cm",
    education: "대학교 졸업",
    introduction: "안녕하세요! 긍정적인 에너지를 나누는 것을 좋아합니다.",
    photos: [
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
    ],
    faceKeywords: ["온화한", "지적인"],
    sajuKeywords: ["안정 추구", "균형 감각"],
    faceAnalysis: "부드러운 인상으로 감성적 소통이 잘 맞음",
    sajuAnalysis: "안정을 추구하는 성향으로 장기적 관계에 적합",
    totalAnalysis: "전체적으로 조화로운 궁합으로 서로를 보완하는 관계",
  },
  {
    id: "2",
    name: "박서준",
    faceCompatibility: 95,
    sajuCompatibility: 89,
    totalCompatibility: 92,
    keywords: ["리더십", "유머감각", "친근함"],
    age: 32,
    job: "개발자",
    region: "경기",
    height: "178cm",
    education: "대학교 졸업",
    introduction: "새로운 사람들과의 만남을 즐겁게 생각합니다.",
    photos: [
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
    ],
    faceKeywords: ["카리스마", "세련된"],
    sajuKeywords: ["직진", "감정교류"],
    faceAnalysis: "카리스마 있는 인상으로 리더십 궁합이 완벽함",
    sajuAnalysis: "직진적 성향으로 솔직한 관계 형성 가능",
    totalAnalysis: "최고 수준의 궁합으로 이상적인 파트너십 기대",
  },
  {
    id: "3",
    name: "이서연",
    faceCompatibility: 85,
    sajuCompatibility: 91,
    totalCompatibility: 88,
    keywords: ["감성적", "섬세함", "진중함"],
    age: 29,
    job: "디자이너",
    region: "부산",
    height: "167cm",
    education: "대학원 졸업",
    introduction: "예술과 자연을 사랑하는 감성적인 사람입니다.",
    photos: [
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
    ],
    faceKeywords: ["귀여운", "순수한"],
    sajuKeywords: ["로맨틱", "안정"],
    faceAnalysis: "순수한 인상으로 감성적 교감이 깊어질 것",
    sajuAnalysis: "로맨틱한 성향으로 감정적 유대감 형성에 탁월",
    totalAnalysis: "감성과 이성의 균형이 잘 맞는 이상적 궁합",
  },
]

// 상세 분석 리포트 더미 데이터
export const dummyAnalysisReport: AnalysisReport = {
  nickname: "채라",
  face_keywords: ["감성적", "밝은 인상", "리더형", "카리스마", "부드러운"],
  saju_keywords: ["직진형", "애정 표현형", "몰입형", "감정교류형", "안정추구형"],
  love_style: "💕 당신은 감정을 숨기지 않고 솔직하게 표현하는 타입입니다. 사랑에 빠지면 빠르게 몰입하며, 파트너에게 확신을 주고받는 관계를 선호합니다. 🌟 밝고 긍정적인 에너지로 주변 사람들을 이끄는 리더십을 가지고 있어, 연애에서도 주도적인 역할을 맡게 됩니다.",
  face_analysis: {
    눈: "또렷하고 위로 올라감 → 자신감 있고 직관적인 인상",
    코: "곧고 균형 잡힘 → 신뢰감과 안정감을 주는 매력",
    입: "입꼬리 올라감 → 밝고 사교적인 성격의 소유자",
    이마: "넓고 균형잡힌 → 지적이고 판단력이 뛰어남",
    턱: "적당한 각도 → 의지력과 결단력이 강함"
  },
  saju_analysis: {
    오행: { "목": 2, "화": 4, "토": 1, "금": 0, "수": 3 },
    해석: "🔥 화(火) 기운이 강한 당신은 열정적이고 직진적인 연애 스타일을 가지고 있습니다. 💧 수(水) 기운도 적당히 있어 감정을 꾸준히 보여주는 스타일로, 빠르게 몰입하며 확신을 주고받는 관계를 선호합니다."
  },
  ideal_match: {
    description: "🌈 당신과 어울리는 사람은 조용하지만 감정을 꾸준히 보여주는 리스너형입니다. 당신의 열정을 받아주고 안정감을 제공하는 파트너가 가장 이상적입니다.",
    keywords: ["정서 안정형", "리스너형", "한결같은 스타일", "배려심 깊은", "신뢰할 수 있는"]
  }
}
