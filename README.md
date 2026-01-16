# VerifyFlow - Email Verification API

Real-time email validation API with disposable email detection, SMTP verification, and usage-based pricing.

## Features

- ✅ **Syntax Validation**: RFC 5322 compliant
- ✅ **Domain Verification**: DNS/MX record lookup
- ✅ **SMTP Validation**: Real mailbox verification
- ✅ **Disposable Detection**: 10,000+ disposable domains
- ✅ **Role-Based Detection**: Flag generic addresses
- ✅ **Risk Scoring**: 0-100 risk score for every email
- ✅ **Usage-Based Pricing**: Stripe metered billing
- ✅ **Rate Limiting**: Per-tier limits
- ✅ **Self-Serve**: No sales calls, instant signup

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Vercel KV (Redis)
- **Payments**: Stripe (metered billing)
- **Hosting**: Vercel Edge Functions
- **Language**: TypeScript, Node.js 20+

## API Usage

### Verify Email

```bash
curl -X POST https://verifyflow-api.vercel.app/api/v1/verify \
  -H "Authorization: Bearer sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

Response:

```json
{
  "email": "user@example.com",
  "valid": true,
  "risk_score": 5,
  "risk_level": "low",
  "checks": {
    "syntax": { "valid": true, "message": "Valid email syntax" },
    "domain": { "valid": true, "message": "Domain exists and has MX records" },
    "smtp": { "valid": true, "message": "Mailbox exists" },
    "disposable": { "is_disposable": false, "message": "Not a disposable email domain" },
    "role_based": { "is_role": false, "message": "Not a role-based address" }
  },
  "timestamp": "2026-01-16T10:30:00Z",
  "credits_used": 1
}
```

### Get Account Info

```bash
curl https://verifyflow-api.vercel.app/api/v1/account \
  -H "Authorization: Bearer sk_live_..."
```

## Pricing

| Plan | Price | Verifications/mo | Features |
|------|-------|-----------------|----------|
| Free | $0 | 100 | Basic validation |
| Starter | $9/mo | 2,500 | + SMTP, risk scoring |
| Growth | $29/mo | 10,000 | + Bulk, priority support |
| Pro | $99/mo | 50,000 | + Custom limits, SLA |

## License

MIT

## Support

- Email: support@verifyflow.com
