import { NextRequest, NextResponse } from 'next/server';
import { comprefaceService } from '@/lib/api/compreface';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: '이미지 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // CompreFace 서버 상태 확인
    const isHealthy = await comprefaceService.checkHealth();
    
    if (!isHealthy) {
      return NextResponse.json(
        { 
          error: 'CompreFace 서버가 사용 불가능합니다. 서버를 시작하고 API 키를 설정해주세요.',
          code: 'COMPREFACE_UNAVAILABLE'
        },
        { status: 503 }
      );
    }

    try {
      // CompreFace를 사용한 실제 얼굴 분석
      const detectionResult = await comprefaceService.detectFaces(imageFile);
      
      if (!detectionResult.result || detectionResult.result.length === 0) {
        return NextResponse.json(
          { 
            error: '이미지에서 얼굴을 감지할 수 없습니다. 얼굴이 명확히 보이는 사진을 업로드해주세요.',
            code: 'NO_FACE_DETECTED'
          },
          { status: 400 }
        );
      }

      const faceDetection = detectionResult.result[0];
      
      // CompreFace 결과를 관상 분석에 적합한 형태로 변환
      const faceData = {
        faceId: faceDetection.face_id,
        bbox: faceDetection.bbox,
        landmarks: faceDetection.landmarks,
        age: faceDetection.age,
        gender: faceDetection.gender,
        mask: faceDetection.mask,
        pose: faceDetection.pose,
        features: {
          eyes: analyzeEyes(faceDetection.landmarks, faceDetection.bbox),
          nose: analyzeNose(faceDetection.landmarks, faceDetection.bbox),
          mouth: analyzeMouth(faceDetection.landmarks, faceDetection.bbox),
          forehead: analyzeForehead(faceDetection.landmarks, faceDetection.bbox),
          chin: analyzeChin(faceDetection.landmarks, faceDetection.bbox),
          faceShape: analyzeFaceShape(faceDetection.landmarks, faceDetection.bbox),
        },
        keywords: generateFaceKeywords(faceDetection),
        loveCompatibility: generateLoveCompatibility(faceDetection),
      };

      return NextResponse.json({
        success: true,
        data: faceData,
      });

    } catch (comprefaceError) {
      console.error('CompreFace 분석 실패:', comprefaceError);
      return NextResponse.json(
        { 
          error: '얼굴 분석에 실패했습니다. CompreFace 서버를 확인해주세요.',
          code: 'COMPREFACE_ANALYSIS_FAILED',
          details: comprefaceError instanceof Error ? comprefaceError.message : String(comprefaceError)
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('얼굴 분석 API 오류:', error);
    return NextResponse.json(
      { error: '얼굴 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 눈 분석 함수
function analyzeEyes(landmarks: Array<{x: number, y: number}>, bbox: any) {
  // MediaPipe 468 포인트 중 눈 관련 랜드마크 사용
  // 실제 구현에서는 정확한 랜드마크 인덱스 사용 필요
  const eyeIndices = {
    leftEye: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
    rightEye: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
  };

  // 눈 크기 계산 (더미)
  const eyeSize = Math.random() > 0.5 ? 'large' : 'medium';
  
  // 눈 모양 분석 (더미)
  const eyeShape = Math.random() > 0.5 ? 'almond' : 'round';
  
  return {
    size: eyeSize,
    shape: eyeShape,
    characteristics: [
      eyeSize === 'large' ? '큰 눈으로 감정 표현이 풍부함' : '적당한 크기의 눈으로 균형감 있음',
      eyeShape === 'almond' ? '아몬드 모양으로 매력적임' : '둥근 모양으로 순수함'
    ]
  };
}

// 코 분석 함수
function analyzeNose(landmarks: Array<{x: number, y: number}>, bbox: any) {
  const noseSize = Math.random() > 0.5 ? 'medium' : 'large';
  const noseShape = Math.random() > 0.5 ? 'straight' : 'curved';
  
  return {
    size: noseSize,
    shape: noseShape,
    characteristics: [
      noseShape === 'straight' ? '직선적인 코로 정직하고 솔직함' : '곡선적인 코로 부드럽고 따뜻함',
      noseSize === 'large' ? '넓은 코로 관대하고 여유로움' : '적당한 크기로 균형감 있음'
    ]
  };
}

// 입 분석 함수
function analyzeMouth(landmarks: Array<{x: number, y: number}>, bbox: any) {
  const mouthSize = Math.random() > 0.5 ? 'medium' : 'large';
  const mouthShape = Math.random() > 0.5 ? 'full' : 'thin';
  
  return {
    size: mouthSize,
    shape: mouthShape,
    characteristics: [
      mouthSize === 'large' ? '큰 입으로 소통 능력이 뛰어남' : '적당한 크기로 신중함',
      mouthShape === 'full' ? '두꺼운 입술로 감정적이고 따뜻함' : '얇은 입술로 섬세하고 정확함'
    ]
  };
}

// 이마 분석 함수
function analyzeForehead(landmarks: Array<{x: number, y: number}>, bbox: any) {
  const foreheadWidth = Math.random() > 0.5 ? 'wide' : 'medium';
  const foreheadHeight = Math.random() > 0.5 ? 'high' : 'medium';
  
  return {
    width: foreheadWidth,
    height: foreheadHeight,
    characteristics: [
      foreheadWidth === 'wide' ? '넓은 이마로 지적 능력이 뛰어남' : '적당한 크기로 균형감 있음',
      foreheadHeight === 'high' ? '높은 이마로 창의성이 풍부함' : '적당한 높이로 안정적임'
    ]
  };
}

// 턱 분석 함수
function analyzeChin(landmarks: Array<{x: number, y: number}>, bbox: any) {
  const chinShape = Math.random() > 0.5 ? 'rounded' : 'square';
  
  return {
    shape: chinShape,
    characteristics: [
      chinShape === 'square' ? '각진 턱으로 의지력과 결단력이 강함' : '둥근 턱으로 부드럽고 친근함'
    ]
  };
}

// 얼굴 형태 분석 함수
function analyzeFaceShape(landmarks: Array<{x: number, y: number}>, bbox: any) {
  const shapes = ['oval', 'round', 'square', 'heart', 'diamond'];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  
  return {
    type: shape,
    characteristics: [
      shape === 'oval' ? '계란형 얼굴로 균형감이 뛰어남' :
      shape === 'round' ? '둥근 얼굴로 친근하고 따뜻함' :
      shape === 'square' ? '각진 얼굴로 강인하고 신뢰할 수 있음' :
      shape === 'heart' ? '하트형 얼굴로 매력적이고 감성적' :
      '다이아몬드형 얼굴로 독특하고 개성적'
    ]
  };
}

// 얼굴 키워드 생성 함수
function generateFaceKeywords(faceData: any): string[] {
  const keywords: string[] = [];
  
  // 나이 기반 키워드
  if (faceData.age < 25) {
    keywords.push('젊음', '활력');
  } else if (faceData.age < 35) {
    keywords.push('성숙함', '안정감');
  } else {
    keywords.push('지혜', '경험');
  }
  
  // 성별 기반 키워드
  if (faceData.gender === 'male') {
    keywords.push('남성적', '강인함');
  } else {
    keywords.push('여성적', '우아함');
  }
  
  // 포즈 기반 키워드
  if (faceData.pose) {
    if (Math.abs(faceData.pose.yaw) < 10) {
      keywords.push('정면성', '자신감');
    }
    if (Math.abs(faceData.pose.pitch) < 10) {
      keywords.push('균형감', '안정성');
    }
  }
  
  // 마스크 기반 키워드
  if (faceData.mask && faceData.mask.value < 0.5) {
    keywords.push('자연스러움', '진정성');
  }
  
  return keywords.slice(0, 5); // 최대 5개
}

// 연애 궁합 키워드 생성 함수
function generateLoveCompatibility(faceData: any): string[] {
  const compatibility: string[] = [];
  
  // 나이 기반 궁합
  if (faceData.age < 25) {
    compatibility.push('젊은 에너지로 활발한 연애');
  } else if (faceData.age < 35) {
    compatibility.push('성숙한 사랑과 안정적인 관계');
  } else {
    compatibility.push('깊이 있는 사랑과 이해');
  }
  
  // 성별 기반 궁합
  if (faceData.gender === 'male') {
    compatibility.push('리더십 있는 연애 스타일');
  } else {
    compatibility.push('따뜻하고 포용력 있는 사랑');
  }
  
  // 포즈 기반 궁합
  if (faceData.pose && Math.abs(faceData.pose.yaw) < 10) {
    compatibility.push('정직하고 솔직한 소통');
  }
  
  return compatibility;
}
