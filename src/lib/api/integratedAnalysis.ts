import { claudeService, ClaudeAnalysisRequest, ClaudeAnalysisResponse } from './claude';
import { sajuService, SajuAnalysisRequest, SajuAnalysisResponse } from './saju';
import { faceReadingService, FaceReadingRequest, FaceReadingResponse } from './faceReading';

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
  summary: {
    overallStyle: string;
    compatibilityScore: number;
    keyStrengths: string[];
    recommendations: string[];
  };
}

export class IntegratedAnalysisService {
  async performIntegratedAnalysis(request: IntegratedAnalysisRequest): Promise<IntegratedAnalysisResponse> {
    try {
      console.log('통합 분석 시작:', request);

      // 1. 관상 분석
      console.log('관상 분석 시작...');
      const faceReading = await faceReadingService.analyzeFace({
        imageFile: request.imageFile
      });
      console.log('관상 분석 완료:', faceReading);

      // 2. 사주 분석
      console.log('사주 분석 시작...');
      const saju = await sajuService.analyzeSaju({
        birthDate: request.birthDate,
        birthTime: request.birthTime
      });
      console.log('사주 분석 완료:', saju);

      // 3. Claude AI 분석
      console.log('Claude AI 분석 시작...');
      const claude = await claudeService.generateLoveReport({
        nickname: request.nickname,
        gender: request.gender,
        birthDate: request.birthDate,
        faceReadingKeywords: faceReading.keywords,
        sajuKeywords: saju.keywords
      });
      console.log('Claude AI 분석 완료:', claude);

      // 4. 통합 요약 생성
      const summary = this.generateSummary(faceReading, saju, claude);

      const result: IntegratedAnalysisResponse = {
        faceReading,
        saju,
        claude,
        summary
      };

      console.log('통합 분석 완료:', result);
      return result;

    } catch (error) {
      console.error('통합 분석 중 오류:', error);
      throw new Error(`통합 분석에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  private generateSummary(
    faceReading: FaceReadingResponse,
    saju: SajuAnalysisResponse,
    claude: ClaudeAnalysisResponse
  ): IntegratedAnalysisResponse['summary'] {
    
    // 전반적인 스타일 결정
    const overallStyle = this.determineOverallStyle(faceReading, saju);
    
    // 궁합 점수 계산
    const compatibilityScore = this.calculateCompatibilityScore(faceReading, saju);
    
    // 주요 강점 추출
    const keyStrengths = this.extractKeyStrengths(faceReading, saju, claude);
    
    // 추천사항 생성
    const recommendations = this.generateRecommendations(faceReading, saju, claude);

    return {
      overallStyle,
      compatibilityScore,
      keyStrengths,
      recommendations
    };
  }

  private determineOverallStyle(
    faceReading: FaceReadingResponse,
    saju: SajuAnalysisResponse
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

  private calculateCompatibilityScore(
    faceReading: FaceReadingResponse,
    saju: SajuAnalysisResponse
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
    
    // 균형 보너스
    const maxElement = Math.max(...Object.values(elements));
    const minElement = Math.min(...Object.values(elements));
    if (maxElement - minElement < 20) {
      score += 10; // 균형잡힌 경우 보너스
    }
    
    return Math.min(100, Math.max(0, score)); // 0-100 범위로 제한
  }

  private extractKeyStrengths(
    faceReading: FaceReadingResponse,
    saju: SajuAnalysisResponse,
    claude: ClaudeAnalysisResponse
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
    
    // Claude AI 강점 (간단한 키워드 추출)
    if (claude.loveStyle.includes('감성적') || claude.loveStyle.includes('직관적')) {
      strengths.push('감정적이고 직관적인 연애 스타일');
    }
    if (claude.loveStyle.includes('성장') || claude.loveStyle.includes('발전')) {
      strengths.push('함께 성장할 수 있는 파트너십');
    }
    
    return strengths.slice(0, 5); // 최대 5개
  }

  private generateRecommendations(
    faceReading: FaceReadingResponse,
    saju: SajuAnalysisResponse,
    claude: ClaudeAnalysisResponse
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
      
    } catch (error) {
      console.error('분석 결과 저장 중 오류:', error);
      // 저장 실패해도 분석 결과는 반환
    }
  }
}

// 싱글톤 인스턴스
export const integratedAnalysisService = new IntegratedAnalysisService();
