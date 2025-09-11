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
        embedding: faceDetection.embedding, // embedding 추가
        executionTime: faceDetection.execution_time, // 실행 시간 정보 추가
        features: {
          eyes: analyzeEyes(faceDetection.landmarks, faceDetection.bbox, faceDetection.pose),
          nose: analyzeNose(faceDetection.landmarks, faceDetection.bbox, faceDetection.pose),
          mouth: analyzeMouth(faceDetection.landmarks, faceDetection.bbox, faceDetection.pose),
          forehead: analyzeForehead(faceDetection.landmarks, faceDetection.bbox, faceDetection.pose),
          chin: analyzeChin(faceDetection.landmarks, faceDetection.bbox, faceDetection.pose),
          faceShape: analyzeFaceShape(faceDetection.landmarks, faceDetection.bbox, faceDetection.pose),
        },
        keywords: generateFaceKeywords(faceDetection),
        loveCompatibility: generateLoveCompatibility(faceDetection),
        personalityTraits: generatePersonalityTraits(faceDetection), // 성격 특성 추가
        confidence: calculateAnalysisConfidence(faceDetection), // 분석 신뢰도 추가
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

// 눈 분석 함수 (향상된 버전 - 포즈 정보 포함)
function analyzeEyes(landmarks: Array<{x: number, y: number}>, bbox: any, pose?: any) {
  if (!landmarks || landmarks.length === 0) {
    return {
      size: 'medium',
      shape: 'round',
      characteristics: ['기본적인 눈 형태로 안정적임']
    };
  }

  // 눈 크기 계산 (실제 랜드마크 기반)
  const eyeSize = calculateEyeSize(landmarks, bbox);
  
  // 눈 모양 분석 (실제 랜드마크 기반)
  const eyeShape = calculateEyeShape(landmarks, bbox);
  
  // 포즈 기반 추가 분석
  const poseCharacteristics = analyzeEyePose(pose);
  
  return {
    size: eyeSize,
    shape: eyeShape,
    characteristics: [
      eyeSize === 'large' ? '큰 눈으로 감정 표현이 풍부함' : 
      eyeSize === 'small' ? '작은 눈으로 집중력이 뛰어남' : '적당한 크기의 눈으로 균형감 있음',
      eyeShape === 'almond' ? '아몬드 모양으로 매력적임' : 
      eyeShape === 'narrow' ? '좁은 눈으로 예리함' : '둥근 모양으로 순수함',
      ...poseCharacteristics
    ]
  };
}

// 눈 크기 계산 함수
function calculateEyeSize(landmarks: Array<{x: number, y: number}>, bbox: any): 'small' | 'medium' | 'large' {
  if (landmarks.length < 2) return 'medium';
  
  // 얼굴 크기 대비 눈 크기 비율 계산
  const faceWidth = bbox.x_max - bbox.x_min;
  const faceHeight = bbox.y_max - bbox.y_min;
  const faceArea = faceWidth * faceHeight;
  
  // 간단한 눈 영역 계산 (실제로는 더 정교한 랜드마크 분석 필요)
  const eyeArea = faceArea * 0.05; // 대략적인 비율
  
  if (eyeArea > faceArea * 0.08) return 'large';
  if (eyeArea < faceArea * 0.03) return 'small';
  return 'medium';
}

// 눈 모양 계산 함수
function calculateEyeShape(landmarks: Array<{x: number, y: number}>, bbox: any): 'round' | 'almond' | 'narrow' {
  if (landmarks.length < 2) return 'round';
  
  // 눈의 가로세로 비율 계산
  const faceWidth = bbox.x_max - bbox.x_min;
  const faceHeight = bbox.y_max - bbox.y_min;
  
  // 간단한 비율 기반 분류
  const ratio = faceWidth / faceHeight;
  
  if (ratio > 1.2) return 'narrow';
  if (ratio < 0.8) return 'round';
  return 'almond';
}

