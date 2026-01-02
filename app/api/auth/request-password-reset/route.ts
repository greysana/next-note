import { NextResponse } from "next/server";
import { getDatabase } from "@/db/mongodb";
import { createToken } from "@/lib/auth/redis-auth";
import { logError } from "@/lib/middlewares/logger-utils";
import {
  compose,
  withErrorHandling,
  withLogging,
  withRateLimit,
  withValidation,
} from "@/lib/middlewares";
import z from "zod";

const requestPasswordResetSchema = z.object({
  email: z
    .email({ message: "Invalid email" })
    .nonempty({ message: "Email is required" }),
});

async function requestPasswordResetHandler(
  request: Request
): Promise<NextResponse> {
  const body = await request.json();
  const { email } = body;
  try {
    const db = await getDatabase();
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({
        success: true,
        message: "If an account exists, a password reset link has been sent.",
      });
    }

    // Create reset token
    const resetToken = await createToken(
      user._id.toString(),
      "password_reset",
      60 * 60 // 1 hour
    );

    // Store in database for audit
    await db.collection("password_resets").insertOne({
      userId: user._id,
      token: resetToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      used: false,
    });

    // TODO: Send reset link via email
    console.log(
      `Password reset link for ${email}: /reset-password?token=${resetToken}`
    );

    return NextResponse.json({
      success: true,
      message: "If an account exists, a password reset link has been sent.",
    });
  } catch (error) {
    logError(error as Error, "Request reset password failed", { email });
    throw error;
  }
}
export const POST = compose(
  withErrorHandling(),
  withLogging(),
  withValidation({ body: requestPasswordResetSchema }),
  withRateLimit({
    max: 5,
    windowMs: 60000,
    useUserIdentifier: true,
    action: "request_password_reset",
  })
)(requestPasswordResetHandler);
