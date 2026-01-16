import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { hashApiKey } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { code: 'INVALID_API_KEY', message: 'Missing or invalid API key' } },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);

    // 2. Get user from API key (hash before lookup for security)
    const hashedKey = hashApiKey(apiKey);
    const userJson = await kv.get<string>(`apikey:${hashedKey}`);
    if (!userJson) {
      return NextResponse.json(
        { error: { code: 'INVALID_API_KEY', message: 'Invalid API key' } },
        { status: 401 }
      );
    }

    const user = JSON.parse(userJson);

    // 3. Get usage stats from current period
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const usageKey = `usage:${user.user_id}:${periodStart.toISOString().substring(0, 7)}`;
    const creditsUsed = (await kv.get<number>(usageKey)) || 0;

    const tiers: any = {
      free: { name: 'Free', price: 0, credits: 100 },
      starter: { name: 'Starter', price: 9, credits: 2500 },
      growth: { name: 'Growth', price: 29, credits: 10000 },
      pro: { name: 'Pro', price: 99, credits: 50000 },
    };

    const plan = tiers[user.tier] || tiers.free;

    return NextResponse.json({
      account_id: user.user_id,
      email: user.email,
      plan: {
        name: plan.name,
        price: plan.price,
        included_credits: plan.credits,
        billing_period: 'monthly',
      },
      usage: {
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        credits_used: creditsUsed,
        credits_remaining: Math.max(0, plan.credits - creditsUsed),
        total_requests: creditsUsed,
      },
      rate_limits: {
        requests_per_minute: user.tier === 'free' ? 10 : user.tier === 'starter' ? 50 : 100,
        requests_per_day: plan.credits,
      },
    });
  } catch (error) {
    console.error('Account error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
