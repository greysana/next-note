import { NextResponse } from "next/server";
import { getDatabase } from "@/db/mongodb";
import { createOTP } from "@/lib/auth/redis-auth";
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

const registerSchema = z.object({
  email: z
    .email({ message: "Invalid email" })
    .nonempty({ message: "Email is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
  name: z.string().nonempty({ message: "Name is required" }),
});
async function registerHandler(request: Request): Promise<NextResponse> {
  const body = await request.json();
  const { email, password, name } = body;
  try {
    const db = await getDatabase();

    // Check if user exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      name,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create OTP for email verification
    const otp = await createOTP(email, "email_verification", 15 * 60);

    // TODO: Send OTP via email
    console.log(`Email verification OTP for ${email}: ${otp}`);

    return NextResponse.json({
      success: true,
      userId: result.insertedId,
      message: "Registration successful. Please verify your email.",
    });
  } catch (error) {
    logError(error as Error, "registration failed", { email });
    throw error;
  }
}

export const POST = compose(
  withErrorHandling(),
  withLogging(),
  withValidation({ body: registerSchema }),
  withRateLimit({
    max: 5,
    windowMs: 60000,
    useUserIdentifier: false,
    action: "register",
  })
)(registerHandler);
