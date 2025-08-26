import { createClient } from '@supabase/supabase-js';

export interface TraditionalText {
  id: string;
  title: string;
  content: string;
  category: 'saju' | 'face_reading' | 'compatibility' | 'general';
  tags: string[];
  embedding?: number[];
}

export interface KnowledgeQuery {
  query: string;
  category?: 'saju' | 'face_reading' | 'compatibility' | 'general';
  limit?: number;
}

export class KnowledgeBaseService {
  private supabase;
  private traditionalTexts: TraditionalText[] = [];

  constructor() {
    // Supabase가 설정되지 않은 경우를 대비한 초기화
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseAnonKey && 
          supabaseUrl !== 'your_supabase_url_here' && 
          supabaseAnonKey !== 'your_supabase_anon_key_here') {
        this.supabase = createClient(supabaseUrl, supabaseAnonKey);
      }
    } catch (error) {
      console.log('Supabase 초기화 실패:', error);
    }
    
    // 기본 전통 문헌 데이터 초기화
    this.initializeBasicTraditionalTexts();
  }

  // 기본 전통 문헌 데이터 (OpenAI API 없이도 작동)
  private initializeBasicTraditionalTexts(): void {
    this.traditionalTexts = [
      {
        id: 'saju_wood_1',
        title: '목(木) 기운의 성격 특성',
        content: '목(木)은 봄의 기운으로 성장과 발전을 상징합니다. 목 기운이 강한 사람은 창의적이고 리더십이 있으며, 새로운 아이디어를 추구하는 경향이 있습니다. 연애에서는 함께 성장할 수 있는 파트너를 찾으며, 감정적으로는 직관적이고 영감을 중요시합니다.',
        category: 'saju',
        tags: ['목', '성장', '창의성', '리더십', '직관']
      },
      {
        id: 'saju_fire_1',
        title: '화(火) 기운의 연애 특성',
        content: '화(火)는 여름의 기운으로 열정과 활력을 상징합니다. 화 기운이 강한 사람은 열정적이고 직감적이며, 첫눈에 반하는 로맨틱한 사랑을 추구합니다. 감정 표현이 풍부하고 활동적이며, 파트너에게 따뜻한 에너지를 전달합니다.',
        category: 'saju',
        tags: ['화', '열정', '직감', '로맨틱', '활동적']
      },
      {
        id: 'saju_earth_1',
        title: '토(土) 기운의 안정성',
        content: '토(土)는 중앙의 기운으로 안정과 신뢰를 상징합니다. 토 기운이 강한 사람은 안정적이고 신뢰할 수 있으며, 책임감이 강하고 꾸준한 성향을 보입니다. 연애에서는 진정한 사랑을 추구하며, 파트너에게 안전감을 제공합니다.',
        category: 'saju',
        tags: ['토', '안정', '신뢰', '책임감', '꾸준함']
      },
      {
        id: 'saju_metal_1',
        title: '금(金) 기운의 원칙성',
        content: '금(金)은 가을의 기운으로 정의와 원칙을 상징합니다. 금 기운이 강한 사람은 정의감이 강하고 결단력이 있으며, 정리정돈을 잘하고 원칙을 중시합니다. 연애에서는 명확한 기준을 가지고 파트너를 선택합니다.',
        category: 'saju',
        tags: ['금', '정의', '결단력', '원칙', '정리정돈']
      },
      {
        id: 'saju_water_1',
        title: '수(水) 기운의 지혜',
        content: '수(水)는 겨울의 기운으로 지혜와 적응력을 상징합니다. 수 기운이 강한 사람은 지혜롭고 적응력이 뛰어나며, 사교적이고 유연한 사고를 가지고 있습니다. 연애에서는 다양한 상황에 유연하게 대처합니다.',
        category: 'saju',
        tags: ['수', '지혜', '적응력', '사교성', '유연함']
      },
      {
        id: 'face_eyes_1',
        title: '눈의 관상학적 의미',
        content: '눈은 마음의 창이라 하여 감정과 직관을 나타냅니다. 큰 눈은 감정 표현이 풍부하고 직관력이 뛰어나며, 작은 눈은 집중력과 분석력이 강합니다. 눈꼬리가 올라간 눈은 자신감과 매력을, 내려간 눈은 신중함과 깊이를 나타냅니다.',
        category: 'face_reading',
        tags: ['눈', '감정', '직관', '매력', '집중력']
      },
      {
        id: 'face_nose_1',
        title: '코의 성격 반영',
        content: '코는 재물운과 성격을 나타내는 중요한 요소입니다. 직선적인 코는 정직하고 원칙적인 성격을, 넓은 코는 관대하고 여유로운 성격을 나타냅니다. 뾰족한 코는 예리하고 섬세한 성격을, 둥근 코는 부드럽고 따뜻한 성격을 상징합니다.',
        category: 'face_reading',
        tags: ['코', '정직', '관대', '예리함', '부드러움']
      },
      {
        id: 'face_mouth_1',
        title: '입의 소통 능력',
        content: '입은 소통과 감정 표현을 나타냅니다. 큰 입은 소통 능력이 뛰어나고 사교적이며, 작은 입은 신중하고 조용한 성격을 나타냅니다. 입꼬리가 올라간 입은 긍정적이고 친근한 성격을, 두꺼운 입술은 감정적이고 따뜻한 성격을 상징합니다.',
        category: 'face_reading',
        tags: ['입', '소통', '사교성', '신중함', '감정적']
      },
      {
        id: 'compatibility_wood_fire',
        title: '목(木)과 화(火)의 궁합',
        content: '목(木)과 화(火)는 상생 관계로 매우 좋은 궁합입니다. 목이 화를 생하므로 창의적인 목 기운이 열정적인 화 기운을 더욱 활발하게 만듭니다. 이 조합은 함께 성장하고 발전할 수 있는 이상적인 파트너십을 형성합니다.',
        category: 'compatibility',
        tags: ['목', '화', '상생', '성장', '발전']
      },
      {
        id: 'compatibility_earth_water',
        title: '토(土)와 수(水)의 조화',
        content: '토(土)와 수(水)는 상극 관계이지만, 적절한 균형을 이루면 매우 안정적인 관계를 형성할 수 있습니다. 토의 안정성이 수의 지혜와 조화를 이루어 신뢰할 수 있고 깊이 있는 관계를 만들어갑니다.',
        category: 'compatibility',
        tags: ['토', '수', '상극', '안정', '지혜']
      },
      {
        id: 'compatibility_metal_wood',
        title: '금(金)과 목(木)의 균형',
        content: '금(金)과 목(木)은 상극 관계이지만, 서로를 보완하는 관계입니다. 금의 원칙성이 목의 창의성을 조절하고, 목의 성장이 금의 고정관념을 깨뜨립니다. 이 조합은 균형잡힌 관계를 만들어갑니다.',
        category: 'compatibility',
        tags: ['금', '목', '상극', '보완', '균형']
      }
    ];
  }

  // 키워드 기반 검색 (OpenAI API 없이 작동)
  async searchRelevantTexts(query: KnowledgeQuery): Promise<TraditionalText[]> {
    try {
      // Supabase가 설정된 경우 벡터 검색 시도
      if (this.supabase) {
        try {
          const queryEmbedding = await this.generateEmbedding(query.query);
          
          const { data, error } = await this.supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: 0.7,
            match_count: query.limit || 5,
            filter_category: query.category
          });

          if (!error && data) {
            return data;
          }
        } catch (error) {
          console.log('벡터 검색 실패, 키워드 검색으로 대체:', error);
        }
      }

      // 키워드 기반 검색 (OpenAI API 없이도 작동)
      return this.searchByKeywords(query.query, query.category, query.limit || 5);
      
    } catch (error) {
      console.error('문헌 검색 중 오류:', error);
      // 오류 발생 시 키워드 검색으로 대체
      return this.searchByKeywords(query.query, query.category, query.limit || 5);
    }
  }

  // 키워드 기반 검색 구현
  private searchByKeywords(query: string, category?: string, limit: number = 5): TraditionalText[] {
    const queryKeywords = query.toLowerCase().split(/\s+/);
    
    let results = this.traditionalTexts
      .filter(text => {
        // 카테고리 필터링
        if (category && text.category !== category) return false;
        
        // 키워드 매칭 점수 계산
        const contentLower = text.content.toLowerCase();
        const tagsLower = text.tags.map(tag => tag.toLowerCase());
        
        let score = 0;
        queryKeywords.forEach(keyword => {
          if (contentLower.includes(keyword)) score += 2;
          if (tagsLower.some(tag => tag.includes(keyword))) score += 3;
          if (text.title.toLowerCase().includes(keyword)) score += 4;
        });
        
        return score > 0;
      })
      .map(text => {
        // 매칭 점수 계산
        const contentLower = text.content.toLowerCase();
        const tagsLower = text.tags.map(tag => tag.toLowerCase());
        
        let score = 0;
        queryKeywords.forEach(keyword => {
          if (contentLower.includes(keyword)) score += 2;
          if (tagsLower.some(tag => tag.includes(keyword))) score += 3;
          if (text.title.toLowerCase().includes(keyword)) score += 4;
        });
        
        return { ...text, score };
      })
      .sort((a, b) => (b as any).score - (a as any).score)
      .slice(0, limit);

    return results;
  }

  // 사주 특성에 따른 맞춤 문헌 검색
  async searchSajuTexts(elements: any, keywords: string[]): Promise<TraditionalText[]> {
    const dominantElement = Object.entries(elements)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0][0];
    
    const query = `${dominantElement} 기운 ${keywords.join(' ')} 연애 성향`;
    
    return this.searchRelevantTexts({
      query,
      category: 'saju',
      limit: 3
    });
  }

  // 관상 특성에 따른 맞춤 문헌 검색
  async searchFaceReadingTexts(features: any, keywords: string[]): Promise<TraditionalText[]> {
    const query = `${keywords.join(' ')} 관상 특성 연애 매력`;
    
    return this.searchRelevantTexts({
      query,
      category: 'face_reading',
      limit: 3
    });
  }

  // 궁합 분석을 위한 문헌 검색
  async searchCompatibilityTexts(element1: string, element2: string): Promise<TraditionalText[]> {
    const query = `${element1} ${element2} 궁합 연애`;
    
    return this.searchRelevantTexts({
      query,
      category: 'compatibility',
      limit: 2
    });
  }

  // OpenAI Embeddings API를 사용한 벡터 생성 (선택사항)
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // OpenAI API 키가 설정되지 않은 경우 더미 벡터 반환
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        return Array.from({ length: 1536 }, () => Math.random());
      }

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-ada-002'
        })
      });

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('임베딩 생성 중 오류:', error);
      // 오류 시 더미 벡터 반환
      return Array.from({ length: 1536 }, () => Math.random());
    }
  }

  // 전통 문헌 데이터베이스 초기화 (Supabase 설정 시)
  async initializeTraditionalTexts(): Promise<void> {
    if (!this.supabase) {
      console.log('Supabase가 설정되지 않아 로컬 데이터만 사용합니다.');
      return;
    }

    try {
      // 벡터 임베딩 생성 및 저장
      for (const text of this.traditionalTexts) {
        await this.storeTextWithEmbedding(text);
      }
      console.log('전통 문헌 데이터베이스 초기화 완료');
    } catch (error) {
      console.error('데이터베이스 초기화 중 오류:', error);
    }
  }

  // 텍스트를 벡터 임베딩과 함께 저장
  private async storeTextWithEmbedding(text: TraditionalText): Promise<void> {
    if (!this.supabase) return;

    try {
      const embedding = await this.generateEmbedding(text.content);
      
      await this.supabase
        .from('traditional_texts')
        .upsert({
          ...text,
          embedding
        });
    } catch (error) {
      console.error('텍스트 저장 중 오류:', error);
    }
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
