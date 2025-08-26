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
너는 관상과 사주를 바탕으로 사용자의 연애 성향을 감성적으로 분석하는 연애 리포트 작성 전문가이자, 감정에 공감하는 상담가야.

지금부터 너는 단순 항목별 설명이 아닌, 한 편의 짧은 이야기처럼 느껴지는 연애 리포트를 작성할 거야.  
분석을 전달하는 게 아니라, **이 사람을 진심으로 이해하고 응원하는 톤**으로 말해줘.

---

📌 입력 정보

- 사용자 이름: ${request.nickname}
- 생년월일: ${request.birthDate}
- 성별: ${request.gender}
- 관상 키워드: ${request.faceReadingKeywords.join(', ')}
- 사주 키워드: ${request.sajuKeywords.join(', ')}

${request.faceReadingFeatures ? `- 관상 특징: ${JSON.stringify(request.faceReadingFeatures, null, 2)}` : ''}
${request.sajuElements ? `- 사주 오행: ${JSON.stringify(request.sajuElements, null, 2)}` : ''}

## 참고할 전통 문헌
${traditionalWisdom}

---

📄 리포트 구성

### [1. 연애 스타일 요약]  
- 이 사람은 어떤 방식으로 사랑하고, 감정을 표현하는지  
- 연애 초반/중반/위기 상황에서 어떤 태도를 보이는지  
- 사랑이란 개념을 어떤 시선으로 바라보는 사람인지

### [2. 관상 & 인상 해석]  
동양 철학의 오행 관상학을 바탕으로 깊이 있는 해석을 제공해주세요:

**이마 (화火) - 정신세계와 야망:**
- 이마의 형태와 광채를 통해 이 사람의 정신적 성향과 야망을 해석
- 권력, 성취, 이상에 대한 태도와 연애에서의 정신적 접근법

**눈 아래 (목木) - 생명력과 사랑:**
- 눈 아래 부분의 생동감과 형태를 통해 사랑에 대한 생명력과 열정 해석
- 학식, 명예, 결혼에 대한 관점과 연애에서의 성장 의지

**뺨 (토土) - 삶의 기반과 조화:**
- 뺨의 넉넉함과 형태를 통해 연애에서의 안정성과 조화 능력 해석
- 모든 가능성이 피어나는 대지처럼 연애에서의 포용력과 균형감

**인중 (금金) - 내면의 강인함:**
- 코와 입술 사이의 인중을 통해 연애에서의 의지력과 물질적 기반 해석
- 땅속 깊이 숨겨진 보물처럼 연애에서의 숨겨진 매력과 강인함

**턱 (수水) - 지혜와 여정:**
- 턱의 형태를 통해 연애에서의 지혜와 삶의 여정에 대한 태도 해석
- 잔잔히 흐르는 강물처럼 연애에서의 지속성과 성숙함

각 부위가 단순한 외모가 아닌 삶의 이야기와 운명의 흐름을 담고 있음을 감성적으로 표현해주세요.

### [3. 사주 기반 성향 분석]  
- 연애에서의 주도/수동성, 표현/내면성, 속도감 등을 중심으로  
- 오행 기반 성향이 어떻게 연애 성격에 작용하는지 비유적으로 설명

### [4. 궁합 해석]  
- 상대방과의 감정 흐름 궁합, 의사소통 궁합, 성장 궁합  
- 둘이 만났을 때 어떤 분위기가 만들어지는지 '장면처럼' 묘사  
- 감정이 잘 맞는 부분, 충돌이 예상되는 부분, 조심하면 좋은 점까지 함께

### [5. 이상형 제안]  
- 이 사람과 진심으로 잘 맞는 이상형을 '조건'이 아닌 '느낌' 중심으로 서술  
- 어떤 사람을 만났을 때 가장 안정되고 깊은 사랑을 할 수 있는지  
- 이 사람의 연애 감정이 가장 잘 피어나는 조합은 어떤지

---

🖋️ 작성 스타일 지시

- 딱딱한 항목 구분보다는, 흐름 있는 이야기처럼 작성
- 반복되는 문장은 피하고, 문장에 감정과 리듬감을 담을 것
- 상담받는 느낌이 아니라 '공감받는 편지'처럼 느껴지도록
- 독자가 "내가 진짜 어떤 사람인지 처음으로 이해받은 기분"이 들게 해줘
- 전통 관상학과 사주 이론의 전문성을 깊이 있게 표현하되, 현대적으로 해석

${conversationContext}

이전 대화의 맥락을 고려하여 연속성 있는 분석을 제공하되,
결과는 전체가 **단일 리포트 문장**처럼 자연스럽게 작성해줘.  
불필요한 목차는 붙이지 말고, 한 문단마다 따뜻한 문장이나 통찰을 남겨줘.
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
      loveStyle: `${request.nickname}님의 얼굴을 보는 순간, 마치 따뜻한 봄날 햇살처럼 부드럽고 포근한 기운이 느껴집니다. 당신은 사랑을 할 때 마음을 완전히 열고, 상대방의 감정에 깊이 공감하는 타입이에요. 연애 초반에는 조심스럽게 다가가지만, 한번 마음을 열면 진심으로 사랑하는 사람입니다. 위기 상황에서는 상대방을 이해하려고 노력하고, 함께 해결책을 찾아가는 스타일이죠.`,
      faceReadingInterpretation: `당신의 얼굴을 동양 철학의 오행 관상학으로 바라보니, 정말 아름다운 운명의 지도가 펼쳐져 있어요. 이마(화火)에서 느껴지는 정신적 성향은 연애에서도 깊이 있는 사고와 이상을 추구하는 모습을 보여줍니다. 눈 아래(목木)의 생동감은 사랑에 대한 생명력과 열정이 넘치는 것을 말해주고, 뺨(토土)의 넉넉함은 연애에서의 안정성과 조화 능력을 보여줍니다. 인중(금金)의 형태는 연애에서의 의지력과 숨겨진 강인함을, 턱(수水)은 연애에서의 지혜와 성숙함을 나타냅니다. 각 부위가 단순한 외모가 아닌 삶의 이야기와 운명의 흐름을 담고 있어, 상대방과의 깊이 있는 교감을 이끌어낼 수 있는 분입니다.`,
      sajuInterpretation: `사주를 보니, 당신은 감정을 솔직하게 표현하는 성향을 타고 태어나셨어요. 연애에서 주도적으로 이끌어가는 스타일은 아니지만, 상대방의 감정에 깊이 공감하고 함께 성장하려는 마음이 강합니다. 새로운 경험을 추구하는 성격이라 연애에서도 항상 새로운 시도와 도전을 즐기시는 분이에요. 이런 특성은 파트너와의 관계를 더욱 풍부하고 흥미롭게 만들어줄 거예요.`,
      idealTypeDescription: `당신과 가장 잘 맞는 사람은 당신의 따뜻함을 진심으로 이해하고 함께 성장할 수 있는 파트너예요. 감정적 교감과 지적 대화를 중시하며, 서로의 꿈과 목표를 공유할 수 있는 사람과 만나면 운명적인 사랑을 경험할 수 있을 거예요. 특히 당신의 공감 능력을 진가로 알아주고, 함께 새로운 모험을 떠날 준비가 된 사람이 이상적입니다.`,
      recommendedKeywords: ['#따뜻한공감', '#성장지향', '#진심사랑', '#소통능력', '#신뢰성'],
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
