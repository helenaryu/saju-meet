# 관상 사주 매칭 앱 (Saju Meet)

관상과 사주를 바탕으로 한 AI 기반 연애 매칭 서비스입니다.

## 🏗️ 프로젝트 구조

### 컴포넌트 구조 (리팩토링 완료)

```
src/
├── components/
│   ├── auth/                    # 인증 관련 컴포넌트
│   │   ├── OnboardingStep.tsx   # 온보딩 화면
│   │   ├── LoginStep.tsx        # 로그인 화면
│   │   ├── SignupStep.tsx       # 회원가입 화면
│   │   └── AuthLoadingStep.tsx  # 인증 로딩 화면
│   ├── analysis/                # 분석 관련 컴포넌트
│   │   ├── IntegratedAnalysisInput.tsx  # 통합 분석 입력
│   │   ├── AnalysisLoadingStep.tsx      # 분석 로딩
│   │   └── AnalysisResultStep.tsx       # 분석 결과
│   └── profile/                 # 프로필 관련 컴포넌트
│       └── ProfileRegistrationStep.tsx  # 프로필 등록
├── lib/
│   ├── api/
│   │   ├── services/            # API 서비스 분리
│   │   │   ├── ClaudePromptBuilder.ts   # Claude 프롬프트 빌더
│   │   │   └── ClaudeResponseParser.ts  # Claude 응답 파서
│   │   ├── claude.ts            # Claude API 서비스
│   │   ├── faceReading.ts       # 관상 분석 API
│   │   ├── saju.ts              # 사주 분석 API
│   │   ├── knowledgeBase.ts     # 지식베이스 API
│   │   └── integratedAnalysis.ts # 통합 분석 API
│   └── supabase.ts              # Supabase 설정
├── types/
│   └── index.ts                 # 타입 정의
├── constants/
│   └── data.ts                  # 상수 데이터
└── app/
    ├── page.tsx                 # 메인 페이지 (리팩토링됨)
    ├── layout.tsx               # 레이아웃
    └── api/
        └── analysis/
            └── route.ts         # 분석 API 라우트
```

## 🚀 주요 기능

### 1. 인증 시스템
- **온보딩**: 서비스 소개 및 시작 화면
- **로그인/회원가입**: 이메일, Google, Kakao OAuth 지원
- **로컬 인증**: Supabase 없이도 작동하는 로컬 인증

### 2. 관상 분석
- **MediaPipe 기반**: 얼굴 랜드마크 추출 및 분석
- **오행 관상학**: 동양 철학 기반 얼굴 특징 해석
- **연애 성향 분석**: 관상을 통한 연애 스타일 분석

### 3. 사주 분석
- **천간지지 계산**: 생년월일 기반 사주 계산
- **오행 분석**: 목화토금수 기반 성향 분석
- **연애운 분석**: 사주를 통한 연애 성향 분석

### 4. AI 통합 분석
- **Claude AI**: 관상과 사주 결과를 종합한 연애 리포트 생성
- **감성적 해석**: 따뜻하고 공감적인 톤의 분석 결과
- **전통 문헌 참조**: RAG를 통한 관련 전통 문헌 검색

### 5. 매칭 시스템
- **궁합 분석**: 관상과 사주 기반 궁합 점수 계산
- **프로필 매칭**: 이상형 키워드 기반 매칭
- **채팅 기능**: 매칭된 사용자와의 대화

## 🛠️ 기술 스택

### Frontend
- **Next.js 14**: App Router 기반
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 스타일링
- **React Hooks**: 상태 관리

### Backend & AI
- **Claude 3 Sonnet**: AI 분석 엔진
- **MediaPipe**: 얼굴 랜드마크 추출
- **Supabase**: 인증 및 데이터베이스 (선택사항)

### API 구조
- **RESTful API**: 분석 요청 처리
- **FormData**: 이미지 업로드
- **WebSocket**: 실시간 채팅 (향후 구현 예정)

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
# .env.local
ANTHROPIC_API_KEY=your_claude_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행
```bash
npm run dev
```

## 🔧 컴포넌트 분리 개선사항

### 이전 구조의 문제점
- 단일 파일에 모든 로직이 집중 (3000+ 라인)
- 컴포넌트 재사용성 부족
- 유지보수 어려움
- 테스트 작성 어려움

### 개선된 구조
1. **기능별 컴포넌트 분리**
   - 인증, 분석, 프로필 등 기능별로 분리
   - 각 컴포넌트는 단일 책임 원칙 준수

2. **API 서비스 분리**
   - 프롬프트 빌더와 응답 파서 분리
   - 재사용 가능한 서비스 클래스

3. **타입 안전성 강화**
   - 인터페이스 기반 props 정의
   - TypeScript 활용한 타입 체크

4. **코드 가독성 향상**
   - 명확한 파일 구조
   - 일관된 네이밍 컨벤션

## 🎯 사용 예시

### 1. 온보딩 → 로그인
```typescript
// OnboardingStep.tsx
<OnboardingStep onStart={() => setCurrentStep("login")} />
```

### 2. 통합 분석
```typescript
// IntegratedAnalysisInput.tsx
<IntegratedAnalysisInput
  uploadedImage={uploadedImage}
  profileData={profileData}
  sajuData={sajuData}
  onStartAnalysis={startIntegratedAnalysis}
  // ... 기타 props
/>
```

### 3. AI 분석
```typescript
// Claude API 사용
const result = await claudeService.generateLoveReport({
  nickname: "사용자",
  gender: "남성",
  birthDate: "1990-01-01",
  faceReadingKeywords: ["감성적", "직관적"],
  sajuKeywords: ["창의적", "성장지향적"]
});
```

## 🔮 향후 계획

1. **실시간 채팅**: WebSocket 기반 실시간 대화
2. **프로필 관리**: 프로필 수정 및 관리 기능
3. **매칭 알고리즘**: 더 정교한 궁합 분석
4. **모바일 앱**: React Native 기반 모바일 앱
5. **결제 시스템**: 프리미엄 기능 결제

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.
