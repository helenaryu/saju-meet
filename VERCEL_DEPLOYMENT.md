# Vercel 배포 가이드

## 1. Vercel 프로젝트 설정

### 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

#### 필수 환경 변수
```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Claude API 설정
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

#### 선택적 환경 변수 (CompreFace)
```env
# CompreFace 설정 (설정하지 않으면 fallback 시스템 사용)
NEXT_PUBLIC_COMPREFACE_URL=https://your-compreface-instance.herokuapp.com
NEXT_PUBLIC_COMPREFACE_API_KEY=your-compreface-api-key-here
```

### 환경 변수 설정 방법

1. Vercel 대시보드에 로그인
2. 프로젝트 선택
3. Settings → Environment Variables
4. 위의 환경 변수들을 추가
5. Production, Preview, Development 환경 모두에 적용

## 2. 배포 과정

### 자동 배포
- GitHub에 코드를 푸시하면 자동으로 배포됩니다
- `main` 브랜치에 푸시하면 Production 환경에 배포
- 다른 브랜치에 푸시하면 Preview 환경에 배포

### 수동 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

## 3. 기능 설명

### CompreFace 통합
- **우선순위**: CompreFace 서버가 사용 가능하면 실제 얼굴 분석 수행
- **Fallback**: CompreFace 서버가 사용 불가능하면 이미지 메타데이터 기반 분석
- **사용자 경험**: 어떤 경우든 일관된 서비스 제공

### Fallback 시스템 특징
- 이미지 파일 크기, 해상도, 파일명을 기반으로 분석
- 합리적인 랜덤 결과 생성
- 관상학적으로 의미 있는 키워드와 해석 제공
- Claude AI를 통한 상세한 해석

## 4. 문제 해결

### CompreFace 연결 오류
- 환경 변수가 올바르게 설정되었는지 확인
- CompreFace 서버가 실행 중인지 확인
- 네트워크 연결 상태 확인

### Fallback 시스템 사용 확인
- 브라우저 개발자 도구의 콘솔에서 로그 확인
- "CompreFace 서버 사용 불가, fallback 시스템 사용" 메시지 확인

### 성능 최적화
- 이미지 파일 크기 제한 (10MB)
- 지원 형식: JPEG, PNG, WebP
- Vercel Functions 타임아웃 고려

## 5. 모니터링

### 로그 확인
- Vercel 대시보드의 Functions 탭에서 로그 확인
- 에러 발생 시 자동으로 fallback 시스템으로 전환

### 성능 메트릭
- Vercel Analytics를 통한 사용자 행동 분석
- Functions 실행 시간 및 오류율 모니터링

## 6. 보안 고려사항

### API 키 보안
- 환경 변수에만 API 키 저장
- 코드에 하드코딩하지 않음
- 정기적인 API 키 로테이션

### 이미지 처리
- 업로드된 이미지는 메모리에서만 처리
- 서버에 이미지 저장하지 않음
- 개인정보 보호 고려

## 7. 확장성

### CompreFace 서버 확장
- Heroku, AWS, GCP 등에 CompreFace 서버 배포
- 로드 밸런싱을 통한 성능 향상
- CDN을 통한 전역 접근성 향상

### 대안 서비스
- Google Vision API
- AWS Rekognition
- Azure Face API
- 기타 얼굴 인식 서비스
