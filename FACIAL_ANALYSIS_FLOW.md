# 관상 분석 시스템 (Facial Analysis Flow)

## 개요

이 문서는 새로운 관상 분석 시스템의 데이터 플로우와 구현을 설명합니다. 사용자가 얼굴 이미지를 업로드하면 CompreFace로 분석하고, rule-based mapping을 통해 관상 특징을 추출한 후, Claude AI로 개인화된 리포트를 생성합니다.

## 데이터 플로우

```
사용자 이미지 업로드
        ↓
   CompreFace 분석
        ↓
  Rule-based Mapping
        ↓
   Claude AI 분석
        ↓
  개인화된 리포트 생성
```

## 1. CompreFace 분석 단계

### 입력
- 사용자 업로드 이미지 (JPEG, PNG, WebP)
- 이미지 크기 제한: 10MB

### CompreFace API 호출
```typescript
const comprefaceResponse = await comprefaceService.detectFaces(imageFile);
```

### 출력 데이터
```typescript
interface CompreFaceDetection {
  age?: { low: number; high: number; probability: number };
  gender?: { value: string; probability: number };
  landmarks: Array<{ x: number; y: number }>;
  pose?: { pitch: number; yaw: number; roll: number };
  mask?: { value: string; probability: number };
  bbox: { x_min: number; y_min: number; x_max: number; y_max: number };
  embedding?: number[];
}
```

## 2. Rule-based Mapping 단계

### FacialFeatureMapper 클래스
CompreFace 데이터를 관상 분석용 특징으로 변환합니다.

#### 주요 기능
- **눈 분석**: 크기, 모양, 특징 추출
- **코 분석**: 다리, 끝부분, 특징 추출  
- **입 분석**: 크기, 모양, 특징 추출
- **이마 분석**: 너비, 높이, 특징 추출
- **턱 분석**: 모양, 특징 추출
- **전체 얼굴**: 얼굴형, 대칭성 분석

#### 매핑 결과
```typescript
interface MappedFacialFeatures {
  eyes: {
    size: 'small' | 'medium' | 'large';
    shape: 'round' | 'almond' | 'narrow' | 'deep-set';
    characteristics: string[];
    confidence: number;
  };
  nose: {
    bridge: 'straight' | 'curved' | 'wide' | 'narrow';
    tip: 'pointed' | 'rounded' | 'wide' | 'upturned';
    characteristics: string[];
    confidence: number;
  };
  // ... 기타 특징들
  keywords: string[];
  loveCompatibility: string[];
}
```

## 3. Claude AI 분석 단계

### ClaudeService 통합
매핑된 관상 특징을 Claude AI에 전달하여 개인화된 분석을 수행합니다.

#### 분석 항목
- **관상 해석**: 얼굴 특징 기반 성격 분석
- **성격 통찰**: 깊이 있는 성격 분석
- **연애 조언**: 관계에서의 특성과 조언
- **궁합 요소**: 연인과의 궁합 분석
- **성장 기회**: 개인적 발전 방향 제시
- **이상형**: 추천 이상형 설명

#### Claude 프롬프트 구조
```
연애 분석: {nickname} ({gender}, {birthDate})
관상: {faceReadingKeywords}
사주: {sajuKeywords}

JSON 응답:
{
  "loveStyle": "연애 스타일 (1-2문장)",
  "faceReadingInterpretation": "관상 해석 (1-2문장)", 
  "sajuInterpretation": "사주 해석 (1-2문장)",
  "idealTypeDescription": "이상형 (1-2문장)",
  "recommendedKeywords": ["키워드1", "키워드2"],
  "detailedAnalysis": {
    "personalityInsights": "성격 통찰 (1-2문장)",
    "relationshipAdvice": "연애 조언 (1-2문장)",
    "compatibilityFactors": "궁합 요소 (1-2문장)",
    "growthOpportunities": "성장 기회 (1-2문장)"
  }
}
```

## 4. API 엔드포인트

### POST /api/facial-analysis

#### 요청
```typescript
FormData {
  imageFile: File;
  nickname?: string;
  gender?: string;
  birthDate?: string;
}
```

