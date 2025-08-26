# 🔌 외부 API 연동 설정 가이드

이 프로젝트는 관상/사주 기반 연애 성향 리포트를 자동으로 생성하기 위해 여러 외부 API를 연동합니다.

## 📋 필요한 API 키

### 1. Claude API (Anthropic)
- **용도**: GPT 역할로 관상/사주 키워드 기반 연애 리포트 자동 생성
- **가입 방법**: [Anthropic Console](https://console.anthropic.com/)에서 계정 생성
- **API 키 발급**: Console에서 API 키 생성
- **환경 변수**: `ANTHROPIC_API_KEY`

### 2. OpenAI API (RAG 시스템용)
- **용도**: 전통 문헌 벡터 임베딩 생성 및 RAG 시스템 구축
- **가입 방법**: [OpenAI Platform](https://platform.openai.com/)에서 계정 생성
- **API 키 발급**: API Keys 섹션에서 키 생성
- **환경 변수**: `OPENAI_API_KEY`

### 3. Supabase 설정
- **용도**: 사용자 인증, 데이터 저장, 벡터 검색
- **가입 방법**: [Supabase](https://supabase.com/)에서 프로젝트 생성
- **환경 변수**: 
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (벡터 검색용)

## 🚀 환경 변수 설정

### 1. 프로젝트 루트에 `.env.local` 파일 생성

```bash
# Claude API (Anthropic)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# OpenAI API (RAG 시스템용)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# 서비스 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 분석 설정
ANALYSIS_VERSION=2.0.0
MAX_IMAGE_SIZE=10485760  # 10MB
CONVERSATION_HISTORY_LIMIT=10
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
├── claude.ts              # Claude API 연동 (고도화됨)
├── saju.ts                # 사주 분석 로직
├── faceReading.ts         # MediaPipe 기반 관상 분석
├── integratedAnalysis.ts  # 통합 분석 서비스 (고도화됨)
└── knowledgeBase.ts       # RAG 시스템 (신규)
```

### 🔄 고도화된 데이터 흐름

1. **사용자 입력** → 사진 + 생년월일
2. **관상 분석** → MediaPipe FaceMesh로 얼굴 특징 추출
3. **사주 분석** → 생년월일 기반 오행 계산
4. **RAG 검색** → 전통 문헌에서 관련 내용 검색
5. **Claude AI** → 관상 + 사주 + 전통 문헌으로 고도화된 리포트 생성
6. **대화형 분석** → 사용자 질문에 대한 맥락 있는 답변
7. **통합 결과** → 클라이언트에 최종 리포트 반환

## 🆕 고도화된 기능

### 1. **RAG (Retrieval-Augmented Generation) 시스템**
- 전통 사주/관상 문헌을 벡터 데이터베이스에 저장
- 사용자 특성에 맞는 관련 문헌 자동 검색
- AI 분석에 전통 지혜 반영

### 2. **대화형 AI 분석**
- 이전 대화 맥락 기억
- 연속적인 질문-답변 가능
- 개인화된 상담 경험 제공

### 3. **고도화된 프롬프트 엔지니어링**
- 30년 경력 전문가 역할 부여
- 전통 이론과 현대 심리학 결합
- 구조화된 상세 분석 제공

### 4. **분석 메타데이터**
- 신뢰도 점수 계산
- 전통 문헌 활용도 추적
- 분석 버전 관리

## 🛡️ 보안 주의사항

### ✅ 권장사항
- API 키는 `.env.local`에만 저장
- `.env.local`을 `.gitignore`에 추가
- 프로덕션에서는 환경 변수 관리 서비스 사용
- Supabase RLS (Row Level Security) 활성화

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
- 고도화된 분석 결과 확인

### 3. 대화형 분석 테스트
- 분석 완료 후 추가 질문 입력
- 맥락 있는 답변 확인

### 4. 콘솔 로그 확인
브라우저 개발자 도구에서 API 호출 과정과 결과를 확인할 수 있습니다.

## 🚨 문제 해결

### Claude API 오류
```
Error: ANTHROPIC_API_KEY is not set
```
**해결**: `.env.local`에 `ANTHROPIC_API_KEY` 설정

### OpenAI API 오류
```
Error: OPENAI_API_KEY is not set
```
**해결**: `.env.local`에 `OPENAI_API_KEY` 설정

### Supabase 벡터 검색 오류
```
Error: Supabase vector search failed
```
**해결**: 
1. `SUPABASE_SERVICE_ROLE_KEY` 설정 확인
2. `pgvector` 확장 활성화 확인
3. 벡터 인덱스 생성 확인

### MediaPipe 오류
```
Error: FaceMesh 초기화 오류
```
**해결**: 인터넷 연결 확인, CDN 접근 가능 여부 확인

## 📚 추가 리소스

- [Anthropic API 문서](https://docs.anthropic.com/)
- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [Supabase Vector Search](https://supabase.com/docs/guides/ai/vector-embeddings)
- [MediaPipe FaceMesh](https://google.github.io/mediapipe/solutions/face_mesh)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🔄 업데이트 내역

- **v1.0.0**: 초기 API 연동 구조 구축
- **v1.1.0**: MediaPipe FaceMesh 통합
- **v1.2.0**: Claude API 연동
- **v1.3.0**: 통합 분석 서비스 완성
- **v2.0.0**: RAG 시스템 및 대화형 AI 고도화

---

**⚠️ 주의**: 이 가이드를 따라 설정한 후에도 문제가 발생하면, 각 API 제공업체의 공식 문서를 참조하거나 지원팀에 문의하세요.
