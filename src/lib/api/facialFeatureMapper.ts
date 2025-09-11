// CompreFace 기반 관상 분석 룰셋 (68-point landmark index 기반)
// 얼굴 특징 해석 결과를 반환함

import { CompreFaceDetection } from './compreface';

interface Landmark {
  x: number;
  y: number;
}

export interface MappedFacialFeatures {
  eyes: {
    size: 'small' | 'medium' | 'large';
    shape: 'round' | 'almond' | 'narrow' | 'deep-set';
    characteristics: string[];
    confidence: number;
  };
  nose: {
    bridge: 'straight' | 'curved' | 'wide' | 'narrow';
    tip: 'pointed' | 'rounded' | 'wide' | 'upturned';
    characteristics: string[];
    confidence: number;
  };
  mouth: {
    size: 'small' | 'medium' | 'large';
    shape: 'thin' | 'full' | 'wide' | 'bow-shaped';
    characteristics: string[];
    confidence: number;
  };
  forehead: {
    width: 'narrow' | 'medium' | 'wide';
    height: 'low' | 'medium' | 'high';
    characteristics: string[];
    confidence: number;
  };
  chin: {
    shape: 'pointed' | 'rounded' | 'square' | 'cleft';
    characteristics: string[];
    confidence: number;
  };
  overall: {
    faceShape: 'oval' | 'round' | 'square' | 'heart' | 'diamond' | 'oblong';
    symmetry: 'high' | 'medium' | 'low';
    characteristics: string[];
    confidence: number;
  };
  keywords: string[];
  loveCompatibility: string[];
}

export class FacialFeatureMapper {
  static mapCompreFaceToFacialFeatures(faceData: CompreFaceDetection): MappedFacialFeatures {
    const landmarks = faceData.landmarks || [];
    
    // Use your new analysis functions
    const eyeFeatures = analyzeEyeFeatures(landmarks);
    const noseFeatures = analyzeNoseFeatures(landmarks);
    const mouthFeatures = analyzeMouthFeatures(landmarks);
    const faceShapeFeatures = analyzeFaceShape(landmarks);
    const symmetryFeatures = analyzeSymmetry(landmarks);
    
    // Convert to expected format
    return {
      eyes: {
        size: this.convertEyeSize(eyeFeatures['눈 크기']),
        shape: 'almond',
        characteristics: [eyeFeatures['눈 사이 거리'], eyeFeatures['눈 크기'], eyeFeatures['눈꼬리 방향']],
        confidence: 0.8
      },
      nose: {
        bridge: this.convertNoseBridge(noseFeatures['코 넓이']),
        tip: this.convertNoseTip(noseFeatures['코 길이']),
        characteristics: [noseFeatures['코 넓이'], noseFeatures['코 길이']],
        confidence: 0.8
      },
      mouth: {
        size: this.convertMouthSize(mouthFeatures['입 크기']),
        shape: this.convertMouthShape(mouthFeatures['입술 두께']),
        characteristics: [mouthFeatures['입 크기'], mouthFeatures['입술 두께'], mouthFeatures['입꼬리 방향']],
        confidence: 0.8
      },
      forehead: {
        width: 'medium',
        height: 'medium',
        characteristics: ['기본적인 이마 형태'],
        confidence: 0.7
      },
      chin: {
        shape: this.convertChinShape(faceShapeFeatures['턱-이마 비율']),
        characteristics: [faceShapeFeatures['턱-이마 비율']],
        confidence: 0.7
      },
      overall: {
        faceShape: this.convertFaceShape(faceShapeFeatures['얼굴 비율']),
        symmetry: this.convertSymmetry(symmetryFeatures['좌우 대칭성']),
        characteristics: [faceShapeFeatures['얼굴 비율'], symmetryFeatures['좌우 대칭성']],
        confidence: 0.8
      },
      keywords: this.generateKeywords(eyeFeatures, noseFeatures, mouthFeatures, faceShapeFeatures, symmetryFeatures),
      loveCompatibility: this.generateLoveCompatibility(eyeFeatures, mouthFeatures, faceShapeFeatures)
    };
  }
  
  private static convertEyeSize(eyeSize: string): 'small' | 'medium' | 'large' {
    if (eyeSize.includes('작은')) return 'small';
    if (eyeSize.includes('큰')) return 'large';
    return 'medium';
  }
  
