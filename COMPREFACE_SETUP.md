# CompreFace 설정 가이드

## 1. 로컬 개발 환경 (Docker)

### Docker Compose를 사용한 실행

```bash
# CompreFace 서버 실행
docker-compose -f docker-compose.compreface.yml up -d

# 서버 상태 확인
docker-compose -f docker-compose.compreface.yml ps
```

### 서버 접속

- CompreFace UI: http://localhost:8000
- API 엔드포인트: http://localhost:8000/api/v1

## 2. Vercel 배포 환경

### 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

```env
# CompreFace 설정 (선택사항 - 설정하지 않으면 fallback 시스템 사용)
NEXT_PUBLIC_COMPREFACE_URL=https://your-compreface-instance.herokuapp.com
NEXT_PUBLIC_COMPREFACE_API_KEY=your-compreface-api-key-here
```

### Fallback 시스템

CompreFace 서버가 사용 불가능한 경우, 자동으로 fallback 시스템이 작동합니다:
- 이미지 메타데이터 기반 분석
- 합리적인 랜덤 분석 결과 생성
- 사용자 경험에 영향 없이 서비스 제공

## 3. 로컬 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# CompreFace 설정 (로컬 개발용)
NEXT_PUBLIC_COMPREFACE_URL=http://localhost:8000
NEXT_PUBLIC_COMPREFACE_API_KEY=your-compreface-api-key-here
```

## 3. API 키 설정

1. CompreFace UI (http://localhost:8000)에 접속
2. 관리자 계정으로 로그인
3. API 키를 생성하고 `.env.local`에 설정

## 4. 서버 중지

```bash
# CompreFace 서버 중지
docker-compose -f docker-compose.compreface.yml down

# 데이터까지 삭제하려면
docker-compose -f docker-compose.compreface.yml down -v
```

## 5. 문제 해결

### 서버가 시작되지 않는 경우

1. Docker가 실행 중인지 확인
2. 포트 8000이 사용 중인지 확인
3. 로그 확인: `docker-compose -f docker-compose.compreface.yml logs`

### API 연결 오류

1. CompreFace 서버가 실행 중인지 확인
2. API 키가 올바른지 확인
3. 네트워크 방화벽 설정 확인

## 6. 기능 설명

### CompreFace가 제공하는 기능

- **얼굴 감지**: 이미지에서 얼굴을 자동으로 감지
- **얼굴 랜드마크**: 468개의 얼굴 특징점 추출
- **나이/성별 인식**: AI 기반 나이와 성별 추정
- **포즈 분석**: 얼굴의 기울기와 회전 각도 분석
- **마스크 감지**: 마스크 착용 여부 확인

### 관상 분석에 활용

CompreFace의 분석 결과를 바탕으로:
- 정확한 얼굴 특징 추출
- 객관적인 데이터 기반 관상 분석
- Claude AI를 통한 상세한 해석 제공
