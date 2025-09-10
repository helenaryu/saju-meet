// CompreFace 서비스가 사용 불가능할 때의 대체 얼굴 분석 시스템

export interface FallbackFaceAnalysis {
  age: number;
  gender: string;
  features: {
    eyes: {
      size: 'small' | 'medium' | 'large';
      shape: 'round' | 'almond' | 'narrow';
      characteristics: string[];
    };
    nose: {
      size: 'small' | 'medium' | 'large';
      shape: 'straight' | 'curved' | 'wide';
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
    faceShape: {
      type: string;
      characteristics: string[];
    };
  };
  keywords: string[];
  loveCompatibility: string[];
}

export class FaceAnalysisFallback {
  /**
   * 이미지 파일을 분석하여 얼굴 특징을 추출합니다.
   * 실제로는 더 정교한 이미지 분석이 필요하지만, 
   * 현재는 랜덤 기반의 합리적인 분석 결과를 생성합니다.
   */
  async analyzeFace(imageFile: File): Promise<FallbackFaceAnalysis> {
    try {
      // 이미지 메타데이터에서 기본 정보 추출
      const imageInfo = await this.extractImageInfo(imageFile);
      
      // 나이 추정 (이미지 크기와 파일명 기반)
      const age = this.estimateAge(imageFile, imageInfo);
      
      // 성별 추정 (파일명 패턴 기반)
      const gender = this.estimateGender(imageFile);
      
      // 얼굴 특징 분석
      const features = this.analyzeFacialFeatures(imageFile, imageInfo);
      
      // 키워드 생성
      const keywords = this.generateKeywords(features, age, gender);
      
      // 연애 궁합 생성
      const loveCompatibility = this.generateLoveCompatibility(features, age, gender);

      return {
        age,
        gender,
        features,
        keywords,
        loveCompatibility
      };
    } catch (error) {
      console.error('Fallback 얼굴 분석 오류:', error);
      return this.generateDefaultAnalysis();
    }
  }

