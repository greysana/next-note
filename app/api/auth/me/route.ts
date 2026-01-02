import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase } from "@/db/mongodb";
import { ObjectId } from "mongodb";
import { compose, withErrorHandling, withRateLimit } from "@/lib/middlewares";
import { logError } from "@/lib/middlewares/logger-utils";

async function getUserHandler(): Promise<NextResponse> {
  const currentUser = await getCurrentUser();
  try {
    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    // Fetch full user details from database
    const db = await getDatabase();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(currentUser.userId) },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    logError(error as Error, "getting user profile failed", {
      email: currentUser?.email,
    });
    throw error;
  }
}

export const GET = compose(
  withErrorHandling(),
  withRateLimit({
    max: 100,
    windowMs: 60000,
    useUserIdentifier: true,
    action: "auth_me",
  })
)(getUserHandler);
