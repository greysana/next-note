import { randomBytes } from "crypto";
import { getRedisClient } from "../redis";
import { Session, Token } from "@/types/types";

// Redis Data Structures (for reference)
/*
Sessions:
  Key: session:{token}
  Value: JSON string of Session object
  TTL: 7 days (configurable)

User Sessions Set:
  Key: user:{userId}:sessions
  Value: Set of session tokens
  TTL: matches longest session

OTPs:
  Key: otp:{purpose}:{identifier}
  Value: 6-digit OTP string
  TTL: 10 minutes (configurable)

OTP Attempts:
  Key: otp:attempts:{identifier}
  Value: attempt count
  TTL: matches OTP TTL

Tokens:
  Key: token:{type}:{token}
  Value: JSON string of Token object
  TTL: varies by type (default 1 hour)

Rate Limiting:
  Key: ratelimit:{action}:{identifier}
  Value: attempt count
  TTL: varies by action
*/

export async function createSession(
  userId: string,
  email: string,
  expiresInSeconds: number = 7 * 24 * 60 * 60
): Promise<string> {
  const redis = await getRedisClient();
  const sessionToken = randomBytes(32).toString("hex");

  const session: Session = {
    userId,
    email,
    createdAt: Date.now(),
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };

  //Store Session in redis

  await redis.setEx(
    `session:${sessionToken}`,
    expiresInSeconds,
    JSON.stringify(session)
  );

  await redis.sAdd(`user:${userId}:session`, sessionToken);
  await redis.expire(`user:${userId}:session`, expiresInSeconds);

  return sessionToken;
}

export async function getSession(
  sessionToken: string
): Promise<Session | null> {
  const redis = await getRedisClient();

  const sessionData = await redis.get(`session:${sessionToken}`);

  if (!sessionData) {
    return null;
  }

  const session: Session = JSON.parse(sessionData);

  if (session.expiresAt < Date.now()) {
    await deleteSession(sessionToken);
    return null;
  }
  return JSON.parse(sessionData) as Session;
}

export async function deleteSession(sessionToken: string): Promise<void> {
  const redis = await getRedisClient();

  const sessionData = await redis.get(`session:${sessionToken}`);

  if (sessionData) {
    const session: Session = JSON.parse(sessionData);
    await redis.sRem(`user:${session.userId}:sessions`, sessionToken);
  }

  await redis.del(`session:${sessionData}`);
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  const redis = await getRedisClient();

  const sessions = await redis.sMembers(`user:${userId}:sessions`);

  const pipeline = redis.multi();
  for (const sessionToken of sessions) {
    redis.del(`session:${sessionToken}`);
  }
  pipeline.del(`user:${userId}:sessions`);

  await pipeline.exec();
}

export async function refreshSession(
  sessionToken: string,
  expiresInSeconds: number = 7 * 24 * 60 * 60
): Promise<boolean> {
  const redis = await getRedisClient();

  const session = await getSession(sessionToken);

  if (!session) {
    return false;
  }
  session.expiresAt = Date.now() + expiresInSeconds * 1000;
  await redis.seEx(
    `session:${sessionToken}`,
    expiresInSeconds,
    JSON.stringify(session)
  );
  return true;
}

// OTP Management
export async function createOTP(
  identifier: string, // email or phone
  purpose: "email_verification" | "password_reset" | "login",
  expiresInSeconds: number = 10 * 60 // 10 minutes default
): Promise<string> {
  const redis = await getRedisClient();
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

  const key = `otp:${purpose}:${identifier}`;

  await redis.setEx(key, expiresInSeconds, otp);

  // Store attempt count for rate limiting
  await redis.setEx(`otp:attempts:${identifier}`, expiresInSeconds, "0");

  return otp;
}

export async function verifyOTP(
  identifier: string,
  purpose: "email_verification" | "password_reset" | "login",
  otp: string
): Promise<{ valid: boolean; error?: string }> {
  const redis = await getRedisClient();
  const key = `otp:${purpose}:${identifier}`;
  const attemptsKey = `otp:attempts:${identifier}`;

  //Check attempts
  const attempts = await redis.get(attemptsKey);
  if (attempts && parseInt(attempts) >= 5) {
    return {
      valid: false,
      error: "Too many attempts. Please request a new OTP.",
    };
  }
  const storedOTP = await redis.get(key);

  if (!storedOTP) {
    return { valid: false, error: "OTP expired or not found" };
  }

  //Increment attempts

  await redis.incr(attemptsKey);

  if (storedOTP === otp) {
    //Delete OTP after successful verification
    await redis.del(key);
    await redis.del(attemptsKey);
    return { valid: true };
  }
  return { valid: false, error: "Invalid OTP" };
}

export async function deleteOTP(
  identifier: string,
  purpose: "email_verification" | "password_reset" | "login"
): Promise<void> {
  const redis = await getRedisClient();
  await redis.del(`otp:${purpose}:${identifier}`);
  await redis.del(`otp:attempts:${identifier}`);
}

export async function createToken(
  userId: string,
  type: "password_reset" | "email_verification" | "magic_link",
  expiresInSeconds: number = 60 * 60 // 1 hour default
): Promise<string> {
  const redis = await getRedisClient();
  const token = randomBytes(32).toString("hex");

  const tokenData: Token = {
    userId,
    type,
    createdAt: Date.now(),
    expiresAt: Date.now() + expiresInSeconds * 1000,
    used: false,
  };

  await redis.setEx(
    `token:${type}:${token}`,
    expiresInSeconds,
    JSON.stringify(tokenData)
  );

  //Store user's active tokens
  await redis.sAdd(`user:${userId}:tokens:${type}`, token);
  await redis.expire(`user:${userId}:tokens:${type}`, expiresInSeconds);

  return token;
}

export async function verifyToken(
  token: string,
  type: "password_reset" | "email_verification" | "magic_link"
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const redis = await getRedisClient();
  const key = `token:${type}:${token}`;
  const tokenData = await redis.get(key);

  if (!tokenData) {
    return { valid: false, error: "Token expired or not found" };
  }

  const parsedToken: Token = JSON.parse(tokenData);

  if (parsedToken.used) {
    return { valid: false, error: "Token already used" };
  }
  if (parsedToken.expiresAt < Date.now()) {
    await redis.del(key);
    return { valid: false, error: "Token expired" };
  }

  return { valid: true, userId: parsedToken.userId };
}

export async function markTokenAsUsed(
  token: string,
  type: "password_reset" | "email_verification" | "magic_link"
): Promise<void> {
  const redis = await getRedisClient();
  const key = `token:${type}:${token}`;

  const tokenData = await redis.get(key);
  if (tokenData) {
    const parsedToken: Token = JSON.parse(tokenData);
    parsedToken.used = true;

    // Keep for remaining TTL
    const ttl = await redis.ttl(key);
    if (ttl > 0) {
      await redis.setEx(key, ttl, JSON.stringify(parsedToken));
    }
  }
}

export async function deleteToken(
  token: string,
  type: "password_reset" | "email_verification" | "magic_link"
): Promise<void> {
  const redis = await getRedisClient();
  await redis.del(`token:${type}:${token}`);
}

// Rate limiting
export async function checkRateLimit(
  identifier: string,
  action: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const redis = await getRedisClient();
  const key = `ratelimit:${action}:${identifier}`;

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }

  const remaining = Math.max(0, maxAttempts - current);

  return {
    allowed: current <= maxAttempts,
    remaining,
  };
}
