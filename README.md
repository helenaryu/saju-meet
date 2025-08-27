# Saju Meet - AI 기반 사주 상담 서비스

## 🌟 프로젝트 개요

Saju Meet는 AI 기술을 활용하여 사주, 관상, 통합 분석을 제공하는 현대적인 상담 플랫폼입니다.

## ✨ 주요 기능

- **🔮 사주 분석**: 생년월일과 시간을 기반으로 한 정확한 사주 해석
- **👁️ 관상 분석**: AI가 분석한 얼굴 특징과 성격 분석
- **🤖 AI 통합 분석**: Claude와 OpenAI를 활용한 개인 맞춤형 상담
- **🔐 소셜 로그인**: Google, Kakao, Naver OAuth 지원
- **📱 반응형 디자인**: 모든 디바이스에서 최적화된 사용자 경험

## 🚀 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (Auth, Database)
- **AI Services**: Claude (Anthropic), OpenAI
- **Deployment**: Vercel
- **Authentication**: Supabase Auth with OAuth providers

## 🎯 사용자 플로우

1. **온보딩**: 서비스 소개 및 시작
2. **인증**: 소셜 로그인 또는 회원가입
3. **프로필 설정**: 기본 정보 및 이상형 입력
4. **사진 업로드**: 얼굴 사진 업로드
5. **AI 분석**: 통합 분석 실행
6. **결과 확인**: 상세한 분석 리포트 확인

## 🔧 설치 및 실행

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
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 배포 환경에서 필요한 설정
NEXT_PUBLIC_SITE_URL=https://saju-meet.vercel.app
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

## 🚀 배포 상태

**최신 업데이트**: 환경 변수 설정 완료 및 Google OAuth 리다이렉트 문제 해결
