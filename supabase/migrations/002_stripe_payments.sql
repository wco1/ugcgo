-- =============================================
-- Stripe Connect + Escrow для ugcgo.ai
-- Применить в Supabase Dashboard → SQL Editor
-- =============================================

-- Stripe connected accounts для креаторов
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_onboarded BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_stripe_id TEXT;

-- Платежи (escrow)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES auth.users(id),
  creator_id UUID REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  escrow_released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- status: pending → held (деньги на платформе) → released (отправлено креатору) → refunded

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands see own payments"
  ON payments FOR SELECT TO authenticated
  USING (brand_id = (select auth.uid()) OR creator_id = (select auth.uid()));

CREATE POLICY "System creates payments"
  ON payments FOR INSERT TO authenticated
  WITH CHECK (brand_id = (select auth.uid()));

-- Подписки брендов
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own subscription"
  ON subscriptions FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- Лимиты по подпискам
-- free: 1 campaign, 3 AI генерации/день
-- starter ($199): 10 videos, 5 creators, basic AI
-- growth ($499): 30 videos, 20 creators, full AI
-- scale ($999): unlimited