  private static convertNoseBridge(noseWidth: string): 'straight' | 'curved' | 'wide' | 'narrow' {
    if (noseWidth.includes('넓은')) return 'wide';
    if (noseWidth.includes('좁은')) return 'narrow';
    return 'straight';
  }
  
  private static convertNoseTip(noseLength: string): 'pointed' | 'rounded' | 'wide' | 'upturned' {
    if (noseLength.includes('긴')) return 'pointed';
    if (noseLength.includes('짧은')) return 'rounded';
    return 'rounded';
  }
  
  private static convertMouthSize(mouthSize: string): 'small' | 'medium' | 'large' {
    if (mouthSize.includes('작은')) return 'small';
    if (mouthSize.includes('큰')) return 'large';
    return 'medium';
  }
  
  private static convertMouthShape(lipThickness: string): 'thin' | 'full' | 'wide' | 'bow-shaped' {
    if (lipThickness.includes('얇은')) return 'thin';
    if (lipThickness.includes('두꺼운')) return 'full';
    return 'bow-shaped';
  }
  
  private static convertChinShape(jawRatio: string): 'pointed' | 'rounded' | 'square' | 'cleft' {
    if (jawRatio.includes('각진')) return 'square';
    if (jawRatio.includes('V라인')) return 'pointed';
    return 'rounded';
  }
  
  private static convertFaceShape(faceProportion: string): 'oval' | 'round' | 'square' | 'heart' | 'diamond' | 'oblong' {
    if (faceProportion.includes('둥근')) return 'round';
    if (faceProportion.includes('긴')) return 'oblong';
    return 'oval';
  }
  
  private static convertSymmetry(symmetry: string): 'high' | 'medium' | 'low' {
    if (symmetry.includes('대칭')) return 'high';
    if (symmetry.includes('비대칭')) return 'low';
    return 'medium';
  }
  
  private static generateKeywords(eyeFeatures: any, noseFeatures: any, mouthFeatures: any, faceShapeFeatures: any, symmetryFeatures: any): string[] {
    const keywords: string[] = [];
    
    // Extract meaningful keywords from each feature category
    this.extractKeywords(eyeFeatures, keywords);
    this.extractKeywords(noseFeatures, keywords);
    this.extractKeywords(mouthFeatures, keywords);
    this.extractKeywords(faceShapeFeatures, keywords);
    this.extractKeywords(symmetryFeatures, keywords);
    
    return [...new Set(keywords)];
  }
  
  private static extractKeywords(features: any, keywords: string[]): void {
    Object.values(features).forEach((value: any) => {
      const str = String(value);
      
      // Extract key terms from Korean descriptions
      if (str.includes('큰')) keywords.push('큰');
      if (str.includes('작은')) keywords.push('작은');
      if (str.includes('넓은')) keywords.push('넓은');
      if (str.includes('좁은')) keywords.push('좁은');
      if (str.includes('긴')) keywords.push('긴');
      if (str.includes('짧은')) keywords.push('짧은');
      if (str.includes('두꺼운')) keywords.push('두꺼운');
      if (str.includes('얇은')) keywords.push('얇은');
      if (str.includes('둥근')) keywords.push('둥근');
      if (str.includes('각진')) keywords.push('각진');
      if (str.includes('V라인')) keywords.push('V라인');
      if (str.includes('대칭')) keywords.push('대칭');
      if (str.includes('비대칭')) keywords.push('비대칭');
      
      // Extract personality traits
      if (str.includes('감성적')) keywords.push('감성적');
      if (str.includes('외향적')) keywords.push('외향적');
      if (str.includes('내향적')) keywords.push('내향적');
      if (str.includes('신중')) keywords.push('신중');
      if (str.includes('집중력')) keywords.push('집중력');
      if (str.includes('포용력')) keywords.push('포용력');
      if (str.includes('재물운')) keywords.push('재물운');
      if (str.includes('추진력')) keywords.push('추진력');
      if (str.includes('즉흥적')) keywords.push('즉흥적');
      if (str.includes('언변')) keywords.push('언변');
      if (str.includes('조용함')) keywords.push('조용함');
      if (str.includes('정 많음')) keywords.push('정 많음');
      if (str.includes('이성적')) keywords.push('이성적');
      if (str.includes('절제형')) keywords.push('절제형');
      if (str.includes('긍정적')) keywords.push('긍정적');
      if (str.includes('활기참')) keywords.push('활기참');
      if (str.includes('밝은')) keywords.push('밝은');
      if (str.includes('진중')) keywords.push('진중');
      if (str.includes('조심스러운')) keywords.push('조심스러운');
      if (str.includes('온화')) keywords.push('온화');
      if (str.includes('친화적')) keywords.push('친화적');
      if (str.includes('논리적')) keywords.push('논리적');
      if (str.includes('리더십')) keywords.push('리더십');
      if (str.includes('섬세함')) keywords.push('섬세함');
      if (str.includes('안정적')) keywords.push('안정적');
      if (str.includes('신뢰감')) keywords.push('신뢰감');
      if (str.includes('자연스러운')) keywords.push('자연스러운');
      if (str.includes('개성')) keywords.push('개성');
      if (str.includes('독립적')) keywords.push('독립적');
    });
  }
  
