import Anthropic from '@anthropic-ai/sdk';
import { knowledgeBaseService, TraditionalText } from './knowledgeBase';

export interface ClaudeAnalysisRequest {
  nickname: string;
  gender: string;
  birthDate: string;
  faceReadingKeywords: string[];
  sajuKeywords: string[];
  faceReadingFeatures?: any;
  sajuElements?: any;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ClaudeAnalysisResponse {
  loveStyle: string;
  faceReadingInterpretation: string;
  sajuInterpretation: string;
  idealTypeDescription: string;
  recommendedKeywords: string[];
  detailedAnalysis: {
    personalityInsights: string;
    relationshipAdvice: string;
    compatibilityFactors: string;
    growthOpportunities: string;
  };
  traditionalWisdom: TraditionalText[];
}

export class ClaudeService {
  private client: Anthropic | null;
  private conversationContext: Map<string, Array<{role: 'user' | 'assistant', content: string}>> = new Map();

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
        return this.generateDummyResponse(request);
      }

      // 1. RAG를 통한 관련 전통 문헌 검색
      const traditionalTexts = await this.searchRelevantTraditionalTexts(request);
      
      // 2. 대화 컨텍스트 관리
      const conversationHistory = this.getConversationHistory(request.nickname);
      
      // 3. 고도화된 프롬프트 생성
      const prompt = this.buildAdvancedPrompt(request, traditionalTexts, conversationHistory);
      
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 3000,
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

      // 4. 대화 컨텍스트 업데이트
      this.updateConversationHistory(request.nickname, 'user', prompt);
      this.updateConversationHistory(request.nickname, 'assistant', content.text);

