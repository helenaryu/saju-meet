import { comprefaceService, CompatibilityResult } from './compreface';

// URL 유틸리티 함수
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  
  return 'http://localhost:3000';
};

export interface FaceRegistrationRequest {
  userId: string;
  imageFile: File;
}

export interface FaceRegistrationResponse {
  success: boolean;
  imageId: string;
  subject: string;
  faceData: any;
  message: string;
}

export interface FaceRecognitionRequest {
  imageFile: File;
}

export interface FaceRecognitionResponse {
  success: boolean;
  matches: Array<{
    subject: string;
    similarity: number;
    userId: string | null;
  }>;
  faceData: any;
  message: string;
}

export interface FaceVerificationRequest {
  targetImageId: string;
  imageFile: File;
}

export interface FaceVerificationResponse {
  success: boolean;
  targetImageId: string;
  similarity: number;
  isMatch: boolean;
  faceData: any;
  message: string;
}

export interface FaceCompatibilityRequest {
  user1ImageId: string;
  user2ImageFile: File;
  analysisType?: 'compatibility' | 'similarity';
}

export interface FaceCompatibilityResponse {
  success: boolean;
  analysisType: string;
  compatibility?: any;
  similarity?: any;
  recommendation?: any;
  message: string;
}

export interface SubjectManagementRequest {
  subjectName: string;
  description?: string;
}

export interface SubjectManagementResponse {
  success: boolean;
  subject: string;
  description?: string;
  message: string;
}

export class FaceRecognitionService {
  private isInitialized = false;

  constructor() {
    this.isInitialized = true;
  }

  /**
   * 사용자 얼굴 등록
   */
  async registerUserFace(request: FaceRegistrationRequest): Promise<FaceRegistrationResponse> {
    try {
      const formData = new FormData();
      formData.append('image', request.imageFile);
      formData.append('userId', request.userId);
      formData.append('action', 'register');

      const response = await fetch(`${getBaseUrl()}/api/face-recognition`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '얼굴 등록에 실패했습니다.');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '얼굴 등록에 실패했습니다.');
      }

      return {
        success: true,
        imageId: result.data.imageId,
        subject: result.data.subject,
        faceData: result.data.faceData,
        message: result.data.message,
      };
    } catch (error) {
      console.error('얼굴 등록 오류:', error);
      throw error;
    }
  }

  /**
   * 얼굴 인식 (등록된 사용자 찾기)
   */
  async recognizeFace(request: FaceRecognitionRequest): Promise<FaceRecognitionResponse> {
    try {
      const formData = new FormData();
      formData.append('image', request.imageFile);
      formData.append('action', 'recognize');

      const response = await fetch(`${getBaseUrl()}/api/face-recognition`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '얼굴 인식에 실패했습니다.');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '얼굴 인식에 실패했습니다.');
      }

      return {
        success: true,
        matches: result.data.matches,
        faceData: result.data.faceData,
        message: result.data.message,
      };
    } catch (error) {
      console.error('얼굴 인식 오류:', error);
      throw error;
    }
  }

  /**
   * 얼굴 검증 (두 얼굴이 같은 사람인지 확인)
   */
  async verifyFace(request: FaceVerificationRequest): Promise<FaceVerificationResponse> {
    try {
      const formData = new FormData();
      formData.append('image', request.imageFile);
      formData.append('targetImageId', request.targetImageId);
      formData.append('action', 'verify');

      const response = await fetch(`${getBaseUrl()}/api/face-recognition`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '얼굴 검증에 실패했습니다.');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '얼굴 검증에 실패했습니다.');
      }

      return {
        success: true,
        targetImageId: result.data.targetImageId,
        similarity: result.data.similarity,
        isMatch: result.data.isMatch,
        faceData: result.data.faceData,
        message: result.data.message,
      };
    } catch (error) {
      console.error('얼굴 검증 오류:', error);
      throw error;
    }
  }

  /**
   * 얼굴 궁합 분석
   */
  async analyzeCompatibility(request: FaceCompatibilityRequest): Promise<FaceCompatibilityResponse> {
    try {
      const formData = new FormData();
      formData.append('user1ImageId', request.user1ImageId);
      formData.append('user2Image', request.user2ImageFile);
      formData.append('analysisType', request.analysisType || 'compatibility');

      const response = await fetch(`${getBaseUrl()}/api/face-compatibility`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '궁합 분석에 실패했습니다.');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '궁합 분석에 실패했습니다.');
      }

      return {
        success: true,
        analysisType: result.data.analysisType,
        compatibility: result.data.compatibility,
        similarity: result.data.similarity,
        recommendation: result.data.recommendation,
        message: result.data.message,
      };
    } catch (error) {
      console.error('궁합 분석 오류:', error);
      throw error;
    }
  }

  /**
   * Subject 생성
   */
  async createSubject(request: SubjectManagementRequest): Promise<SubjectManagementResponse> {
    try {
      const response = await fetch(`${getBaseUrl()}/api/face-subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectName: request.subjectName,
          description: request.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Subject 생성에 실패했습니다.');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Subject 생성에 실패했습니다.');
      }

      return {
        success: true,
        subject: result.data.subject,
        description: result.data.description,
        message: result.data.message,
      };
    } catch (error) {
      console.error('Subject 생성 오류:', error);
      throw error;
    }
  }

  /**
   * Subject 목록 조회
   */
  async listSubjects(): Promise<string[]> {
    try {
      const response = await fetch(`${getBaseUrl()}/api/face-subjects`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Subject 목록 조회에 실패했습니다.');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Subject 목록 조회에 실패했습니다.');
      }

      return result.data.subjects;
    } catch (error) {
      console.error('Subject 목록 조회 오류:', error);
      throw error;
    }
  }

  /**
   * Subject 삭제
   */
  async deleteSubject(subjectName: string): Promise<SubjectManagementResponse> {
    try {
      const response = await fetch(`${getBaseUrl()}/api/face-subjects?subjectName=${encodeURIComponent(subjectName)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Subject 삭제에 실패했습니다.');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Subject 삭제에 실패했습니다.');
      }

      return {
        success: true,
        subject: result.data.subject,
        message: result.data.message,
      };
    } catch (error) {
      console.error('Subject 삭제 오류:', error);
      throw error;
    }
  }

  /**
   * 사용자 얼굴 삭제
   */
  async deleteUserFace(imageId: string): Promise<boolean> {
    try {
      const result = await comprefaceService.deleteUserFace(imageId);
      return true;
    } catch (error) {
      console.error('사용자 얼굴 삭제 오류:', error);
      throw error;
    }
  }

  /**
   * CompreFace 서버 상태 확인
   */
  async checkServerHealth(): Promise<boolean> {
    try {
      return await comprefaceService.checkHealth();
    } catch (error) {
      console.error('서버 상태 확인 오류:', error);
      return false;
    }
  }

  /**
   * 얼굴 embedding 추출
   */
  async getFaceEmbedding(imageFile: File): Promise<number[]> {
    try {
      return await comprefaceService.getFaceEmbedding(imageFile);
    } catch (error) {
      console.error('Embedding 추출 오류:', error);
      throw error;
    }
  }

  /**
   * 두 embedding 간의 유사도 계산
   */
  calculateEmbeddingSimilarity(embedding1: number[], embedding2: number[]): number {
    try {
      return comprefaceService.calculateEmbeddingSimilarity(embedding1, embedding2);
    } catch (error) {
      console.error('Embedding 유사도 계산 오류:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
export const faceRecognitionService = new FaceRecognitionService();
