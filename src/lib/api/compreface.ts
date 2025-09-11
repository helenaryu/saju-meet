import axios from 'axios';

export interface CompreFaceConfig {
  baseUrl: string;
  apiKey: string;
  subject: string;
}

export interface CompreFaceDetection {
  subject?: string;
  similarity?: number;
  face_id?: string;
  bbox: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
    probability: number;
  };
  landmarks: Array<{
    x: number;
    y: number;
  }>;
  age?: {
    low: number;
    high: number;
    probability: number;
  };
  gender?: {
    value: string;
    probability: number;
  };
  mask?: {
    value: string;
    probability: number;
  };
  pose?: {
    pitch: number;
    yaw: number;
    roll: number;
  };
  embedding?: number[];
  execution_time?: {
    age?: number;
    gender?: number;
    detector?: number;
    calculator?: number;
    mask?: number;
  };
}

export interface CompreFaceResponse {
  result: CompreFaceDetection[];
  plugins_versions?: {
    age?: string;
    gender?: string;
    detector?: string;
    calculator?: string;
    mask?: string;
  };
}

export interface FaceEmbedding {
  embedding: number[];
  similarity?: number;
  subject?: string;
}

export interface EmbeddingResponse {
  result: FaceEmbedding[];
}

export interface CompatibilityResult {
  similarity: number;
  ageCompatibility: {
    score: number;
    description: string;
  };
  facialHarmony: {
    score: number;
    description: string;
  };
  overallCompatibility: number;
}

export interface SubjectInfo {
  subject: string;
  image_id?: string;
  deleted?: number;
}

export class CompreFaceService {
  private config: CompreFaceConfig;

  constructor(config: CompreFaceConfig) {
    this.config = config;
  }