// 포즈 기반 눈 분석
function analyzeEyePose(pose?: any): string[] {
  if (!pose) return [];
  
  const characteristics: string[] = [];
  
  // Yaw (좌우 회전) 분석
  if (Math.abs(pose.yaw) < 5) {
    characteristics.push('정면을 향한 시선으로 자신감 있음');
  } else if (pose.yaw > 5) {
    characteristics.push('오른쪽을 보는 시선으로 적극적임');
  } else {
    characteristics.push('왼쪽을 보는 시선으로 신중함');
  }
  
  // Pitch (상하 회전) 분석
  if (Math.abs(pose.pitch) < 5) {
    characteristics.push('수평한 시선으로 균형감 있음');
  } else if (pose.pitch > 5) {
    characteristics.push('위를 보는 시선으로 긍정적임');
  } else {
    characteristics.push('아래를 보는 시선으로 겸손함');
  }
  
  return characteristics;
}

// 코 분석 함수 (향상된 버전 - 포즈 정보 포함)
function analyzeNose(landmarks: Array<{x: number, y: number}>, bbox: any, pose?: any) {
  if (!landmarks || landmarks.length === 0) {
    return {
      size: 'medium',
      shape: 'straight',
      characteristics: ['기본적인 코 형태로 안정적임']
    };
  }

  const noseSize = calculateNoseSize(landmarks, bbox);
  const noseShape = calculateNoseShape(landmarks, bbox);
  const poseCharacteristics = analyzeNosePose(pose);
  
  return {
    size: noseSize,
    shape: noseShape,
    characteristics: [
      noseShape === 'straight' ? '직선적인 코로 정직하고 솔직함' : 
      noseShape === 'curved' ? '곡선적인 코로 부드럽고 따뜻함' : '넓은 코로 관대하고 여유로움',
      noseSize === 'large' ? '넓은 코로 관대하고 여유로움' : 
      noseSize === 'small' ? '작은 코로 섬세하고 정확함' : '적당한 크기로 균형감 있음',
      ...poseCharacteristics
    ]
  };
}

// 코 크기 계산 함수
function calculateNoseSize(landmarks: Array<{x: number, y: number}>, bbox: any): 'small' | 'medium' | 'large' {
  const faceWidth = bbox.x_max - bbox.x_min;
  const faceHeight = bbox.y_max - bbox.y_min;
  const faceArea = faceWidth * faceHeight;
  
  // 코 영역 대략적 계산
  const noseArea = faceArea * 0.03;
  
  if (noseArea > faceArea * 0.05) return 'large';
  if (noseArea < faceArea * 0.02) return 'small';
  return 'medium';
}

// 코 모양 계산 함수
function calculateNoseShape(landmarks: Array<{x: number, y: number}>, bbox: any): 'straight' | 'curved' | 'wide' {
  // 간단한 비율 기반 분류
  const faceWidth = bbox.x_max - bbox.x_min;
  const faceHeight = bbox.y_max - bbox.y_min;
  const ratio = faceWidth / faceHeight;
  
  if (ratio > 1.1) return 'wide';
  if (ratio < 0.9) return 'curved';
  return 'straight';
}

// 포즈 기반 코 분석
function analyzeNosePose(pose?: any): string[] {
  if (!pose) return [];
  
  const characteristics: string[] = [];
  
  // Roll (좌우 기울기) 분석
  if (Math.abs(pose.roll) < 5) {
    characteristics.push('균형잡힌 코로 안정적임');
  } else {
    characteristics.push('자연스러운 기울기로 개성적임');
  }
  
  return characteristics;
}

