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
너는 관상과 사주 해석을 바탕으로 사람의 연애 성향을 분석하는 AI 연애 컨설턴트이자,
궁합 상담 전문가야.

지금부터 제공하는 정보는 사용자의 얼굴 특징과 생년월일, 그리고 상대방의 생년월일이야.
이를 바탕으로 다음과 같은 연애 리포트를 구성해줘.

---
📌 사용자 정보
- 이름: ${request.nickname}
- 성별: ${request.gender}
- 생년월일: ${request.birthDate}
- 관상 키워드: ${request.faceReadingKeywords.join(', ')}
- 사주 키워드: ${request.sajuKeywords.join(', ')}

${request.faceReadingFeatures ? `📌 관상 특징\n${JSON.stringify(request.faceReadingFeatures, null, 2)}` : ''}
${request.sajuElements ? `📌 사주 오행\n${JSON.stringify(request.sajuElements, null, 2)}` : ''}

## 참고할 전통 문헌
${traditionalWisdom}

---

📄 리포트 구성 항목 (총 6가지):

1. **[나의 연애 성향 요약]**  
나의 전체적인 연애 태도와 스타일을 감성적으로 설명.  
행동 패턴, 감정 흐름, 밀당 성향, 연애에서 중요시하는 가치 등을 분석.

2. **[관상 해석]**  
눈, 코, 입, 턱의 형태를 기반으로 사람의 인상과 연애 스타일을 유추.  
관상 키워드를 포함해 '감성적/이성적/주도형/수용형' 등으로 분류하고 근거를 서술.

3. **[사주 해석]**  
사주 오행 비율과 성향 키워드를 바탕으로 연애 시 장점/단점, 몰입도, 이상형에 대한 태도를 해석.  
에너지 흐름과 연애의 안정성 또는 파동성에 대한 분석도 포함.

4. **[궁합 분석]**  
상대방 생년월일을 기준으로, 오행 궁합 / 정서적 합 / 관계의 시너지 또는 갈등 가능성을 통합 분석.  
"잘 맞는 부분 / 조심해야 할 부분 / 함께 성장할 수 있는 지점"을 명확히 구분해서 설명.

5. **[어울리는 이상형 설명]**  
이 사람이 안정적으로 사랑할 수 있는 사람의 성격적 특징과 대화 방식, 감정 처리 방식 등 제안.  
실제로 만났을 때 안정감 있게 지속 가능한 관계를 만들 수 있는 조건 중심으로 서술.

6. **[연애 키워드 태깅]**  
사용자에게 어울리는 핵심 연애 키워드 5개를 해시태그 형식으로 제안.  
예: \`#직진연애 #감성폭발 #표현왕 #리드력강함 #정서안정추구\`

---

🖋️ 작성 스타일 지시

- 마치 '이 사람만을 위한 맞춤 리포트'처럼 서술할 것
- 단순 정보 나열이 아닌 감정적 공감과 통찰력을 담은 글쓰기
- 너무 점성술스럽지 않게, 현대 연애 컨설턴트처럼 자연스럽게
- 글은 문단마다 제목을 붙이고, 포인트를 나누되, 무겁지 않게
- 전통 관상학과 사주 이론의 전문성을 깊이 있게 표현하되, 현대적으로 해석
- "당신의 얼굴을 보니...", "사주를 보니..." 등으로 시작하여 전문가적 톤 유지

${conversationContext}

이전 대화의 맥락을 고려하여 연속성 있는 분석을 제공하되,
결과는 **JSON 구조** 없이 **문장 형태의 리포트**로 자연스럽게 작성해줘.
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
      loveStyle: `**[나의 연애 성향 요약]**\n\n당신의 얼굴을 보니, ${request.nickname}님은 하늘이 내린 특별한 연애 운을 타고 태어나셨습니다. ${request.gender === '남성' ? '남성다운' : '여성다운'} 매력과 함께 감정적이고 직관적인 연애 스타일을 보여주시는군요. 운명이 당신에게 주신 선물 같은 매력이 연애에서 큰 힘이 될 것입니다.`,
      faceReadingInterpretation: `**[관상 해석]**\n\n관상 분석 결과, 당신의 얼굴에서 따뜻하고 신뢰할 수 있는 기운이 강하게 느껴집니다. 특히 소통 능력이 뛰어나 타인과의 교감에서 큰 매력을 발휘하시는 분입니다. 이는 연애에서 매우 중요한 요소로, 상대방의 마음을 쉽게 읽어내는 능력을 가지고 계십니다.`,
      sajuInterpretation: `**[사주 해석]**\n\n사주를 보니, 당신은 창의적이고 성장 지향적인 성향을 타고 태어나셨습니다. 새로운 경험을 추구하는 성격으로, 연애에서도 항상 새로운 시도와 도전을 즐기시는 분입니다. 이런 특성은 파트너와의 관계를 더욱 풍부하고 흥미롭게 만들어줄 것입니다.`,
      idealTypeDescription: `**[어울리는 이상형 설명]**\n\n당신과 가장 잘 맞는 사람은 자신을 이해하고 함께 성장할 수 있는 파트너입니다. 감정적 교감과 지적 대화를 중시하며, 서로의 꿈과 목표를 공유할 수 있는 사람과 만나면 운명적인 사랑을 경험할 수 있을 것입니다.`,
      recommendedKeywords: ['#감성적', '#창의적', '#성장지향적', '#소통능력', '#신뢰성'],
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
