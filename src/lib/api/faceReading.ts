// CompreFace API 연동
import { comprefaceService, CompreFaceDetection } from './compreface';

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

export interface FaceReadingRequest {
  imageFile: File;
  imageUrl?: string;
}

export interface FaceReadingResponse {
  features: {
    eyes: {
      size: 'small' | 'medium' | 'large';
      shape: 'round' | 'almond' | 'narrow';
      characteristics: string[];
    };
    nose: {
      bridge: 'straight' | 'curved' | 'wide';
      tip: 'pointed' | 'rounded' | 'wide';
      characteristics: string[];
    };
    mouth: {
      size: 'small' | 'medium' | 'large';
      shape: 'thin' | 'full' | 'wide';
      characteristics: string[];
    };
    forehead: {
      width: 'narrow' | 'medium' | 'wide';
      height: 'low' | 'medium' | 'high';
      characteristics: string[];
    };
    chin: {
      shape: 'pointed' | 'rounded' | 'square';
      characteristics: string[];
    };
  };
  keywords: string[];
  interpretation: string;
  loveCompatibility: string[];
}

export class FaceReadingService {
  private isInitialized = false;

  constructor() {
    this.isInitialized = true;
  }

  // MediaPipe 관련 코드는 제거됨 - CompreFace 사용

