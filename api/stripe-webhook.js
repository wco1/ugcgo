const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!STRIPE_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const stripe = require('stripe')(STRIPE_SECRET);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let event;
  try {
    if (STRIPE_WEBHOOK_SECRET) {
      const sig = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } else {
      event = req.body;
    }
  } catch (e) {
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        await supabase.from('payments').update({
          status: 'held',
          updated_at: new Date().toISOString()
        }).eq('stripe_payment_intent_id', pi.id);
        break;
      }

      case 'transfer.created': {
        const transfer = event.data.object;
        await supabase.from('payments').update({
          status: 'released',
          stripe_transfer_id: transfer.id,
          escrow_released_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }).eq('stripe_payment_intent_id', transfer.source_transaction);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const userId = sub.metadata?.ugcgo_user_id;
        if (userId) {
          const plan = sub.items.data[0]?.price?.lookup_key || 'starter';
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            plan,
            stripe_subscription_id: sub.id,
            stripe_customer_id: sub.customer,
            status: sub.status,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString()
          }, { onConflict: 'user_id' });

          await supabase.from('user_profiles').update({
            subscription_plan: plan
          }).eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = sub.metadata?.ugcgo_user_id;
        if (userId) {
          await supabase.from('subscriptions').update({
            status: 'canceled'
          }).eq('stripe_subscription_id', sub.id);

          await supabase.from('user_profiles').update({
            subscription_plan: 'free'
          }).eq('id', userId);
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object;
        const userId = account.metadata?.ugcgo_user_id;
        if (userId && account.charges_enabled) {
          await supabase.from('user_profiles').update({
            stripe_account_id: account.id,
            stripe_onboarded: true
          }).eq('id', userId);
        }
        break;
      }
    }

    res.status(200).json({ received: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
