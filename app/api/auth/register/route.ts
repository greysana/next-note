import { NextResponse } from 'next/server';
import { getDatabase } from '@/db/mongodb';
import { createOTP, checkRateLimit } from '@/lib/auth/redis-auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(email, 'register', 3, 60 * 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const db = await getDatabase();

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      name,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create OTP for email verification
    const otp = await createOTP(email, 'email_verification', 15 * 60);

    // TODO: Send OTP via email
    console.log(`Email verification OTP for ${email}: ${otp}`);

    return NextResponse.json({
      success: true,
      userId: result.insertedId,
      message: 'Registration successful. Please verify your email.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register' },
      { status: 500 }
    );
  }
}
