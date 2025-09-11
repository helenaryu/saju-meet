import { NextRequest, NextResponse } from 'next/server';
import { comprefaceService } from '@/lib/api/compreface';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const userId = formData.get('userId') as string;
    const action = formData.get('action') as string; // 'register', 'recognize', 'verify'

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
      let result;

      switch (action) {
        case 'register':
          if (!userId) {
            return NextResponse.json(
              { error: '사용자 ID가 필요합니다.' },
              { status: 400 }
            );
          }
          result = await handleFaceRegistration(userId, imageFile);
          break;

        case 'recognize':
          result = await handleFaceRecognition(imageFile);
          break;

        case 'verify':
          const targetImageId = formData.get('targetImageId') as string;
          if (!targetImageId) {
            return NextResponse.json(
              { error: '검증할 이미지 ID가 필요합니다.' },
              { status: 400 }
            );
          }
          result = await handleFaceVerification(targetImageId, imageFile);
          break;

        default:
          return NextResponse.json(
            { error: '유효하지 않은 액션입니다. register, recognize, verify 중 하나를 선택해주세요.' },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        data: result,
      });

    } catch (comprefaceError) {
      console.error('CompreFace 처리 실패:', comprefaceError);
      return NextResponse.json(
        { 
          error: '얼굴 처리에 실패했습니다. CompreFace 서버를 확인해주세요.',
          code: 'COMPREFACE_PROCESSING_FAILED',
          details: comprefaceError instanceof Error ? comprefaceError.message : String(comprefaceError)
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('얼굴 인식 API 오류:', error);
    return NextResponse.json(
      { error: '얼굴 인식 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 얼굴 등록 처리
async function handleFaceRegistration(userId: string, imageFile: File) {
  try {
    // 먼저 얼굴이 감지되는지 확인
    const detectionResult = await comprefaceService.detectFaces(imageFile);
    
    if (!detectionResult.result || detectionResult.result.length === 0) {
      throw new Error('이미지에서 얼굴을 감지할 수 없습니다.');
    }

    // 얼굴 등록
    const registrationResult = await comprefaceService.addUserFace(userId, imageFile);
    
    return {
      action: 'register',
      userId,
      imageId: registrationResult.image_id,
      subject: registrationResult.subject,
      message: '얼굴이 성공적으로 등록되었습니다.',
      faceData: {
        bbox: detectionResult.result[0].bbox,
        age: detectionResult.result[0].age,
        gender: detectionResult.result[0].gender,
        pose: detectionResult.result[0].pose,
        embedding: detectionResult.result[0].embedding,
      }
    };
  } catch (error) {
    console.error('얼굴 등록 오류:', error);
    throw new Error('얼굴 등록에 실패했습니다.');
  }
}

// 얼굴 인식 처리
async function handleFaceRecognition(imageFile: File) {
  try {
    const recognitionResult = await comprefaceService.recognizeFace(imageFile);
    
    if (!recognitionResult.result || recognitionResult.result.length === 0) {
      return {
        action: 'recognize',
        matches: [],
        message: '등록된 얼굴과 일치하는 사람을 찾을 수 없습니다.'
      };
    }

    const faceData = recognitionResult.result[0];
    const matches = faceData.subjects || [];

    return {
      action: 'recognize',
      matches: matches.map((match: any) => ({
        subject: match.subject,
        similarity: match.similarity,
        userId: match.subject?.replace('user_', '') || null,
      })),
      faceData: {
        bbox: faceData.bbox,
        age: faceData.age,
        gender: faceData.gender,
        pose: faceData.pose,
        embedding: faceData.embedding,
      },
      message: matches.length > 0 ? 
        `${matches.length}명의 일치하는 사용자를 찾았습니다.` : 
        '일치하는 사용자를 찾을 수 없습니다.'
    };
  } catch (error) {
    console.error('얼굴 인식 오류:', error);
    throw new Error('얼굴 인식에 실패했습니다.');
  }
}

// 얼굴 검증 처리
async function handleFaceVerification(targetImageId: string, imageFile: File) {
  try {
    const verificationResult = await comprefaceService.verifyFaces(targetImageId, imageFile);
    
    if (!verificationResult.result || verificationResult.result.length === 0) {
      throw new Error('얼굴 검증 결과를 가져올 수 없습니다.');
    }

    const faceData = verificationResult.result[0];
    const similarity = faceData.similarity || 0;

    return {
      action: 'verify',
      targetImageId,
      similarity,
      isMatch: similarity > 0.7, // 70% 이상 유사하면 일치로 판단
      faceData: {
        bbox: faceData.bbox,
        age: faceData.age,
        gender: faceData.gender,
        pose: faceData.pose,
        embedding: faceData.embedding,
      },
      message: similarity > 0.7 ? 
        '두 얼굴이 같은 사람으로 판단됩니다.' : 
        '두 얼굴이 다른 사람으로 판단됩니다.'
    };
  } catch (error) {
    console.error('얼굴 검증 오류:', error);
    throw new Error('얼굴 검증에 실패했습니다.');
  }
}