      return this.parseAdvancedResponse(content.text, traditionalTexts);
    } catch (error) {
      console.error('Claude API 호출 중 오류:', error);
      return this.generateDummyResponse(request);
    }
  }

  private async searchRelevantTraditionalTexts(request: ClaudeAnalysisRequest): Promise<TraditionalText[]> {
    const texts: TraditionalText[] = [];
    
    try {
      // 사주 관련 문헌 검색
      if (request.sajuElements && request.sajuKeywords) {
        const sajuTexts = await knowledgeBaseService.searchSajuTexts(
          request.sajuElements, 
          request.sajuKeywords
        );
        texts.push(...sajuTexts);
      }

      // 관상 관련 문헌 검색
      if (request.faceReadingFeatures && request.faceReadingKeywords) {
        const faceTexts = await knowledgeBaseService.searchFaceReadingTexts(
          request.faceReadingFeatures, 
          request.faceReadingKeywords
        );
        texts.push(...faceTexts);
      }

      // 궁합 관련 문헌 검색
      if (request.sajuElements) {
        const dominantElements = Object.entries(request.sajuElements)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 2);
        
        if (dominantElements.length >= 2) {
          const compatibilityTexts = await knowledgeBaseService.searchCompatibilityTexts(
            dominantElements[0][0], 
            dominantElements[1][0]
          );
          texts.push(...compatibilityTexts);
        }
      }
    } catch (error) {
      console.error('전통 문헌 검색 중 오류:', error);
    }

    return texts;
  }

  private getConversationHistory(nickname: string): Array<{role: 'user' | 'assistant', content: string}> {
    return this.conversationContext.get(nickname) || [];
  }

  private updateConversationHistory(nickname: string, role: 'user' | 'assistant', content: string): void {
    const history = this.getConversationHistory(nickname);
    history.push({ role, content });
    
    // 최근 10개 대화만 유지
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
    
    this.conversationContext.set(nickname, history);
  }

  private buildAdvancedPrompt(
    request: ClaudeAnalysisRequest, 
    traditionalTexts: TraditionalText[],
    conversationHistory: Array<{role: 'user' | 'assistant', content: string}>
  ): string {
    const traditionalWisdom = traditionalTexts
      .map(text => `[${text.title}]\n${text.content}`)
      .join('\n\n');

    const conversationContext = conversationHistory.length > 0 
      ? `\n\n이전 대화 내용:\n${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
      : '';

    return `
당신은 50년 경력의 국내 최고 권위를 가진 관상학자이자 사주 대가입니다. 
조선시대부터 전해져 내려온 전통 관상학과 사주 이론의 정수를 깊이 있게 연구하고,
수많은 사람들의 인생을 바꾼 경험을 바탕으로 진정한 운명의 해석을 제공합니다.

## 사용자 정보
- 닉네임: ${request.nickname}
- 성별: ${request.gender}
- 생년월일: ${request.birthDate}

## 분석 데이터
관상 키워드: ${request.faceReadingKeywords.join(', ')}
사주 키워드: ${request.sajuKeywords.join(', ')}

${request.faceReadingFeatures ? `관상 특징: ${JSON.stringify(request.faceReadingFeatures, null, 2)}` : ''}
${request.sajuElements ? `사주 오행: ${JSON.stringify(request.sajuElements, null, 2)}` : ''}

## 참고할 전통 문헌
${traditionalWisdom}

## 분석 요청사항
마치 정말로 사주와 관상을 보는 전문가가 직접 상담해주는 것처럼,
따뜻하고 공감적이면서도 전문적인 톤으로 분석해주세요.

### 1. 연애 스타일 분석 (감성적, 공감적)
- "당신의 얼굴을 보니..."로 시작하여 관상학적 관점에서 연애 성향 분석
- 전통 관상학과 사주 이론을 바탕으로 한 깊이 있는 연애 성향 해석
- 감정 표현 방식과 파트너와의 소통 스타일을 따뜻하게 설명
- 사랑에 대한 기본적인 태도와 접근법을 운명적 관점에서 해석

### 2. 관상 해석 (전문적, 운명적)
- "당신의 눈을 보니..." "입술을 보니..." 등으로 시작하여 각 부위별 상세 분석
- 얼굴 특징이 연애에 미치는 영향을 전통 관상학 이론으로 설명
- 매력 포인트와 개선 가능한 부분을 따뜻하게 조언
- 전통 관상학적 관점에서의 연애 운세를 운명적으로 해석

### 3. 사주 해석 (전문적, 운명적)
- "당신의 사주를 보니..."로 시작하여 오행 기운 분석
- 오행 기운이 연애에 미치는 영향을 사주 이론으로 상세 설명
- 생년월일을 통한 연애 운세를 운명적 관점에서 해석
- 사주적 관점에서의 이상형과 궁합을 전통 이론으로 분석

### 4. 이상형 상세 분석 (구체적, 실용적)
- "당신과 가장 잘 맞는 사람은..."으로 시작하여 구체적인 이상형 제시
- 전통 이론과 현대 심리학을 결합한 이상형 분석
- 구체적인 성격적 특징과 외적 특징을 상세히 설명
- 함께했을 때 시너지를 낼 수 있는 파트너 유형을 운명적으로 해석

### 5. 추천 키워드 (5개, 의미있는 설명 포함)
- 각 키워드에 대해 "이런 특성을 가진 사람과 만나면..." 식의 설명 추가
- 연애 성공을 위한 핵심 키워드와 그 이유
- 파트너와의 소통에 도움이 될 특성들과 구체적 활용법

### 6. 상세 분석 리포트 (감성적, 조언적)
- "앞으로의 연애 운세를 보니..."로 시작하여 미래 전망 제시
- 성격적 통찰과 연애에 미치는 영향을 따뜻하게 조언
- 관계 개선을 위한 구체적인 조언과 실천 방법
- 궁합 요소와 주의사항을 운명적 관점에서 설명
- 개인적 성장 기회와 발전 방향을 따뜻하게 제시

### 7. 전통 지혜 활용 (깊이 있는 해석)
- 위에서 제공된 전통 문헌의 내용을 적극 활용하여 깊이 있는 해석
- 현대적 해석과 함께 전통적 관점을 운명적으로 제시
- "옛 선현들의 지혜에 따르면..." 식의 표현 사용

## 응답 형식
- 각 섹션은 "당신의 [특징]을 보니..." "사주를 보니..." 등으로 시작
- 전문적이면서도 따뜻하고 공감적인 톤 유지
- 전통 관상학과 사주 이론의 전문성을 깊이 있게 표현
- 현대인들이 이해하기 쉽게 설명하되, 운명적이고 신비로운 느낌 유지
- "운명이 당신에게 주신 선물" "하늘이 내린 복" 등 운명적 표현 적극 활용

${conversationContext}

이전 대화의 맥락을 고려하여 연속성 있는 분석을 제공하되,
마치 정말로 사주와 관상을 보는 전문가가 직접 상담해주는 것처럼
따뜻하고 공감적이면서도 전문적인 톤으로 작성해주세요.
`;
  }

  private parseAdvancedResponse(text: string, traditionalTexts: TraditionalText[]): ClaudeAnalysisResponse {
    // 더 정교한 파싱 로직
    const sections = this.extractSections(text);
    
    return {
      loveStyle: sections.loveStyle || '분석 중...',
      faceReadingInterpretation: sections.faceReading || '분석 중...',
      sajuInterpretation: sections.saju || '분석 중...',
      idealTypeDescription: sections.idealType || '분석 중...',
      recommendedKeywords: sections.keywords || [],
      detailedAnalysis: {
        personalityInsights: sections.personalityInsights || '분석 중...',
        relationshipAdvice: sections.relationshipAdvice || '분석 중...',
        compatibilityFactors: sections.compatibilityFactors || '분석 중...',
        growthOpportunities: sections.growthOpportunities || '분석 중...'
      },
      traditionalWisdom: traditionalTexts
    };
  }

  private extractSections(text: string): Record<string, any> {
    const sections: Record<string, any> = {};
    
    // 연애 스타일 추출
    const loveStyleMatch = text.match(/### 1\. 연애 스타일 분석\s*([\s\S]*?)(?=###|$)/);
    if (loveStyleMatch) sections.loveStyle = loveStyleMatch[1].trim();

    // 관상 해석 추출
    const faceReadingMatch = text.match(/### 2\. 관상 해석\s*([\s\S]*?)(?=###|$)/);
    if (faceReadingMatch) sections.faceReading = faceReadingMatch[1].trim();

    // 사주 해석 추출
    const sajuMatch = text.match(/### 3\. 사주 해석\s*([\s\S]*?)(?=###|$)/);
    if (sajuMatch) sections.saju = sajuMatch[1].trim();

    // 이상형 추출
    const idealTypeMatch = text.match(/### 4\. 이상형 상세 분석\s*([\s\S]*?)(?=###|$)/);
    if (idealTypeMatch) sections.idealType = idealTypeMatch[1].trim();

    // 키워드 추출
    const keywordsMatch = text.match(/### 5\. 추천 키워드\s*([\s\S]*?)(?=###|$)/);
    if (keywordsMatch) {
      sections.keywords = keywordsMatch[1]
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.replace(/^[-*•]\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 5);
    }

    // 상세 분석 추출
    const detailedMatch = text.match(/### 6\. 상세 분석 리포트\s*([\s\S]*?)(?=###|$)/);
    if (detailedMatch) {
      const detailedText = detailedMatch[1];
      
      const personalityMatch = detailedText.match(/성격적 통찰[:\s]*([\s\S]*?)(?=관계 개선|궁합 요소|개인적 성장|$)/);
      if (personalityMatch) sections.personalityInsights = personalityMatch[1].trim();
      
      const adviceMatch = detailedText.match(/관계 개선[:\s]*([\s\S]*?)(?=궁합 요소|개인적 성장|$)/);
      if (adviceMatch) sections.relationshipAdvice = adviceMatch[1].trim();
      
      const compatibilityMatch = detailedText.match(/궁합 요소[:\s]*([\s\S]*?)(?=개인적 성장|$)/);
      if (compatibilityMatch) sections.compatibilityFactors = compatibilityMatch[1].trim();
      
      const growthMatch = detailedText.match(/개인적 성장[:\s]*([\s\S]*?)(?=$)/);
      if (growthMatch) sections.growthOpportunities = growthMatch[1].trim();
    }

    return sections;
  }

  private generateDummyResponse(request: ClaudeAnalysisRequest): ClaudeAnalysisResponse {
    return {
      loveStyle: `당신의 얼굴을 보니, ${request.nickname}님은 하늘이 내린 특별한 연애 운을 타고 태어나셨습니다. ${request.gender === '남성' ? '남성다운' : '여성다운'} 매력과 함께 감정적이고 직관적인 연애 스타일을 보여주시는군요. 운명이 당신에게 주신 선물 같은 매력이 연애에서 큰 힘이 될 것입니다.`,
      faceReadingInterpretation: '관상 분석 결과, 당신의 얼굴에서 따뜻하고 신뢰할 수 있는 기운이 강하게 느껴집니다. 특히 소통 능력이 뛰어나 타인과의 교감에서 큰 매력을 발휘하시는 분입니다. 이는 연애에서 매우 중요한 요소로, 상대방의 마음을 쉽게 읽어내는 능력을 가지고 계십니다.',
      sajuInterpretation: '사주를 보니, 당신은 창의적이고 성장 지향적인 성향을 타고 태어나셨습니다. 새로운 경험을 추구하는 성격으로, 연애에서도 항상 새로운 시도와 도전을 즐기시는 분입니다. 이런 특성은 파트너와의 관계를 더욱 풍부하고 흥미롭게 만들어줄 것입니다.',
      idealTypeDescription: '당신과 가장 잘 맞는 사람은 자신을 이해하고 함께 성장할 수 있는 파트너입니다. 감정적 교감과 지적 대화를 중시하며, 서로의 꿈과 목표를 공유할 수 있는 사람과 만나면 운명적인 사랑을 경험할 수 있을 것입니다.',
      recommendedKeywords: ['감성적', '창의적', '성장 지향적', '소통 능력', '신뢰성'],
      detailedAnalysis: {
        personalityInsights: '전체적으로 균형잡힌 성격으로 다양한 상황에 잘 적응하는 편입니다. 특히 연애에서 상대방의 감정을 이해하고 공감하는 능력이 뛰어나, 깊이 있는 관계를 형성할 수 있는 분입니다.',
        relationshipAdvice: '자연스러운 소통을 통해 상대방을 이해하려고 노력하세요. 당신의 직관력과 공감 능력은 연애에서 큰 강점이 될 것입니다. 상대방의 마음을 읽어내는 능력을 활용하여 더욱 깊이 있는 사랑을 만들어가세요.',
        compatibilityFactors: '감정적 교감과 지적 성장을 중시하는 파트너와 잘 맞습니다. 함께 배우고 성장할 수 있는 관계를 추구하는 분과 만나면 시너지를 낼 수 있을 것입니다.',
        growthOpportunities: '새로운 경험을 통해 더욱 풍부한 연애 경험을 쌓을 수 있습니다. 당신의 창의성과 도전 정신을 연애에도 적용하여, 파트너와 함께 새로운 모험을 떠나는 것도 좋은 방법입니다.'
      },
      traditionalWisdom: []
    };
  }

  // 대화형 분석을 위한 메서드
  async continueConversation(
    nickname: string, 
    userMessage: string, 
    previousAnalysis?: ClaudeAnalysisResponse
  ): Promise<ClaudeAnalysisResponse> {
    const conversationHistory = this.getConversationHistory(nickname);
    
    const prompt = `
이전 분석 결과를 바탕으로 추가 질문에 답변해주세요.

이전 분석 요약:
${previousAnalysis ? JSON.stringify(previousAnalysis, null, 2) : '없음'}

사용자 추가 질문: ${userMessage}

이전 대화 맥락을 고려하여 전문적이고 상세한 답변을 제공해주세요.
`;

    try {
      if (!this.client) {
        return this.generateDummyResponse({ nickname, gender: '', birthDate: '', faceReadingKeywords: [], sajuKeywords: [] });
      }

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

      this.updateConversationHistory(nickname, 'user', userMessage);
      this.updateConversationHistory(nickname, 'assistant', content.text);

      return {
        loveStyle: content.text,
        faceReadingInterpretation: '',
        sajuInterpretation: '',
        idealTypeDescription: '',
        recommendedKeywords: [],
        detailedAnalysis: {
          personalityInsights: '',
          relationshipAdvice: '',
          compatibilityFactors: '',
          growthOpportunities: ''
        },
        traditionalWisdom: []
      };
    } catch (error) {
      console.error('대화형 분석 중 오류:', error);
      return this.generateDummyResponse({ nickname, gender: '', birthDate: '', faceReadingKeywords: [], sajuKeywords: [] });
    }
  }
}

// 싱글톤 인스턴스
export const claudeService = new ClaudeService();
