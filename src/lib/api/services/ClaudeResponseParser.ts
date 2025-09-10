import { ClaudeAnalysisResponse } from '../claude'
import { TraditionalText } from '../knowledgeBase'

export class ClaudeResponseParser {
  static parseAdvancedResponse(text: string, traditionalTexts: TraditionalText[]): ClaudeAnalysisResponse {
    console.log('ClaudeResponseParser: 응답 텍스트 시작:', text.substring(0, 200) + '...');
    
    // JSON 응답을 먼저 시도
    const jsonResponse = this.tryParseJsonResponse(text);
    if (jsonResponse) {
      console.log('ClaudeResponseParser: JSON 파싱 성공!');
      return {
        ...jsonResponse,
        traditionalWisdom: traditionalTexts
      };
    }
    
    console.log('ClaudeResponseParser: JSON 파싱 실패, 마크다운 방식으로 폴백');

    // JSON 파싱 실패 시 기존 마크다운 방식으로 폴백
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

  private static tryParseJsonResponse(text: string): ClaudeAnalysisResponse | null {
    try {
      console.log('tryParseJsonResponse: JSON 파싱 시도 중...');
      
      // JSON 코드 블록에서 JSON 추출
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        console.log('tryParseJsonResponse: JSON 코드 블록 발견');
        const jsonText = jsonMatch[1].trim();
        console.log('tryParseJsonResponse: JSON 텍스트:', jsonText.substring(0, 100) + '...');
        const parsed = JSON.parse(jsonText);
        console.log('tryParseJsonResponse: JSON 파싱 성공, 필수 필드 확인 중...');
        
        // 필수 필드 검증
        if (parsed.loveStyle && parsed.faceReadingInterpretation && parsed.sajuInterpretation) {
          console.log('tryParseJsonResponse: 필수 필드 검증 통과, 응답 생성');
          return {
            loveStyle: parsed.loveStyle || '분석 중...',
            faceReadingInterpretation: parsed.faceReadingInterpretation || '분석 중...',
            sajuInterpretation: parsed.sajuInterpretation || '분석 중...',
            idealTypeDescription: parsed.idealTypeDescription || '분석 중...',
            recommendedKeywords: Array.isArray(parsed.recommendedKeywords) ? parsed.recommendedKeywords : [],
            detailedAnalysis: {
              personalityInsights: parsed.detailedAnalysis?.personalityInsights || '분석 중...',
              relationshipAdvice: parsed.detailedAnalysis?.relationshipAdvice || '분석 중...',
              compatibilityFactors: parsed.detailedAnalysis?.compatibilityFactors || '분석 중...',
              growthOpportunities: parsed.detailedAnalysis?.growthOpportunities || '분석 중...'
            },
            traditionalWisdom: []
          };
        } else {
          console.log('tryParseJsonResponse: 필수 필드 부족 - loveStyle:', !!parsed.loveStyle, 'faceReading:', !!parsed.faceReadingInterpretation, 'saju:', !!parsed.sajuInterpretation);
        }
      }

      // 코드 블록 없이 직접 JSON인 경우
      const directJsonMatch = text.match(/\{[\s\S]*\}/);
      if (directJsonMatch) {
        console.log('tryParseJsonResponse: 직접 JSON 객체 발견');
        const jsonText = directJsonMatch[0];
        console.log('tryParseJsonResponse: 직접 JSON 텍스트:', jsonText.substring(0, 100) + '...');
        const parsed = JSON.parse(jsonText);
        console.log('tryParseJsonResponse: 직접 JSON 파싱 성공, 필수 필드 확인 중...');
        
        if (parsed.loveStyle && parsed.faceReadingInterpretation && parsed.sajuInterpretation) {
          console.log('tryParseJsonResponse: 직접 JSON 필수 필드 검증 통과, 응답 생성');
          return {
            loveStyle: parsed.loveStyle || '분석 중...',
            faceReadingInterpretation: parsed.faceReadingInterpretation || '분석 중...',
            sajuInterpretation: parsed.sajuInterpretation || '분석 중...',
            idealTypeDescription: parsed.idealTypeDescription || '분석 중...',
            recommendedKeywords: Array.isArray(parsed.recommendedKeywords) ? parsed.recommendedKeywords : [],
            detailedAnalysis: {
              personalityInsights: parsed.detailedAnalysis?.personalityInsights || '분석 중...',
              relationshipAdvice: parsed.detailedAnalysis?.relationshipAdvice || '분석 중...',
              compatibilityFactors: parsed.detailedAnalysis?.compatibilityFactors || '분석 중...',
              growthOpportunities: parsed.detailedAnalysis?.growthOpportunities || '분석 중...'
            },
            traditionalWisdom: []
          };
        } else {
          console.log('tryParseJsonResponse: 직접 JSON 필수 필드 부족 - loveStyle:', !!parsed.loveStyle, 'faceReading:', !!parsed.faceReadingInterpretation, 'saju:', !!parsed.sajuInterpretation);
        }
      }
      
      console.log('tryParseJsonResponse: JSON 패턴을 찾지 못함');
    } catch (error) {
      console.log('tryParseJsonResponse: JSON 파싱 실패:', error);
    }
    
    return null;
  }

  private static extractSections(text: string): Record<string, any> {
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

  static generateDummyResponse(request: any): ClaudeAnalysisResponse {
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
}
