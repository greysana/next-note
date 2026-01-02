import { NextResponse } from "next/server";
import { getDatabase } from "@/db/mongodb";
import { createSession } from "@/lib/auth/redis-auth";
import bcrypt from "bcryptjs";
import z from "zod";
import { logError } from "@/lib/middlewares/logger-utils";
import {
  compose,
  withErrorHandling,
  withLogging,
  withRateLimit,
  withValidation,
} from "@/lib/middlewares";

const loginSchema = z.object({
  email: z
    .email({ message: "Invalid email" })
    .nonempty({ message: "Email is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
});
async function loginHandler(request: Request): Promise<NextResponse> {
  const body = await request.json();
  const { email, password } = body;

  try {
    const db = await getDatabase();
    const user = await db.collection("users").findOne({ email });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = await createSession(
      user._id.toString(),
      user.email,
      7 * 24 * 60 * 60 // 7 days
    );
    console.log(`session user ${user.email}`);

    // Store session in database for audit
    await db.collection("sessions").insertOne({
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
    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    logError(error as Error, "Login failed");
    throw error;
  }
}
export const POST = compose(
  withErrorHandling(),
  withLogging(),
  withValidation({ body: loginSchema }),
  withRateLimit({
    max: 5,
    windowMs: 60000,
    useUserIdentifier: false,
    action: "login",
  })
)(loginHandler);
