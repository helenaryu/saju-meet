# 배포 환경 OAuth 설정 가이드

## 🚀 배포 전 필수 설정

### 1. Vercel 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수들을 설정하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 사이트 URL (배포 환경에서 필요)
NEXT_PUBLIC_SITE_URL=https://saju-meet.vercel.app

# AI API 키
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 2. Google Cloud Console 설정

#### 2.1 OAuth 2.0 클라이언트 설정
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 프로젝트 선택
3. **APIs & Services** > **Credentials**로 이동
4. **OAuth 2.0 Client IDs**에서 사용 중인 클라이언트 선택

#### 2.2 Authorized redirect URIs 설정
다음 URL을 **Authorized redirect URIs**에 추가:

```
https://saju-meet.vercel.app/auth/callback
```

#### 2.3 Authorized JavaScript origins 설정
다음 URL을 **Authorized JavaScript origins**에 추가:

```
https://saju-meet.vercel.app
```

### 3. Supabase Auth 설정

#### 3.1 Site URL 설정
Supabase 대시보드 > Authentication > Settings에서:

- **Site URL**: `https://saju-meet.vercel.app`

#### 3.2 Redirect URLs 설정
다음 URL들을 **Redirect URLs**에 추가:

```
https://saju-meet.vercel.app/auth/callback
https://saju-meet.vercel.app/profile
```

#### 3.3 OAuth Provider 설정
각 OAuth 제공자(Google, Kakao, Naver)에서:

- **Redirect URL**: `https://saju-meet.vercel.app/auth/callback`

## 🔧 문제 해결

### 문제 1: "redirect_uri_mismatch" 오류
**증상**: Google OAuth에서 "redirect_uri_mismatch" 오류 발생

**해결 방법**:
1. Google Cloud Console에서 Authorized redirect URIs 확인
2. `https://saju-meet.vercel.app/auth/callback`이 정확히 등록되어 있는지 확인
3. URL 끝에 슬래시(/)가 없는지 확인

### 문제 2: Supabase Auth 콜백 오류
**증상**: Supabase에서 콜백 처리 실패

**해결 방법**:
1. Supabase Auth Settings에서 Redirect URLs 확인
2. 환경 변수 `NEXT_PUBLIC_SITE_URL`이 올바르게 설정되었는지 확인
3. Vercel 환경 변수에서 `NEXT_PUBLIC_SITE_URL=https://saju-meet.vercel.app` 설정

### 문제 3: 개발/프로덕션 환경 전환 문제
**증상**: 로컬에서는 작동하지만 배포 환경에서 작동하지 않음

**해결 방법**:
1. 환경 변수 `NODE_ENV`가 올바르게 설정되었는지 확인
2. `NEXT_PUBLIC_SITE_URL` 환경 변수 설정 확인
3. 모든 OAuth 제공자에서 프로덕션 URL 등록 확인

## 📝 체크리스트

배포 전 다음 항목들을 확인하세요:

- [ ] Vercel 환경 변수 설정 완료
- [ ] Google Cloud Console OAuth 설정 완료
- [ ] Supabase Auth 설정 완료
- [ ] 모든 OAuth 제공자에서 프로덕션 URL 등록
- [ ] 로컬 환경에서 테스트 완료
- [ ] 배포 후 인증 플로우 테스트 완료

## 🚨 주의사항

1. **보안**: API 키와 시크릿은 절대 공개 저장소에 커밋하지 마세요
2. **URL 정확성**: 모든 URL이 정확히 일치해야 합니다 (http/https, www 유무 등)
3. **환경 변수**: Vercel에서 환경 변수가 올바르게 설정되었는지 확인하세요
4. **캐시**: 설정 변경 후 브라우저 캐시를 클리어하세요

## 📞 지원

문제가 지속되면 다음을 확인하세요:
1. 브라우저 개발자 도구의 콘솔 로그
2. Vercel 배포 로그
3. Supabase 대시보드의 Auth 로그
