import { claudeService } from './claude';

export interface OhaengAnalysisRequest {
  nickname: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  faceReadingKeywords: string[];
  sajuKeywords: string[];
  sajuElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
}

export interface OhaengAnalysisResponse {
  labels: string[];
  data: number[];
  descriptions: string[];
  personalTraits: string[];
  colors: string[];
  overallInterpretation: string;
}

export class OhaengAnalysisService {
  async analyzeOhaeng(request: OhaengAnalysisRequest): Promise<OhaengAnalysisResponse> {
    try {
      console.log('오행 분석 시작:', request);

      // 사주 오행 비율 계산
      const ohaengData = this.calculateOhaengRatios(request.sajuElements);
      
      // Claude AI를 통한 오행 해석 생성
      const claudeInterpretation = await this.generateOhaengInterpretation(request, ohaengData);
      
      // 결과 구성
      const result: OhaengAnalysisResponse = {
        labels: ["목(木)", "화(火)", "토(土)", "금(金)", "수(水)"],
        data: ohaengData,
        descriptions: claudeInterpretation.descriptions,
        personalTraits: claudeInterpretation.personalTraits,
        colors: ["#A8D5BA", "#FFB4A2", "#FFEAA7", "#B5B2C2", "#AED9E0"],
        overallInterpretation: claudeInterpretation.overallInterpretation
      };

      console.log('오행 분석 완료:', result);
      return result;

    } catch (error) {
      console.error('오행 분석 중 오류:', error);
      throw new Error(`오행 분석에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  private calculateOhaengRatios(elements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  }): number[] {
    // 사주 오행 비율을 0-100% 범위로 정규화
    const total = elements.wood + elements.fire + elements.earth + elements.metal + elements.water;
    
    if (total === 0) {
      // 기본 균형 비율 (모든 오행이 동일)
      return [20, 20, 20, 20, 20];
    }

    const ratios = [
      Math.round((elements.wood / total) * 100),
      Math.round((elements.fire / total) * 100),
      Math.round((elements.earth / total) * 100),
      Math.round((elements.metal / total) * 100),
      Math.round((elements.water / total) * 100)
    ];
    
    return ratios;
  }

  private async generateOhaengInterpretation(
    request: OhaengAnalysisRequest,
    ohaengData: number[]
  ): Promise<{
    descriptions: string[];
    personalTraits: string[];
    overallInterpretation: string;
  }> {
    const prompt = `
당신은 전통 동양 철학과 사주학에 깊은 지식을 가진 전문가입니다. 
사용자의 사주 정보와 관상 분석 결과를 바탕으로 오행(목화토금수) 분석을 해주세요.

**사용자 정보:**
- 이름: ${request.nickname}
- 성별: ${request.gender}
- 생년월일: ${request.birthDate}
- 출생시간: ${request.birthTime}

**관상 분석 키워드:** ${request.faceReadingKeywords.join(', ')}

**사주 분석 키워드:** ${request.sajuKeywords.join(', ')}

**오행 비율:**
- 목(木): ${ohaengData[0]}%
- 화(火): ${ohaengData[1]}%
- 토(土): ${ohaengData[2]}%
- 금(金): ${ohaengData[3]}%
- 수(水): ${ohaengData[4]}%

다음 형식으로 JSON 응답해주세요:

{
  "descriptions": [
    "목(木)에 대한 기본 성향 설명 (2-3문장, 개인화된 내용)",
    "화(火)에 대한 기본 성향 설명 (2-3문장, 개인화된 내용)",
    "토(土)에 대한 기본 성향 설명 (2-3문장, 개인화된 내용)",
    "금(金)에 대한 기본 성향 설명 (2-3문장, 개인화된 내용)",
    "수(水)에 대한 기본 성향 설명 (2-3문장, 개인화된 내용)"
  ],
  "personalTraits": [
    "목(木) 기질의 개인적 특징과 연애/성향 해석 (2-3문장)",
    "화(火) 기질의 개인적 특징과 연애/성향 해석 (2-3문장)",
    "토(土) 기질의 개인적 특징과 연애/성향 해석 (2-3문장)",
    "금(金) 기질의 개인적 특징과 연애/성향 해석 (2-3문장)",
    "수(水) 기질의 개인적 특징과 연애/성향 해석 (2-3문장)"
  ],
  "overallInterpretation": "전체적인 오행 분석 종합 해석 (3-4문장, 개인의 특성을 반영한 종합적인 평가)"
}

**중요 지침:**
1. 각 오행의 설명은 사용자의 실제 사주와 관상 정보를 반영해야 합니다
2. 개인화된 내용으로 작성하되, 전통적인 오행 이론을 기반으로 해야 합니다
3. 연애와 성향에 대한 구체적인 해석을 포함해야 합니다
4. 긍정적이고 건설적인 톤으로 작성하세요
5. JSON 형식을 정확히 지켜주세요
`;

    try {
      const claudeRequest = {
        nickname: request.nickname,
        gender: request.gender,
        birthDate: request.birthDate,
        faceReadingKeywords: request.faceReadingKeywords,
        sajuKeywords: request.sajuKeywords,
        faceReadingFeatures: {},
        sajuElements: request.sajuElements
      };
      
      const response = await claudeService.generateLoveReport(claudeRequest);
      
      return {
        descriptions: response.detailedAnalysis.personalityInsights ? [response.detailedAnalysis.personalityInsights] : [],
        personalTraits: response.recommendedKeywords || [],
        overallInterpretation: response.detailedAnalysis.relationshipAdvice || ''
      };
    } catch (error) {
      console.error('Claude 오행 해석 생성 중 오류:', error);
      
      // 기본값 반환
      return {
        descriptions: [
          "자라나는 생명력, 성장성과 끈기를 갖고 있어요.",
          "불 같은 추진력, 열정과 감정의 폭발이 강한 편이에요.",
          "중심을 잡는 안정감, 책임감과 인내심이 돋보입니다.",
          "냉철한 판단력, 이성적이고 분석적인 면이 강합니다.",
          "유연한 사고와 감성, 흐름에 순응하는 스타일이에요."
        ],
        personalTraits: [
          "아이디어를 꾸준히 키워나가는 스타일이에요.",
          "때론 감정에 솔직하게 반응하며 이끌어가는 편이에요.",
          "무게감 있게 중심을 잡고 리더십을 발휘해요.",
          "꼼꼼하고 효율적인 일처리를 잘하는 편이에요.",
          "타인의 감정에 민감하고 배려심이 많아요."
        ],
        overallInterpretation: "당신의 오행 분석 결과를 종합해보면, 균형잡힌 성향을 보이고 있습니다."
      };
    }
  }
}

// 싱글톤 인스턴스
export const ohaengAnalysisService = new OhaengAnalysisService();
