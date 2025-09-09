import { claudeService } from './claude';
import { CompatibilityRequest, CompatibilityResponse } from '@/types';

export class CompatibilityService {
  async analyzeCompatibility(request: CompatibilityRequest): Promise<CompatibilityResponse> {
    try {
      // 1. 관상 궁합 분석
      const faceCompatibility = this.analyzeFaceCompatibility(
        request.user1.faceKeywords,
        request.user2.faceKeywords,
        request.user1.faceAnalysis,
        request.user2.faceAnalysis
      );

      // 2. 사주 궁합 분석
      const sajuCompatibility = this.analyzeSajuCompatibility(
        request.user1.sajuKeywords,
        request.user2.sajuKeywords,
        request.user1.sajuAnalysis,
        request.user2.sajuAnalysis
      );

      // 3. 전체 점수 계산
      const overallScore = Math.round(
        (faceCompatibility.score * 0.4 + sajuCompatibility.score * 0.6)
      );

      // 4. 상세 분석 생성
      const detailedAnalysis = this.generateDetailedAnalysis(
        request,
        faceCompatibility,
        sajuCompatibility
      );

      // 5. Claude를 사용한 고급 궁합 분석
      const claudeAnalysis = await this.generateClaudeCompatibilityAnalysis(request);

      return {
        overallScore,
        faceCompatibility,
        sajuCompatibility,
        detailedAnalysis,
        claudeAnalysis
      };
    } catch (error) {
      console.error('궁합 분석 중 오류:', error);
      throw new Error('궁합 분석에 실패했습니다.');
    }
  }

  private analyzeFaceCompatibility(
    user1Keywords: string[],
    user2Keywords: string[],
    user1Analysis?: any,
    user2Analysis?: any
  ): CompatibilityResponse['faceCompatibility'] {
    // 빈 키워드 배열에 대한 fallback 처리
    const safeUser1Keywords = user1Keywords.length > 0 ? user1Keywords : ['관상 분석 필요'];
    const safeUser2Keywords = user2Keywords.length > 0 ? user2Keywords : ['관상 분석 필요'];
    
    // 키워드 매칭 점수 계산
    const commonKeywords = safeUser1Keywords.filter(keyword => 
      safeUser2Keywords.includes(keyword)
    );
    
    const keywordScore = Math.min(
      (commonKeywords.length / Math.max(safeUser1Keywords.length, safeUser2Keywords.length)) * 100,
      100
    );

    // 관상 특징 호환성 분석
    let compatibilityScore = keywordScore;
    let analysis = '';
    let keywords: string[] = [];

    // 보완적 특징 분석
    const complementaryFeatures = this.findComplementaryFeatures(user1Analysis, user2Analysis);
    if (complementaryFeatures.length > 0) {
      compatibilityScore += 10;
      keywords.push(...complementaryFeatures);
    }

    // 균형 분석
    const balanceScore = this.analyzeFaceBalance(user1Analysis, user2Analysis);
    compatibilityScore += balanceScore;

    // 최종 점수 조정 (0-100 범위)
    compatibilityScore = Math.min(Math.max(compatibilityScore, 0), 100);

    // 분석 텍스트 생성
    if (compatibilityScore >= 80) {
      analysis = '관상적으로 매우 잘 맞는 조합입니다. 서로의 매력을 인정하고 끌어당기는 힘이 강합니다.';
    } else if (compatibilityScore >= 60) {
      analysis = '관상적으로 좋은 조합입니다. 서로 보완하는 특징들이 많아 조화로운 관계를 이룰 수 있습니다.';
    } else if (compatibilityScore >= 40) {
      analysis = '관상적으로 보통 수준의 조합입니다. 서로 다른 매력을 가지고 있어 흥미로운 관계가 될 수 있습니다.';
    } else {
      analysis = '관상적으로 차이가 있는 조합입니다. 서로를 이해하고 배려하는 노력이 필요합니다.';
    }

    return {
      score: Math.round(compatibilityScore),
      analysis,
      keywords: [...commonKeywords, ...keywords].slice(0, 5)
    };
  }

