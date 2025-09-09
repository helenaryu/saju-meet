# Vercel 환경 변수 설정 가이드

## 🚀 3단계: Vercel 환경 변수 설정

### 1. Supabase API 키 가져오기

#### 1.1 Supabase 대시보드에서 API 키 확인
1. **Supabase 대시보드**에서 `supabase-saju-meet` 프로젝트 선택
2. **왼쪽 사이드바**에서 **"Settings"** (설정) 클릭
3. **"API"** 탭으로 이동

#### 1.2 필요한 키들
- **Project URL**: `https://ydykauldznfysemdjxdm.supabase.co`
- **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (긴 문자열)
- **service_role secret**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (긴 문자열)

### 2. Vercel 환경 변수 설정

#### 2.1 Vercel 대시보드 접속
1. [Vercel](https://vercel.com)에 로그인
2. `saju-meet` 프로젝트 선택
3. **"Settings"** 탭으로 이동
4. **"Environment Variables"** 섹션으로 이동

#### 2.2 환경 변수 추가
다음 환경 변수들을 하나씩 추가하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://ydykauldznfysemdjxdm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon public 키)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role secret 키)

# 사이트 URL (중요: localhost 리다이렉트 문제 해결)
NEXT_PUBLIC_SITE_URL=https://saju-meet.vercel.app

# AI API 키
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key
```

**⚠️ 중요**: `NEXT_PUBLIC_SITE_URL`은 반드시 설정해야 합니다. 이 변수가 없으면 localhost로 리다이렉트되는 문제가 발생합니다.

#### 2.3 환경 변수 설정 옵션
- **Environment**: `Production`, `Preview`, `Development` 모두 선택
- **Add** 버튼 클릭하여 저장

### 3. 환경 변수 확인

#### 3.1 설정 완료 후
- **"Redeploy"** 버튼 클릭하여 환경 변수를 적용
- 또는 **"Deployments"** 탭에서 최신 배포 확인

#### 3.2 설정 확인 방법
배포 후 콘솔에서 다음 메시지 확인:
```
Supabase 설정이 완료되었습니다.
```

## 🔧 문제 해결

### 문제 1: 환경 변수가 적용되지 않음
**해결**: Vercel에서 "Redeploy" 실행

### 문제 2: Supabase 연결 실패
**해결**: API 키가 정확한지 확인, 환경 변수 이름 확인

### 문제 3: OAuth 로그인 실패
**해결**: `NEXT_PUBLIC_SITE_URL` 설정 확인

### 문제 4: Vercel에서 localhost로 리다이렉트되는 문제 ⚠️
**원인**: 
- `NEXT_PUBLIC_SITE_URL` 환경 변수가 설정되지 않음
- 미들웨어에서 상대 URL 사용
- Supabase 리다이렉트 URL 설정 오류

**해결 방법**:
1. **Vercel 환경 변수에서 `NEXT_PUBLIC_SITE_URL=https://saju-meet.vercel.app` 설정** (가장 중요!)
2. **Supabase 대시보드에서 Site URL을 `https://saju-meet.vercel.app`로 설정**
3. **Google OAuth 콘솔에서 승인된 리다이렉트 URI에 `https://saju-meet.vercel.app/auth/callback` 추가**
4. **Vercel에서 "Redeploy" 실행**
5. **브라우저 캐시 삭제 후 재시도**

**추가 확인사항**:
- Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client IDs
- 승인된 리다이렉트 URI에 다음 URL이 포함되어 있는지 확인:
  - `https://saju-meet.vercel.app/auth/callback`

## 📝 체크리스트

- [ ] Supabase API 키 가져오기
- [ ] Vercel 환경 변수 설정
- [ ] 환경 변수 적용을 위한 재배포
- [ ] 설정 확인

## 🎯 다음 단계

환경 변수 설정이 완료되면 **4단계: 배포 및 테스트**를 진행합니다.
