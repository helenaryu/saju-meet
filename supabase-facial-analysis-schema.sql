-- Supabase schema for facial analysis storage
-- Run this in your Supabase SQL editor

-- Create facial_analyses table
CREATE TABLE IF NOT EXISTS facial_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  compreface_data JSONB NOT NULL,
  mapped_features JSONB NOT NULL,
  claude_analysis JSONB NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_facial_analyses_user_id ON facial_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_facial_analyses_created_at ON facial_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_facial_analyses_keywords ON facial_analyses USING GIN(keywords);

-- Enable Row Level Security
ALTER TABLE facial_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own facial analyses
CREATE POLICY "Users can view own facial analyses" ON facial_analyses
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own facial analyses
CREATE POLICY "Users can insert own facial analyses" ON facial_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own facial analyses
CREATE POLICY "Users can update own facial analyses" ON facial_analyses
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own facial analyses
CREATE POLICY "Users can delete own facial analyses" ON facial_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_facial_analyses_updated_at
  BEFORE UPDATE ON facial_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create compatibility_matches table for storing compatibility results
CREATE TABLE IF NOT EXISTS compatibility_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user1_analysis_id UUID REFERENCES facial_analyses(id) ON DELETE CASCADE,
  user2_analysis_id UUID REFERENCES facial_analyses(id) ON DELETE CASCADE,
  compatibility_score DECIMAL(3,2) CHECK (compatibility_score >= 0 AND compatibility_score <= 1),
  compatibility_factors JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for compatibility_matches
CREATE INDEX IF NOT EXISTS idx_compatibility_matches_user1 ON compatibility_matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_matches_user2 ON compatibility_matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_matches_score ON compatibility_matches(compatibility_score DESC);

-- Enable RLS for compatibility_matches
ALTER TABLE compatibility_matches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for compatibility_matches
CREATE POLICY "Users can view their compatibility matches" ON compatibility_matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert compatibility matches" ON compatibility_matches
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create user_profiles table for storing user preferences
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nickname TEXT,
  birth_date DATE,
  gender TEXT,
  ideal_type_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