#### 응답
```typescript
{
  success: boolean;
  data: {
    comprefaceData: CompreFaceDetection;
    facialFeatures: MappedFacialFeatures;
    claudeAnalysis: {
      interpretation: string;
      personalityInsights: string;
      relationshipAdvice: string;
      compatibilityFactors: string;
      growthOpportunities: string;
      recommendedKeywords: string[];
      loveStyle: string;
      idealTypeDescription: string;
    };
    keywords: string[];
    loveCompatibility: string[];
    summary: string;
    metadata: {
      timestamp: string;
      analysisVersion: string;
      confidence: number;
      processingTime: number;
    };
  };
}
```

## 5. 서비스 클래스

### FacialAnalysisService
전체 관상 분석 프로세스를 관리하는 메인 서비스입니다.

#### 주요 메서드
- `analyzeFacialFeatures()`: 종합적인 관상 분석 수행
- `generateSummary()`: 분석 결과 요약 생성
- `generateKeywords()`: 키워드 배열 생성

### FaceReadingService (업데이트됨)
기존 FaceReadingService가 새로운 시스템을 사용하도록 업데이트되었습니다.

#### 변경사항
- 새로운 FacialAnalysisService 통합
- Fallback 메커니즘 추가
- 기존 인터페이스 호환성 유지

## 6. 에러 처리

### 계층적 에러 처리
1. **CompreFace 오류**: 얼굴 감지 실패, 서버 연결 오류
2. **Mapping 오류**: 랜드마크 데이터 부족, 분석 실패
3. **Claude 오류**: API 호출 실패, 응답 파싱 오류
4. **Fallback**: 각 단계에서 실패 시 대체 로직 실행

### 에러 응답 형식
```typescript
{
  success: false;
  error: string;
  details?: string;
}
```

## 7. 테스트

### 테스트 스크립트
`test-facial-analysis.js` 파일로 전체 시스템을 테스트할 수 있습니다.

#### 실행 방법
```bash
# 개발 서버 실행
npm run dev

# 다른 터미널에서 테스트 실행
node test-facial-analysis.js
```

#### 테스트 항목
- 서버 상태 확인
- 더미 이미지 생성
- API 호출 테스트
- 응답 데이터 검증
- 에러 처리 확인

## 8. 설정 요구사항

### 환경 변수
```env
# CompreFace 설정
NEXT_PUBLIC_COMPREFACE_URL=your_compreface_url
NEXT_PUBLIC_COMPREFACE_API_KEY=your_api_key

# Claude AI 설정
ANTHROPIC_API_KEY=your_claude_api_key
```

### 의존성
- `@anthropic-ai/sdk`: Claude AI 통합
- `axios`: CompreFace API 호출
- `form-data`: 파일 업로드 처리

## 9. 성능 최적화

### 타임아웃 설정
- CompreFace API: 15초
- Claude API: 30초
- 전체 분석: 60초

### 캐싱 전략
- 분석 결과 캐싱 (선택사항)
- CompreFace 서버 상태 캐싱
- Claude 응답 캐싱 (선택사항)

### 에러 복구
- CompreFace 실패 시 Fallback 분석
- Claude 실패 시 기본 해석 제공
- 네트워크 오류 시 재시도 로직

## 10. 향후 개선사항

### 단기 개선
- 더 정확한 랜드마크 분석
- 추가적인 얼굴 특징 추출
- 실시간 분석 진행률 표시

### 장기 개선
- 머신러닝 기반 특징 매핑
- 다국어 지원
- 모바일 최적화
- 실시간 비디오 분석

## 11. 사용 예시

### 프론트엔드에서 사용
```typescript
// 이미지 업로드 후 분석
const formData = new FormData();
formData.append('imageFile', imageFile);
formData.append('nickname', '사용자');
formData.append('gender', '여성');

const response = await fetch('/api/facial-analysis', {
  method: 'POST',
  body: formData
});

const result = await response.json();
if (result.success) {
  console.log('관상 해석:', result.data.claudeAnalysis.interpretation);
  console.log('연애 스타일:', result.data.claudeAnalysis.loveStyle);
  console.log('키워드:', result.data.keywords);
}
```

### 서비스에서 직접 사용
```typescript
import { facialAnalysisService } from '@/lib/api/facialAnalysisService';

const result = await facialAnalysisService.analyzeFacialFeatures({
  imageFile: uploadedFile,
  nickname: '사용자',
  gender: '여성'
});

console.log('분석 결과:', result.mappedFeatures);
console.log('Claude 해석:', result.claudeAnalysis.interpretation);
```

이 시스템을 통해 사용자는 자신의 얼굴 사진을 업로드하여 개인화된 관상 분석과 연애 조언을 받을 수 있습니다.
