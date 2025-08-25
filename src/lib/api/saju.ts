export interface SajuAnalysisRequest {
  birthDate: string;
  birthTime: string;
  birthPlace?: string;
}

export interface SajuAnalysisResponse {
  elements: {
    wood: number;    // 목(木)
    fire: number;    // 화(火)
    earth: number;   // 토(土)
    metal: number;   // 금(金)
    water: number;   // 수(水)
  };
  keywords: string[];
  personality: string;
  loveStyle: string;
  compatibility: string[];
}

export class SajuService {
  // 천간(天干) 정의
  private heavenlyStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  
  // 지지(地支) 정의
  private earthlyBranches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  
  // 오행 속성
  private elementAttributes = {
    wood: ['갑', '을', '인', '묘'],
    fire: ['병', '정', '사', '오'],
    earth: ['무', '기', '진', '술', '축', '미'],
    metal: ['경', '신', '신', '유'],
    water: ['임', '계', '자', '해']
  };

  async analyzeSaju(request: SajuAnalysisRequest): Promise<SajuAnalysisResponse> {
    try {
      const birthDate = new Date(request.birthDate);
      const birthYear = birthDate.getFullYear();
      const birthMonth = birthDate.getMonth() + 1;
      const birthDay = birthDate.getDate();
      
      // 간단한 사주 계산 (실제로는 더 복잡한 알고리즘이 필요)
      const yearStem = this.calculateYearStem(birthYear);
      const monthStem = this.calculateMonthStem(birthYear, birthMonth);
      const dayStem = this.calculateDayStem(birthDate);
      
      const elements = this.calculateElements(yearStem, monthStem, dayStem);
      const keywords = this.generateKeywords(elements);
      const personality = this.analyzePersonality(elements);
      const loveStyle = this.analyzeLoveStyle(elements);
      const compatibility = this.suggestCompatibility(elements);

      return {
        elements,
        keywords,
        personality,
        loveStyle,
        compatibility
      };
    } catch (error) {
      console.error('사주 분석 중 오류:', error);
      throw new Error('사주 분석에 실패했습니다.');
    }
  }

  private calculateYearStem(year: number): string {
    // 간단한 연도 천간 계산
    const stemIndex = (year - 4) % 10;
    return this.heavenlyStems[stemIndex];
  }

  private calculateMonthStem(year: number, month: number): string {
    // 월 천간 계산 (간단한 버전)
    const yearStem = this.calculateYearStem(year);
    const monthOffset = month - 1;
    const stemIndex = (this.heavenlyStems.indexOf(yearStem) * 2 + monthOffset) % 10;
    return this.heavenlyStems[stemIndex];
  }

  private calculateDayStem(date: Date): string {
    // 일 천간 계산 (간단한 버전)
    const baseDate = new Date(1900, 0, 1);
    const daysDiff = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    const stemIndex = daysDiff % 10;
    return this.heavenlyStems[stemIndex];
  }

  private calculateElements(yearStem: string, monthStem: string, dayStem: string): SajuAnalysisResponse['elements'] {
    const stems = [yearStem, monthStem, dayStem];
    
    let wood = 0, fire = 0, earth = 0, metal = 0, water = 0;
    
    stems.forEach(stem => {
      if (this.elementAttributes.wood.includes(stem)) wood++;
      if (this.elementAttributes.fire.includes(stem)) fire++;
      if (this.elementAttributes.earth.includes(stem)) earth++;
      if (this.elementAttributes.metal.includes(stem)) metal++;
      if (this.elementAttributes.water.includes(stem)) water++;
    });

    // 정규화 (0-100 범위)
    const total = wood + fire + earth + metal + water;
    return {
      wood: Math.round((wood / total) * 100),
      fire: Math.round((fire / total) * 100),
      earth: Math.round((earth / total) * 100),
      metal: Math.round((metal / total) * 100),
      water: Math.round((water / total) * 100)
    };
  }

