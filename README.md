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

### 3. 데이터베이스 스키마 설정
Supabase에서 다음 단계를 따라 데이터베이스를 설정하세요:

1. **Supabase 대시보드**에서 프로젝트 선택
2. **"SQL Editor"** 탭 클릭
3. **"New query"** 클릭
4. `database-schema.sql` 파일의 내용을 복사해서 붙여넣기
5. **"Run"** 버튼 클릭하여 스키마 생성

### 4. 개발 서버 실행
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

## 🗄️ 데이터베이스 구조

### 주요 테이블
- **user_profiles**: 사용자 기본 정보
- **face_reading_results**: 관상 분석 결과
- **saju_results**: 사주 분석 결과
- **compatibility_results**: 궁합 분석 결과
- **messages**: 사용자 간 메시지
- **payment_history**: 결제 내역
- **usage_tracking**: 사용량 추적
- **user_credits**: 사용자 크레딧

### 보안 기능
- **Row Level Security (RLS)** 활성화
- **사용자별 데이터 접근 제어**
- **자동 크레딧 차감 시스템**

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

### 데이터베이스 수정
데이터베이스 스키마를 수정할 때는 `database-schema.sql` 파일을 업데이트하고 Supabase에서 실행하세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
# Force new deployment
# Fresh Start - 2025년 8월 21일 목요일 16시 47분 18초 KST

## 🚀 새로운 배포 진행 중 (2025-08-25)
- ✅ 환경 변수 설정 완료 (Claude API 키, Supabase 연결)
- ✅ ESLint 오류 수정 완료
- ✅ 리포트 섹션 분리 및 중복 아이콘 제거
- 🔄 Vercel 자동 배포 진행 중
