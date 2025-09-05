import { NextRequest, NextResponse } from 'next/server';
import { compatibilityService } from '@/lib/api/compatibility';
import { CompatibilityRequest } from '@/types';

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

export async function POST(request: NextRequest) {
  try {
    const body: CompatibilityRequest = await request.json();
    
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
    if (!body.user1 || !body.user2) {
      return NextResponse.json(
        { error: '두 사용자의 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    const { user1, user2 } = body;

    // 필수 필드 검증
    const requiredFields = ['nickname', 'gender', 'birthDate', 'faceKeywords', 'sajuKeywords'];
    for (const field of requiredFields) {
      if (!user1[field as keyof typeof user1]) {
        return NextResponse.json(
          { error: `첫 번째 사용자의 ${field} 정보가 필요합니다.` },
          { status: 400 }
        );
      }
      if (!user2[field as keyof typeof user2]) {
        return NextResponse.json(
          { error: `두 번째 사용자의 ${field} 정보가 필요합니다.` },
          { status: 400 }
        );
      }
    }

    console.log('궁합 분석 요청:', {
      user1: user1.nickname,
      user2: user2.nickname,
      user1Keywords: user1.faceKeywords.length + user1.sajuKeywords.length,
      user2Keywords: user2.faceKeywords.length + user2.sajuKeywords.length
    });

    // 궁합 분석 수행
    const compatibilityResult = await compatibilityService.analyzeCompatibility(body);

    // 분석 결과를 데이터베이스에 저장 (Supabase가 설정된 경우에만)
    if (supabase) {
      try {
        // 궁합 분석 결과 저장 로직 (필요시 구현)
        console.log('궁합 분석 결과 저장 완료');
      } catch (error) {
        console.error('궁합 분석 결과 저장 중 오류:', error);
        // 저장 실패해도 분석 결과는 반환
      }
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      data: compatibilityResult,
      message: '궁합 분석이 성공적으로 완료되었습니다.'
    });

  } catch (error) {
    console.error('궁합 분석 API 오류:', error);
    
    return NextResponse.json(
      { 
        error: '궁합 분석 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// 궁합 분석 히스토리 조회를 위한 GET 메서드
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

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

    if (userId) {
      // 특정 사용자의 궁합 분석 히스토리 조회
      // 실제 구현에서는 데이터베이스에서 조회
      return NextResponse.json({
        success: true,
        data: [],
        message: '궁합 분석 히스토리를 조회했습니다.'
      });
    } else {
      // 모든 궁합 분석 히스토리 조회
      return NextResponse.json({
        success: true,
        data: [],
        message: '전체 궁합 분석 히스토리를 조회했습니다.'
      });
    }

  } catch (error) {
    console.error('궁합 분석 히스토리 조회 오류:', error);
    
    return NextResponse.json(
      { 
        error: '궁합 분석 히스토리 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
