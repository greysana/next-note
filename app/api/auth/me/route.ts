import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase } from "@/db/mongodb";
import { ObjectId } from "mongodb";
import { checkRateLimit } from "@/lib/auth/redis-auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(
      currentUser.email,
      "auth_me",
      100,
      60
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
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
    console.error("Get current user error:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}
