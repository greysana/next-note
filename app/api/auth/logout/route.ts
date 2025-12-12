import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/redis-auth";
import { getDatabase } from "@/db/mongodb";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(request: any) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value;

    if (sessionToken) {
      await deleteSession(sessionToken);

      // Remove from database
      const db = await getDatabase();
      await db.collection("sessions").deleteOne({ sessionToken });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("session_token");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
