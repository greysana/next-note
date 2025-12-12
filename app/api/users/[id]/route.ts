// app/api/users/[id]/route.ts (Updated)
import { getDatabase } from "@/db/mongodb";
import {
  CACHE_TAGS,
  invalidateUserCache,
  invalidateUsersCache,
} from "@/lib/cache";
import { isValidObjectId } from "@/lib/helper/helpers";
import { ObjectId } from "mongodb";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/redis-auth";

async function authenticate(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const sessionToken = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("session_token="))
    ?.split("=")[1];

  if (!sessionToken) {
    return null;
  }

  return await getSession(sessionToken);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await authenticate(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const getCachedUser = unstable_cache(
      async (userId: string) => {
        const db = await getDatabase();
        const user = await db.collection("users").findOne({
          _id: new ObjectId(userId),
        });

        // Remove sensitive data
        if (user) {
          delete user.password;
        }

        return user;
      },
      [`user-${id}`],
      {
        tags: [CACHE_TAGS.user(id)],
        revalidate: 60,
      }
    );

    const user = await getCachedUser(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await authenticate(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Check if user can update this profile
    if (session.userId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = await getDatabase();
    const body = await request.json();

    // Build update object (exclude sensitive fields)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.bio) updateData.bio = body.bio;
    if (body.avatar) updateData.avatar = body.avatar;

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateData,
        $currentDate: { updatedAt: true },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    invalidateUserCache(id);
    invalidateUsersCache();

    return NextResponse.json({
      success: true,
      modified: result.modifiedCount > 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await authenticate(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Check if user can delete this profile (or is admin)
    if (session.userId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = await getDatabase();
    const result = await db.collection("users").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete all user sessions
    const { deleteAllUserSessions } = await import("@/lib/auth/redis-auth");
    await deleteAllUserSessions(id);

    invalidateUserCache(id);
    invalidateUsersCache();

    return NextResponse.json({
      success: true,
      deleted: result.deletedCount > 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
