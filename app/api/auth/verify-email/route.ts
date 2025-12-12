import { NextResponse } from 'next/server';
import { getDatabase } from '@/db/mongodb';
import { verifyOTP } from '@/lib/auth/redis-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const verification = await verifyOTP(email, 'email_verification', otp);

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Update user
    const db = await getDatabase();
    await db.collection('users').updateOne(
      { email },
      {
        $set: {
          emailVerified: true,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}