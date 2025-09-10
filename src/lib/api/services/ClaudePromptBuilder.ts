import { ClaudeAnalysisRequest } from '../claude'
import { TraditionalText } from '../knowledgeBase'

export class ClaudePromptBuilder {
  static buildAdvancedPrompt(
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
${request.nickname}님의 관상과 사주를 바탕으로 연애 성향을 분석해주세요.

**입력 정보:**
- 생년월일: ${request.birthDate}
- 성별: ${request.gender}
- 관상 키워드: ${request.faceReadingKeywords.join(', ')}
- 사주 키워드: ${request.sajuKeywords.join(', ')}
- 사주 오행: ${request.sajuElements ? JSON.stringify(request.sajuElements) : '없음'}

**분석 요청:**
1. 연애 스타일과 감정 표현 방식
2. 관상의 연애적 의미 (이마, 눈, 코, 입, 턱)
3. 사주 기반 연애 성향
4. 이상형과 궁합
5. 연애 조언

감성적이고 따뜻한 톤으로 작성해주세요.
${conversationContext}
`;
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
