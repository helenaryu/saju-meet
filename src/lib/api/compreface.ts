import axios from 'axios';

export interface CompreFaceConfig {
  baseUrl: string;
  apiKey: string;
  subject: string;
}

export interface CompreFaceDetection {
  subject: string;
  similarity: number;
  face_id: string;
  bbox: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
  };
  landmarks: Array<{
    x: number;
    y: number;
  }>;
  age: number;
  gender: string;
  mask: {
    value: number;
    confidence: number;
  };
  pose: {
    pitch: number;
    yaw: number;
    roll: number;
  };
}

export interface CompreFaceResponse {
  result: CompreFaceDetection[];
}

export class CompreFaceService {
  private config: CompreFaceConfig;

  constructor(config: CompreFaceConfig) {
    this.config = config;
  }

  /**
   * 얼굴 감지 및 분석
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
            face_plugins: 'age,gender,landmarks,mask,pose', // 모든 플러그인 활성화
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('CompreFace API 오류:', error);
      throw new Error('얼굴 분석에 실패했습니다.');
    }
  }

  /**
   * 얼굴 등록 (참조용)
   */
  async addFace(imageFile: File, subject: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/faces`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': this.config.apiKey,
          },
          params: {
            subject: subject,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('CompreFace 얼굴 등록 오류:', error);
      throw new Error('얼굴 등록에 실패했습니다.');
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
            subject: this.config.subject,
            limit: 1,
            status: true,
            face_plugins: 'age,gender,landmarks,mask,pose',
          },
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
  async verifyFaces(imageFile1: File, imageFile2: File): Promise<any> {
    const formData = new FormData();
    formData.append('file1', imageFile1);
    formData.append('file2', imageFile2);

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
            subject: this.config.subject,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('CompreFace 얼굴 검증 오류:', error);
      throw new Error('얼굴 검증에 실패했습니다.');
    }
  }

  /**
   * CompreFace 서버 상태 확인
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.baseUrl}/api/v1/health`);
      return response.status === 200;
    } catch (error) {
      console.error('CompreFace 서버 상태 확인 오류:', error);
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