  /**
   * 얼굴 감지 및 분석 (향상된 버전 - embedding 포함)
   */
  async detectFaces(imageFile: File): Promise<CompreFaceResponse> {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/detection/detect`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': this.config.apiKey,
          },
          params: {
            subject: this.config.subject,
            limit: 1, // 최대 1개 얼굴만 감지
            status: true,
            face_plugins: 'age,gender,landmarks,mask,pose,calculator', // embedding을 위한 calculator 추가
            det_prob_threshold: '0.8', // 더 정확한 얼굴 감지를 위해 임계값 설정
          },
          timeout: 15000, // 15초 타임아웃 (embedding 계산 시간 고려)
          validateStatus: (status) => status < 500, // 500 미만은 성공으로 간주
        }
      );

      // 응답이 HTML인지 확인 (에러 페이지)
      if (typeof response.data === 'string' && response.data.includes('<!doctype')) {
        throw new Error('CompreFace 서버가 HTML 응답을 반환했습니다.');
      }

      return response.data;
    } catch (error) {
      console.error('CompreFace API 오류:', error);
      throw new Error('얼굴 분석에 실패했습니다.');
    }
  }

  /**
   * 얼굴 embedding 추출
   */
  async getFaceEmbedding(imageFile: File): Promise<number[]> {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/detection/detect`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': this.config.apiKey,
          },
          params: {
            face_plugins: 'calculator', // embedding만 추출
            status: true,
          },
          timeout: 10000,
        }
      );

      if (response.data.result && response.data.result.length > 0) {
        return response.data.result[0].embedding || [];
      }
      
      throw new Error('얼굴에서 embedding을 추출할 수 없습니다.');
    } catch (error) {
      console.error('Embedding 추출 오류:', error);
      throw new Error('얼굴 embedding 추출에 실패했습니다.');
    }
  }

  /**
   * 두 embedding 간의 유사도 계산 (코사인 유사도)
   */
  calculateEmbeddingSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embedding 차원이 일치하지 않습니다.');
    }

    const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * 얼굴 등록 (사용자 프로필용)
   */
  async addUserFace(userId: string, imageFile: File): Promise<SubjectInfo> {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/recognition/faces`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': this.config.apiKey,
          },
          params: {
            subject: `user_${userId}`,
            det_prob_threshold: '0.8',
          },
          timeout: 10000,
        }
      );

      return {
        subject: `user_${userId}`,
        image_id: response.data.image_id,
      };
    } catch (error) {
      console.error('CompreFace 얼굴 등록 오류:', error);
      throw new Error('얼굴 등록에 실패했습니다.');
    }
  }

  /**
   * 사용자 얼굴 삭제
   */
  async deleteUserFace(imageId: string): Promise<SubjectInfo> {
    try {
      const response = await axios.delete(
        `${this.config.baseUrl}/api/v1/recognition/faces/${imageId}`,
        {
          headers: {
            'x-api-key': this.config.apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('CompreFace 얼굴 삭제 오류:', error);
      throw new Error('얼굴 삭제에 실패했습니다.');
    }
  }

  /**
   * 얼굴 인식 (등록된 얼굴과 비교)
   */
  async recognizeFace(imageFile: File): Promise<CompreFaceResponse> {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/recognition/recognize`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': this.config.apiKey,
          },
          params: {
            limit: 1,
            prediction_count: 5, // 상위 5개 매치 반환
            status: true,
            face_plugins: 'age,gender,landmarks,mask,pose,calculator',
            det_prob_threshold: '0.8',
          },
          timeout: 15000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('CompreFace 얼굴 인식 오류:', error);
      throw new Error('얼굴 인식에 실패했습니다.');
    }
  }

  /**
   * 얼굴 검증 (두 얼굴이 같은 사람인지 확인)
   */
  async verifyFaces(imageId: string, imageFile: File): Promise<CompreFaceResponse> {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/recognition/faces/${imageId}/verify`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': this.config.apiKey,
          },
          params: {
            face_plugins: 'age,gender,landmarks,pose,calculator',
            det_prob_threshold: '0.8',
            status: true,
          },
          timeout: 15000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('CompreFace 얼굴 검증 오류:', error);
      throw new Error('얼굴 검증에 실패했습니다.');
    }
  }

  /**
   * 두 이미지 간 얼굴 검증
   */
  async verifyTwoFaces(sourceImageFile: File, targetImageFile: File): Promise<CompreFaceResponse> {
    const formData = new FormData();
    formData.append('source_image', sourceImageFile);
    formData.append('target_image', targetImageFile);

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/verification/verify`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': this.config.apiKey,
          },
          params: {
            face_plugins: 'age,gender,landmarks,pose,calculator',
            det_prob_threshold: '0.8',
            status: true,
          },
          timeout: 15000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('CompreFace 두 얼굴 검증 오류:', error);
      throw new Error('두 얼굴 검증에 실패했습니다.');
    }
  }

  /**
   * 얼굴 궁합 분석
   */
  async analyzeCompatibility(user1ImageId: string, user2ImageFile: File): Promise<CompatibilityResult> {
    try {
      const verificationResult = await this.verifyFaces(user1ImageId, user2ImageFile);
      
      if (!verificationResult.result || verificationResult.result.length === 0) {
        throw new Error('얼굴 검증 결과를 가져올 수 없습니다.');
      }

      const faceData = verificationResult.result[0];
      const similarity = faceData.similarity || 0;

      // 나이 궁합 분석
      const ageCompatibility = this.analyzeAgeCompatibility(faceData);
      
      // 얼굴 조화 분석
      const facialHarmony = this.analyzeFacialHarmony(faceData);

      // 전체 궁합 점수 계산
      const overallCompatibility = this.calculateOverallCompatibility(
        similarity,
        ageCompatibility.score,
        facialHarmony.score
      );

      return {
        similarity,
        ageCompatibility,
        facialHarmony,
        overallCompatibility,
      };
    } catch (error) {
      console.error('궁합 분석 오류:', error);
      throw new Error('궁합 분석에 실패했습니다.');
    }
  }

  /**
   * 나이 궁합 분석
   */
  private analyzeAgeCompatibility(faceData: CompreFaceDetection): { score: number; description: string } {
    if (!faceData.age) {
      return { score: 0.5, description: '나이 정보가 없어 분석할 수 없습니다.' };
    }

    const age = (faceData.age.low + faceData.age.high) / 2;
    let score = 0.5;
    let description = '';

    if (age < 25) {
      score = 0.8;
      description = '젊은 에너지로 활발한 궁합을 보입니다.';
    } else if (age < 35) {
      score = 0.9;
      description = '성숙하면서도 활력 있는 완벽한 궁합입니다.';
    } else if (age < 45) {
      score = 0.85;
      description = '안정적이고 깊이 있는 궁합을 보입니다.';
    } else {
      score = 0.7;
      description = '경험과 지혜가 어우러진 궁합입니다.';
    }

    return { score, description };
  }

  /**
   * 얼굴 조화 분석
   */
  private analyzeFacialHarmony(faceData: CompreFaceDetection): { score: number; description: string } {
    let score = 0.5;
    let description = '';

    // 포즈 분석
    if (faceData.pose) {
      const yaw = Math.abs(faceData.pose.yaw);
      const pitch = Math.abs(faceData.pose.pitch);
      const roll = Math.abs(faceData.pose.roll);

      if (yaw < 10 && pitch < 10 && roll < 10) {
        score += 0.2;
        description += '정면을 향한 자연스러운 포즈로 신뢰감이 높습니다. ';
      }
    }

    // 성별 분석
    if (faceData.gender && faceData.gender.probability > 0.8) {
      score += 0.1;
      description += '명확한 성별 특성이 잘 드러납니다. ';
    }

    // 마스크 분석
    if (faceData.mask && faceData.mask.value === 'without_mask') {
      score += 0.1;
      description += '자연스러운 얼굴 표정으로 진정성이 느껴집니다. ';
    }

    // 나이 신뢰도
    if (faceData.age && faceData.age.probability > 0.8) {
      score += 0.1;
      description += '나이 추정이 정확하여 분석 신뢰도가 높습니다. ';
    }

    return { 
      score: Math.min(score, 1.0), 
      description: description || '기본적인 얼굴 조화를 보입니다.' 
    };
  }

  /**
   * 전체 궁합 점수 계산
   */
  private calculateOverallCompatibility(
    similarity: number,
    ageScore: number,
    facialScore: number
  ): number {
    // 가중치: 유사도 50%, 나이 궁합 25%, 얼굴 조화 25%
    return (similarity * 0.5) + (ageScore * 0.25) + (facialScore * 0.25);
  }

  /**
   * Subject 관리 - 새 Subject 생성
   */
  async createSubject(subjectName: string): Promise<SubjectInfo> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/recognition/subjects`,
        { subject: subjectName },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Subject 생성 오류:', error);
      throw new Error('Subject 생성에 실패했습니다.');
    }
  }

  /**
   * Subject 목록 조회
   */
  async listSubjects(): Promise<string[]> {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/api/v1/recognition/subjects/`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
          },
        }
      );

      return response.data.subjects || [];
    } catch (error) {
      console.error('Subject 목록 조회 오류:', error);
      throw new Error('Subject 목록 조회에 실패했습니다.');
    }
  }

  /**
   * Subject 삭제
   */
  async deleteSubject(subjectName: string): Promise<SubjectInfo> {
    try {
      const response = await axios.delete(
        `${this.config.baseUrl}/api/v1/recognition/subjects/${subjectName}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Subject 삭제 오류:', error);
      throw new Error('Subject 삭제에 실패했습니다.');
    }
  }

  /**
   * CompreFace 서버 상태 확인
   */
  async checkHealth(): Promise<boolean> {
    try {
      // 기본 URL이 잘못된 경우 바로 false 반환
      if (this.config.baseUrl === 'https://compreface-api.herokuapp.com' || 
          this.config.apiKey === 'your-api-key-here' ||
          this.config.baseUrl === 'http://localhost:8000') {
        console.log('❌ CompreFace 설정이 필요합니다.');
        console.log('📋 설정 방법:');
        console.log('1. Docker Desktop 설치: https://www.docker.com/products/docker-desktop/');
        console.log('2. CompreFace 실행: ./setup-compreface.sh');
        console.log('3. .env.local에 API 키 설정:');
        console.log('   NEXT_PUBLIC_COMPREFACE_URL=http://localhost:8000');
        console.log('   NEXT_PUBLIC_COMPREFACE_API_KEY=your-actual-api-key');
        return false;
      }

      // CompreFace 1.2.0 health check endpoint
      const response = await axios.get(`${this.config.baseUrl}/api/v1/health`, {
        timeout: 5000, // 5초 타임아웃
        validateStatus: (status) => status < 500, // 500 미만은 성공으로 간주
        headers: {
          'x-api-key': this.config.apiKey,
        }
      });
      
      // CompreFace 1.2.0 returns { "status": "ok" } on success
      const isHealthy = response.status === 200 && 
        (response.data?.status === 'ok' || response.data?.status === 'OK');
      
      if (isHealthy) {
        console.log('✅ CompreFace 1.2.0 서버가 정상 작동 중');
      } else {
        console.log('⚠️ CompreFace 서버 응답이 예상과 다름:', response.data);
      }
      
      return isHealthy;
    } catch (error) {
      console.log('❌ CompreFace 서버 연결 실패:', error instanceof Error ? error.message : String(error));
      console.log('📋 해결 방법:');
      console.log('1. CompreFace 서버가 실행 중인지 확인');
      console.log('2. API 키가 올바른지 확인');
      console.log('3. 방화벽 설정 확인');
      return false;
    }
  }
}

// 기본 설정
const defaultConfig: CompreFaceConfig = {
  baseUrl: process.env.NEXT_PUBLIC_COMPREFACE_URL || 'https://compreface-api.herokuapp.com',
  apiKey: process.env.NEXT_PUBLIC_COMPREFACE_API_KEY || 'your-api-key-here',
  subject: 'saju-meet',
};

// 싱글톤 인스턴스
export const comprefaceService = new CompreFaceService(defaultConfig);
