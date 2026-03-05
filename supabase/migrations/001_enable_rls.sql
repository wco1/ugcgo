-- =============================================
-- RLS POLICIES для ugcgo.ai
-- Применить в Supabase Dashboard → SQL Editor
-- =============================================

-- 1. USER_PROFILES
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profiles"
  ON user_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- 2. CAMPAIGNS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active campaigns"
  ON campaigns FOR SELECT
  TO anon, authenticated
  USING (status = 'active' OR brand_id = (select auth.uid()));

CREATE POLICY "Brands create campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = brand_id);

CREATE POLICY "Brands update own campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = brand_id);

CREATE POLICY "Brands delete own campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = brand_id);

-- 3. APPLICATIONS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators see own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    creator_id = (select auth.uid())
    OR campaign_id IN (SELECT id FROM campaigns WHERE brand_id = (select auth.uid()))
  );

CREATE POLICY "Creators create applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = creator_id);

CREATE POLICY "Brands update application status"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    campaign_id IN (SELECT id FROM campaigns WHERE brand_id = (select auth.uid()))
  );

-- 4. CONVERSATIONS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (brand_id = (select auth.uid()) OR creator_id = (select auth.uid()));

CREATE POLICY "Users create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (brand_id = (select auth.uid()) OR creator_id = (select auth.uid()));

CREATE POLICY "Users update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (brand_id = (select auth.uid()) OR creator_id = (select auth.uid()));

-- 5. MESSAGES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see messages in own conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE brand_id = (select auth.uid()) OR creator_id = (select auth.uid())
    )
  );

CREATE POLICY "Users send messages in own conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (select auth.uid())
    AND conversation_id IN (
      SELECT id FROM conversations
      WHERE brand_id = (select auth.uid()) OR creator_id = (select auth.uid())
    )
  );
