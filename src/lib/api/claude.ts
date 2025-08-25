import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeAnalysisRequest {
  nickname: string;
  gender: string;
  birthDate: string;
  faceReadingKeywords: string[];
  sajuKeywords: string[];
}

export interface ClaudeAnalysisResponse {
  loveStyle: string;
  faceReadingInterpretation: string;
  sajuInterpretation: string;
  idealTypeDescription: string;
  recommendedKeywords: string[];
}

export class ClaudeService {
  private client: Anthropic | null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY is not set. Claude API will not be available.');
      this.client = null;
    } else {
      this.client = new Anthropic({ apiKey });
    }
  }

  async generateLoveReport(request: ClaudeAnalysisRequest): Promise<ClaudeAnalysisResponse> {
    try {
      if (!this.client) {
        // API 키가 설정되지 않은 경우 더미 응답 반환
        return this.generateDummyResponse(request);
      }

      const prompt = this.buildPrompt(request);
      
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude API');
      }

      return this.parseResponse(content.text);
    } catch (error) {
      console.error('Claude API 호출 중 오류:', error);
      // 오류 발생 시 더미 응답 반환
      return this.generateDummyResponse(request);
    }
  }

  private buildPrompt(request: ClaudeAnalysisRequest): string {
    return `
당신은 전문적인 관상학자이자 사주 전문가입니다. 
사용자의 정보를 바탕으로 연애 성향과 이상형에 대한 상세한 리포트를 작성해주세요.

사용자 정보:
- 닉네임: ${request.nickname}
- 성별: ${request.gender}
- 생년월일: ${request.birthDate}

관상 분석 키워드: ${request.faceReadingKeywords.join(', ')}

사주 분석 키워드: ${request.sajuKeywords.join(', ')}

다음 형식으로 응답해주세요:

## 연애 스타일
[사용자의 연애 성향을 3-4문장으로 요약]

## 관상 해석
[관상 키워드들을 바탕으로 한 상세한 해석]

## 사주 해석  
[사주 키워드들을 바탕으로 한 상세한 해석]

## 이상형 설명
[사용자와 잘 맞는 이상형의 특징을 설명]

## 추천 키워드
[이상형과의 매칭에 도움이 될 키워드 5개]

응답은 한국어로 작성하고, 친근하고 이해하기 쉽게 설명해주세요.
`;
  }

  private parseResponse(text: string): ClaudeAnalysisResponse {
    // 실제 구현에서는 더 정교한 파싱 로직이 필요합니다
    // 현재는 간단한 구조로 반환
    return {
      loveStyle: text.includes('## 연애 스타일') ? 
        text.split('## 연애 스타일')[1]?.split('##')[0]?.trim() || '분석 중...' : '분석 중...',
      faceReadingInterpretation: text.includes('## 관상 해석') ? 
        text.split('## 관상 해석')[1]?.split('##')[0]?.trim() || '분석 중...' : '분석 중...',
      sajuInterpretation: text.includes('## 사주 해석') ? 
        text.split('## 사주 해석')[1]?.split('##')[0]?.trim() || '분석 중...' : '분석 중...',
      idealTypeDescription: text.includes('## 이상형 설명') ? 
        text.split('## 이상형 설명')[1]?.split('##')[0]?.trim() || '분석 중...' : '분석 중...',
      recommendedKeywords: text.includes('## 추천 키워드') ? 
        text.split('## 추천 키워드')[1]?.split('\n').filter(line => line.trim() && !line.startsWith('#'))
          .map(line => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean).slice(0, 5) || [] : []
    };
  }

  private generateDummyResponse(request: ClaudeAnalysisRequest): ClaudeAnalysisResponse {
    // API 키가 설정되지 않은 경우 더미 응답 생성
    return {
      loveStyle: `${request.nickname}님은 ${request.gender === '남성' ? '남성다운' : '여성다운'} 매력을 가지고 있으며, 감정적이고 직관적인 연애 스타일을 보입니다.`,
      faceReadingInterpretation: '관상 분석 결과, 따뜻하고 신뢰할 수 있는 인상을 주며, 소통 능력이 뛰어납니다.',
      sajuInterpretation: '사주 분석 결과, 창의적이고 성장 지향적인 성향을 보이며, 새로운 경험을 추구하는 성격입니다.',
      idealTypeDescription: '자신을 이해하고 함께 성장할 수 있는 파트너를 찾으며, 감정적 교감과 지적 대화를 중시합니다.',
      recommendedKeywords: ['감성적', '창의적', '성장 지향적', '소통 능력', '신뢰성']
    };
  }
}

// 싱글톤 인스턴스
export const claudeService = new ClaudeService();
