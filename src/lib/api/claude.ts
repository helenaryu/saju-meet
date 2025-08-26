import Anthropic from '@anthropic-ai/sdk';
import { knowledgeBaseService, TraditionalText } from './knowledgeBase';
import { ClaudePromptBuilder } from './services/ClaudePromptBuilder';
import { ClaudeResponseParser } from './services/ClaudeResponseParser';

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
      const prompt = ClaudePromptBuilder.buildAdvancedPrompt(request, traditionalTexts, conversationHistory);
      
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

      return ClaudeResponseParser.parseAdvancedResponse(content.text, traditionalTexts);
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





  // 대화형 분석을 위한 메서드
  async continueConversation(
    nickname: string, 
    userMessage: string, 
    previousAnalysis?: ClaudeAnalysisResponse
  ): Promise<ClaudeAnalysisResponse> {
    const conversationHistory = this.getConversationHistory(nickname);
    
    const prompt = ClaudePromptBuilder.buildConversationPrompt(nickname, userMessage, previousAnalysis);

    try {
      if (!this.client) {
        return ClaudeResponseParser.generateDummyResponse({ nickname, gender: '', birthDate: '', faceReadingKeywords: [], sajuKeywords: [] });
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
      return ClaudeResponseParser.generateDummyResponse({ nickname, gender: '', birthDate: '', faceReadingKeywords: [], sajuKeywords: [] });
    }
  }
}

// 싱글톤 인스턴스
export const claudeService = new ClaudeService();
