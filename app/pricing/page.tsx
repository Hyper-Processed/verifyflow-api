export default function Pricing() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-600">VerifyFlow</a>
          <nav className="space-x-6">
            <a href="/#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="/docs" className="text-gray-600 hover:text-gray-900">Docs</a>
          </nav>
        </div>
      </header>

      {/* Pricing Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600">
          Pay only for what you use. No hidden fees. Cancel anytime.
        </p>
      </section>

      {/* Pricing Tiers */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <PricingCard
            name="Free"
            price="$0"
            period="forever"
            verifications="100"
            features={[
              'Syntax validation',
              'Domain verification',
              'Disposable detection',
              'Basic support',
              'API documentation',
            ]}
            cta="Start Free"
            ctaLink="/dashboard"
            popular={false}
          />
          <PricingCard
            name="Starter"
            price="$9"
            period="/month"
            verifications="2,500"
            features={[
              'Everything in Free',
              'SMTP verification',
              'Role-based detection',
              'Risk scoring',
              'Email support',
            ]}
            cta="Get Started"
            ctaLink="/api/checkout?tier=starter"
            popular={false}
          />
          <PricingCard
            name="Growth"
            price="$29"
            period="/month"
            verifications="10,000"
            features={[
              'Everything in Starter',
              'Bulk verification',
              'Higher rate limits',
              'Priority support',
              'Usage analytics',
            ]}
            cta="Get Started"
            ctaLink="/api/checkout?tier=growth"
            popular={true}
          />
          <PricingCard
            name="Pro"
            price="$99"
            period="/month"
            verifications="50,000"
            features={[
              'Everything in Growth',
              'Custom rate limits',
              'Dedicated support',
              'SLA guarantee',
              'Team accounts',
            ]}
            cta="Get Started"
            ctaLink="/api/checkout?tier=pro"
            popular={false}
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-20 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <FAQ
            question="What happens if I exceed my plan's limit?"
            answer="Overage charges apply at $0.002 per verification for Growth and Pro plans. Free and Starter plans are hard-capped."
          />
          <FAQ
            question="Can I cancel anytime?"
            answer="Yes! You can cancel your subscription at any time. Your API access continues until the end of your billing period."
          />
          <FAQ
            question="Do you offer refunds?"
            answer="We offer a 14-day money-back guarantee on all paid plans if you're not satisfied."
          />
          <FAQ
            question="What payment methods do you accept?"
            answer="We accept all major credit cards (Visa, Mastercard, Amex) via Stripe."
          />
        </div>
      </section>
    </main>
  );
}

function PricingCard({
  name,
  price,
  period,
  verifications,
  features,
  cta,
  ctaLink,
  popular,
}: {
  name: string;
  price: string;
  period: string;
  verifications: string;
  features: string[];
  cta: string;
  ctaLink: string;
  popular: boolean;
}) {
  return (
    <div className={`bg-white p-8 rounded-lg border-2 ${popular ? 'border-blue-600' : 'border-gray-200'} relative`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-gray-600">{period}</span>
      </div>
      <p className="text-gray-600 mb-6">
        <span className="font-semibold">{verifications}</span> verifications/month
      </p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <a
        href={ctaLink}
        className={`block w-full text-center py-3 rounded-lg font-semibold ${
          popular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {cta}
      </a>
    </div>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-gray-200 pb-6">
      <h3 className="text-lg font-semibold mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