  private analyzeSajuCompatibility(
    user1Keywords: string[],
    user2Keywords: string[],
    user1Analysis?: any,
    user2Analysis?: any
  ): CompatibilityResponse['sajuCompatibility'] {
    // 빈 키워드 배열에 대한 fallback 처리
    const safeUser1Keywords = user1Keywords.length > 0 ? user1Keywords : ['사주 분석 필요'];
    const safeUser2Keywords = user2Keywords.length > 0 ? user2Keywords : ['사주 분석 필요'];
    
    // 사주 키워드 매칭
    const commonKeywords = safeUser1Keywords.filter(keyword => 
      safeUser2Keywords.includes(keyword)
    );
    
    const keywordScore = Math.min(
      (commonKeywords.length / Math.max(safeUser1Keywords.length, safeUser2Keywords.length)) * 100,
      100
    );

    // 오행 궁합 분석
    let compatibilityScore = keywordScore;
    let analysis = '';
    let keywords: string[] = [];

    if (user1Analysis?.오행 && user2Analysis?.오행) {
      const ohaengScore = this.calculateOhaengCompatibility(
        user1Analysis.오행,
        user2Analysis.오행
      );
      compatibilityScore += ohaengScore;
    }

    // 사주 상성 분석
    const sajuScore = this.calculateSajuCompatibility(user1Analysis, user2Analysis);
    compatibilityScore += sajuScore;

    // 최종 점수 조정
    compatibilityScore = Math.min(Math.max(compatibilityScore, 0), 100);

    // 분석 텍스트 생성
    if (compatibilityScore >= 80) {
      analysis = '사주적으로 매우 좋은 궁합입니다. 서로의 운세를 상승시키고 조화로운 관계를 이룰 수 있습니다.';
    } else if (compatibilityScore >= 60) {
      analysis = '사주적으로 좋은 궁합입니다. 서로 보완하는 오행을 가지고 있어 안정적인 관계가 가능합니다.';
    } else if (compatibilityScore >= 40) {
      analysis = '사주적으로 보통 수준의 궁합입니다. 서로 다른 성향을 가지고 있어 균형을 맞추는 노력이 필요합니다.';
    } else {
      analysis = '사주적으로 주의가 필요한 궁합입니다. 서로의 차이를 인정하고 이해하는 자세가 중요합니다.';
    }

    return {
      score: Math.round(compatibilityScore),
      analysis,
      keywords: [...commonKeywords, ...keywords].slice(0, 5)
    };
  }

  private calculateOhaengCompatibility(
    user1Ohaeng: Record<string, number>,
    user2Ohaeng: Record<string, number>
  ): number {
    const elements = ['wood', 'fire', 'earth', 'metal', 'water'];
    let compatibilityScore = 0;

    // 오행 상생 관계 분석
    const sangsaeng = {
      wood: 'fire',
      fire: 'earth',
      earth: 'metal',
      metal: 'water',
      water: 'wood'
    };

    for (const element of elements) {
      const user1Value = user1Ohaeng[element] || 0;
      const user2Value = user2Ohaeng[element] || 0;
      
      // 같은 오행이 강한 경우
      if (user1Value > 30 && user2Value > 30) {
        compatibilityScore += 5;
      }
      
      // 상생 관계인 경우
      const targetElement = sangsaeng[element as keyof typeof sangsaeng];
      if (user1Value > 30 && user2Ohaeng[targetElement] > 30) {
        compatibilityScore += 10;
      }
    }

    return Math.min(compatibilityScore, 20);
  }

  private calculateSajuCompatibility(user1Analysis?: any, user2Analysis?: any): number {
    // 간단한 사주 궁합 점수 계산
    let score = 0;
    
    if (user1Analysis?.해석 && user2Analysis?.해석) {
      // 해석 내용의 유사성 분석 (간단한 키워드 매칭)
      const user1Words = user1Analysis.해석.split(' ');
      const user2Words = user2Analysis.해석.split(' ');
      const commonWords = user1Words.filter((word: string) => user2Words.includes(word));
      
      score += Math.min(commonWords.length * 2, 15);
    }
    
    return score;
  }

