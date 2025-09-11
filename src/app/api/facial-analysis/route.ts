import { NextRequest, NextResponse } from 'next/server';
import { facialAnalysisService, FacialAnalysisRequest } from '@/lib/api/facialAnalysisService';

export async function POST(request: NextRequest) {
  try {
    console.log('관상 분석 API 요청 시작');
    
    // FormData에서 데이터 추출
    const formData = await request.formData();
    const imageFile = formData.get('imageFile') as File;
    const nickname = formData.get('nickname') as string;
    const gender = formData.get('gender') as string;
    const birthDate = formData.get('birthDate') as string;
    
    // 입력 검증
    if (!imageFile) {
      return NextResponse.json(
        { 
          success: false,
          error: '이미지 파일이 필요합니다.' 
        },
        { status: 400 }
      );
    }
    
    // 이미지 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { 
          success: false,
          error: '지원하지 않는 이미지 형식입니다. JPEG, PNG, WebP만 지원합니다.' 
        },
        { status: 400 }
      );
    }
    
    // 이미지 파일 크기 검증 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { 
          success: false,
          error: '이미지 파일이 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.' 
        },
        { status: 400 }
      );
    }
    
    console.log('입력 검증 완료:', {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type,
      nickname: nickname || '익명',
      gender: gender || '미지정'
    });
    
    // 관상 분석 요청 데이터 구성
    const analysisRequest: FacialAnalysisRequest = {
      imageFile,
      nickname: nickname || '사용자',
      gender: gender || '미지정',
      birthDate: birthDate || undefined
    };
    
    // 관상 분석 수행
    console.log('관상 분석 시작...');
    const analysisResult = await facialAnalysisService.analyzeFacialFeatures(analysisRequest);
    console.log('관상 분석 완료:', {
      confidence: analysisResult.metadata.confidence,
      processingTime: analysisResult.metadata.processingTime,
      keywordsCount: analysisResult.mappedFeatures.keywords.length
    });
    
    // 응답 데이터 구성
    const response = {
      success: true,
      data: {
        // CompreFace 원본 데이터
        comprefaceData: {
          age: analysisResult.comprefaceData.age,
          gender: analysisResult.comprefaceData.gender,
          landmarks: analysisResult.comprefaceData.landmarks?.length || 0,
          pose: analysisResult.comprefaceData.pose,
          mask: analysisResult.comprefaceData.mask,
          bbox: analysisResult.comprefaceData.bbox
        },
        
        // 매핑된 관상 특징
        facialFeatures: {
          eyes: {
            size: analysisResult.mappedFeatures.eyes.size,
            shape: analysisResult.mappedFeatures.eyes.shape,
            characteristics: analysisResult.mappedFeatures.eyes.characteristics,
            confidence: analysisResult.mappedFeatures.eyes.confidence
          },
          nose: {
            bridge: analysisResult.mappedFeatures.nose.bridge,
            tip: analysisResult.mappedFeatures.nose.tip,
            characteristics: analysisResult.mappedFeatures.nose.characteristics,
            confidence: analysisResult.mappedFeatures.nose.confidence
          },
          mouth: {
            size: analysisResult.mappedFeatures.mouth.size,
            shape: analysisResult.mappedFeatures.mouth.shape,
            characteristics: analysisResult.mappedFeatures.mouth.characteristics,
            confidence: analysisResult.mappedFeatures.mouth.confidence
          },
          forehead: {
            width: analysisResult.mappedFeatures.forehead.width,
            height: analysisResult.mappedFeatures.forehead.height,
            characteristics: analysisResult.mappedFeatures.forehead.characteristics,
            confidence: analysisResult.mappedFeatures.forehead.confidence
          },
          chin: {
            shape: analysisResult.mappedFeatures.chin.shape,
            characteristics: analysisResult.mappedFeatures.chin.characteristics,
            confidence: analysisResult.mappedFeatures.chin.confidence
          },
          overall: {
            faceShape: analysisResult.mappedFeatures.overall.faceShape,
            symmetry: analysisResult.mappedFeatures.overall.symmetry,
            characteristics: analysisResult.mappedFeatures.overall.characteristics,
            confidence: analysisResult.mappedFeatures.overall.confidence
          }
        },
        
        // Claude AI 분석 결과
        claudeAnalysis: analysisResult.claudeAnalysis,
        
        // 키워드 및 요약
        keywords: analysisResult.mappedFeatures.keywords,
        loveCompatibility: analysisResult.mappedFeatures.loveCompatibility,
        summary: facialAnalysisService.generateSummary(analysisResult),
        
        // 분석 메타데이터
        metadata: analysisResult.metadata
      }
    };
    
    console.log('관상 분석 API 응답 완료');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('관상 분석 API 오류:', error);
    
    // 에러 타입에 따른 응답
    if (error instanceof Error) {
      if (error.message.includes('얼굴을 감지할 수 없습니다')) {
        return NextResponse.json(
          { 
            success: false,
            error: '얼굴을 감지할 수 없습니다. 더 명확한 얼굴 사진을 업로드해주세요.',
            details: error.message
          },
          { status: 400 }
        );
      }
      
      if (error.message.includes('CompreFace')) {
        return NextResponse.json(
          { 
            success: false,
            error: '얼굴 분석 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            details: error.message
          },
          { status: 503 }
        );
      }
      
      if (error.message.includes('Claude')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'AI 분석 서비스에 일시적인 문제가 발생했습니다. 기본 관상 해석을 제공합니다.',
            details: error.message
          },
          { status: 503 }
        );
      }
    }
    
    // 일반적인 서버 오류
    return NextResponse.json(
      { 
        success: false,
        error: '관상 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// OPTIONS 요청 처리 (CORS)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