// 입 분석 함수 (향상된 버전 - 포즈 정보 포함)
function analyzeMouth(landmarks: Array<{x: number, y: number}>, bbox: any, pose?: any) {
  if (!landmarks || landmarks.length === 0) {
    return {
      size: 'medium',
      shape: 'full',
      characteristics: ['기본적인 입 형태로 안정적임']
    };
  }

  const mouthSize = calculateMouthSize(landmarks, bbox);
  const mouthShape = calculateMouthShape(landmarks, bbox);
  const poseCharacteristics = analyzeMouthPose(pose);
  
  return {
    size: mouthSize,
    shape: mouthShape,
    characteristics: [
      mouthSize === 'large' ? '큰 입으로 소통 능력이 뛰어남' : 
      mouthSize === 'small' ? '작은 입으로 신중하고 조용함' : '적당한 크기로 균형감 있음',
      mouthShape === 'full' ? '두꺼운 입술로 감정적이고 따뜻함' : 
      mouthShape === 'thin' ? '얇은 입술로 섬세하고 정확함' : '넓은 입으로 활발함',
      ...poseCharacteristics
    ]
  };
}

// 입 크기 계산 함수
function calculateMouthSize(landmarks: Array<{x: number, y: number}>, bbox: any): 'small' | 'medium' | 'large' {
  const faceWidth = bbox.x_max - bbox.x_min;
  const faceHeight = bbox.y_max - bbox.y_min;
  const faceArea = faceWidth * faceHeight;
  
  const mouthArea = faceArea * 0.02;
  
  if (mouthArea > faceArea * 0.04) return 'large';
  if (mouthArea < faceArea * 0.01) return 'small';
  return 'medium';
}

// 입 모양 계산 함수
function calculateMouthShape(landmarks: Array<{x: number, y: number}>, bbox: any): 'thin' | 'full' | 'wide' {
  const faceWidth = bbox.x_max - bbox.x_min;
  const faceHeight = bbox.y_max - bbox.y_min;
  const ratio = faceWidth / faceHeight;
  
  if (ratio > 1.2) return 'wide';
  if (ratio < 0.8) return 'thin';
  return 'full';
}

// 포즈 기반 입 분석
function analyzeMouthPose(pose?: any): string[] {
  if (!pose) return [];
  
  const characteristics: string[] = [];
  
  // Pitch (상하 회전) 분석 - 입꼬리 방향
  if (pose.pitch > 0) {
    characteristics.push('입꼬리가 올라가 긍정적이고 친근함');
  } else if (pose.pitch < 0) {
    characteristics.push('입꼬리가 내려가 신중하고 진지함');
  } else {
    characteristics.push('수평한 입꼬리로 균형감 있음');
  }
  
  return characteristics;
}

// 이마 분석 함수 (향상된 버전 - 포즈 정보 포함)
function analyzeForehead(landmarks: Array<{x: number, y: number}>, bbox: any, pose?: any) {
  if (!landmarks || landmarks.length === 0) {
    return {
      width: 'medium',
      height: 'medium',
      characteristics: ['기본적인 이마 형태로 안정적임']
    };
  }

  const foreheadWidth = calculateForeheadWidth(landmarks, bbox);
  const foreheadHeight = calculateForeheadHeight(landmarks, bbox);
  const poseCharacteristics = analyzeForeheadPose(pose);
  
  return {
    width: foreheadWidth,
    height: foreheadHeight,
    characteristics: [
      foreheadWidth === 'wide' ? '넓은 이마로 지적 능력이 뛰어남' : 
      foreheadWidth === 'narrow' ? '좁은 이마로 집중력이 뛰어남' : '적당한 크기로 균형감 있음',
      foreheadHeight === 'high' ? '높은 이마로 창의성이 풍부함' : 
      foreheadHeight === 'low' ? '낮은 이마로 실용적임' : '적당한 높이로 안정적임',
      ...poseCharacteristics
    ]
  };
}

// 이마 너비 계산 함수
function calculateForeheadWidth(landmarks: Array<{x: number, y: number}>, bbox: any): 'narrow' | 'medium' | 'wide' {
  const faceWidth = bbox.x_max - bbox.x_min;
  const faceHeight = bbox.y_max - bbox.y_min;
  const ratio = faceWidth / faceHeight;
  
  if (ratio > 1.1) return 'wide';
  if (ratio < 0.9) return 'narrow';
  return 'medium';
}

