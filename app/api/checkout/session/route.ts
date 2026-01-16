import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing session_id parameter' },
      { status: 400 }
    );
  }

  try {
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get the subscription to retrieve the API key from metadata
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      );
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // The API key is stored in subscription metadata by the webhook
    const apiKey = subscription.metadata?.api_key;
    const userId = subscription.metadata?.user_id;
    const tier = session.metadata?.tier || 'starter';

    if (!apiKey) {
      // Webhook might not have processed yet - return pending status
      return NextResponse.json({
        status: 'pending',
        message: 'Your API key is being generated. Please refresh in a moment.',
        tier,
      });
    }

    return NextResponse.json({
      status: 'success',
      apiKey,
      userId,
      tier,
      customerEmail: session.customer_email,
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session details' },
      { status: 500 }
    );
  }
}