  private static generateLoveCompatibility(eyeFeatures: any, mouthFeatures: any, faceShapeFeatures: any): string[] {
    const compatibility: string[] = [];
    if (eyeFeatures['눈 크기'].includes('큰')) compatibility.push('감성적', '표현력');
    if (mouthFeatures['입 크기'].includes('큰')) compatibility.push('소통', '활발함');
    if (faceShapeFeatures['얼굴 비율'].includes('둥근')) compatibility.push('친근함', '따뜻함');
    return [...new Set(compatibility)];
  }
}

export function analyzeEyeFeatures(landmarks: Landmark[]) {
  // Landmark validation
  if (!landmarks || landmarks.length < 68) {
    return {
      '눈 사이 거리': '분석 불가 (랜드마크 부족)',
      '눈 크기': '분석 불가 (랜드마크 부족)',
      '눈꼬리 방향': '분석 불가 (랜드마크 부족)'
    };
  }

  const faceWidth = landmarks[16].x - landmarks[0].x;
  const eyeDistance = Math.abs(landmarks[45].x - landmarks[36].x) / faceWidth;
  const leftEyeWidth = Math.abs(landmarks[39].x - landmarks[36].x);
  const eyeWidthRatio = leftEyeWidth / faceWidth;
  const eyeSlantLeft = landmarks[36].y - landmarks[39].y;
  const eyeSlantRight = landmarks[45].y - landmarks[42].y;

  let eyeDistanceType = "보통";
  if (eyeDistance < 0.25) eyeDistanceType = "가까움 (집중력 있음)";
  else if (eyeDistance > 0.35) eyeDistanceType = "멀음 (개방적 성향)";

  let eyeSizeType = "보통";
  if (eyeWidthRatio < 0.1) eyeSizeType = "작은 눈 (신중하고 감정 절제형)";
  else if (eyeWidthRatio > 0.15) eyeSizeType = "큰 눈 (감성적이고 외향적)";

  let eyeSlantType = "중립 또는 비대칭";
  if (eyeSlantLeft < 0 && eyeSlantRight < 0) eyeSlantType = "양쪽 눈꼬리 올라감 (긍정적, 활기참)";
  else if (eyeSlantLeft > 0 && eyeSlantRight > 0) eyeSlantType = "양쪽 눈꼬리 내려감 (내성적, 신중함)";

      return {
    '눈 사이 거리': eyeDistanceType,
    '눈 크기': eyeSizeType,
    '눈꼬리 방향': eyeSlantType
  };
}

export function analyzeNoseFeatures(landmarks: Landmark[]) {
  // Landmark validation
  if (!landmarks || landmarks.length < 68) {
    return {
      '코 넓이': '분석 불가 (랜드마크 부족)',
      '코 길이': '분석 불가 (랜드마크 부족)'
    };
  }

  const faceWidth = landmarks[16].x - landmarks[0].x;
  const noseWidth = Math.abs(landmarks[35].x - landmarks[31].x) / faceWidth;
  const noseHeight = Math.abs(landmarks[30].y - landmarks[27].y);
  const faceHeight = landmarks[8].y - landmarks[27].y;
  const noseLengthRatio = noseHeight / faceHeight;

  let noseWidthType = "보통";
  if (noseWidth > 0.35) noseWidthType = "넓은 코 (포용력, 재물운 풍부)";
  else if (noseWidth < 0.25) noseWidthType = "좁은 코 (신중함, 내향적)";

  let noseLengthType = "보통";
  if (noseLengthRatio > 0.35) noseLengthType = "긴 코 (집중력, 추진력 강함)";
  else if (noseLengthRatio < 0.25) noseLengthType = "짧은 코 (즉흥적, 감성형)";

      return {
    '코 넓이': noseWidthType,
    '코 길이': noseLengthType
  };
}

