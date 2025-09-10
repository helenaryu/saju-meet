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
      console.log('🔍 오행 분석 시작:', request);
      console.log('🔍 사주 elements:', request.sajuElements);

      // 사주 오행 비율 계산
      const ohaengData = this.calculateOhaengRatios(request.sajuElements);
      console.log('🔍 계산된 오행 비율:', ohaengData);
      
      // Claude AI를 통한 오행 해석 생성
      const claudeInterpretation = await this.generateOhaengInterpretation(request, ohaengData);
      console.log('생성된 해석:', claudeInterpretation);
      
      // 결과 구성
      const result: OhaengAnalysisResponse = {
        labels: ["목(木)", "화(火)", "토(土)", "금(金)", "수(水)"],
        data: ohaengData,
        descriptions: claudeInterpretation.descriptions,
        personalTraits: claudeInterpretation.personalTraits,
        colors: ["#A8D5BA", "#FFB4A2", "#FFEAA7", "#B5B2C2", "#AED9E0"],
        overallInterpretation: claudeInterpretation.overallInterpretation
      };

      console.log('✅ 오행 분석 완료:', result);
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
    // 사주 서비스에서 이미 0-100% 범위로 정규화된 값을 받음
    // 따라서 그대로 사용하면 됨
    const ratios = [
      elements.wood,
      elements.fire,
      elements.earth,
      elements.metal,
      elements.water
    ];
    
    console.log('오행 비율 (정규화됨):', ratios);
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
    // 오행 비율에 따른 개인화된 설명 생성
    const descriptions = this.generateOhaengDescriptions(ohaengData, request);
    const personalTraits = this.generatePersonalTraits(ohaengData, request);
    const overallInterpretation = this.generateOverallInterpretation(ohaengData, request);
    
    return {
      descriptions,
      personalTraits,
      overallInterpretation
    };
  }

  private generateOhaengDescriptions(ohaengData: number[], request: OhaengAnalysisRequest): string[] {
    const descriptions = [];
    
    // 목(木) - 0번째
    if (ohaengData[0] > 0) {
      descriptions.push(`목의 기운이 ${ohaengData[0]}%로 강해 성장과 발전을 추구하는 성향이 뚜렷해요. 새로운 아이디어를 꾸준히 키워나가고 도전정신이 강한 편이에요.`);
    } else {
      descriptions.push(`목의 기운이 약하지만 잠재력이 있어 꾸준한 노력을 통해 성장할 수 있는 가능성이 높아요.`);
    }
    
    // 화(火) - 1번째
    if (ohaengData[1] > 0) {
      descriptions.push(`화의 기운이 ${ohaengData[1]}%로 매우 강해 열정적이고 활발한 성향이에요. 추진력이 뛰어나고 감정 표현이 솔직한 편이에요.`);
    } else {
      descriptions.push(`화의 기운이 약하지만 필요할 때 적절한 열정을 발휘할 수 있는 능력이 있어요.`);
    }
    
    // 토(土) - 2번째
    if (ohaengData[2] > 0) {
      descriptions.push(`토의 기운이 ${ohaengData[2]}%로 강해 안정감과 신뢰성을 중시하는 성향이에요. 책임감이 강하고 꾸준한 노력으로 목표를 달성해요.`);
    } else {
      descriptions.push(`토의 기운이 약하지만 필요에 따라 안정성을 추구하는 면이 있어요.`);
    }
    
    // 금(金) - 3번째
    if (ohaengData[3] > 0) {
      descriptions.push(`금의 기운이 ${ohaengData[3]}%로 강해 이성적이고 분석적인 사고를 가지고 있어요. 원칙을 중시하고 효율적인 일처리를 선호해요.`);
    } else {
      descriptions.push(`금의 기운이 약하지만 필요할 때 논리적 판단을 할 수 있는 능력이 있어요.`);
    }
    
    // 수(水) - 4번째
    if (ohaengData[4] > 0) {
      descriptions.push(`수의 기운이 ${ohaengData[4]}%로 강해 유연하고 적응력이 뛰어난 성향이에요. 직관력이 좋고 타인의 감정에 민감하게 반응해요.`);
    } else {
      descriptions.push(`수의 기운이 약하지만 상황에 맞게 유연하게 대처할 수 있는 능력이 있어요.`);
    }
    
    return descriptions;
  }

  private generatePersonalTraits(ohaengData: number[], request: OhaengAnalysisRequest): string[] {
    const traits = [];
    
    // 목(木) 특성
    if (ohaengData[0] > 0) {
      traits.push(`창의적이고 성장 지향적인 사고를 가지고 있어 새로운 도전을 두려워하지 않아요. 리더십이 있고 팀을 이끌어가는 능력이 뛰어나요.`);
    } else {
      traits.push(`신중하게 접근하되 필요할 때는 적극적으로 행동하는 균형잡힌 성향이에요.`);
    }
    
    // 화(火) 특성
    if (ohaengData[1] > 0) {
      traits.push(`열정적이고 활발한 에너지로 주변 사람들에게 긍정적인 영향을 미쳐요. 감정 표현이 솔직하고 진정성 있는 관계를 추구해요.`);
    } else {
      traits.push(`차분한 성향이지만 중요한 순간에는 적절한 열정을 보여주는 스타일이에요.`);
    }
    
    // 토(土) 특성
    if (ohaengData[2] > 0) {
      traits.push(`안정적이고 신뢰할 수 있는 성격으로 다른 사람들이 의지할 수 있는 존재예요. 꾸준한 노력으로 목표를 달성하는 인내심이 있어요.`);
    } else {
      traits.push(`유연한 사고를 가지고 있지만 필요할 때는 안정성을 추구하는 면이 있어요.`);
    }
    
    // 금(金) 특성
    if (ohaengData[3] > 0) {
      traits.push(`논리적이고 체계적인 사고로 문제를 해결하는 능력이 뛰어나요. 원칙을 중시하고 공정한 판단을 내리는 편이에요.`);
    } else {
      traits.push(`감성적이지만 필요할 때는 이성적 판단을 할 수 있는 균형잡힌 성향이에요.`);
    }
    
    // 수(水) 특성
    if (ohaengData[4] > 0) {
      traits.push(`직관력이 뛰어나고 타인의 감정을 잘 이해하는 공감 능력이 있어요. 상황에 맞게 유연하게 대처하는 적응력이 뛰어나요.`);
    } else {
      traits.push(`원칙적이지만 필요할 때는 유연한 사고를 할 수 있는 능력이 있어요.`);
    }
    
    return traits;
  }

  private generateOverallInterpretation(ohaengData: number[], request: OhaengAnalysisRequest): string {
    const maxIndex = ohaengData.indexOf(Math.max(...ohaengData));
    const maxValue = ohaengData[maxIndex];
    const elements = ['목(木)', '화(火)', '토(土)', '금(金)', '수(水)'];
    
    if (maxValue > 50) {
      return `${elements[maxIndex]}의 기운이 ${maxValue}%로 매우 강해 이 오행의 특성이 당신의 성격을 주도하고 있어요. 이 강점을 잘 활용하면 더욱 빛나는 매력을 발휘할 수 있을 거예요.`;
    } else if (maxValue > 30) {
      return `${elements[maxIndex]}의 기운이 ${maxValue}%로 강해 이 오행의 특성이 당신의 성격에 큰 영향을 미치고 있어요. 균형잡힌 성향을 유지하면서도 이 강점을 살리는 것이 좋겠어요.`;
    } else {
      return `다양한 오행의 기운이 균형있게 분포되어 있어 상황에 맞게 유연하게 대처할 수 있는 능력이 뛰어나요. 각 오행의 장점을 적절히 활용하는 것이 성공의 열쇠가 될 거예요.`;
    }
  }
}

// 싱글톤 인스턴스
export const ohaengAnalysisService = new OhaengAnalysisService();
