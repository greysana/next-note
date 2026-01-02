import { NextResponse } from "next/server";
import { getDatabase } from "@/db/mongodb";
import { verifyOTP } from "@/lib/auth/redis-auth";
import {
  compose,
  withErrorHandling,
  withLogging,
  withRateLimit,
  withValidation,
} from "@/lib/middlewares";
import z from "zod";
import { logError } from "@/lib/middlewares/logger-utils";
const loginSchema = z.object({
  email: z
    .email({ message: "Invalid email" })
    .nonempty({ message: "Email is required" }),
  otp: z.string().nonempty({ message: "OTP is required" }),
});
async function loginHandler(request: Request): Promise<NextResponse> {
  const body = await request.json();
  const { email, otp } = body;
  try {
    const verification = await verifyOTP(email, "email_verification", otp);

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || "Invalid OTP" },
        { status: 400 }
      );
    }

    // Update user
    const db = await getDatabase();
    await db.collection("users").updateOne(
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
      message: "Email verified successfully",
    });
  } catch (error) {
    logError(error as Error, "Verifying Email failed", { email });
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
    useUserIdentifier: true,
    action: "login",
  })
)(loginHandler);
