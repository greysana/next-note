import { NextResponse } from 'next/server';
import { getDatabase } from '@/db/mongodb';
import { createToken, checkRateLimit } from '@/lib/auth/redis-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(email, 'password_reset', 3, 60 * 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again later.' },
        { status: 429 }
      );
    }

    const db = await getDatabase();
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a password reset link has been sent.',
      });
    }

    // Create reset token
    const resetToken = await createToken(
      user._id.toString(),
      'password_reset',
      60 * 60 // 1 hour
    );

    // Store in database for audit
    await db.collection('password_resets').insertOne({
      userId: user._id,
      token: resetToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      used: false,
    });

    // TODO: Send reset link via email
    console.log(`Password reset link for ${email}: /reset-password?token=${resetToken}`);

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}