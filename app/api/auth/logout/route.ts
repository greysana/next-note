import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/redis-auth";
import { getDatabase } from "@/db/mongodb";
import { invalidateAllCache } from "@/lib/cache";
import {
  compose,
  withErrorHandling,
  withLogging,
  withRateLimit,
} from "@/lib/middlewares";
import { logError } from "@/lib/middlewares/logger-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logoutHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const sessionToken = request.cookies.get("session_token")?.value;

    if (sessionToken) {
      await deleteSession(sessionToken);

      // Remove from database
      const db = await getDatabase();
      await db.collection("sessions").deleteOne({ sessionToken });
    }
    await invalidateAllCache();
    const response = NextResponse.json({ success: true });
    response.cookies.delete("session_token");

    return response;
  } catch (error) {
    logError(error as Error, "logout failed");
    throw error;
  }
}

export const POST = compose(
  withErrorHandling(),
  withLogging(),
  withRateLimit({
    max: 5,
    windowMs: 60000,
    useUserIdentifier: false,
    action: "logout",
  })
)(logoutHandler);
