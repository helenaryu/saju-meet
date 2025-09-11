import { comprefaceService, CompreFaceDetection } from './compreface';
import { FacialFeatureMapper, MappedFacialFeatures } from './facialFeatureMapper';
import { claudeService, ClaudeAnalysisRequest } from './claude';

export interface FacialAnalysisRequest {
  imageFile: File;
  nickname?: string;
  gender?: string;
  birthDate?: string;
}

export interface FacialAnalysisResponse {
  // CompreFace 원본 데이터
  comprefaceData: CompreFaceDetection;
  
  // 매핑된 관상 특징
  mappedFeatures: MappedFacialFeatures;
  
  // Claude AI 분석 결과
  claudeAnalysis: {
    interpretation: string;
    personalityInsights: string;
    relationshipAdvice: string;
    compatibilityFactors: string;
    growthOpportunities: string;
    recommendedKeywords: string[];
    loveStyle: string;
    idealTypeDescription: string;
  };
  
  // 분석 메타데이터
  metadata: {
    timestamp: string;
    analysisVersion: string;
    confidence: number;
    processingTime: number;
  };
}

export class FacialAnalysisService {
  private isInitialized = false;

  constructor() {
    this.isInitialized = true;
  }

  /**
   * 종합적인 관상 분석 수행
   */
  async analyzeFacialFeatures(request: FacialAnalysisRequest): Promise<FacialAnalysisResponse> {
    const startTime = Date.now();
    
    try {
      console.log('관상 분석 시작:', request.nickname || '익명');
      
      // 1. CompreFace로 얼굴 분석
      console.log('CompreFace 얼굴 분석 중...');
      let comprefaceResponse;
      let faceData;
      
      // CompreFace 서버 상태 확인
      const isHealthy = await comprefaceService.checkHealth();
      if (!isHealthy) {
        throw new Error('CompreFace 서버가 사용 불가능합니다. 서버를 시작하고 API 키를 설정해주세요.');
      }

      comprefaceResponse = await comprefaceService.detectFaces(request.imageFile);
      
      if (!comprefaceResponse.result || comprefaceResponse.result.length === 0) {
        throw new Error('얼굴을 감지할 수 없습니다. 더 명확한 얼굴 사진을 업로드해주세요.');
      }
      
      faceData = comprefaceResponse.result[0];
      console.log('CompreFace 분석 완료:', {
        age: faceData.age,
        gender: faceData.gender,
        landmarks: faceData.landmarks?.length || 0
      });
      
      // 2. CompreFace 데이터를 관상 특징으로 매핑
      console.log('관상 특징 매핑 중...');
      const mappedFeatures = FacialFeatureMapper.mapCompreFaceToFacialFeatures(faceData);
      console.log('관상 특징 매핑 완료:', {
        eyes: mappedFeatures.eyes.shape,
        nose: mappedFeatures.nose.bridge,
        mouth: mappedFeatures.mouth.shape,
        faceShape: mappedFeatures.overall.faceShape
      });
      
      // 3. Claude AI로 개인화된 분석 수행
      console.log('Claude AI 분석 중...');
      const claudeAnalysis = await this.performClaudeAnalysis(mappedFeatures, request);
      console.log('Claude AI 분석 완료');
      
      const processingTime = Date.now() - startTime;
      
      return {
        comprefaceData: faceData,
        mappedFeatures,
        claudeAnalysis,
        metadata: {
          timestamp: new Date().toISOString(),
          analysisVersion: '1.0.0',
          confidence: this.calculateOverallConfidence(faceData, mappedFeatures),
          processingTime
        }
      };
      
    } catch (error) {
      console.error('관상 분석 오류:', error);
      throw error;
    }
  }

  /**
   * Claude AI를 사용한 개인화된 관상 분석
   */
  private async performClaudeAnalysis(
    mappedFeatures: MappedFacialFeatures,
    request: FacialAnalysisRequest
  ): Promise<FacialAnalysisResponse['claudeAnalysis']> {
    try {
      // Claude 요청 데이터 구성
      const claudeRequest: ClaudeAnalysisRequest = {
        nickname: request.nickname || '사용자',
        gender: request.gender || '미지정',
        birthDate: request.birthDate || '미지정',
        faceReadingKeywords: mappedFeatures.keywords,
        sajuKeywords: [], // 사주 데이터가 없는 경우 빈 배열
        faceReadingFeatures: {
          eyes: mappedFeatures.eyes,
          nose: mappedFeatures.nose,
          mouth: mappedFeatures.mouth,
          forehead: mappedFeatures.forehead,
          chin: mappedFeatures.chin,
          overall: mappedFeatures.overall
        },
        sajuElements: {} // 사주 데이터가 없는 경우 빈 객체
      };

      // Claude AI 분석 수행
      const claudeResponse = await claudeService.generateLoveReport(claudeRequest);
      
      return {
        interpretation: claudeResponse.faceReadingInterpretation || this.generateFallbackInterpretation(mappedFeatures),
        personalityInsights: claudeResponse.detailedAnalysis?.personalityInsights || '성격 분석을 진행 중입니다.',
        relationshipAdvice: claudeResponse.detailedAnalysis?.relationshipAdvice || '연애 조언을 분석 중입니다.',
        compatibilityFactors: claudeResponse.detailedAnalysis?.compatibilityFactors || '궁합 요소를 분석 중입니다.',
        growthOpportunities: claudeResponse.detailedAnalysis?.growthOpportunities || '성장 기회를 분석 중입니다.',
        recommendedKeywords: claudeResponse.recommendedKeywords || mappedFeatures.keywords.slice(0, 5),
        loveStyle: claudeResponse.loveStyle || '감성적이고 로맨틱한 연애 스타일',
        idealTypeDescription: claudeResponse.idealTypeDescription || '조화롭고 이해심 있는 이상형'
      };
      
    } catch (error) {
      console.error('Claude AI 분석 오류:', error);
      
      // Claude 분석 실패 시 fallback 응답
      return {
        interpretation: this.generateFallbackInterpretation(mappedFeatures),
        personalityInsights: 'AI 분석이 일시적으로 불가능합니다. 기본 관상 해석을 제공합니다.',
        relationshipAdvice: '관상 기반 연애 조언을 준비 중입니다.',
        compatibilityFactors: '얼굴 특징 기반 궁합 분석을 진행합니다.',
        growthOpportunities: '개인적 성장 방향을 제안합니다.',
        recommendedKeywords: mappedFeatures.keywords.slice(0, 5),
        loveStyle: '감성적이고 로맨틱한 연애 스타일',
        idealTypeDescription: '조화롭고 이해심 있는 이상형'
      };
    }
  }


