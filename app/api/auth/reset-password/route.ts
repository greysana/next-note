import { NextResponse } from 'next/server';
import { getDatabase } from '@/db/mongodb';
import { verifyToken, markTokenAsUsed } from '@/lib/auth/redis-auth';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    const verification = await verifyToken(token, 'password_reset');

    if (!verification.valid || !verification.userId) {
      return NextResponse.json(
        { error: verification.error || 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    const db = await getDatabase();
    await db.collection('users').updateOne(
      { _id: new ObjectId(verification.userId) },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    // Mark token as used
    await markTokenAsUsed(token, 'password_reset');

    // Update in database
    await db.collection('password_resets').updateOne(
      { token },
      {
        $set: {
          used: true,
          usedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}