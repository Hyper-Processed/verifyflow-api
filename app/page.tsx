export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">VerifyFlow</div>
          <nav className="space-x-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="/docs" className="text-gray-600 hover:text-gray-900">Docs</a>
            <a href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Get Started
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Accurate Email Verification API
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Validate email addresses in real-time. Detect disposable emails, verify domains,
          and protect your sender reputation with our simple REST API.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/pricing" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
            Start Free
          </a>
          <a href="/docs" className="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-200">
            View Docs
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Syntax Validation"
            description="RFC 5322 compliant email syntax checking with intelligent pattern recognition."
          />
          <FeatureCard
            title="Domain Verification"
            description="DNS and MX record lookup to ensure domains exist and can receive email."
          />
          <FeatureCard
            title="SMTP Validation"
            description="Real mailbox verification using SMTP protocol for maximum accuracy."
          />
          <FeatureCard
            title="Disposable Detection"
            description="Identify and block temporary/disposable email addresses from 10,000+ domains."
          />
          <FeatureCard
            title="Role-Based Detection"
            description="Flag generic addresses like info@, support@, and admin@ for better lead quality."
          />
          <FeatureCard
            title="Risk Scoring"
            description="Get a comprehensive risk score (0-100) for every email address validated."
          />
        </div>
      </section>

      {/* Code Example */}
      <section className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple to Integrate</h2>
          <div className="max-w-3xl mx-auto">
            <pre className="bg-gray-800 p-6 rounded-lg overflow-x-auto">
              <code>{`curl -X POST https://api.verifyflow.com/v1/verify \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com"}'

{
  "email": "user@example.com",
  "valid": true,
  "risk_score": 5,
  "risk_level": "low",
  "checks": {
    "syntax": { "valid": true },
    "domain": { "valid": true },
    "smtp": { "valid": true },
    "disposable": { "is_disposable": false }
  }
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Transparent, Usage-Based Pricing</h2>
        <p className="text-xl text-gray-600 mb-8">
          Pay only for what you use. No hidden fees, no surprises.
        </p>
        <a href="/pricing" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
          View Pricing
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2026 VerifyFlow. Built with Next.js and deployed on Vercel.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