  /**
   * Fallback 관상 해석 생성
   */
  private generateFallbackInterpretation(mappedFeatures: MappedFacialFeatures): string {
    const { eyes, nose, mouth, overall } = mappedFeatures;
    
    let interpretation = '';
    
    // 눈 특징 해석
    if (eyes.size === 'large') {
      interpretation += '큰 눈을 가진 당신은 표현력이 풍부하고 감성적입니다. ';
    } else if (eyes.size === 'small') {
      interpretation += '작은 눈을 가진 당신은 섬세하고 집중력이 뛰어납니다. ';
    }
    
    if (eyes.shape === 'round') {
      interpretation += '둥근 눈은 순수함과 솔직함을 나타냅니다. ';
    } else if (eyes.shape === 'almond') {
      interpretation += '아몬드형 눈은 우아함과 매력을 보여줍니다. ';
    }
    
    // 입 특징 해석
    if (mouth.shape === 'full') {
      interpretation += '도톰한 입술은 감성적이고 로맨틱한 성향을 나타냅니다. ';
    } else if (mouth.shape === 'thin') {
      interpretation += '얇은 입술은 절제되고 신중한 성격을 보여줍니다. ';
    }
    
    // 전체적인 얼굴 모양 해석
    if (overall.faceShape === 'oval') {
      interpretation += '계란형 얼굴은 균형잡힌 미와 조화로움을 나타냅니다. ';
    } else if (overall.faceShape === 'heart') {
      interpretation += '하트형 얼굴은 로맨틱하고 사랑스러운 매력을 보여줍니다. ';
    } else if (overall.faceShape === 'square') {
      interpretation += '각진 얼굴은 강인함과 결단력을 나타냅니다. ';
    }
    
    // 대칭성 해석
    if (overall.symmetry === 'high') {
      interpretation += '대칭적인 얼굴은 조화롭고 안정적인 성격을 나타냅니다. ';
    }
    
    return interpretation || '기본적인 관상 특징을 바탕으로 한 해석입니다.';
  }

  /**
   * 전체 분석 신뢰도 계산
   */
  private calculateOverallConfidence(faceData: CompreFaceDetection, mappedFeatures: MappedFacialFeatures): number {
    let confidence = 0.5; // 기본 신뢰도
    
    // CompreFace 신뢰도 반영
    if (faceData.age && faceData.age.probability > 0.8) confidence += 0.1;
    if (faceData.gender && faceData.gender.probability > 0.8) confidence += 0.1;
    if (faceData.landmarks && faceData.landmarks.length >= 68) confidence += 0.1;
    
    // 포즈 신뢰도 반영
    if (faceData.pose) {
      const yaw = Math.abs(faceData.pose.yaw);
      const pitch = Math.abs(faceData.pose.pitch);
      const roll = Math.abs(faceData.pose.roll);
      
      if (yaw < 15 && pitch < 15 && roll < 15) confidence += 0.1;
    }
    
    // 매핑된 특징의 신뢰도 반영
    const featureConfidences = [
      mappedFeatures.eyes.confidence,
      mappedFeatures.nose.confidence,
      mappedFeatures.mouth.confidence,
      mappedFeatures.forehead.confidence,
      mappedFeatures.chin.confidence,
      mappedFeatures.overall.confidence
    ];
    
    const avgFeatureConfidence = featureConfidences.reduce((sum, conf) => sum + conf, 0) / featureConfidences.length;
    confidence += avgFeatureConfidence * 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * 관상 분석 결과를 간단한 요약으로 변환
   */
  generateSummary(response: FacialAnalysisResponse): string {
    const { mappedFeatures, claudeAnalysis } = response;
    
    return `${mappedFeatures.overall.faceShape} 얼굴형의 ${mappedFeatures.eyes.shape} 눈을 가진 당신은 ${claudeAnalysis.loveStyle}을 가지고 있습니다. ${claudeAnalysis.interpretation}`;
  }

  /**
   * 관상 분석 결과를 키워드 배열로 변환
   */
  generateKeywords(response: FacialAnalysisResponse): string[] {
    const { mappedFeatures, claudeAnalysis } = response;
    
    return [
      ...mappedFeatures.keywords,
      ...claudeAnalysis.recommendedKeywords,
      mappedFeatures.overall.faceShape,
      mappedFeatures.eyes.shape,
      claudeAnalysis.loveStyle
    ].filter((keyword, index, array) => array.indexOf(keyword) === index); // 중복 제거
  }
}

// 싱글톤 인스턴스
export const facialAnalysisService = new FacialAnalysisService();
