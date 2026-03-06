-- Create plans table
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  max_keywords INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  features JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO plans (name, max_keywords, price, features) VALUES
('Starter', 5, 29.00, '{"grid_enabled": true, "reporting": false}'),
('Standard', 20, 79.00, '{"grid_enabled": true, "reporting": true}'),
('Premium', 100, 199.00, '{"grid_enabled": true, "reporting": true, "white_label": true}');

-- Create businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ghl_subaccount_id TEXT,
  name TEXT NOT NULL,
  address TEXT,
  place_id TEXT,
  subscription_tier TEXT DEFAULT 'Starter',
  reporting_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create keywords table
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  current_rank INTEGER,
  trend TEXT CHECK (trend IN ('up', 'down', 'none')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create snapshots table
CREATE TABLE snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  avg_rank DECIMAL(5, 2),
  visibility_score DECIMAL(5, 2),
  points JSONB NOT NULL -- Stores the 7x7 grid array
);

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

-- Policies for Plans (Public Read)
CREATE POLICY "Public can view plans" ON plans FOR SELECT USING (true);

-- Policies for Businesses
CREATE POLICY "Users can view own business" ON businesses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own business" ON businesses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own business" ON businesses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for Keywords (via Business)
CREATE POLICY "Users can view own keywords" ON keywords FOR SELECT USING (
  EXISTS (SELECT 1 FROM businesses WHERE businesses.id = keywords.business_id AND businesses.user_id = auth.uid())
);
CREATE POLICY "Users can insert own keywords" ON keywords FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM businesses WHERE businesses.id = keywords.business_id AND businesses.user_id = auth.uid())
);
CREATE POLICY "Users can update own keywords" ON keywords FOR UPDATE USING (
  EXISTS (SELECT 1 FROM businesses WHERE businesses.id = keywords.business_id AND businesses.user_id = auth.uid())
);
CREATE POLICY "Users can delete own keywords" ON keywords FOR DELETE USING (
  EXISTS (SELECT 1 FROM businesses WHERE businesses.id = keywords.business_id AND businesses.user_id = auth.uid())
);

-- Policies for Snapshots (via Keyword -> Business)
CREATE POLICY "Users can view own snapshots" ON snapshots FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM keywords
    JOIN businesses ON businesses.id = keywords.business_id
    WHERE keywords.id = snapshots.keyword_id AND businesses.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert own snapshots" ON snapshots FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM keywords
    JOIN businesses ON businesses.id = keywords.business_id
    WHERE keywords.id = snapshots.keyword_id AND businesses.user_id = auth.uid()
  )
);