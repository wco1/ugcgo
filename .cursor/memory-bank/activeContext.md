# Active Context — 2026-03-05

## Текущий фокус
- Все 8 багов исправлены
- Все 3 главных риска закрыты
- Stripe Connect escrow подготовлен
- Переходим к production deployment

## Что сделано (2026-03-05) — полный технический аудит

### 8 багов исправлены:
1. Rate limiting — in-memory по IP (20/мин с auth, 5/мин без, 10/3 для видео)
2. Auth-проверка — мягкий режим (с auth = больше лимит, без = меньше)
3. RLS-политики — SQL готов (supabase/migrations/001_enable_rls.sql), нужно применить в Dashboard
4. Favicon — SVG data URI на всех 4 страницах
5. Meta description + OG-теги — на всех страницах
6. Удалены 12 мёртвых файлов (ugcgo-v2...v12.html, ugcgo-dashboard-full.html)
7. Voice — убран getDisplayMedia, теперь чистый SpeechSynthesis
8. Remix — base64 заменён на загрузку в Supabase Storage + публичный URL

### 3 главных риска:
1. Stripe Connect + Escrow подготовлен:
   - api/stripe-connect.js — создание Connect-аккаунта, PaymentIntent, release escrow, подписки
   - api/stripe-webhook.js — обработка событий Stripe
   - supabase/migrations/002_stripe_payments.sql — таблицы payments, subscriptions
   - package.json — зависимости stripe + supabase-js
   - Escrow-модель: Brand платит → деньги на платформе (held) → Creator выполняет → платформа release → 15% комиссия
2. Onboarding wizard — 3 шага для новых брендов (company, categories, first campaign)
3. AI fallback — 3 модели (Gemini Flash → Gemini Flash 001 → Llama Maverick)

## Что нужно сделать тебе (пользователю):
1. **Supabase Dashboard** → SQL Editor → применить:
   - `supabase/migrations/001_enable_rls.sql` (RLS-политики)
   - `supabase/migrations/002_stripe_payments.sql` (таблицы для Stripe)
2. **Stripe Dashboard** → получить ключи и добавить в Vercel env vars:
   - `STRIPE_SECRET_KEY` (sk_test_...)
   - `STRIPE_WEBHOOK_SECRET` (whsec_...)
3. **Stripe Dashboard** → создать Products:
   - Starter: $199/мес → получить price_id
   - Growth: $499/мес → получить price_id
   - Scale: $999/мес → получить price_id
4. **Stripe Dashboard** → Webhooks → добавить endpoint:
   - URL: https://ugcgo-delta.vercel.app/api/stripe-webhook
   - Events: payment_intent.succeeded, transfer.created, customer.subscription.*

## Структура Stripe Connect Escrow
```
Brand → PaymentIntent ($1000) → ugcgo platform (held)
                                    ↓ (creator delivers content)
                                Release escrow
                                    ↓
                          Creator gets $850 (85%)
                          Platform keeps $150 (15%)
```
