import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./redis-auth";

export async function authMiddleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (!sessionToken) {
    return NextResponse.json(
      { error: "Unauthorized - No session token" },
      { status: 401 }
    );
  }

  const session = await getSession(sessionToken);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized - No session token" },
      { status: 401 }
    );
  }

  //Add user info to headers for use in API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.userId);
  requestHeaders.set("x-user-email", session.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Helper to get user from request in API routes
export function getUserFromRequest(request: Request): {
  userId: string;
  email: string;
} | null {
  const userId = request.headers.get("x-user-id");
  const email = request.headers.get("x-user-email");

  if (!userId || !email) {
    return null;
  }

  return { userId, email };
}