  private findComplementaryFeatures(user1Analysis?: any, user2Analysis?: any): string[] {
    const complementaryFeatures: string[] = [];
    
    if (!user1Analysis || !user2Analysis) return complementaryFeatures;

    // 관상 특징 보완성 분석
    const features = ['눈', '코', '입', '이마', '턱'];
    
    for (const feature of features) {
      if (user1Analysis[feature] && user2Analysis[feature]) {
        // 서로 다른 특징이 보완하는 경우
        if (this.isComplementary(user1Analysis[feature], user2Analysis[feature])) {
          complementaryFeatures.push(`${feature} 보완`);
        }
      }
    }
    
    return complementaryFeatures;
  }

  private isComplementary(analysis1: string, analysis2: string): boolean {
    // 간단한 보완성 판단 로직
    const complementaryPairs = [
      ['직관적', '논리적'],
      ['활발한', '차분한'],
      ['감성적', '이성적'],
      ['자유로운', '안정적인']
    ];
    
    for (const [trait1, trait2] of complementaryPairs) {
      if ((analysis1.includes(trait1) && analysis2.includes(trait2)) ||
          (analysis1.includes(trait2) && analysis2.includes(trait1))) {
        return true;
      }
    }
    
    return false;
  }

  private analyzeFaceBalance(user1Analysis?: any, user2Analysis?: any): number {
    if (!user1Analysis || !user2Analysis) return 0;
    
    // 얼굴 균형 분석
    let balanceScore = 0;
    
    // 전체적인 균형성 평가
    const user1Balance = this.calculateFaceBalance(user1Analysis);
    const user2Balance = this.calculateFaceBalance(user2Analysis);
    
    // 균형이 비슷한 경우 점수 추가
    if (Math.abs(user1Balance - user2Balance) < 20) {
      balanceScore += 5;
    }
    
    return balanceScore;
  }

  private calculateFaceBalance(analysis: any): number {
    let balance = 50; // 기본값
    
    // 각 특징별 균형 점수 계산
    const features = ['눈', '코', '입', '이마', '턱'];
    let totalScore = 0;
    
    for (const feature of features) {
      if (analysis[feature]) {
        // 특징별 균형 점수 (간단한 예시)
        totalScore += 20;
      }
    }
    
    return Math.min(totalScore, 100);
  }

  private generateDetailedAnalysis(
    request: CompatibilityRequest,
    faceCompatibility: CompatibilityResponse['faceCompatibility'],
    sajuCompatibility: CompatibilityResponse['sajuCompatibility']
  ): CompatibilityResponse['detailedAnalysis'] {
    const overallScore = Math.round(
      (faceCompatibility.score * 0.4 + sajuCompatibility.score * 0.6)
    );

    let personalityMatch = '';
    let relationshipDynamics = '';
    const challenges: string[] = [];
    const strengths: string[] = [];
    let advice = '';

    // 성격 매칭 분석
    if (overallScore >= 80) {
      personalityMatch = `${request.user1.nickname}님과 ${request.user2.nickname}님은 성격적으로 매우 잘 맞는 조합입니다. 서로의 장점을 인정하고 보완하는 관계를 이룰 수 있습니다.`;
      strengths.push('서로의 장점을 인정하는 관계');
      strengths.push('자연스러운 조화와 균형');
      strengths.push('깊은 이해와 공감');
    } else if (overallScore >= 60) {
      personalityMatch = `${request.user1.nickname}님과 ${request.user2.nickname}님은 성격적으로 좋은 조합입니다. 서로 다른 매력을 가지고 있어 흥미로운 관계가 될 수 있습니다.`;
      strengths.push('서로 다른 매력의 조화');
      strengths.push('상호 보완적 관계');
      challenges.push('서로의 차이를 이해하는 노력 필요');
    } else if (overallScore >= 40) {
      personalityMatch = `${request.user1.nickname}님과 ${request.user2.nickname}님은 성격적으로 보통 수준의 조합입니다. 서로를 이해하고 배려하는 노력이 필요합니다.`;
      challenges.push('서로의 성향 차이 이해 필요');
      challenges.push('소통과 타협의 중요성');
    } else {
      personalityMatch = `${request.user1.nickname}님과 ${request.user2.nickname}님은 성격적으로 차이가 있는 조합입니다. 서로를 존중하고 이해하는 자세가 중요합니다.`;
      challenges.push('서로의 차이를 인정하는 자세');
      challenges.push('지속적인 소통과 이해');
      challenges.push('상호 존중과 배려');
    }

    // 관계 역학 분석
    if (faceCompatibility.score > sajuCompatibility.score) {
      relationshipDynamics = '관상적 궁합이 사주적 궁합보다 좋아, 첫인상과 외적 매력에서 서로를 끌어당기는 힘이 강합니다.';
    } else if (sajuCompatibility.score > faceCompatibility.score) {
      relationshipDynamics = '사주적 궁합이 관상적 궁합보다 좋아, 시간이 지날수록 서로를 이해하고 깊은 관계를 형성할 수 있습니다.';
    } else {
      relationshipDynamics = '관상과 사주 궁합이 균형을 이루어, 다양한 면에서 서로를 보완하는 관계를 이룰 수 있습니다.';
    }

    // 조언 생성
    if (overallScore >= 80) {
      advice = '이미 좋은 궁합을 가지고 있으니, 서로의 장점을 더욱 발전시키고 함께 성장하는 관계를 유지하세요.';
    } else if (overallScore >= 60) {
      advice = '좋은 기반을 가지고 있으니, 서로의 차이를 인정하고 보완하는 관계로 발전시켜 나가세요.';
    } else if (overallScore >= 40) {
      advice = '서로를 이해하고 배려하는 노력을 통해 더 나은 관계를 만들어 나가세요.';
    } else {
      advice = '서로의 차이를 존중하고 이해하는 자세로, 점진적으로 관계를 발전시켜 나가세요.';
    }

    return {
      personalityMatch,
      relationshipDynamics,
      challenges,
      strengths,
      advice
    };
  }

