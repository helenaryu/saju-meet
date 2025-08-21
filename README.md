# Saju Meet - 관상 사주 매칭 서비스

관상과 사주를 결합한 데이팅 매칭 서비스입니다.

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경변수를 설정하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://ydykauldznfysemdjxdm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeWthdWxkem5meXNlbWRqeGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3Mzk2MDksImV4cCI6MjA3MTMxNTYwOX0.cdQAFJA827Eiqlz7yH5Y54iBzkvGDsSS0G7ezCGpDTc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeWthdWxkem5meXNlbWRqeGRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTczOTYwOSwiZXhwIjoyMDcxMzE1NjA5fQ.6JZFzYYBb_YA2yPB6wm5SZpgl75J_4K9gYV86fj0ck0

# Anthropic Claude API (추후 설정)
# ANTHROPIC_API_KEY=your-claude-api-key

# Toss Payments (추후 설정)
# TOSS_PAYMENTS_SECRET_KEY=your-toss-secret-key
# TOSS_PAYMENTS_CLIENT_KEY=your-toss-client-key
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + OAuth
- **AI Service**: Anthropic Claude API
- **Payment**: Toss Payments
- **Deployment**: Vercel

## 📱 주요 기능

- **관상 분석**: MediaPipe FaceMesh를 통한 얼굴 특징 분석
- **사주 분석**: 생년월일, 시간, 지역 기반 사주 계산
- **궁합 매칭**: 관상 + 사주 결과를 종합한 궁합 점수
- **프로필 관리**: 사용자 정보 및 사진 관리
- **채팅 시스템**: 매칭된 사용자와의 대화
- **결제 시스템**: 유료 기능 이용을 위한 결제

## 🚀 배포

### Vercel 배포
1. GitHub 저장소를 Vercel에 연결
2. 환경변수 설정
3. 자동 배포

### 환경변수 설정 (Vercel)
Vercel 프로젝트 설정에서 다음 환경변수를 추가하세요:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📁 프로젝트 구조

```
src/
├── app/                 # Next.js App Router
├── components/          # 재사용 가능한 컴포넌트
├── constants/           # 상수 데이터
├── lib/                 # 유틸리티 함수 및 설정
├── types/               # TypeScript 타입 정의
└── hooks/               # 커스텀 React 훅
```

## 🔧 개발 가이드

### 컴포넌트 추가
새로운 컴포넌트는 `src/components/` 폴더에 추가하세요.

### 타입 추가
새로운 타입은 `src/types/index.ts`에 추가하세요.

### 상수 추가
새로운 상수는 `src/constants/` 폴더에 추가하세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
# Force redeploy
# Force new deployment
