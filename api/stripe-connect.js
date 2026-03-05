const ALLOWED = ['https://ugcgo.ai', 'https://www.ugcgo.ai', 'https://ugcgo-delta.vercel.app'];

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  const allowedOrigin = ALLOWED.includes(origin) ? origin : ALLOWED[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET) return res.status(500).json({ error: 'Stripe not configured' });

  const stripe = require('stripe')(STRIPE_SECRET);
  const { action, ...params } = req.body;

  try {
    // Креатор создаёт Stripe Connect аккаунт
    if (action === 'create_connect_account') {
      const account = await stripe.accounts.create({
        type: 'express',
        country: params.country || 'US',
        email: params.email,
        capabilities: {
          transfers: { requested: true },
        },
        metadata: { ugcgo_user_id: params.user_id }
      });

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${allowedOrigin}/platform?stripe=refresh`,
        return_url: `${allowedOrigin}/platform?stripe=complete&account=${account.id}`,
        type: 'account_onboarding',
      });

      return res.status(200).json({
        account_id: account.id,
        onboarding_url: accountLink.url
      });
    }

    // Бренд оплачивает кампанию (escrow — деньги на платформе)
    if (action === 'create_payment') {
      const { amount, campaign_id, application_id, creator_stripe_account } = params;
      const platformFee = Math.round(amount * 0.15);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        transfer_group: `campaign_${campaign_id}`,
        metadata: {
          campaign_id,
          application_id,
          creator_stripe_account,
          platform_fee: platformFee
        }
      });

      return res.status(200).json({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id
      });
    }

    // Релиз escrow — перевод денег креатору после одобрения работы
    if (action === 'release_escrow') {
      const { payment_intent_id, creator_stripe_account, amount } = params;
      const platformFee = Math.round(amount * 0.15);
      const creatorAmount = amount - platformFee;

      const transfer = await stripe.transfers.create({
        amount: creatorAmount,
        currency: 'usd',
        destination: creator_stripe_account,
        source_transaction: payment_intent_id,
        transfer_group: params.transfer_group,
        metadata: { platform_fee: platformFee }
      });

      return res.status(200).json({
        transfer_id: transfer.id,
        creator_amount: creatorAmount,
        platform_fee: platformFee
      });
    }

    // Создание подписки для бренда
    if (action === 'create_subscription') {
      const { email, price_id } = params;

      let customer;
      const existing = await stripe.customers.list({ email, limit: 1 });
      if (existing.data.length > 0) {
        customer = existing.data[0];
      } else {
        customer = await stripe.customers.create({ email, metadata: { ugcgo_user_id: params.user_id } });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        mode: 'subscription',
        line_items: [{ price: price_id, quantity: 1 }],
        success_url: `${allowedOrigin}/platform?subscription=success`,
        cancel_url: `${allowedOrigin}/platform?subscription=cancel`,
        metadata: { ugcgo_user_id: params.user_id }
      });

      return res.status(200).json({ checkout_url: session.url, customer_id: customer.id });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
