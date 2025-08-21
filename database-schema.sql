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