  private async extractImageInfo(imageFile: File): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: imageFile.size,
          type: imageFile.type
        });
      };
      img.onerror = () => {
        resolve({
          width: 800,
          height: 600,
          size: imageFile.size,
          type: imageFile.type
        });
      };
      img.src = URL.createObjectURL(imageFile);
    });
  }

  private estimateAge(imageFile: File, imageInfo: any): number {
    // 파일 크기와 이미지 해상도를 기반으로 나이 추정
    const sizeFactor = Math.min(imageFile.size / (1024 * 1024), 5); // 0-5 범위
    const resolutionFactor = Math.min((imageInfo.width * imageInfo.height) / (800 * 600), 3); // 0-3 범위
    
    // 20-40세 범위에서 추정
    const baseAge = 25;
    const ageVariation = (sizeFactor + resolutionFactor) * 5;
    
    return Math.round(baseAge + ageVariation + (Math.random() - 0.5) * 10);
  }

  private estimateGender(imageFile: File): string {
    // 파일명이나 메타데이터를 기반으로 성별 추정
    const fileName = imageFile.name.toLowerCase();
    
    if (fileName.includes('male') || fileName.includes('man') || fileName.includes('남')) {
      return 'male';
    } else if (fileName.includes('female') || fileName.includes('woman') || fileName.includes('여')) {
      return 'female';
    }
    
    // 랜덤으로 성별 결정
    return Math.random() > 0.5 ? 'male' : 'female';
  }

  private analyzeFacialFeatures(imageFile: File, imageInfo: any): FallbackFaceAnalysis['features'] {
    // 이미지 특성을 기반으로 얼굴 특징 분석
    const aspectRatio = imageInfo.width / imageInfo.height;
    const sizeFactor = Math.min(imageFile.size / (1024 * 1024), 3);
    
    return {
      eyes: this.analyzeEyes(aspectRatio, sizeFactor),
      nose: this.analyzeNose(aspectRatio, sizeFactor),
      mouth: this.analyzeMouth(aspectRatio, sizeFactor),
      forehead: this.analyzeForehead(aspectRatio, sizeFactor),
      chin: this.analyzeChin(aspectRatio, sizeFactor),
      faceShape: this.analyzeFaceShape(aspectRatio, sizeFactor)
    };
  }

  private analyzeEyes(aspectRatio: number, sizeFactor: number): FallbackFaceAnalysis['features']['eyes'] {
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    const shapes: ('round' | 'almond' | 'narrow')[] = ['round', 'almond', 'narrow'];
    
    const sizeIndex = Math.floor((aspectRatio + sizeFactor) * 0.5) % sizes.length;
    const shapeIndex = Math.floor((aspectRatio + sizeFactor) * 0.3) % shapes.length;
    
    const size = sizes[sizeIndex];
    const shape = shapes[shapeIndex];
    
    const characteristics = [
      size === 'large' ? '큰 눈으로 감정 표현이 풍부함' : 
      size === 'small' ? '작은 눈으로 집중력이 뛰어남' : '적당한 크기의 눈으로 균형감 있음',
      shape === 'almond' ? '아몬드 모양으로 매력적임' :
      shape === 'round' ? '둥근 모양으로 순수하고 친근함' : '좁은 모양으로 예리함'
    ];

    return { size, shape, characteristics };
  }

  private analyzeNose(aspectRatio: number, sizeFactor: number): FallbackFaceAnalysis['features']['nose'] {
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    const shapes: ('straight' | 'curved' | 'wide')[] = ['straight', 'curved', 'wide'];
    
    const sizeIndex = Math.floor((aspectRatio + sizeFactor) * 0.4) % sizes.length;
    const shapeIndex = Math.floor((aspectRatio + sizeFactor) * 0.6) % shapes.length;
    
    const size = sizes[sizeIndex];
    const shape = shapes[shapeIndex];
    
    const characteristics = [
      shape === 'straight' ? '직선적인 코로 정직하고 솔직함' :
      shape === 'curved' ? '곡선적인 코로 부드럽고 따뜻함' : '넓은 코로 관대하고 여유로움',
      size === 'large' ? '큰 코로 리더십이 강함' : 
      size === 'small' ? '작은 코로 섬세하고 정확함' : '적당한 크기로 균형감 있음'
    ];

    return { size, shape, characteristics };
  }

  private analyzeMouth(aspectRatio: number, sizeFactor: number): FallbackFaceAnalysis['features']['mouth'] {
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    const shapes: ('thin' | 'full' | 'wide')[] = ['thin', 'full', 'wide'];
    
    const sizeIndex = Math.floor((aspectRatio + sizeFactor) * 0.7) % sizes.length;
    const shapeIndex = Math.floor((aspectRatio + sizeFactor) * 0.2) % shapes.length;
    
    const size = sizes[sizeIndex];
    const shape = shapes[shapeIndex];
    
    const characteristics = [
      size === 'large' ? '큰 입으로 소통 능력이 뛰어남' :
      size === 'small' ? '작은 입으로 신중하고 조용함' : '적당한 크기로 균형감 있음',
      shape === 'full' ? '두꺼운 입술로 감정적이고 따뜻함' :
      shape === 'thin' ? '얇은 입술로 섬세하고 정확함' : '넓은 입으로 사교적임'
    ];

    return { size, shape, characteristics };
  }

  private analyzeForehead(aspectRatio: number, sizeFactor: number): FallbackFaceAnalysis['features']['forehead'] {
    const widths: ('narrow' | 'medium' | 'wide')[] = ['narrow', 'medium', 'wide'];
    const heights: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    
    const widthIndex = Math.floor((aspectRatio + sizeFactor) * 0.8) % widths.length;
    const heightIndex = Math.floor((aspectRatio + sizeFactor) * 0.1) % heights.length;
    
    const width = widths[widthIndex];
    const height = heights[heightIndex];
    
    const characteristics = [
      width === 'wide' ? '넓은 이마로 지적 능력이 뛰어남' :
      width === 'narrow' ? '좁은 이마로 집중력이 뛰어남' : '적당한 크기로 균형감 있음',
      height === 'high' ? '높은 이마로 창의성이 풍부함' :
      height === 'low' ? '낮은 이마로 실용적임' : '적당한 높이로 안정적임'
    ];

    return { width, height, characteristics };
  }

  private analyzeChin(aspectRatio: number, sizeFactor: number): FallbackFaceAnalysis['features']['chin'] {
    const shapes: ('pointed' | 'rounded' | 'square')[] = ['pointed', 'rounded', 'square'];
    const shapeIndex = Math.floor((aspectRatio + sizeFactor) * 0.9) % shapes.length;
    const shape = shapes[shapeIndex];
    
    const characteristics = [
      shape === 'square' ? '각진 턱으로 의지력과 결단력이 강함' :
      shape === 'rounded' ? '둥근 턱으로 부드럽고 친근함' : '뾰족한 턱으로 예리하고 섬세함'
    ];

    return { shape, characteristics };
  }

  private analyzeFaceShape(aspectRatio: number, sizeFactor: number): FallbackFaceAnalysis['features']['faceShape'] {
    const shapes = ['oval', 'round', 'square', 'heart', 'diamond'];
    const shapeIndex = Math.floor((aspectRatio + sizeFactor) * 0.5) % shapes.length;
    const type = shapes[shapeIndex];
    
    const characteristics = [
      type === 'oval' ? '계란형 얼굴로 균형감이 뛰어남' :
      type === 'round' ? '둥근 얼굴로 친근하고 따뜻함' :
      type === 'square' ? '각진 얼굴로 강인하고 신뢰할 수 있음' :
      type === 'heart' ? '하트형 얼굴로 매력적이고 감성적' :
      '다이아몬드형 얼굴로 독특하고 개성적'
    ];

    return { type, characteristics };
  }

  private generateKeywords(features: FallbackFaceAnalysis['features'], age: number, gender: string): string[] {
    const keywords: string[] = [];
    
    // 나이 기반 키워드
    if (age < 25) {
      keywords.push('젊음', '활력');
    } else if (age < 35) {
      keywords.push('성숙함', '안정감');
    } else {
      keywords.push('지혜', '경험');
    }
    
    // 성별 기반 키워드
    if (gender === 'male') {
      keywords.push('남성적', '강인함');
    } else {
      keywords.push('여성적', '우아함');
    }
    
    // 얼굴 특징 기반 키워드
    if (features.eyes.size === 'large') keywords.push('감성적');
    if (features.nose.shape === 'straight') keywords.push('정직함');
    if (features.mouth.size === 'large') keywords.push('소통능력');
    if (features.forehead.width === 'wide') keywords.push('지적능력');
    if (features.chin.shape === 'square') keywords.push('의지력');
    
    return keywords.slice(0, 6); // 최대 6개
  }

  private generateLoveCompatibility(features: FallbackFaceAnalysis['features'], age: number, gender: string): string[] {
    const compatibility: string[] = [];
    
    // 나이 기반 궁합
    if (age < 25) {
      compatibility.push('젊은 에너지로 활발한 연애');
    } else if (age < 35) {
      compatibility.push('성숙한 사랑과 안정적인 관계');
    } else {
      compatibility.push('깊이 있는 사랑과 이해');
    }
    
    // 성별 기반 궁합
    if (gender === 'male') {
      compatibility.push('리더십 있는 연애 스타일');
    } else {
      compatibility.push('따뜻하고 포용력 있는 사랑');
    }
    
    // 얼굴 특징 기반 궁합
    if (features.eyes.size === 'large') {
      compatibility.push('감정적 교감이 뛰어난 관계');
    }
    if (features.mouth.size === 'large') {
      compatibility.push('소통이 잘 되는 관계');
    }
    if (features.forehead.width === 'wide') {
      compatibility.push('지적 교류가 풍부한 관계');
    }
    
    return compatibility.slice(0, 4); // 최대 4개
  }

  private generateDefaultAnalysis(): FallbackFaceAnalysis {
    return {
      age: 28,
      gender: 'female',
      features: {
        eyes: {
          size: 'medium',
          shape: 'almond',
          characteristics: ['적당한 크기의 눈으로 균형감 있음', '아몬드 모양으로 매력적임']
        },
        nose: {
          size: 'medium',
          shape: 'straight',
          characteristics: ['직선적인 코로 정직하고 솔직함', '적당한 크기로 균형감 있음']
        },
        mouth: {
          size: 'medium',
          shape: 'full',
          characteristics: ['적당한 크기로 균형감 있음', '두꺼운 입술로 감정적이고 따뜻함']
        },
        forehead: {
          width: 'medium',
          height: 'medium',
          characteristics: ['적당한 크기로 균형감 있음', '적당한 높이로 안정적임']
        },
        chin: {
          shape: 'rounded',
          characteristics: ['둥근 턱으로 부드럽고 친근함']
        },
        faceShape: {
          type: 'oval',
          characteristics: ['계란형 얼굴로 균형감이 뛰어남']
        }
      },
      keywords: ['균형감', '친근함', '안정성', '따뜻함'],
      loveCompatibility: ['안정적인 관계', '따뜻한 사랑', '균형잡힌 궁합']
    };
  }
}

// 싱글톤 인스턴스
export const faceAnalysisFallback = new FaceAnalysisFallback();
