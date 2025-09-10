import { claudeService, ClaudeAnalysisRequest, ClaudeAnalysisResponse } from './claude';
import { sajuService, SajuAnalysisRequest, SajuAnalysisResponse } from './saju';
import { faceReadingService, FaceReadingRequest, FaceReadingResponse } from './faceReading';
import { knowledgeBaseService } from './knowledgeBase';
import { ohaengAnalysisService, OhaengAnalysisRequest, OhaengAnalysisResponse } from './ohaengAnalysis';

export interface IntegratedAnalysisRequest {
  nickname: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  imageFile: File;
}

export interface IntegratedAnalysisResponse {
  faceReading: FaceReadingResponse;
  saju: SajuAnalysisResponse;
  claude: ClaudeAnalysisResponse;
  ohaeng: OhaengAnalysisResponse;
  summary: {
    overallStyle: string;
    compatibilityScore: number;
    keyStrengths: string[];
    recommendations: string[];
  };
  conversationId: string;
  analysisMetadata: {
    timestamp: string;
    analysisVersion: string;
    confidenceScore: number;
    traditionalWisdomCount: number;
  };
}

export class IntegratedAnalysisService {
  private analysisHistory: Map<string, IntegratedAnalysisResponse> = new Map();

  async performIntegratedAnalysis(request: IntegratedAnalysisRequest): Promise<IntegratedAnalysisResponse> {
    console.log('고도화된 통합 분석 시작:', request);

    // 1. 관상 분석 (MediaPipe 기반)
    console.log('관상 분석 시작...');
    const faceReading = await faceReadingService.analyzeFace({
      imageFile: request.imageFile
    });
    console.log('관상 분석 완료:', faceReading);

    // 2. 사주 분석 (전통 이론 기반)
    console.log('사주 분석 시작...');
    const saju = await sajuService.analyzeSaju({
      birthDate: request.birthDate,
      birthTime: request.birthTime
    });
    console.log('사주 분석 완료:', saju);

    // 3. RAG 기반 전통 문헌 검색
    console.log('전통 문헌 검색 시작...');
    const traditionalTexts = await this.searchRelevantTraditionalTexts(faceReading, saju);
    console.log('전통 문헌 검색 완료:', traditionalTexts.length, '개');

    // 4. 고도화된 Claude AI 분석 (실패해도 계속 진행)
    let claude;
    try {
      console.log('Claude AI 고도화 분석 시작...');
      
      // Vercel 타임아웃을 고려한 Promise.race 사용 (타임아웃을 12초로 증가)
      const claudePromise = claudeService.generateLoveReport({
        nickname: request.nickname,
        gender: request.gender,
        birthDate: request.birthDate,
        faceReadingKeywords: faceReading.keywords,
        sajuKeywords: saju.keywords,
        faceReadingFeatures: faceReading.features,
        sajuElements: saju.elements
      });
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Claude API timeout - 12초 내에 응답하지 않음')), 12000) // 12초 타임아웃
      );
      
      claude = await Promise.race([claudePromise, timeoutPromise]);
      console.log('Claude AI 분석 완료:', claude);
    } catch (claudeError) {
      console.error('Claude AI 분석 실패, 기본값 사용:', claudeError);
      // Claude 실패 시 기본값 사용
      claude = {
        loveStyle: '분석 중...',
        faceReadingInterpretation: '분석 중...',
        sajuInterpretation: '분석 중...',
        idealTypeDescription: '분석 중...',
        recommendedKeywords: [],
        detailedAnalysis: {
          personalityInsights: '분석 중...',
          relationshipAdvice: '분석 중...',
          compatibilityFactors: '분석 중...',
          growthOpportunities: '분석 중...'
        },
        traditionalWisdom: []
      } as ClaudeAnalysisResponse;
    }

    // 5. 오행 분석 (Claude 실패와 독립적으로 실행)
    console.log('오행 분석 시작...');
    const ohaeng = await ohaengAnalysisService.analyzeOhaeng({
      nickname: request.nickname,
      gender: request.gender,
      birthDate: request.birthDate,
      birthTime: request.birthTime,
      faceReadingKeywords: faceReading.keywords,
      sajuKeywords: saju.keywords,
      sajuElements: saju.elements
    });
    console.log('오행 분석 완료:', ohaeng);

    // 6. 통합 요약 생성
    const summary = this.generateAdvancedSummary(faceReading, saju, claude, traditionalTexts);

    // 7. 분석 메타데이터 생성
    const analysisMetadata = this.generateAnalysisMetadata(faceReading, saju, claude, traditionalTexts);

