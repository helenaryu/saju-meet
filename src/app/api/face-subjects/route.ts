import { NextRequest, NextResponse } from 'next/server';
import { comprefaceService } from '@/lib/api/compreface';

export async function GET(request: NextRequest) {
  try {
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
      const subjects = await comprefaceService.listSubjects();
      
      return NextResponse.json({
        success: true,
        data: {
          subjects,
          count: subjects.length,
          message: `${subjects.length}개의 Subject를 찾았습니다.`
        }
      });

    } catch (comprefaceError) {
      console.error('Subject 목록 조회 실패:', comprefaceError);
      return NextResponse.json(
        { 
          error: 'Subject 목록 조회에 실패했습니다.',
          code: 'COMPREFACE_SUBJECT_LIST_FAILED',
          details: comprefaceError instanceof Error ? comprefaceError.message : String(comprefaceError)
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Subject 목록 API 오류:', error);
    return NextResponse.json(
      { error: 'Subject 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjectName, description } = body;

    if (!subjectName) {
      return NextResponse.json(
        { error: 'Subject 이름이 필요합니다.' },
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
      const result = await comprefaceService.createSubject(subjectName);
      
      return NextResponse.json({
        success: true,
        data: {
          subject: result.subject,
          description: description || '',
          message: `Subject '${subjectName}'이 성공적으로 생성되었습니다.`
        }
      });

    } catch (comprefaceError) {
      console.error('Subject 생성 실패:', comprefaceError);
      return NextResponse.json(
        { 
          error: 'Subject 생성에 실패했습니다.',
          code: 'COMPREFACE_SUBJECT_CREATE_FAILED',
          details: comprefaceError instanceof Error ? comprefaceError.message : String(comprefaceError)
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Subject 생성 API 오류:', error);
    return NextResponse.json(
      { error: 'Subject 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectName = searchParams.get('subjectName');

    if (!subjectName) {
      return NextResponse.json(
        { error: '삭제할 Subject 이름이 필요합니다.' },
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
      const result = await comprefaceService.deleteSubject(subjectName);
      
      return NextResponse.json({
        success: true,
        data: {
          subject: result.subject,
          message: `Subject '${subjectName}'이 성공적으로 삭제되었습니다.`
        }
      });

    } catch (comprefaceError) {
      console.error('Subject 삭제 실패:', comprefaceError);
      return NextResponse.json(
        { 
          error: 'Subject 삭제에 실패했습니다.',
          code: 'COMPREFACE_SUBJECT_DELETE_FAILED',
          details: comprefaceError instanceof Error ? comprefaceError.message : String(comprefaceError)
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Subject 삭제 API 오류:', error);
    return NextResponse.json(
      { error: 'Subject 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
