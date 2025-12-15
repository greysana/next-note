import { NextResponse } from 'next/server';
import { getDatabase } from '@/db/mongodb';
import { createSession, checkRateLimit } from '@/lib/auth/redis-auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(email, 'login', 20, 15 * 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const db = await getDatabase();
    const user = await db.collection('users').findOne({ email });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = await createSession(
      user._id.toString(),
      user.email,
      7 * 24 * 60 * 60 // 7 days
    );
    console.log(`session user ${user.email}`)

    // Store session in database for audit
    await db.collection('sessions').insertOne({
      userId: user._id,
      sessionToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(),
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
