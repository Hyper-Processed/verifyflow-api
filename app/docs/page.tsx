export default function DocsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-600">VerifyFlow</a>
          <nav className="space-x-6">
            <a href="/#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="/docs" className="text-blue-600 font-medium">Docs</a>
            <a href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Dashboard
            </a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">API Documentation</h1>

        {/* Table of Contents */}
        <div className="bg-gray-50 rounded-lg p-6 mb-12">
          <h2 className="font-semibold text-gray-900 mb-3">Contents</h2>
          <ul className="space-y-2 text-blue-600">
            <li><a href="#authentication" className="hover:underline">Authentication</a></li>
            <li><a href="#verify-single" className="hover:underline">Verify Single Email</a></li>
            <li><a href="#verify-bulk" className="hover:underline">Bulk Verification</a></li>
            <li><a href="#account" className="hover:underline">Account Information</a></li>
            <li><a href="#response-format" className="hover:underline">Response Format</a></li>
            <li><a href="#error-codes" className="hover:underline">Error Codes</a></li>
            <li><a href="#rate-limits" className="hover:underline">Rate Limits</a></li>
          </ul>
        </div>

        {/* Authentication */}
        <section id="authentication" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
          <p className="text-gray-600 mb-4">
            All API requests require authentication using your API key. Include it in the
            Authorization header as a Bearer token.
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
            <code>Authorization: Bearer sk_live_your_api_key_here</code>
          </pre>
          <p className="text-gray-600">
            Your API key was provided after purchase. Keep it secure and never share it publicly.
          </p>
        </section>

        {/* Verify Single Email */}
        <section id="verify-single" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Verify Single Email</h2>
          <p className="text-gray-600 mb-4">
            Verify a single email address and get detailed validation results.
          </p>

          <h3 className="font-semibold text-gray-900 mb-2">Endpoint</h3>
          <div className="bg-gray-100 rounded-lg p-3 mb-4 font-mono text-sm">
            POST /api/v1/verify
          </div>

          <h3 className="font-semibold text-gray-900 mb-2">Request Body</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
            <code>{`{
  "email": "user@example.com"
}`}</code>
          </pre>

          <h3 className="font-semibold text-gray-900 mb-2">Example Request</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
            <code>{`curl -X POST https://api.verifyflow.com/api/v1/verify \\
  -H "Authorization: Bearer sk_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com"}'`}</code>
          </pre>

          <h3 className="font-semibold text-gray-900 mb-2">Response</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{`{
  "email": "user@example.com",
  "valid": true,
  "risk_score": 5,
  "risk_level": "low",
  "checks": {
    "syntax": {
      "valid": true,
      "local_part": "user",
      "domain": "example.com"
    },
    "domain": {
      "valid": true,
      "has_mx": true,
      "mx_records": ["mx.example.com"]
    },
    "smtp": {
      "valid": true,
      "catch_all": false
    },
    "disposable": {
      "is_disposable": false
    },
    "role_based": {
      "is_role": false
    }
  }
}`}</code>
          </pre>
        </section>

        {/* Bulk Verification */}
        <section id="verify-bulk" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bulk Verification</h2>
          <p className="text-gray-600 mb-4">
            Verify multiple email addresses in a single request. Available on Growth and Pro plans.
          </p>

          <h3 className="font-semibold text-gray-900 mb-2">Endpoint</h3>
          <div className="bg-gray-100 rounded-lg p-3 mb-4 font-mono text-sm">
            POST /api/v1/verify/bulk
          </div>

          <h3 className="font-semibold text-gray-900 mb-2">Request Body</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
            <code>{`{
  "emails": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
  ]
}`}</code>
          </pre>

          <h3 className="font-semibold text-gray-900 mb-2">Limits</h3>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Growth plan: Up to 100 emails per request</li>
            <li>Pro plan: Up to 500 emails per request</li>
          </ul>
        </section>

        {/* Account Information */}
        <section id="account" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Information</h2>
          <p className="text-gray-600 mb-4">
            Get information about your account, including usage and remaining credits.
          </p>

          <h3 className="font-semibold text-gray-900 mb-2">Endpoint</h3>
          <div className="bg-gray-100 rounded-lg p-3 mb-4 font-mono text-sm">
            GET /api/v1/account
          </div>

          <h3 className="font-semibold text-gray-900 mb-2">Response</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{`{
  "tier": "growth",
  "usage": {
    "current_period": {
      "verifications": 1234,
      "limit": 10000
    }
  },
  "rate_limit": {
    "requests_per_second": 50
  }
}`}</code>
          </pre>
        </section>

        {/* Response Format */}
        <section id="response-format" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Response Format</h2>

          <h3 className="font-semibold text-gray-900 mb-2">Risk Levels</h3>
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Level</th>
                <th className="border p-2 text-left">Score Range</th>
                <th className="border p-2 text-left">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2"><code>low</code></td>
                <td className="border p-2">0-30</td>
                <td className="border p-2">Safe to send, high deliverability expected</td>
              </tr>
              <tr>
                <td className="border p-2"><code>medium</code></td>
                <td className="border p-2">31-70</td>
                <td className="border p-2">Proceed with caution, may have issues</td>
              </tr>
              <tr>
                <td className="border p-2"><code>high</code></td>
                <td className="border p-2">71-100</td>
                <td className="border p-2">High risk, consider not sending</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Error Codes */}
        <section id="error-codes" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Codes</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Code</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2"><code>INVALID_API_KEY</code></td>
                <td className="border p-2">401</td>
                <td className="border p-2">API key is missing or invalid</td>
              </tr>
              <tr>
                <td className="border p-2"><code>INVALID_EMAIL</code></td>
                <td className="border p-2">400</td>
                <td className="border p-2">Email format is invalid</td>
              </tr>
              <tr>
                <td className="border p-2"><code>RATE_LIMITED</code></td>
                <td className="border p-2">429</td>
                <td className="border p-2">Too many requests, slow down</td>
              </tr>
              <tr>
                <td className="border p-2"><code>QUOTA_EXCEEDED</code></td>
                <td className="border p-2">403</td>
                <td className="border p-2">Monthly verification limit reached</td>
              </tr>
              <tr>
                <td className="border p-2"><code>INTERNAL_ERROR</code></td>
                <td className="border p-2">500</td>
                <td className="border p-2">Server error, please retry</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Rate Limits */}
        <section id="rate-limits" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limits</h2>
          <p className="text-gray-600 mb-4">
            Rate limits vary by plan and are applied per API key.
          </p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Plan</th>
                <th className="border p-2 text-left">Requests/Second</th>
                <th className="border p-2 text-left">Monthly Limit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Free</td>
                <td className="border p-2">1</td>
                <td className="border p-2">100</td>
              </tr>
              <tr>
                <td className="border p-2">Starter</td>
                <td className="border p-2">10</td>
                <td className="border p-2">2,500</td>
              </tr>
              <tr>
                <td className="border p-2">Growth</td>
                <td className="border p-2">50</td>
                <td className="border p-2">10,000</td>
              </tr>
              <tr>
                <td className="border p-2">Pro</td>
                <td className="border p-2">100</td>
                <td className="border p-2">50,000</td>
              </tr>
            </tbody>
          </table>
          <p className="text-gray-500 text-sm mt-4">
            When rate limited, you&apos;ll receive a 429 response with a Retry-After header.
          </p>
        </section>

        {/* Support */}
        <section className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Need Help?</h2>
          <p className="text-gray-600 mb-4">
            Check out our examples or contact support for assistance.
          </p>
          <div className="flex gap-4">
            <a
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </a>
            <a
              href="mailto:support@verifyflow.com"
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Contact Support
            </a>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2026 VerifyFlow. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
