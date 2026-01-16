'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface SessionData {
  status: 'success' | 'pending';
  apiKey?: string;
  userId?: string;
  tier?: string;
  customerEmail?: string;
  message?: string;
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [data, setData] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/checkout/session?session_id=${sessionId}`);
        const result = await res.json();

        if (!res.ok) {
          setError(result.error || 'Failed to retrieve session');
          setLoading(false);
          return;
        }

        if (result.status === 'pending') {
          // Retry after 2 seconds if webhook hasn't processed yet
          setTimeout(fetchSession, 2000);
          return;
        }

        setData(result);
        setLoading(false);
      } catch (err) {
        setError('Failed to connect to server');
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const copyApiKey = async () => {
    if (data?.apiKey) {
      await navigator.clipboard.writeText(data.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tierNames: Record<string, string> = {
    starter: 'Starter',
    growth: 'Growth',
    pro: 'Pro',
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
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

      <section className="container mx-auto px-4 py-16 max-w-2xl">
        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Setting up your account...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-red-700 mb-2">Something went wrong</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <a href="/pricing" className="text-blue-600 hover:underline">Return to pricing</a>
          </div>
        ) : (
          <div className="text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to VerifyFlow!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Your {tierNames[data?.tier || 'starter'] || 'Starter'} plan is now active.
            </p>

            {/* API Key Card */}
            <div className="bg-white border-2 border-green-200 rounded-lg p-6 mb-8 text-left">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Your API Key</h2>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                  Save this now!
                </span>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <code className="text-green-400 break-all text-sm">{data?.apiKey}</code>
              </div>

              <button
                onClick={copyApiKey}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy API Key
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 mt-3 text-center">
                This is the only time your full API key will be shown. Store it securely.
              </p>
            </div>

            {/* Quick Start */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Start</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`curl -X POST https://api.verifyflow.com/v1/verify \\
  -H "Authorization: Bearer ${data?.apiKey?.substring(0, 20)}..." \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@example.com"}'`}</code>
              </pre>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <a
                href="/dashboard"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Go to Dashboard
              </a>
              <a
                href="/docs"
                className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200"
              >
                Read the Docs
              </a>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
