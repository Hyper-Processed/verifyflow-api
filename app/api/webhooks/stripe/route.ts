import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { kv } from '@vercel/kv';
import { generateApiKey, hashApiKey, maskApiKey } from '@/lib/auth';
import { claimEvent } from '@/lib/idempotency';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: { code: 'MISSING_SIGNATURE', message: 'Missing webhook signature' } },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature' } },
      { status: 400 }
    );
  }

  // Idempotency check - prevent duplicate processing
  const claimed = await claimEvent(event.id);
  if (!claimed) {
    console.log(`Webhook event ${event.id} already processed, skipping`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Webhook handler error for event ${event.id}:`, error);
    return NextResponse.json(
      { error: { code: 'PROCESSING_ERROR', message: 'Webhook processing failed' } },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: any) {
  const { customer, subscription, metadata } = session;

  const sub = await stripe.subscriptions.retrieve(subscription as string);
  const subscriptionItemId = sub.items.data[0].id;

  const apiKey = generateApiKey();
  const hashedKey = hashApiKey(apiKey);

  const userId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

  const user = {
    user_id: userId,
    email: session.customer_email,
    stripe_customer_id: customer,
    stripe_subscription_id: subscription,
    subscription_item_id: subscriptionItemId,
    tier: metadata?.tier || 'starter',
    created_at: new Date().toISOString(),
  };

  await kv.set(`apikey:${hashedKey}`, JSON.stringify(user));

  const userRecord = {
    ...user,
    api_key_masked: maskApiKey(apiKey),
    api_key_hash: hashedKey,
  };
  await kv.set(`user:${userId}`, JSON.stringify(userRecord));
  await kv.set(`customer:${customer}`, userId);

  await stripe.subscriptions.update(subscription as string, {
    metadata: { api_key: apiKey, user_id: userId },
  });

  console.log(`Created user ${userId} with tier ${user.tier} (key: ${maskApiKey(apiKey)})`);
}

async function handleSubscriptionUpdated(subscription: any) {
  const customerId = subscription.customer;
  const userId = await kv.get<string>(`customer:${customerId}`);

  if (!userId) {
    console.warn(`No user found for customer ${customerId}`);
    return;
  }

  const userJson = await kv.get<string>(`user:${userId}`);
  if (userJson) {
    const user = JSON.parse(userJson);
    console.log(`Subscription updated for user ${userId}: status=${subscription.status}`);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  const customerId = subscription.customer;
  const userId = await kv.get<string>(`customer:${customerId}`);

  if (!userId) {
    console.warn(`No user found for customer ${customerId}`);
    return;
  }

  const userJson = await kv.get<string>(`user:${userId}`);
  if (userJson) {
    const user = JSON.parse(userJson);

    if (user.api_key_hash) {
      await kv.del(`apikey:${user.api_key_hash}`);
    }

    user.status = 'inactive';
    user.deactivated_at = new Date().toISOString();
    await kv.set(`user:${userId}`, JSON.stringify(user));

    console.log(`Subscription deleted for user ${userId}, API access revoked`);
  }
}

async function handlePaymentFailed(invoice: any) {
  const customerId = invoice.customer;
  const userId = await kv.get<string>(`customer:${customerId}`);

  if (!userId) {
    console.warn(`No user found for customer ${customerId}`);
    return;
  }

  console.log(`Payment failed for user ${userId}, attempt ${invoice.attempt_count}`);

  if (invoice.attempt_count >= 3) {
    const userJson = await kv.get<string>(`user:${userId}`);
    if (userJson) {
      const user = JSON.parse(userJson);
      user.status = 'payment_failed';
      await kv.set(`user:${userId}`, JSON.stringify(user));
      console.log(`User ${userId} marked as payment_failed after ${invoice.attempt_count} attempts`);
    }
  }
}
