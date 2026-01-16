'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface UserData {
  user_id: string;
  email: string;
  tier: string;
  api_key_masked: string;
  created_at: string;
  status: string;
}

const tierLimits: Record<string, { verifications: string; rate: string }> = {
  starter: { verifications: '2,500', rate: '10/sec' },
  growth: { verifications: '10,000', rate: '50/sec' },
  pro: { verifications: '50,000', rate: '100/sec' },
};

const tierNames: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  pro: 'Pro',
};

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user_id from URL params or localStorage
    let userId = searchParams.get('user_id');

    if (!userId) {
      userId = localStorage.getItem('verifyflow_user_id');
    }

    if (!userId) {
      setError('Please log in with your API key or complete checkout');
      setLoading(false);
      return;
    }

    // Store user_id for future visits
    localStorage.setItem('verifyflow_user_id', userId);

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user?user_id=${userId}`);
        const result = await res.json();

        if (!res.ok) {
          setError(result.error || 'Failed to load dashboard');
          setLoading(false);
          return;
        }

        setUser(result);
        setLoading(false);
      } catch (err) {
        setError('Failed to connect to server');
        setLoading(false);
      }
    };

    fetchUser();
  }, [searchParams]);

  const logout = () => {
    localStorage.removeItem('verifyflow_user_id');
    window.location.href = '/';
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-600">VerifyFlow</a>
          <nav className="flex items-center space-x-6">
            <a href="/docs" className="text-gray-600 hover:text-gray-900">Docs</a>
            {user && (
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                Log out
              </button>
            )}
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg border p-8 text-center max-w-lg mx-auto mt-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to VerifyFlow</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <a
                href="/pricing"
                className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Get Started
              </a>
              <p className="text-sm text-gray-500">
                Already have an account? Check your email for your user ID.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user?.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user?.status === 'active' ? 'Active' : user?.status}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Plan Card */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Current Plan</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {tierNames[user?.tier || 'starter'] || 'Starter'}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {tierLimits[user?.tier || 'starter']?.verifications} verifications/mo
                </p>
              </div>

              {/* Usage Card */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">This Month</h3>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-gray-600 text-sm mt-1">
                  of {tierLimits[user?.tier || 'starter']?.verifications} verifications
                </p>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              {/* Rate Limit Card */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Rate Limit</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {tierLimits[user?.tier || 'starter']?.rate}
                </p>
                <p className="text-gray-600 text-sm mt-1">requests per second</p>
              </div>
            </div>

            {/* API Key Section */}
            <div className="bg-white rounded-lg border p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">API Key</h2>
                <a href="/docs" className="text-blue-600 text-sm hover:underline">
                  View documentation
                </a>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
                {user?.api_key_masked}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                For security, your full API key was only shown once after purchase.
                If you need a new key, please contact support.
              </p>
            </div>

            {/* Quick Start */}
            <div className="bg-white rounded-lg border p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h2>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`curl -X POST https://api.verifyflow.com/v1/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com"}'`}</code>
              </pre>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <a
                href="/docs"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Read Documentation
              </a>
              <a
                href="https://billing.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200"
              >
                Manage Subscription
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
