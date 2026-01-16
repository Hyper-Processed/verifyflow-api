import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  validateSyntax,
  validateDomain,
  verifySMTP,
  isRoleBased,
  calculateRiskScore,
  getRiskLevel,
} from '@/lib/validation';
import { isDisposable } from '@/lib/disposable';
import { reportUsage } from '@/lib/stripe';
import { kv } from '@vercel/kv';
import { hashApiKey } from '@/lib/auth';

const verifySchema = z.object({
  email: z.string().email(),
  quick: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
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

    // 3. Rate limiting
    const rateLimitKey = `ratelimit:${apiKey}:${Math.floor(Date.now() / 60000)}`;
    const requestCount = await kv.incr(rateLimitKey);
    await kv.expire(rateLimitKey, 60);

    const rateLimit = user.tier === 'free' ? 10 : user.tier === 'starter' ? 50 : 100;
    if (requestCount > rateLimit) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded' } },
        { status: 429 }
      );
    }

    // 4. Parse request
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_EMAIL_FORMAT', message: 'Invalid email format' } },
        { status: 400 }
      );
    }

    const { email, quick } = parsed.data;
    const domain = email.split('@')[1];

    // 5. Perform validation checks
    const syntaxCheck = validateSyntax(email);

    let domainCheck = { valid: false, message: '', mx_records: [] as string[] };
    let smtpCheck = { valid: false, message: '' };
    let disposableCheck = { is_disposable: false, message: '' };
    let roleCheck = { is_role: false, message: '' };

    if (syntaxCheck.valid) {
      [domainCheck, disposableCheck, roleCheck] = await Promise.all([
        validateDomain(domain),
        isDisposable(domain),
        Promise.resolve(isRoleBased(email)),
      ]);

      if (!quick && domainCheck.valid && domainCheck.mx_records && domainCheck.mx_records.length > 0) {
        smtpCheck = await verifySMTP(email, domainCheck.mx_records[0]);
      } else if (quick && domainCheck.valid) {
        smtpCheck = { valid: true, message: 'Skipped (quick mode)' };
      }
    }

    // 6. Calculate risk score
    const checks = {
      syntax: syntaxCheck,
      domain: domainCheck,
      smtp: smtpCheck,
      disposable: disposableCheck,
      role_based: roleCheck,
    };

    const riskScore = calculateRiskScore(checks);
    const riskLevel = getRiskLevel(riskScore);

    // 7. Determine overall validity
    const isValid = syntaxCheck.valid && domainCheck.valid && !disposableCheck.is_disposable;

    // 8. Report usage to Stripe
    if (user.subscription_item_id) {
      reportUsage(user.subscription_item_id, 1).catch(console.error);
    }

    // 9. Return response
    return NextResponse.json({
      email,
      valid: isValid,
      checks: {
        syntax: syntaxCheck,
        domain: domainCheck,
        smtp: smtpCheck,
        disposable: disposableCheck,
        role_based: roleCheck,
      },
      risk_score: riskScore,
      risk_level: riskLevel,
      timestamp: new Date().toISOString(),
      credits_used: 1,
    });
  } catch (error) {
    console.error('Verification error:', error);
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
