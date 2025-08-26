-- Saju Meet 데이터베이스 스키마
-- Supabase SQL 편집기에서 실행하세요

-- 1. 사용자 프로필 테이블
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  region VARCHAR(100) NOT NULL,
  height VARCHAR(20) NOT NULL,
  body_type VARCHAR(50) NOT NULL,
  job VARCHAR(100) NOT NULL,
  education VARCHAR(50) NOT NULL,
  school VARCHAR(100),
  introduction TEXT,
  ideal_keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 관상 분석 결과 테이블
CREATE TABLE face_reading_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  landmarks_data JSONB, -- MediaPipe FaceMesh 결과
  face_keywords TEXT[] NOT NULL,
  face_analysis TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 사주 분석 결과 테이블
CREATE TABLE saju_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_place VARCHAR(100) NOT NULL,
  birth_place_detail VARCHAR(200),
  saju_keywords TEXT[] NOT NULL,
  saju_analysis TEXT,
  ohaeng_ratios JSONB, -- 오행 비율 데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 궁합 분석 결과 테이블
CREATE TABLE compatibility_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  face_compatibility INTEGER CHECK (face_compatibility >= 0 AND face_compatibility <= 100),
  saju_compatibility INTEGER CHECK (saju_compatibility >= 0 AND saju_compatibility <= 100),
  total_compatibility INTEGER CHECK (total_compatibility >= 0 AND total_compatibility <= 100),
  compatibility_analysis TEXT,
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- 5. 메시지 테이블
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 결제 내역 테이블
CREATE TABLE payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('profile_view', 'message', 'unlimited')),
  amount INTEGER NOT NULL, -- 원 단위
  credits_purchased INTEGER NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  toss_payment_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 사용량 추적 테이블
CREATE TABLE usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('profile_view', 'message_sent')),
  target_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 사용자 크레딧 테이블
CREATE TABLE user_credits (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  profile_view_credits INTEGER DEFAULT 10, -- 1일 10건 무료
  message_credits INTEGER DEFAULT 3, -- 1일 3명 무료
  unlimited_plan_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_user_profiles_region ON user_profiles(region);
CREATE INDEX idx_user_profiles_gender ON user_profiles(gender);
CREATE INDEX idx_user_profiles_birth_date ON user_profiles(birth_date);
CREATE INDEX idx_compatibility_results_user1 ON compatibility_results(user1_id);
CREATE INDEX idx_compatibility_results_user2 ON compatibility_results(user2_id);
CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- RLS (Row Level Security) 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_reading_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE saju_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
-- 사용자 프로필: 본인만 수정 가능, 다른 사용자는 읽기만 가능
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 관상/사주 결과: 본인만 접근 가능
CREATE POLICY "Users can access own analysis results" ON face_reading_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own saju results" ON saju_results FOR ALL USING (auth.uid() = user_id);

-- 궁합 결과: 관련된 두 사용자만 접근 가능
CREATE POLICY "Users can access own compatibility results" ON compatibility_results FOR SELECT USING (auth.uid() IN (user1_id, user2_id));

-- 메시지: 송신자와 수신자만 접근 가능
CREATE POLICY "Users can access own messages" ON messages FOR ALL USING (auth.uid() IN (sender_id, receiver_id));

-- 결제 내역: 본인만 접근 가능
CREATE POLICY "Users can access own payment history" ON payment_history FOR ALL USING (auth.uid() = user_id);

-- 사용량 추적: 본인만 접근 가능
CREATE POLICY "Users can access own usage tracking" ON usage_tracking FOR ALL USING (auth.uid() = user_id);

-- 사용자 크레딧: 본인만 접근 가능
CREATE POLICY "Users can access own credits" ON user_credits FOR ALL USING (auth.uid() = user_id);

-- 함수 생성: 사용자 크레딧 업데이트
CREATE OR REPLACE FUNCTION update_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- 프로필 조회 시 크레딧 차감
  IF NEW.action_type = 'profile_view' THEN
    UPDATE user_credits 
    SET profile_view_credits = profile_view_credits - 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  -- 메시지 전송 시 크레딧 차감
  IF NEW.action_type = 'message_sent' THEN
    UPDATE user_credits 
    SET message_credits = message_credits - 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trigger_update_user_credits
  AFTER INSERT ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_user_credits();

-- 초기 데이터 삽입 (테스트용)
INSERT INTO user_credits (user_id, profile_view_credits, message_credits)
SELECT id, 10, 3 FROM user_profiles;

-- 댓글
COMMENT ON TABLE user_profiles IS '사용자 기본 프로필 정보';
COMMENT ON TABLE face_reading_results IS '관상 분석 결과 및 랜드마크 데이터';
COMMENT ON TABLE saju_results IS '사주 분석 결과 및 오행 데이터';
COMMENT ON TABLE compatibility_results IS '두 사용자 간의 궁합 분석 결과';
COMMENT ON TABLE messages IS '사용자 간 메시지';
COMMENT ON TABLE payment_history IS '결제 내역 및 크레딧 구매';
COMMENT ON TABLE usage_tracking IS '사용량 추적 및 크레딧 소모';
COMMENT ON TABLE user_credits IS '사용자별 크레딧 잔액';

-- 기존 테이블들
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nickname TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME,
  face_reading_result JSONB,
  saju_result JSONB,
  claude_result JSONB,
  summary JSONB,
  analysis_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 전통 문헌을 위한 벡터 검색 테이블
CREATE TABLE IF NOT EXISTS traditional_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('saju', 'face_reading', 'compatibility', 'general')),
  tags TEXT[] DEFAULT '{}',
  embedding VECTOR(1536), -- OpenAI text-embedding-ada-002 모델용
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 벡터 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS traditional_texts_embedding_idx ON traditional_texts USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 카테고리별 인덱스
CREATE INDEX IF NOT EXISTS traditional_texts_category_idx ON traditional_texts(category);
CREATE INDEX IF NOT EXISTS traditional_texts_tags_idx ON traditional_texts USING GIN(tags);

