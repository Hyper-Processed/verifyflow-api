import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing user_id parameter' },
      { status: 400 }
    );
  }

  try {
    const userJson = await kv.get<string>(`user:${userId}`);

    if (!userJson) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = typeof userJson === 'string' ? JSON.parse(userJson) : userJson;

    // Return safe user data (no full API key)
    return NextResponse.json({
      user_id: user.user_id,
      email: user.email,
      tier: user.tier,
      api_key_masked: user.api_key_masked,
      created_at: user.created_at,
      status: user.status || 'active',
    });
  } catch (error) {
    console.error('User retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user' },
      { status: 500 }
    );
  }
}
