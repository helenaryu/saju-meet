// MediaPipe는 클라이언트 사이드에서만 로드
let FaceMesh: any = null;
let Camera: any = null;

if (typeof window !== 'undefined') {
  // 클라이언트 사이드에서만 MediaPipe 로드
  import('@mediapipe/face_mesh').then(module => {
    FaceMesh = module.FaceMesh;
  });
  import('@mediapipe/camera_utils').then(module => {
    Camera = module.Camera;
  });
}

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
  private faceMesh: any;
  private isInitialized = false;

  constructor() {
    // 클라이언트 사이드에서만 초기화
    if (typeof window !== 'undefined') {
      this.initializeFaceMesh();
    }
  }

  private async initializeFaceMesh() {
    try {
      if (!FaceMesh) {
        throw new Error('MediaPipe FaceMesh이 로드되지 않았습니다.');
      }

      this.faceMesh = new FaceMesh({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.faceMesh.onResults((results: any) => {
        // 결과 처리 로직
        console.log('Face mesh results:', results);
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('FaceMesh 초기화 오류:', error);
      // 초기화 실패 시 더미 분석으로 진행
      this.isInitialized = true;
    }
  }

  async analyzeFace(request: FaceReadingRequest): Promise<FaceReadingResponse> {
    try {
      // 서버 사이드에서는 더미 분석 결과 반환
      if (typeof window === 'undefined') {
        return this.generateDummyAnalysis();
      }

      if (!this.isInitialized) {
        await this.initializeFaceMesh();
      }

      // MediaPipe가 사용 가능한 경우 실제 분석 수행
      if (this.faceMesh) {
        try {
          // 이미지에서 얼굴 랜드마크 추출
          const landmarks = await this.extractLandmarks(request.imageFile);
          
          // 랜드마크 기반으로 얼굴 특징 분석
          const features = this.analyzeFeatures(landmarks);
          
          // 특징을 바탕으로 키워드 생성
          const keywords = this.generateKeywords(features);
          
          // 관상 해석 생성
          const interpretation = this.generateInterpretation(features, keywords);
          
          // 연애 궁합 키워드 생성
          const loveCompatibility = this.generateLoveCompatibility(features, keywords);

          return {
            features,
            keywords,
            interpretation,
            loveCompatibility
          };
        } catch (error) {
          console.error('MediaPipe 분석 중 오류:', error);
          // MediaPipe 분석 실패 시 더미 분석으로 대체
        }
      }

      // MediaPipe가 사용 불가능하거나 분석 실패 시 더미 분석 결과 반환
      return this.generateDummyAnalysis();
    } catch (error) {
      console.error('관상 분석 중 오류:', error);
      // 오류 발생 시 더미 분석 결과 반환
      return this.generateDummyAnalysis();
    }
  }

  private async extractLandmarks(imageFile: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Canvas에 이미지 그리기
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context를 생성할 수 없습니다.'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // FaceMesh에 이미지 전달
          this.faceMesh.send({ image: canvas });
          
          // 임시로 더미 랜드마크 반환 (실제 구현에서는 FaceMesh 결과 사용)
          setTimeout(() => {
            resolve(this.generateDummyLandmarks());
          }, 1000);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
      img.src = URL.createObjectURL(imageFile);
    });
  }

  private generateDummyLandmarks(): any[] {
    // 실제 구현에서는 FaceMesh에서 반환된 랜드마크 사용
    // 현재는 테스트용 더미 데이터 반환
    return Array.from({ length: 468 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 100
    }));
  }

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
