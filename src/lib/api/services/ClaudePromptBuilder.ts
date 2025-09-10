import { ClaudeAnalysisRequest } from '../claude'
import { TraditionalText } from '../knowledgeBase'

export class ClaudePromptBuilder {
  static buildAdvancedPrompt(
    request: ClaudeAnalysisRequest, 
    traditionalTexts: TraditionalText[],
    conversationHistory: Array<{role: 'user' | 'assistant', content: string}>
  ): string {
    // 전통 문헌을 간단히 요약하여 프롬프트 길이 단축
    const traditionalWisdom = traditionalTexts.length > 0 
      ? `\n\n참고 문헌:\n${traditionalTexts.map(text => `- ${text.title}: ${text.content.substring(0, 100)}...`).join('\n')}`
      : '';

    const conversationContext = conversationHistory.length > 0 
      ? `\n\n이전 대화: ${conversationHistory.map(msg => msg.content).join(' | ')}`
      : '';

    return `${request.nickname}님의 연애 성향 분석

정보: ${request.birthDate} ${request.gender}, 관상: ${request.faceReadingKeywords.join(', ')}, 사주: ${request.sajuKeywords.join(', ')}, 오행: ${request.sajuElements ? JSON.stringify(request.sajuElements) : '없음'}

다음 형식으로 JSON 응답:
{
  "loveStyle": "연애 스타일 (2-3문장)",
  "faceReadingInterpretation": "관상 해석 (2-3문장)", 
  "sajuInterpretation": "사주 해석 (2-3문장)",
  "idealTypeDescription": "이상형 (2-3문장)",
  "recommendedKeywords": ["키워드1", "키워드2", "키워드3"],
  "detailedAnalysis": {
    "personalityInsights": "성격 통찰 (2-3문장)",
    "relationshipAdvice": "연애 조언 (2-3문장)",
    "compatibilityFactors": "궁합 요소 (2-3문장)",
    "growthOpportunities": "성장 기회 (2-3문장)"
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
