import { ClaudeAnalysisRequest } from '../claude'
import { TraditionalText } from '../knowledgeBase'

export class ClaudePromptBuilder {
  static buildAdvancedPrompt(
    request: ClaudeAnalysisRequest, 
    traditionalTexts: TraditionalText[],
    conversationHistory: Array<{role: 'user' | 'assistant', content: string}>
  ): string {
    // 전통 문헌을 최대 1개로 제한하고 매우 간단히 요약
    const traditionalWisdom = traditionalTexts.length > 0 
      ? `\n참고: ${traditionalTexts[0].title}`
      : '';

    // 대화 히스토리를 최대 2개로 제한
    const recentHistory = conversationHistory.slice(-2);
    const conversationContext = recentHistory.length > 0 
      ? `\n이전: ${recentHistory.map(msg => msg.content.substring(0, 50)).join(' | ')}`
      : '';

    return `연애 분석: ${request.nickname} (${request.gender}, ${request.birthDate})
관상: ${request.faceReadingKeywords.slice(0, 3).join(', ')}
사주: ${request.sajuKeywords.slice(0, 3).join(', ')}

JSON 응답:
{
  "loveStyle": "연애 스타일 (1-2문장)",
  "faceReadingInterpretation": "관상 해석 (1-2문장)", 
  "sajuInterpretation": "사주 해석 (1-2문장)",
  "idealTypeDescription": "이상형 (1-2문장)",
  "recommendedKeywords": ["키워드1", "키워드2"],
  "detailedAnalysis": {
    "personalityInsights": "성격 통찰 (1-2문장)",
    "relationshipAdvice": "연애 조언 (1-2문장)",
    "compatibilityFactors": "궁합 요소 (1-2문장)",
    "growthOpportunities": "성장 기회 (1-2문장)"
  }
}${traditionalWisdom}${conversationContext}`;
  }

  static buildConversationPrompt(
    nickname: string, 
    userMessage: string, 
    previousAnalysis?: any
  ): string {
    return `
이전 분석 결과를 바탕으로 추가 질문에 답변해주세요.

이전 분석 요약:
${previousAnalysis ? JSON.stringify(previousAnalysis, null, 2) : '없음'}

사용자 추가 질문: ${userMessage}

이전 대화 맥락을 고려하여 전문적이고 상세한 답변을 제공해주세요.
`;
  }
}