-- 벡터 유사도 검색을 위한 함수
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  tags TEXT[],
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    traditional_texts.id,
    traditional_texts.title,
    traditional_texts.content,
    traditional_texts.category,
    traditional_texts.tags,
    1 - (traditional_texts.embedding <=> query_embedding) AS similarity
  FROM traditional_texts
  WHERE 
    traditional_texts.embedding IS NOT NULL
    AND (filter_category IS NULL OR traditional_texts.category = filter_category)
    AND 1 - (traditional_texts.embedding <=> query_embedding) > match_threshold
  ORDER BY traditional_texts.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 대화 히스토리를 위한 테이블
CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 대화 히스토리 인덱스
CREATE INDEX IF NOT EXISTS conversation_history_conversation_id_idx ON conversation_history(conversation_id);
CREATE INDEX IF NOT EXISTS conversation_history_user_id_idx ON conversation_history(user_id);
CREATE INDEX IF NOT EXISTS conversation_history_created_at_idx ON conversation_history(created_at);

-- 사용자 설정을 위한 테이블
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  analysis_depth TEXT DEFAULT 'standard' CHECK (analysis_depth IN ('basic', 'standard', 'detailed')),
  include_traditional_wisdom BOOLEAN DEFAULT TRUE,
  conversation_style TEXT DEFAULT 'friendly' CHECK (conversation_style IN ('formal', 'friendly', 'casual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 분석 통계를 위한 테이블
CREATE TABLE IF NOT EXISTS analysis_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_analyses INT DEFAULT 0,
  average_confidence_score FLOAT DEFAULT 0,
  most_common_elements JSONB,
  most_common_keywords TEXT[],
  last_analysis_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 통계 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_analysis_statistics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analysis_statistics (user_id, total_analyses, average_confidence_score, last_analysis_date)
  VALUES (NEW.user_id, 1, (NEW.analysis_metadata->>'confidenceScore')::FLOAT, NEW.created_at)
  ON CONFLICT (user_id) DO UPDATE SET
    total_analyses = analysis_statistics.total_analyses + 1,
    average_confidence_score = (analysis_statistics.average_confidence_score * analysis_statistics.total_analyses + (NEW.analysis_metadata->>'confidenceScore')::FLOAT) / (analysis_statistics.total_analyses + 1),
    last_analysis_date = NEW.created_at,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 분석 결과 삽입 시 통계 업데이트 트리거
CREATE TRIGGER trigger_update_analysis_statistics
  AFTER INSERT ON analysis_results
  FOR EACH ROW
  EXECUTE FUNCTION update_analysis_statistics();

-- 샘플 전통 문헌 데이터 삽입
INSERT INTO traditional_texts (title, content, category, tags) VALUES
(
  '목(木) 기운의 성격 특성',
  '목(木)은 봄의 기운으로 성장과 발전을 상징합니다. 목 기운이 강한 사람은 창의적이고 리더십이 있으며, 새로운 아이디어를 추구하는 경향이 있습니다. 연애에서는 함께 성장할 수 있는 파트너를 찾으며, 감정적으로는 직관적이고 영감을 중요시합니다.',
  'saju',
  ARRAY['목', '성장', '창의성', '리더십', '직관']
),
(
  '화(火) 기운의 연애 특성',
  '화(火)는 여름의 기운으로 열정과 활력을 상징합니다. 화 기운이 강한 사람은 열정적이고 직감적이며, 첫눈에 반하는 로맨틱한 사랑을 추구합니다. 감정 표현이 풍부하고 활동적이며, 파트너에게 따뜻한 에너지를 전달합니다.',
  'saju',
  ARRAY['화', '열정', '직감', '로맨틱', '활동적']
),
(
  '눈의 관상학적 의미',
  '눈은 마음의 창이라 하여 감정과 직관을 나타냅니다. 큰 눈은 감정 표현이 풍부하고 직관력이 뛰어나며, 작은 눈은 집중력과 분석력이 강합니다. 눈꼬리가 올라간 눈은 자신감과 매력을, 내려간 눈은 신중함과 깊이를 나타냅니다.',
  'face_reading',
  ARRAY['눈', '감정', '직관', '매력', '집중력']
),
(
  '코의 성격 반영',
  '코는 재물운과 성격을 나타내는 중요한 요소입니다. 직선적인 코는 정직하고 원칙적인 성격을, 넓은 코는 관대하고 여유로운 성격을 나타냅니다. 뾰족한 코는 예리하고 섬세한 성격을, 둥근 코는 부드럽고 따뜻한 성격을 상징합니다.',
  'face_reading',
  ARRAY['코', '정직', '관대', '예리함', '부드러움']
),
(
  '목(木)과 화(火)의 궁합',
  '목(木)과 화(火)는 상생 관계로 매우 좋은 궁합입니다. 목이 화를 생하므로 창의적인 목 기운이 열정적인 화 기운을 더욱 활발하게 만듭니다. 이 조합은 함께 성장하고 발전할 수 있는 이상적인 파트너십을 형성합니다.',
  'compatibility',
  ARRAY['목', '화', '상생', '성장', '발전']
),
(
  '토(土)와 수(水)의 조화',
  '토(土)와 수(水)는 상극 관계이지만, 적절한 균형을 이루면 매우 안정적인 관계를 형성할 수 있습니다. 토의 안정성이 수의 지혜와 조화를 이루어 신뢰할 수 있고 깊이 있는 관계를 만들어갑니다.',
  'compatibility',
  ARRAY['토', '수', '상극', '안정', '지혜']
);

-- RLS (Row Level Security) 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_statistics ENABLE ROW LEVEL SECURITY;

-- 사용자별 데이터 접근 정책
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own analysis results" ON analysis_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analysis results" ON analysis_results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own conversation history" ON conversation_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversation history" ON conversation_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own statistics" ON analysis_statistics FOR SELECT USING (auth.uid() = user_id);
