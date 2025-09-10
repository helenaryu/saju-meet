import { NextRequest, NextResponse } from 'next/server';
import { integratedAnalysisService } from '@/lib/api/integratedAnalysis';
import { claudeService } from '@/lib/api/claude';

// Supabase 클라이언트를 선택적으로 생성
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'your_supabase_url_here' || 
      supabaseAnonKey === 'your_supabase_anon_key_here') {
    return null;
  }
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Supabase 클라이언트 생성 실패:', error);
    return null;
  }
};

// CompreFace 데이터를 처리하는 함수
async function handleFaceReadingAnalysis(faceData: any) {
  try {
    // Claude에게 CompreFace 분석 결과를 전달하여 관상 해석 요청
    const claudePrompt = `
당신은 전문 관상학자입니다. CompreFace로 분석된 얼굴 데이터를 바탕으로 정확하고 상세한 관상 분석을 제공해주세요.

**분석된 얼굴 데이터:**
- 나이: ${faceData.age}세
- 성별: ${faceData.gender}
- 얼굴 특징:
  - 눈: ${JSON.stringify(faceData.features.eyes)}
  - 코: ${JSON.stringify(faceData.features.nose)}
  - 입: ${JSON.stringify(faceData.features.mouth)}
  - 이마: ${JSON.stringify(faceData.features.forehead)}
  - 턱: ${JSON.stringify(faceData.features.chin)}
  - 얼굴 형태: ${JSON.stringify(faceData.features.faceShape)}
- 포즈 정보: ${JSON.stringify(faceData.pose)}
- 마스크 정보: ${JSON.stringify(faceData.mask)}

**기본 키워드:** ${faceData.basicKeywords?.join(', ') || '없음'}
**기본 연애 궁합:** ${faceData.basicLoveCompatibility?.join(', ') || '없음'}

위 데이터를 바탕으로 다음을 제공해주세요:

1. **주요 키워드 (5-7개)**: 관상의 핵심 특징을 나타내는 키워드
2. **상세 해석**: 관상학적 관점에서의 종합적인 해석 (200-300자)
3. **연애 궁합**: 연애와 관계에서의 특징과 궁합 (3-4개 항목)

JSON 형태로 응답해주세요:
{
  "keywords": ["키워드1", "키워드2", ...],
  "interpretation": "상세한 관상 해석",
  "loveCompatibility": ["궁합1", "궁합2", ...]
}
`;

    const claudeResponse = await claudeService.generateResponse(claudePrompt);
    
    // Claude 응답을 JSON으로 파싱
    let claudeAnalysis;
    try {
      claudeAnalysis = JSON.parse(claudeResponse);
    } catch (parseError) {
      console.error('Claude 응답 파싱 오류:', parseError);
      // 파싱 실패 시 기본값 사용
      claudeAnalysis = {
        keywords: faceData.basicKeywords || [],
        interpretation: '관상 분석을 완료했습니다.',
        loveCompatibility: faceData.basicLoveCompatibility || []
      };
    }

    return NextResponse.json({
      success: true,
      data: claudeAnalysis
    });

  } catch (error) {
    console.error('CompreFace 관상 분석 오류:', error);
    return NextResponse.json(
      { 
        error: '관상 분석 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    
    // JSON 요청인지 확인 (CompreFace 데이터 처리용)
    if (contentType?.includes('application/json')) {
      const body = await request.json();
      
      if (body.type === 'face_reading') {
        return handleFaceReadingAnalysis(body.data);
      }
    }
    
    // 기존 FormData 처리 (통합 분석용)
    const formData = await request.formData();
    
    // 기본 정보 추출
    const nickname = formData.get('nickname') as string;
    const gender = formData.get('gender') as string;
    const birthDate = formData.get('birthDate') as string;
    const birthTime = formData.get('birthTime') as string;
    const imageFile = formData.get('imageFile') as File;

    // 사용자 인증 확인 (Supabase가 설정된 경우에만)
    const supabase = createSupabaseClient();
    let userId: string | null = null;

    if (supabase) {
      try {
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          const { data: { user }, error } = await supabase.auth.getUser(token);
          
          if (error || !user) {
            console.log('인증 실패:', error);
          } else {
            userId = user.id;
          }
        }
      } catch (error) {
        console.error('인증 확인 중 오류:', error);
      }
    } else {
      console.log('Supabase가 설정되지 않아 인증을 건너뜁니다.');
    }

    // 입력 검증 (이미지만 필수)
    if (!imageFile) {
      return NextResponse.json(
        { error: '이미지 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 다른 필드들은 기본값으로 설정
    const finalNickname = nickname || '사용자';
    const finalGender = gender || '미지정';
    const finalBirthDate = birthDate || new Date().toISOString().split('T')[0];
    const finalBirthTime = birthTime || '00:00';

    // 파일 크기 검증 (10MB 제한)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '이미지 파일 크기는 10MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: '지원하지 않는 이미지 형식입니다. JPEG, PNG, WebP만 지원합니다.' },
        { status: 400 }
      );
    }

    console.log('분석 요청 시작:', {
      nickname: finalNickname,
      gender: finalGender,
      birthDate: finalBirthDate,
      birthTime: finalBirthTime,
      imageSize: imageFile.size,
      imageType: imageFile.type,
      userId
    });

    // 고도화된 통합 분석 수행
    const analysisResult = await integratedAnalysisService.performIntegratedAnalysis({
      nickname: finalNickname,
      gender: finalGender,
      birthDate: finalBirthDate,
      birthTime: finalBirthTime,
      imageFile
    });

    // 분석 결과를 데이터베이스에 저장 (Supabase가 설정된 경우에만)
    if (userId && supabase) {
      try {
        await integratedAnalysisService.saveAnalysisResult(
          userId,
          {
            nickname: finalNickname,
            gender: finalGender,
            birthDate: finalBirthDate,
            birthTime: finalBirthTime,
            imageFile
          },
          analysisResult
        );
      } catch (error) {
        console.error('분석 결과 저장 중 오류:', error);
        // 저장 실패해도 분석 결과는 반환
      }
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      data: analysisResult,
      message: '분석이 성공적으로 완료되었습니다.'
    });

  } catch (error) {
    console.error('분석 API 오류:', error);
    
    return NextResponse.json(
      { 
        error: '분석 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// 대화형 분석을 위한 PUT 메서드
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message } = body;

    // 사용자 인증 확인 (Supabase가 설정된 경우에만)
    const supabase = createSupabaseClient();
    if (supabase) {
      try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
          return NextResponse.json(
            { error: '인증이 필요합니다.' },
            { status: 401 }
          );
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
          return NextResponse.json(
            { error: '인증이 필요합니다.' },
            { status: 401 }
          );
        }
      } catch (error) {
        console.error('인증 오류:', error);
        return NextResponse.json(
          { error: '인증 토큰이 유효하지 않습니다.' },
          { status: 401 }
        );
      }
    } else {
      console.log('Supabase가 설정되지 않아 인증을 건너뜁니다.');
    }

    // 입력 검증
    if (!conversationId || !message) {
      return NextResponse.json(
        { error: '대화 ID와 메시지가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('대화형 분석 요청:', { conversationId, message });

    // 대화형 분석 수행
    const conversationResult = await integratedAnalysisService.continueConversation(
      conversationId,
      message
    );

    // 성공 응답
    return NextResponse.json({
      success: true,
      data: conversationResult,
      message: '대화형 분석이 완료되었습니다.'
    });

  } catch (error) {
    console.error('대화형 분석 API 오류:', error);
    
    return NextResponse.json(
      { 
        error: '대화형 분석 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// 분석 히스토리 조회를 위한 GET 메서드
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    // 사용자 인증 확인 (Supabase가 설정된 경우에만)
    const supabase = createSupabaseClient();
    if (supabase) {
      try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
          return NextResponse.json(
            { error: '인증이 필요합니다.' },
            { status: 401 }
          );
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
          return NextResponse.json(
            { error: '인증이 필요합니다.' },
            { status: 401 }
          );
        }
      } catch (error) {
        console.error('인증 오류:', error);
        return NextResponse.json(
          { error: '인증 토큰이 유효하지 않습니다.' },
          { status: 401 }
        );
      }
    } else {
      console.log('Supabase가 설정되지 않아 인증을 건너뜁니다.');
    }

    if (conversationId) {
      // 특정 대화 히스토리 조회
      const analysisHistory = integratedAnalysisService.getAnalysisHistory(conversationId);
      
      if (!analysisHistory) {
        return NextResponse.json(
          { error: '해당 대화를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: analysisHistory
      });
    } else {
      // 모든 분석 히스토리 조회
      const allHistory = integratedAnalysisService.getAllAnalysisHistory();
      
      return NextResponse.json({
        success: true,
        data: allHistory,
        count: allHistory.length
      });
    }

  } catch (error) {
    console.error('분석 히스토리 조회 오류:', error);
    
    return NextResponse.json(
      { 
        error: '분석 히스토리 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
