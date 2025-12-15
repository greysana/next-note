// lib/auth/session.ts
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth/redis-auth';

export interface CurrentUser {
  userId: string;
  email: string;
  sessionToken: string;
}

/**
 * Get the current authenticated user from the session
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return null;
    }

    const session = await getSession(sessionToken);

    if (!session) {
      return null;
    }
    console.log(session)

    return {
      userId: session.userId,
      email: session.email,
      sessionToken,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in API routes that require authentication
 */
export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Get user ID from session (shorthand)
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.userId || null;
}

/**
 * Get user email from session (shorthand)
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.email || null;
}