// 이마 높이 계산 함수
function calculateForeheadHeight(landmarks: Array<{x: number, y: number}>, bbox: any): 'low' | 'medium' | 'high' {
  const faceWidth = bbox.x_max - bbox.x_min;
  const faceHeight = bbox.y_max - bbox.y_min;
  const ratio = faceHeight / faceWidth;
  
  if (ratio > 1.2) return 'high';
  if (ratio < 0.8) return 'low';
  return 'medium';
}

// 포즈 기반 이마 분석
function analyzeForeheadPose(pose?: any): string[] {
  if (!pose) return [];
  
  const characteristics: string[] = [];
  
  // Roll (좌우 기울기) 분석
  if (Math.abs(pose.roll) < 3) {
    characteristics.push('균형잡힌 이마로 안정적임');
  } else {
    characteristics.push('자연스러운 기울기로 개성적임');
  }
  
  return characteristics;
}

// 턱 분석 함수 (향상된 버전 - 포즈 정보 포함)
function analyzeChin(landmarks: Array<{x: number, y: number}>, bbox: any, pose?: any) {
  if (!landmarks || landmarks.length === 0) {
    return {
      shape: 'rounded',
      characteristics: ['기본적인 턱 형태로 안정적임']
    };
  }

  const chinShape = calculateChinShape(landmarks, bbox);
  const poseCharacteristics = analyzeChinPose(pose);
  
  return {
    shape: chinShape,
    characteristics: [
      chinShape === 'square' ? '각진 턱으로 의지력과 결단력이 강함' : 
      chinShape === 'pointed' ? '뾰족한 턱으로 예리하고 섬세함' : '둥근 턱으로 부드럽고 친근함',
      ...poseCharacteristics
    ]
  };
}

// 턱 모양 계산 함수
function calculateChinShape(landmarks: Array<{x: number, y: number}>, bbox: any): 'pointed' | 'rounded' | 'square' {
  const faceWidth = bbox.x_max - bbox.x_min;
  const faceHeight = bbox.y_max - bbox.y_min;
  const ratio = faceWidth / faceHeight;
  
  if (ratio > 1.1) return 'square';
  if (ratio < 0.9) return 'pointed';
  return 'rounded';
}

// 포즈 기반 턱 분석
function analyzeChinPose(pose?: any): string[] {
  if (!pose) return [];
  
  const characteristics: string[] = [];
  
  // Pitch (상하 회전) 분석
  if (pose.pitch > 0) {
    characteristics.push('턱이 올라가 자신감 있음');
  } else if (pose.pitch < 0) {
    characteristics.push('턱이 내려가 겸손함');
  } else {
    characteristics.push('수평한 턱으로 균형감 있음');
  }
  
  return characteristics;
}

// 얼굴 형태 분석 함수 (향상된 버전 - 포즈 정보 포함)
function analyzeFaceShape(landmarks: Array<{x: number, y: number}>, bbox: any, pose?: any) {
  if (!landmarks || landmarks.length === 0) {
    return {
      type: 'oval',
      characteristics: ['기본적인 얼굴 형태로 안정적임']
    };
  }

  const shape = calculateFaceShape(landmarks, bbox);
  const poseCharacteristics = analyzeFaceShapePose(pose);
  
  return {
    type: shape,
    characteristics: [
      shape === 'oval' ? '계란형 얼굴로 균형감이 뛰어남' :
      shape === 'round' ? '둥근 얼굴로 친근하고 따뜻함' :
      shape === 'square' ? '각진 얼굴로 강인하고 신뢰할 수 있음' :
      shape === 'heart' ? '하트형 얼굴로 매력적이고 감성적' :
      shape === 'diamond' ? '다이아몬드형 얼굴로 독특하고 개성적' :
      '긴 얼굴로 우아하고 세련됨',
      ...poseCharacteristics
    ]
  };
}

