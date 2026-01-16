import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backward compatibility
export const stripe = {
  get subscriptionItems() {
    return getStripe().subscriptionItems;
  },
  get checkout() {
    return getStripe().checkout;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
  get customers() {
    return getStripe().customers;
  },
  get products() {
    return getStripe().products;
  },
  get prices() {
    return getStripe().prices;
  },
  get subscriptions() {
    return getStripe().subscriptions;
  },
};

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