  async analyzeFace(request: FaceReadingRequest): Promise<FaceReadingResponse> {
    try {
      // CompreFace API를 통한 실제 얼굴 분석
      const response = await fetch(`${getBaseUrl()}/api/face-analysis`, {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append('image', request.imageFile);
          return formData;
        })(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '얼굴 분석에 실패했습니다.');
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('얼굴 분석 결과를 받을 수 없습니다.');
      }

      const faceData = result.data;

      // CompreFace 결과를 기존 인터페이스에 맞게 변환
      const features = {
        eyes: faceData.features.eyes,
        nose: faceData.features.nose,
        mouth: faceData.features.mouth,
        forehead: faceData.features.forehead,
        chin: faceData.features.chin,
      };

      // Claude에게 전달할 상세 분석 요청
      const claudeAnalysis = await this.requestClaudeAnalysis(faceData);

      return {
        features,
        keywords: claudeAnalysis.keywords || faceData.keywords,
        interpretation: claudeAnalysis.interpretation || this.generateInterpretation(features, faceData.keywords),
        loveCompatibility: claudeAnalysis.loveCompatibility || faceData.loveCompatibility
      };

    } catch (error) {
      console.error('관상 분석 중 오류:', error);
      // 오류 발생 시 더미 분석 결과 반환
      return this.generateDummyAnalysis();
    }
  }

  private async requestClaudeAnalysis(faceData: any): Promise<{
    keywords: string[];
    interpretation: string;
    loveCompatibility: string[];
  }> {
    try {
      const response = await fetch(`${getBaseUrl()}/api/analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'face_reading',
          data: {
            // CompreFace 분석 결과
            age: faceData.age,
            gender: faceData.gender,
            features: faceData.features,
            landmarks: faceData.landmarks,
            pose: faceData.pose,
            mask: faceData.mask,
            bbox: faceData.bbox,
            // 기본 키워드
            basicKeywords: faceData.keywords,
            basicLoveCompatibility: faceData.loveCompatibility,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Claude 분석 요청에 실패했습니다.');
      }

      const result = await response.json();
      return result.data || {
        keywords: faceData.keywords,
        interpretation: '',
        loveCompatibility: faceData.loveCompatibility,
      };
    } catch (error) {
      console.error('Claude 분석 요청 오류:', error);
      return {
        keywords: faceData.keywords,
        interpretation: '',
        loveCompatibility: faceData.loveCompatibility,
      };
    }
  }

  // MediaPipe 관련 메서드들은 제거됨 - CompreFace 사용

  private analyzeFeatures(landmarks: any[]): FaceReadingResponse['features'] {
    // 랜드마크 기반으로 얼굴 특징 분석
    // 실제 구현에서는 정확한 좌표 계산 필요
    
    return {
      eyes: {
        size: this.analyzeEyeSize(landmarks),
        shape: this.analyzeEyeShape(landmarks),
        characteristics: this.analyzeEyeCharacteristics(landmarks)
      },
      nose: {
        bridge: this.analyzeNoseBridge(landmarks),
        tip: this.analyzeNoseTip(landmarks),
        characteristics: this.analyzeNoseCharacteristics(landmarks)
      },
      mouth: {
        size: this.analyzeMouthSize(landmarks),
        shape: this.analyzeMouthShape(landmarks),
        characteristics: this.analyzeMouthCharacteristics(landmarks)
      },
      forehead: {
        width: this.analyzeForeheadWidth(landmarks),
        height: this.analyzeForeheadHeight(landmarks),
        characteristics: this.analyzeForeheadCharacteristics(landmarks)
      },
      chin: {
        shape: this.analyzeChinShape(landmarks),
        characteristics: this.analyzeChinCharacteristics(landmarks)
      }
    };
  }

  private analyzeEyeSize(landmarks: any[]): 'small' | 'medium' | 'large' {
    // 눈 크기 분석 로직 (더미)
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  private analyzeEyeShape(landmarks: any[]): 'round' | 'almond' | 'narrow' {
    // 눈 모양 분석 로직 (더미)
    const shapes: ('round' | 'almond' | 'narrow')[] = ['round', 'almond', 'narrow'];
    return shapes[Math.floor(Math.random() * shapes.length)];
  }

  private analyzeEyeCharacteristics(landmarks: any[]): string[] {
    // 눈 특징 분석 로직 (더미)
    const characteristics = [
      '큰 눈으로 감정 표현이 풍부함',
      '긴 속눈썹으로 매력적임',
      '눈꼬리가 올라가 자신감 있음',
      '둥근 눈으로 순수하고 친근함',
      '좁은 눈으로 집중력이 뛰어남'
    ];
    
    return characteristics.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  private analyzeNoseBridge(landmarks: any[]): 'straight' | 'curved' | 'wide' {
    const bridges: ('straight' | 'curved' | 'wide')[] = ['straight', 'curved', 'wide'];
    return bridges[Math.floor(Math.random() * bridges.length)];
  }

  private analyzeNoseTip(landmarks: any[]): 'pointed' | 'rounded' | 'wide' {
    const tips: ('pointed' | 'rounded' | 'wide')[] = ['pointed', 'rounded', 'wide'];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  private analyzeNoseCharacteristics(landmarks: any[]): string[] {
    const characteristics = [
      '직선적인 코로 정직하고 솔직함',
      '넓은 코로 관대하고 여유로움',
      '뾰족한 코로 예리하고 섬세함',
      '둥근 코로 부드럽고 따뜻함'
    ];
    
    return characteristics.slice(0, Math.floor(Math.random() * 2) + 1);
  }

  private analyzeMouthSize(landmarks: any[]): 'small' | 'medium' | 'large' {
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  private analyzeMouthShape(landmarks: any[]): 'thin' | 'full' | 'wide' {
    const shapes: ('thin' | 'full' | 'wide')[] = ['thin', 'full', 'wide'];
    return shapes[Math.floor(Math.random() * shapes.length)];
  }

  private analyzeMouthCharacteristics(landmarks: any[]): string[] {
    const characteristics = [
      '입꼬리가 올라가 긍정적이고 친근함',
      '큰 입으로 소통 능력이 뛰어남',
      '작은 입으로 신중하고 조용함',
      '두꺼운 입술로 감정적이고 따뜻함'
    ];
    
    return characteristics.slice(0, Math.floor(Math.random() * 2) + 1);
  }

  private analyzeForeheadWidth(landmarks: any[]): 'narrow' | 'medium' | 'wide' {
    const widths: ('narrow' | 'medium' | 'wide')[] = ['narrow', 'medium', 'wide'];
    return widths[Math.floor(Math.random() * widths.length)];
  }

  private analyzeForeheadHeight(landmarks: any[]): 'low' | 'medium' | 'high' {
    const heights: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    return heights[Math.floor(Math.random() * heights.length)];
  }

  private analyzeForeheadCharacteristics(landmarks: any[]): string[] {
    const characteristics = [
      '넓은 이마로 지적 능력이 뛰어남',
      '높은 이마로 창의성이 풍부함',
      '좁은 이마로 집중력이 뛰어남',
      '균형잡힌 이마로 안정적임'
    ];
    
    return characteristics.slice(0, Math.floor(Math.random() * 2) + 1);
  }

  private analyzeChinShape(landmarks: any[]): 'pointed' | 'rounded' | 'square' {
    const shapes: ('pointed' | 'rounded' | 'square')[] = ['pointed', 'rounded', 'square'];
    return shapes[Math.floor(Math.random() * shapes.length)];
  }

  private analyzeChinCharacteristics(landmarks: any[]): string[] {
    const characteristics = [
      '뾰족한 턱으로 예리하고 섬세함',
      '각진 턱으로 의지력과 결단력이 강함',
      '둥근 턱으로 부드럽고 친근함',
      '넓은 턱으로 안정적이고 신뢰할 수 있음'
    ];
    
    return characteristics.slice(0, Math.floor(Math.random() * 2) + 1);
  }

  private generateKeywords(features: FaceReadingResponse['features']): string[] {
    const keywords: string[] = [];
    
    // 눈 관련 키워드
    if (features.eyes.size === 'large') keywords.push('감성적', '직관적');
    if (features.eyes.shape === 'almond') keywords.push('매력적', '자신감');
    if (features.eyes.characteristics.some(c => c.includes('큰 눈'))) keywords.push('표현력 풍부');
    
    // 코 관련 키워드
    if (features.nose.bridge === 'straight') keywords.push('정직함', '솔직함');
    if (features.nose.characteristics.some(c => c.includes('직선적'))) keywords.push('원칙적');
    
    // 입 관련 키워드
    if (features.mouth.size === 'large') keywords.push('소통 능력', '사교적');
    if (features.mouth.characteristics.some(c => c.includes('입꼬리'))) keywords.push('긍정적', '친근함');
    
    // 이마 관련 키워드
    if (features.forehead.width === 'wide') keywords.push('지적 능력', '창의성');
    if (features.forehead.height === 'high') keywords.push('영감', '직관력');
    
    // 턱 관련 키워드
    if (features.chin.shape === 'square') keywords.push('의지력', '결단력');
    if (features.chin.shape === 'rounded') keywords.push('부드러움', '친근함');
    
    return keywords.slice(0, 5); // 최대 5개
  }

  private generateInterpretation(features: FaceReadingResponse['features'], keywords: string[]): string {
    let interpretation = '전체적으로 균형 잡힌 인상으로, ';
    
    if (keywords.includes('감성적')) {
      interpretation += '감정 표현이 풍부하고 직관력이 뛰어납니다. ';
    }
    if (keywords.includes('소통 능력')) {
      interpretation += '타인과의 소통에 능숙하며 친근한 매력을 가지고 있습니다. ';
    }
    if (keywords.includes('지적 능력')) {
      interpretation += '창의적이고 지적인 면모를 보여줍니다. ';
    }
    if (keywords.includes('의지력')) {
      interpretation += '목표 달성에 대한 강한 의지와 결단력을 가지고 있습니다. ';
    }
    
    interpretation += '이러한 특징들이 조화를 이루어 신뢰할 수 있고 매력적인 인상을 줍니다.';
    
    return interpretation;
  }

  private generateLoveCompatibility(features: FaceReadingResponse['features'], keywords: string[]): string[] {
    const compatibility: string[] = [];
    
    if (keywords.includes('감성적')) {
      compatibility.push('로맨틱하고 감정적인 파트너와 잘 맞습니다.');
    }
    if (keywords.includes('소통 능력')) {
      compatibility.push('대화가 잘 통하는 파트너와 좋은 관계를 형성합니다.');
    }
    if (keywords.includes('지적 능력')) {
      compatibility.push('함께 성장할 수 있는 지적 파트너를 찾습니다.');
    }
    if (keywords.includes('의지력')) {
      compatibility.push('안정적이고 신뢰할 수 있는 파트너와 잘 맞습니다.');
    }
    
    if (compatibility.length === 0) {
      compatibility.push('다양한 성향의 파트너와 조화롭게 어울릴 수 있습니다.');
    }
    
    return compatibility;
  }

  private generateDummyAnalysis(): FaceReadingResponse {
    // 더미 관상 분석 결과 생성
    const dummyFeatures = {
      eyes: {
        size: 'medium' as const,
        shape: 'almond' as const,
        characteristics: ['큰 눈으로 감정 표현이 풍부함', '긴 속눈썹으로 매력적임']
      },
      nose: {
        bridge: 'straight' as const,
        tip: 'rounded' as const,
        characteristics: ['직선적인 코로 정직하고 솔직함']
      },
      mouth: {
        size: 'medium' as const,
        shape: 'full' as const,
        characteristics: ['입꼬리가 올라가 긍정적이고 친근함']
      },
      forehead: {
        width: 'medium' as const,
        height: 'medium' as const,
        characteristics: ['균형잡힌 이마로 안정적임']
      },
      chin: {
        shape: 'rounded' as const,
        characteristics: ['둥근 턱으로 부드럽고 친근함']
      }
    };

    const dummyKeywords = ['감성적', '소통 능력', '친근함', '신뢰성'];
    const dummyInterpretation = '전체적으로 균형 잡힌 인상으로, 따뜻하고 신뢰할 수 있는 매력을 가지고 있습니다.';
    const dummyCompatibility = ['로맨틱하고 감정적인 파트너와 잘 맞습니다.', '대화가 잘 통하는 파트너와 좋은 관계를 형성합니다.'];

    return {
      features: dummyFeatures,
      keywords: dummyKeywords,
      interpretation: dummyInterpretation,
      loveCompatibility: dummyCompatibility
    };
  }
}

// 싱글톤 인스턴스
export const faceReadingService = new FaceReadingService();