// 얼굴 형태 계산 함수
function calculateFaceShape(landmarks: Array<{x: number, y: number}>, bbox: any): 'oval' | 'round' | 'square' | 'heart' | 'diamond' | 'long' {
  const faceWidth = bbox.x_max - bbox.x_min;
  const faceHeight = bbox.y_max - bbox.y_min;
  const ratio = faceWidth / faceHeight;
  
  if (ratio > 1.1) return 'round';
  if (ratio < 0.7) return 'long';
  if (ratio > 0.9 && ratio < 1.1) return 'oval';
  if (ratio > 0.8 && ratio < 0.9) return 'heart';
  if (ratio > 1.0 && ratio < 1.1) return 'square';
  return 'diamond';
}

// 포즈 기반 얼굴 형태 분석
function analyzeFaceShapePose(pose?: any): string[] {
  if (!pose) return [];
  
  const characteristics: string[] = [];
  
  // 전체적인 포즈 균형 분석
  const totalDeviation = Math.abs(pose.yaw) + Math.abs(pose.pitch) + Math.abs(pose.roll);
  
  if (totalDeviation < 10) {
    characteristics.push('균형잡힌 포즈로 안정적이고 신뢰할 수 있음');
  } else if (totalDeviation < 20) {
    characteristics.push('자연스러운 포즈로 친근함');
  } else {
    characteristics.push('개성적인 포즈로 독특한 매력');
  }
  
  return characteristics;
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

// 성격 특성 생성 함수 (새로 추가)
function generatePersonalityTraits(faceData: any): string[] {
  const traits: string[] = [];
  
  // 나이 기반 성격 특성
  if (faceData.age) {
    const age = (faceData.age.low + faceData.age.high) / 2;
    if (age < 25) {
      traits.push('활발함', '호기심');
    } else if (age < 35) {
      traits.push('성숙함', '안정감');
    } else {
      traits.push('지혜', '경험');
    }
  }
  
  // 성별 기반 성격 특성
  if (faceData.gender && faceData.gender.probability > 0.8) {
    if (faceData.gender.value === 'male') {
      traits.push('리더십', '결단력');
    } else {
      traits.push('감성', '포용력');
    }
  }
  
  // 포즈 기반 성격 특성
  if (faceData.pose) {
    if (Math.abs(faceData.pose.yaw) < 5) {
      traits.push('자신감', '정직함');
    }
    if (Math.abs(faceData.pose.pitch) < 5) {
      traits.push('균형감', '안정성');
    }
    if (Math.abs(faceData.pose.roll) < 5) {
      traits.push('신뢰성', '일관성');
    }
  }
  
  // 마스크 기반 성격 특성
  if (faceData.mask && faceData.mask.value === 'without_mask') {
    traits.push('자연스러움', '진정성');
  }
  
  return traits.slice(0, 6); // 최대 6개
}

// 분석 신뢰도 계산 함수 (새로 추가)
function calculateAnalysisConfidence(faceData: any): number {
  let confidence = 0.5; // 기본 신뢰도
  
  // 얼굴 감지 신뢰도
  if (faceData.bbox && faceData.bbox.probability) {
    confidence += faceData.bbox.probability * 0.3;
  }
  
  // 나이 추정 신뢰도
  if (faceData.age && faceData.age.probability) {
    confidence += faceData.age.probability * 0.2;
  }
  
  // 성별 추정 신뢰도
  if (faceData.gender && faceData.gender.probability) {
    confidence += faceData.gender.probability * 0.2;
  }
  
  // 마스크 감지 신뢰도
  if (faceData.mask && faceData.mask.probability) {
    confidence += faceData.mask.probability * 0.1;
  }
  
  // 포즈 안정성
  if (faceData.pose) {
    const poseStability = 1 - (Math.abs(faceData.pose.yaw) + Math.abs(faceData.pose.pitch) + Math.abs(faceData.pose.roll)) / 180;
    confidence += Math.max(0, poseStability) * 0.2;
  }
  
  return Math.min(confidence, 1.0); // 최대 1.0
}
