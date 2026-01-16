import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Report usage to Stripe
export async function reportUsage(
  subscriptionItemId: string,
  quantity: number = 1
): Promise<void> {
  try {
    await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
      quantity,
      timestamp: Math.floor(Date.now() / 1000),
      action: 'increment',
    });
  } catch (error) {
    console.error('Failed to report usage to Stripe:', error);
    // Don't throw - usage reporting shouldn't block API calls
  }
}