  private async generateClaudeCompatibilityAnalysis(
    request: CompatibilityRequest
  ): Promise<CompatibilityResponse['claudeAnalysis']> {
    try {
      // Claude를 사용한 고급 궁합 분석
      const claudeRequest = {
        nickname: `${request.user1.nickname} & ${request.user2.nickname}`,
        gender: 'couple',
        birthDate: `${request.user1.birthDate} & ${request.user2.birthDate}`,
        faceReadingKeywords: [...request.user1.faceKeywords, ...request.user2.faceKeywords],
        sajuKeywords: [...request.user1.sajuKeywords, ...request.user2.sajuKeywords],
        faceReadingFeatures: {
          user1: request.user1.faceAnalysis,
          user2: request.user2.faceAnalysis
        },
        sajuElements: {
          user1: request.user1.sajuAnalysis,
          user2: request.user2.sajuAnalysis
        }
      };

      const claudeResponse = await claudeService.generateLoveReport(claudeRequest);

      return {
        compatibilityReport: claudeResponse.detailedAnalysis.relationshipAdvice || 
          `${request.user1.nickname}님과 ${request.user2.nickname}님의 궁합을 종합적으로 분석한 결과, 서로를 보완하는 관계를 이룰 수 있습니다.`,
        recommendations: claudeResponse.recommendedKeywords || [
          '서로의 차이를 인정하고 존중하기',
          '지속적인 소통과 이해',
          '함께 성장하는 관계 유지'
        ],
        traditionalWisdom: claudeResponse.traditionalWisdom.map(wisdom => wisdom.content) || [
          '상생상극의 원리에 따라 서로를 보완하는 관계가 가장 이상적입니다.',
          '오행의 조화를 통해 안정적이고 행복한 관계를 이룰 수 있습니다.'
        ]
      };
    } catch (error) {
      console.error('Claude 궁합 분석 중 오류:', error);
      
      // Claude 분석 실패 시 기본 분석 반환
      return {
        compatibilityReport: `${request.user1.nickname}님과 ${request.user2.nickname}님의 궁합을 분석한 결과, 서로를 보완하는 관계를 이룰 수 있습니다.`,
        recommendations: [
          '서로의 차이를 인정하고 존중하기',
          '지속적인 소통과 이해',
          '함께 성장하는 관계 유지'
        ],
        traditionalWisdom: [
          '상생상극의 원리에 따라 서로를 보완하는 관계가 가장 이상적입니다.',
          '오행의 조화를 통해 안정적이고 행복한 관계를 이룰 수 있습니다.'
        ]
      };
    }
  }
}

// 싱글톤 인스턴스
export const compatibilityService = new CompatibilityService();
