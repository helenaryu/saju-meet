# 🔌 외부 API 연동 설정 가이드

이 프로젝트는 관상/사주 기반 연애 성향 리포트를 자동으로 생성하기 위해 여러 외부 API를 연동합니다.

## 📋 필요한 API 키

### 1. Claude API (Anthropic)
- **용도**: GPT 역할로 관상/사주 키워드 기반 연애 리포트 자동 생성
- **가입 방법**: [Anthropic Console](https://console.anthropic.com/)에서 계정 생성
- **API 키 발급**: Console에서 API 키 생성
- **환경 변수**: `ANTHROPIC_API_KEY`

### 2. OpenAI API (대안)
- **용도**: Claude API 대신 사용 가능
- **가입 방법**: [OpenAI Platform](https://platform.openai.com/)에서 계정 생성
- **API 키 발급**: API Keys 섹션에서 키 생성
- **환경 변수**: `OPENAI_API_KEY`

### 3. Supabase 설정
- **용도**: 사용자 인증 및 데이터 저장
- **가입 방법**: [Supabase](https://supabase.com/)에서 프로젝트 생성
- **환경 변수**: 
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🚀 환경 변수 설정

### 1. 프로젝트 루트에 `.env.local` 파일 생성

```bash
# Claude API (Anthropic)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# OpenAI API (대안)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 서비스 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. 환경 변수 설정 확인

```bash
# 프로젝트 루트에서
npm run dev
```

콘솔에서 API 키 관련 오류가 없다면 정상적으로 설정된 것입니다.

## 🔧 API 서비스 구조

### 📁 `src/lib/api/` 디렉토리

```
src/lib/api/
├── claude.ts          # Claude API 연동
├── saju.ts            # 사주 분석 로직
├── faceReading.ts     # MediaPipe 기반 관상 분석
└── integratedAnalysis.ts # 통합 분석 서비스
```

### 🔄 데이터 흐름

1. **사용자 입력** → 사진 + 생년월일
2. **관상 분석** → MediaPipe FaceMesh로 얼굴 특징 추출
3. **사주 분석** → 생년월일 기반 오행 계산
4. **Claude AI** → 관상 + 사주 키워드로 리포트 생성
5. **통합 결과** → 클라이언트에 최종 리포트 반환

## 🛡️ 보안 주의사항

### ✅ 권장사항
- API 키는 `.env.local`에만 저장
- `.env.local`을 `.gitignore`에 추가
- 프로덕션에서는 환경 변수 관리 서비스 사용

### ❌ 금지사항
- API 키를 코드에 하드코딩
- API 키를 Git에 커밋
- 클라이언트 사이드에 API 키 노출

## 🧪 테스트 방법

### 1. 개발 서버 실행
```bash
npm run dev
```

### 2. 브라우저에서 테스트
- `http://localhost:3000` 접속
- 통합 분석 단계에서 사진 업로드 및 생년월일 입력
- API 응답 확인

### 3. 콘솔 로그 확인
브라우저 개발자 도구에서 API 호출 과정과 결과를 확인할 수 있습니다.

## 🚨 문제 해결

### Claude API 오류
```
Error: ANTHROPIC_API_KEY is not set
```
**해결**: `.env.local`에 `ANTHROPIC_API_KEY` 설정

### MediaPipe 오류
```
Error: FaceMesh 초기화 오류
```
**해결**: 인터넷 연결 확인, CDN 접근 가능 여부 확인

### Supabase 오류
```
Error: Supabase 연결 실패
```
**해결**: `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인

## 📚 추가 리소스

- [Anthropic API 문서](https://docs.anthropic.com/)
- [MediaPipe FaceMesh](https://google.github.io/mediapipe/solutions/face_mesh)
- [Supabase 문서](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🔄 업데이트 내역

- **v1.0.0**: 초기 API 연동 구조 구축
- **v1.1.0**: MediaPipe FaceMesh 통합
- **v1.2.0**: Claude API 연동
- **v1.3.0**: 통합 분석 서비스 완성

---

**⚠️ 주의**: 이 가이드를 따라 설정한 후에도 문제가 발생하면, 각 API 제공업체의 공식 문서를 참조하거나 지원팀에 문의하세요.