export function analyzeMouthFeatures(landmarks: Landmark[]) {
  // Landmark validation
  if (!landmarks || landmarks.length < 68) {
    return {
      '입 크기': '분석 불가 (랜드마크 부족)',
      '입술 두께': '분석 불가 (랜드마크 부족)',
      '입꼬리 방향': '분석 불가 (랜드마크 부족)'
    };
  }

  const faceWidth = landmarks[16].x - landmarks[0].x;
  const mouthWidth = Math.abs(landmarks[54].x - landmarks[48].x) / faceWidth;
  const lipThickness = Math.abs(landmarks[66].y - landmarks[62].y);
  const faceHeight = landmarks[8].y - landmarks[27].y;
  const lipRatio = lipThickness / faceHeight;
  const mouthCornerSlope = landmarks[54].y - landmarks[48].y;

  let mouthWidthType = "보통";
  if (mouthWidth > 0.45) mouthWidthType = "큰 입 (외향적이고 언변 뛰어남)";
  else if (mouthWidth < 0.3) mouthWidthType = "작은 입 (내향적이고 조용함)";

  let lipType = "보통";
  if (lipRatio > 0.12) lipType = "두꺼운 입술 (감정 풍부, 정 많음)";
  else if (lipRatio < 0.08) lipType = "얇은 입술 (이성적이고 절제형)";

  let mouthCornerType = "수평 (중립적)";
  if (mouthCornerSlope < -2) mouthCornerType = "입꼬리 올라감 (긍정적이고 밝은 인상)";
  else if (mouthCornerSlope > 2) mouthCornerType = "입꼬리 내려감 (진중하고 조심스러운 성향)";

      return {
    '입 크기': mouthWidthType,
    '입술 두께': lipType,
    '입꼬리 방향': mouthCornerType
  };
}

export function analyzeFaceShape(landmarks: Landmark[]) {
  // Landmark validation
  if (!landmarks || landmarks.length < 68) {
    return {
      '얼굴 비율': '분석 불가 (랜드마크 부족)',
      '턱-이마 비율': '분석 불가 (랜드마크 부족)'
    };
  }

  const faceWidth = landmarks[16].x - landmarks[0].x;
  const faceHeight = landmarks[8].y - landmarks[27].y;
  const jawWidth = landmarks[12].x - landmarks[4].x;
  const foreheadWidth = landmarks[21].x - landmarks[22].x; // approximate
  const jawToForeheadRatio = jawWidth / Math.abs(foreheadWidth);

  let faceProportionType = "보통형";
  if (faceWidth > faceHeight) faceProportionType = "둥근 얼굴형 (온화하고 친화적)";
  else if (faceHeight > faceWidth * 1.3) faceProportionType = "긴 얼굴형 (논리적이고 신중함)";

  let jawShapeType = "균형형";
  if (jawToForeheadRatio > 0.9) jawShapeType = "각진 얼굴형 (리더십, 추진력 강함)";
  else if (jawToForeheadRatio < 0.6) jawShapeType = "V라인 얼굴형 (감성적, 섬세함)";
    
    return {
    '얼굴 비율': faceProportionType,
    '턱-이마 비율': jawShapeType
  };
}

export function analyzeSymmetry(landmarks: Landmark[]) {
  // Landmark validation
  if (!landmarks || landmarks.length < 68) {
    return { '좌우 대칭성': '분석 불가 (랜드마크 부족)' };
  }

  const faceCenter = (landmarks[16].x + landmarks[0].x) / 2;
  const symmetricPairs = [
    [36, 45], [39, 42], [48, 54], [31, 35]
  ];

  let totalDiff = 0;
  for (const [leftIndex, rightIndex] of symmetricPairs) {
    const left = landmarks[leftIndex];
    const right = landmarks[rightIndex];
    const leftDist = Math.abs(left.x - faceCenter);
    const rightDist = Math.abs(right.x - faceCenter);
    totalDiff += Math.abs(leftDist - rightDist);
  }
  const avgDiff = totalDiff / symmetricPairs.length;

  if (avgDiff < 5) return { '좌우 대칭성': '대칭 (안정적이고 신뢰감 주는 인상)' };
  else if (avgDiff < 10) return { '좌우 대칭성': '약간 비대칭 (자연스러우며 개성 있음)' };
  else return { '좌우 대칭성': '비대칭 (강한 개성, 독립적 이미지)' };
}