  private generateKeywords(elements: SajuAnalysisResponse['elements']): string[] {
    const keywords: string[] = [];
    
    if (elements.wood > 30) keywords.push('창의적', '성장 지향적', '리더십');
    if (elements.fire > 30) keywords.push('열정적', '직감적', '활동적');
    if (elements.earth > 30) keywords.push('안정적', '신뢰성', '실용적');
    if (elements.metal > 30) keywords.push('정의감', '결단력', '정리정돈');
    if (elements.water > 30) keywords.push('지혜로움', '적응력', '사교성');

    // 균형 잡힌 경우
    const maxElement = Math.max(...Object.values(elements));
    const minElement = Math.min(...Object.values(elements));
    if (maxElement - minElement < 20) {
      keywords.push('균형잡힌', '조화로운', '다재다능');
    }

    return keywords.slice(0, 5); // 최대 5개
  }

  private analyzePersonality(elements: SajuAnalysisResponse['elements']): string {
    const dominantElements = Object.entries(elements)
      .filter(([_, value]) => value > 25)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 2);

    if (dominantElements.length === 0) {
      return '균형잡힌 성격으로 다양한 상황에 잘 적응하는 편입니다.';
    }

    const descriptions: Record<string, string> = {
      wood: '창의적이고 성장 지향적인 성격으로, 새로운 아이디어를 추구하고 리더십을 발휘하는 경향이 있습니다.',
      fire: '열정적이고 직감적인 성격으로, 활동적이며 감정 표현이 풍부하고 영감을 중요시합니다.',
      earth: '안정적이고 신뢰할 수 있는 성격으로, 실용적이며 책임감이 강하고 꾸준한 성향을 보입니다.',
      metal: '정의감이 강하고 결단력 있는 성격으로, 정리정돈을 잘하며 원칙을 중시하는 경향이 있습니다.',
      water: '지혜롭고 적응력이 뛰어난 성격으로, 사교적이며 유연한 사고를 가지고 있습니다.'
    };

    if (dominantElements.length === 1) {
      return descriptions[dominantElements[0][0]];
    } else {
      return `${descriptions[dominantElements[0][0]]} 또한 ${descriptions[dominantElements[1][0]]}`;
    }
  }

  private analyzeLoveStyle(elements: SajuAnalysisResponse['elements']): string {
    if (elements.fire > 30) {
      return '열정적이고 직감적인 연애 스타일로, 첫눈에 반하는 로맨틱한 사랑을 추구합니다.';
    } else if (elements.wood > 30) {
      return '창의적이고 성장 지향적인 연애 스타일로, 함께 성장할 수 있는 파트너를 찾습니다.';
    } else if (elements.earth > 30) {
      return '안정적이고 신뢰할 수 있는 연애 스타일로, 꾸준하고 진정한 사랑을 추구합니다.';
    } else if (elements.metal > 30) {
      return '정의감이 강하고 결단력 있는 연애 스타일로, 명확한 기준을 가지고 파트너를 선택합니다.';
    } else if (elements.water > 30) {
      return '지혜롭고 적응력이 뛰어난 연애 스타일로, 다양한 상황에 유연하게 대처합니다.';
    } else {
      return '균형잡힌 연애 스타일로, 상황에 따라 다양한 방식으로 사랑을 표현합니다.';
    }
  }

  private suggestCompatibility(elements: SajuAnalysisResponse['elements']): string[] {
    const suggestions: string[] = [];
    
    // 부족한 오행 보완
    if (elements.wood < 20) suggestions.push('목(木) 기운이 부족하여 창의성과 성장을 중시하는 파트너가 좋습니다.');
    if (elements.fire < 20) suggestions.push('화(火) 기운이 부족하여 열정적이고 활발한 파트너가 좋습니다.');
    if (elements.earth < 20) suggestions.push('토(土) 기운이 부족하여 안정적이고 신뢰할 수 있는 파트너가 좋습니다.');
    if (elements.metal < 20) suggestions.push('금(金) 기운이 부족하여 정리정돈을 잘하고 원칙적인 파트너가 좋습니다.');
    if (elements.water < 20) suggestions.push('수(水) 기운이 부족하여 지혜롭고 적응력이 뛰어난 파트너가 좋습니다.');

    // 균형 조언
    if (suggestions.length === 0) {
      suggestions.push('오행이 균형잡혀 있어 다양한 성향의 파트너와 잘 맞을 수 있습니다.');
    }

    return suggestions;
  }
}

// 싱글톤 인스턴스
export const sajuService = new SajuService();
