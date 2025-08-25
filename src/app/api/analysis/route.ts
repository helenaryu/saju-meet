import { NextRequest, NextResponse } from 'next/server';
import { integratedAnalysisService, IntegratedAnalysisRequest } from '@/lib/api/integratedAnalysis';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // 폼 데이터에서 필요한 정보 추출
    const nickname = formData.get('nickname') as string;
    const gender = formData.get('gender') as string;
    const birthDate = formData.get('birthDate') as string;
    const birthTime = formData.get('birthTime') as string;
    const imageFile = formData.get('imageFile') as File;

    // 필수 필드 검증 (이미지는 반드시 필요)
    if (!imageFile) {
      return NextResponse.json(
        { error: '이미지 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 다른 필드들은 선택사항으로 처리
    const analysisRequest: IntegratedAnalysisRequest = {
      nickname: nickname || '사용자',
      gender: gender || '미지정',
      birthDate: birthDate || new Date().toISOString().split('T')[0],
      birthTime: birthTime || '00:00',
      imageFile
    };

    // 이미지 파일 검증
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '유효한 이미지 파일이 아닙니다.' },
        { status: 400 }
      );
    }



    console.log('통합 분석 요청:', analysisRequest);

    // 통합 분석 실행
    const analysisResult = await integratedAnalysisService.performIntegratedAnalysis(analysisRequest);

    // 분석 결과 반환
    return NextResponse.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('API 오류:', error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false 
      },
      { status: 500 }
    );
  }
}

// GET 요청 처리 (분석 상태 확인 등)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('id');

    if (!analysisId) {
      return NextResponse.json(
        { error: '분석 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // TODO: Supabase에서 분석 결과 조회
    // 현재는 더미 응답 반환
    return NextResponse.json({
      success: true,
      data: {
        status: 'completed',
        message: '분석이 완료되었습니다.'
      }
    });

  } catch (error) {
    console.error('GET API 오류:', error);
    
    return NextResponse.json(
      { 
        error: '분석 결과 조회에 실패했습니다.',
        success: false 
      },
      { status: 500 }
    );
  }
}