    // 8. 대화 ID 생성
    const conversationId = this.generateConversationId(request.nickname);

    const result: IntegratedAnalysisResponse = {
      faceReading,
      saju,
      claude,
      ohaeng,
      summary,
      conversationId,
      analysisMetadata
    };

    // 9. 분석 히스토리 저장
    this.analysisHistory.set(conversationId, result);

    console.log('고도화된 통합 분석 완료:', result);
    return result;
  }

  private async searchRelevantTraditionalTexts(
    faceReading: FaceReadingResponse, 
    saju: SajuAnalysisResponse
  ): Promise<any[]> {
    const texts: any[] = [];
    
    try {
      // 사주 관련 문헌 검색 (최대 2개로 제한)
      const sajuTexts = await knowledgeBaseService.searchSajuTexts(
        saju.elements, 
        saju.keywords
      );
      texts.push(...sajuTexts.slice(0, 2));

      // 관상 관련 문헌 검색 (최대 1개로 제한)
      const faceTexts = await knowledgeBaseService.searchFaceReadingTexts(
        faceReading.features, 
        faceReading.keywords
      );
      texts.push(...faceTexts.slice(0, 1));

      // 궁합 관련 문헌 검색 (최대 1개로 제한)
      const dominantElements = Object.entries(saju.elements)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 2);
      
      if (dominantElements.length >= 2) {
        const compatibilityTexts = await knowledgeBaseService.searchCompatibilityTexts(
          dominantElements[0][0], 
          dominantElements[1][0]
        );
        texts.push(...compatibilityTexts.slice(0, 1));
      }
    } catch (error) {
      console.error('전통 문헌 검색 중 오류:', error);
    }

    // 최대 4개로 제한하여 프롬프트 길이 관리
    return texts.slice(0, 4);
  }

  private generateAdvancedSummary(
    faceReading: FaceReadingResponse,
    saju: SajuAnalysisResponse,
    claude: ClaudeAnalysisResponse,
    traditionalTexts: any[]
  ): IntegratedAnalysisResponse['summary'] {
    
    // 전반적인 스타일 결정 (전통 문헌 반영)
    const overallStyle = this.determineAdvancedOverallStyle(faceReading, saju, traditionalTexts);
    
    // 궁합 점수 계산 (전통 이론 기반)
    const compatibilityScore = this.calculateAdvancedCompatibilityScore(faceReading, saju, traditionalTexts);
    
    // 주요 강점 추출 (전통 문헌 기반)
    const keyStrengths = this.extractAdvancedKeyStrengths(faceReading, saju, claude, traditionalTexts);
    
    // 추천사항 생성 (전통 지혜 반영)
    const recommendations = this.generateAdvancedRecommendations(faceReading, saju, claude, traditionalTexts);

    return {
      overallStyle,
      compatibilityScore,
      keyStrengths,
      recommendations
    };
  }

  private determineAdvancedOverallStyle(
    faceReading: FaceReadingResponse,
    saju: SajuAnalysisResponse,
    traditionalTexts: any[]
  ): string {
    const styles: string[] = [];
    
    // 관상 기반 스타일
    if (faceReading.keywords.includes('감성적') || faceReading.keywords.includes('직관적')) {
      styles.push('감성적');
    }
    if (faceReading.keywords.includes('지적 능력') || faceReading.keywords.includes('창의성')) {
      styles.push('지적');
    }
    if (faceReading.keywords.includes('의지력') || faceReading.keywords.includes('결단력')) {
      styles.push('의지적');
    }
    if (faceReading.keywords.includes('소통 능력') || faceReading.keywords.includes('사교적')) {
      styles.push('사교적');
    }
    
    // 사주 기반 스타일
    if (saju.elements.fire > 30) styles.push('열정적');
    if (saju.elements.wood > 30) styles.push('성장 지향적');
    if (saju.elements.earth > 30) styles.push('안정적');
    if (saju.elements.metal > 30) styles.push('원칙적');
    if (saju.elements.water > 30) styles.push('적응력');
    
    // 전통 문헌 기반 스타일 보완
    traditionalTexts.forEach(text => {
      if (text.content.includes('창의적') && !styles.includes('창의적')) styles.push('창의적');
      if (text.content.includes('리더십') && !styles.includes('리더십')) styles.push('리더십');
      if (text.content.includes('직관') && !styles.includes('직관적')) styles.push('직관적');
    });
    
    // 중복 제거 및 정렬
    const uniqueStyles = [...new Set(styles)];
    
    if (uniqueStyles.length === 0) {
      return '균형잡힌';
    } else if (uniqueStyles.length === 1) {
      return uniqueStyles[0];
    } else {
      return `${uniqueStyles[0]}하고 ${uniqueStyles[1]}`;
    }
  }

  private calculateAdvancedCompatibilityScore(
    faceReading: FaceReadingResponse,
    saju: SajuAnalysisResponse,
    traditionalTexts: any[]
  ): number {
    let score = 50; // 기본 점수
    
    // 관상 기반 점수
    const faceKeywords = faceReading.keywords;
    if (faceKeywords.includes('감성적')) score += 10;
    if (faceKeywords.includes('소통 능력')) score += 15;
    if (faceKeywords.includes('지적 능력')) score += 10;
    if (faceKeywords.includes('의지력')) score += 10;
    if (faceKeywords.includes('매력적')) score += 10;
    
    // 사주 기반 점수
    const elements = saju.elements;
    if (elements.fire > 30) score += 8;
    if (elements.wood > 30) score += 8;
    if (elements.earth > 30) score += 8;
    if (elements.metal > 30) score += 8;
    if (elements.water > 30) score += 8;
    
    // 전통 문헌 기반 보너스 점수
    traditionalTexts.forEach(text => {
      if (text.content.includes('상생') || text.content.includes('좋은 궁합')) {
        score += 5;
      }
      if (text.content.includes('조화') || text.content.includes('균형')) {
        score += 3;
      }
    });
    
    // 균형 보너스
    const maxElement = Math.max(...Object.values(elements));
    const minElement = Math.min(...Object.values(elements));
    if (maxElement - minElement < 20) {
      score += 10; // 균형잡힌 경우 보너스
    }
    
    return Math.min(100, Math.max(0, score)); // 0-100 범위로 제한
  }

  private extractAdvancedKeyStrengths(
    faceReading: FaceReadingResponse,
    saju: SajuAnalysisResponse,
    claude: ClaudeAnalysisResponse,
    traditionalTexts: any[]
  ): string[] {
    const strengths: string[] = [];
    
    // 관상 강점
    if (faceReading.keywords.includes('감성적')) {
      strengths.push('풍부한 감정 표현과 직관력');
    }
    if (faceReading.keywords.includes('소통 능력')) {
      strengths.push('뛰어난 소통 능력과 사교성');
    }
    if (faceReading.keywords.includes('지적 능력')) {
      strengths.push('창의적이고 지적인 사고');
    }
    if (faceReading.keywords.includes('의지력')) {
      strengths.push('강한 의지력과 결단력');
    }
    
    // 사주 강점
    if (saju.elements.fire > 30) {
      strengths.push('열정적이고 활발한 에너지');
    }
    if (saju.elements.wood > 30) {
      strengths.push('성장 지향적이고 리더십 있는 성향');
    }
    if (saju.elements.earth > 30) {
      strengths.push('안정적이고 신뢰할 수 있는 성격');
    }
    
    // 전통 문헌 기반 강점
    traditionalTexts.forEach(text => {
      if (text.content.includes('창의성') && !strengths.some(s => s.includes('창의'))) {
        strengths.push('전통적 관점에서의 창의성');
      }
      if (text.content.includes('리더십') && !strengths.some(s => s.includes('리더'))) {
        strengths.push('전통적 관점에서의 리더십');
      }
    });
    
    // Claude AI 강점
    if (claude.loveStyle.includes('감성적') || claude.loveStyle.includes('직관적')) {
      strengths.push('감정적이고 직관적인 연애 스타일');
    }
    if (claude.loveStyle.includes('성장') || claude.loveStyle.includes('발전')) {
      strengths.push('함께 성장할 수 있는 파트너십');
    }
    
    return strengths.slice(0, 5); // 최대 5개
  }

  private generateAdvancedRecommendations(
    faceReading: FaceReadingResponse,
    saju: SajuAnalysisResponse,
    claude: ClaudeAnalysisResponse,
    traditionalTexts: any[]
  ): string[] {
    const recommendations: string[] = [];
    
    // 관상 기반 추천
    if (faceReading.keywords.includes('감성적')) {
      recommendations.push('로맨틱한 데이트와 감정적 교감을 중시하세요.');
    }
    if (faceReading.keywords.includes('소통 능력')) {
      recommendations.push('대화를 통한 깊이 있는 소통을 시도해보세요.');
    }
    if (faceReading.keywords.includes('지적 능력')) {
      recommendations.push('함께 배우고 성장할 수 있는 활동을 찾아보세요.');
    }
    
    // 사주 기반 추천
    if (saju.elements.fire > 30) {
      recommendations.push('열정적이고 활발한 파트너와의 만남을 추천합니다.');
    }
    if (saju.elements.wood > 30) {
      recommendations.push('창의적이고 성장 지향적인 파트너를 찾아보세요.');
    }
    if (saju.elements.earth > 30) {
      recommendations.push('안정적이고 신뢰할 수 있는 관계를 구축하세요.');
    }
    
    // 전통 문헌 기반 추천
    traditionalTexts.forEach(text => {
      if (text.content.includes('상생') && !recommendations.some(r => r.includes('상생'))) {
        recommendations.push('전통적 관점에서 상생 관계의 파트너를 찾아보세요.');
      }
      if (text.content.includes('조화') && !recommendations.some(r => r.includes('조화'))) {
        recommendations.push('전통적 관점에서 조화로운 관계를 추구하세요.');
      }
    });
    
    // Claude AI 기반 추천
    if (claude.recommendedKeywords.length > 0) {
      recommendations.push(`'${claude.recommendedKeywords[0]}'과 같은 특성을 가진 파트너를 찾아보세요.`);
    }
    
    // 일반적인 추천
    if (recommendations.length < 3) {
      recommendations.push('자신의 강점을 잘 활용하여 자연스러운 만남을 추구하세요.');
      recommendations.push('상대방의 관심사와 가치관을 이해하려고 노력하세요.');
    }
    
    return recommendations.slice(0, 5); // 최대 5개
  }

  private generateAnalysisMetadata(
    faceReading: FaceReadingResponse,
    saju: SajuAnalysisResponse,
    claude: ClaudeAnalysisResponse,
    traditionalTexts: any[]
  ): IntegratedAnalysisResponse['analysisMetadata'] {
    // 신뢰도 점수 계산
    let confidenceScore = 70; // 기본 신뢰도
    
    // 관상 분석 신뢰도
    if (faceReading.keywords.length >= 3) confidenceScore += 10;
    if (faceReading.interpretation.length > 100) confidenceScore += 5;
    
    // 사주 분석 신뢰도
    const maxElement = Math.max(...Object.values(saju.elements));
    if (maxElement > 40) confidenceScore += 10;
    if (saju.keywords.length >= 3) confidenceScore += 5;
    
    // Claude 분석 신뢰도
    if (claude.loveStyle.length > 200) confidenceScore += 10;
    if (claude.recommendedKeywords.length >= 3) confidenceScore += 5;
    
    // 전통 문헌 활용도
    if (traditionalTexts.length >= 3) confidenceScore += 10;
    
    return {
      timestamp: new Date().toISOString(),
      analysisVersion: '2.0.0',
      confidenceScore: Math.min(100, confidenceScore),
      traditionalWisdomCount: traditionalTexts.length
    };
  }

  private generateConversationId(nickname: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${nickname}_${timestamp}_${random}`;
  }

  // 대화형 분석을 위한 메서드
  async continueConversation(
    conversationId: string,
    userMessage: string
  ): Promise<ClaudeAnalysisResponse> {
    const previousAnalysis = this.analysisHistory.get(conversationId);
    
    if (!previousAnalysis) {
      throw new Error('이전 분석 결과를 찾을 수 없습니다.');
    }

    return await claudeService.continueConversation(
      previousAnalysis.faceReading.keywords[0] || '사용자',
      userMessage,
      previousAnalysis.claude
    );
  }

  // 분석 결과를 Supabase에 저장하는 메서드
  async saveAnalysisResult(
    userId: string,
    request: IntegratedAnalysisRequest,
    response: IntegratedAnalysisResponse
  ): Promise<void> {
    try {
      // Supabase 저장 로직 구현
      console.log('분석 결과 저장:', { userId, request, response });
      
      // TODO: Supabase 테이블에 저장
      // - 사용자 ID
      // - 분석 요청 데이터
      // - 분석 결과
      // - 생성 시간
      // - 대화 ID
      // - 메타데이터
      
    } catch (error) {
      console.error('분석 결과 저장 중 오류:', error);
      // 저장 실패해도 분석 결과는 반환
    }
  }

  // 분석 히스토리 조회
  getAnalysisHistory(conversationId: string): IntegratedAnalysisResponse | undefined {
    return this.analysisHistory.get(conversationId);
  }

  // 모든 분석 히스토리 조회
  getAllAnalysisHistory(): IntegratedAnalysisResponse[] {
    return Array.from(this.analysisHistory.values());
  }
}

// 싱글톤 인스턴스
export const integratedAnalysisService = new IntegratedAnalysisService();
