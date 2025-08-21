# Supabase 인증 시스템 설정 가이드

## 🔐 1단계: Supabase 대시보드에서 Auth 설정

### 1.1 Authentication 탭으로 이동
1. **Supabase 대시보드**에서 `saju-meet` 프로젝트 선택
2. **왼쪽 사이드바**에서 **"Authentication"** 아이콘 클릭
3. **"Settings"** 탭으로 이동

### 1.2 기본 Auth 설정
- **Site URL**: `https://saju-meet.vercel.app`
- **Redirect URLs**: 
  - `https://saju-meet.vercel.app/auth/callback`
  - `https://saju-meet.vercel.app/profile`
  - `http://localhost:3000/auth/callback` (개발용)

### 1.3 이메일 템플릿 설정
- **Confirm signup**: 사용자 정의 템플릿
- **Invite user**: 사용자 정의 템플릿
- **Magic Link**: 사용자 정의 템플릿

## 🌐 2단계: OAuth 제공자 설정

### 2.1 카카오 OAuth 설정
1. **"Providers"** 탭에서 **"Kakao"** 찾기
2. **"Enable"** 체크박스 선택
3. **Client ID**: 카카오 개발자 콘솔에서 가져온 값
4. **Client Secret**: 카카오 개발자 콘솔에서 가져온 값
5. **Redirect URL**: `https://saju-meet.vercel.app/auth/callback`

### 2.2 네이버 OAuth 설정
1. **"Providers"** 탭에서 **"Naver"** 찾기
2. **"Enable"** 체크박스 선택
3. **Client ID**: 네이버 개발자 센터에서 가져온 값
4. **Client Secret**: 네이버 개발자 센터에서 가져온 값
5. **Redirect URL**: `https://saju-meet.vercel.app/auth/callback`

### 2.3 구글 OAuth 설정
1. **"Providers"** 탭에서 **"Google"** 찾기
2. **"Enable"** 체크박스 선택
3. **Client ID**: Google Cloud Console에서 가져온 값
4. **Client Secret**: Google Cloud Console에서 가져온 값
5. **Redirect URL**: `https://saju-meet.vercel.app/auth/callback`

## 🔧 3단계: Next.js 인증 컴포넌트 생성

### 3.1 인증 컨텍스트 생성
- `src/contexts/AuthContext.tsx` 파일 생성
- 사용자 상태 관리 및 인증 함수 제공

### 3.2 로그인/회원가입 페이지
- `src/app/auth/login/page.tsx` 생성
- `src/app/auth/signup/page.tsx` 생성
- OAuth 버튼 및 폼 구현

### 3.3 인증 미들웨어
- `src/middleware.ts` 파일 생성
- 보호된 라우트에 대한 접근 제어

## 📱 4단계: UI 컴포넌트 구현

### 4.1 로그인 폼
- 이메일/비밀번호 입력
- OAuth 버튼 (카카오, 네이버, 구글)
- 에러 메시지 표시

### 4.2 회원가입 폼
- 기본 정보 입력
- 약관 동의
- 이메일 인증

### 4.3 프로필 설정
- 사용자 정보 입력
- 프로필 사진 업로드
- 이상형 키워드 선택

## 🚀 5단계: 테스트 및 배포

### 5.1 로컬 테스트
- `npm run dev`로 개발 서버 실행
- 인증 플로우 테스트
- OAuth 연동 테스트

### 5.2 배포
- Vercel에 자동 배포
- 프로덕션 환경에서 테스트

## ⚠️ 주의사항

- **OAuth Client ID/Secret**은 절대 공개하지 마세요
- **Redirect URL**은 정확히 설정해야 합니다
- **개발/프로덕션** 환경별로 다른 설정이 필요할 수 있습니다
