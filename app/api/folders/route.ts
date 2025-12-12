import { getDatabase } from "@/db/mongodb";
import { checkRateLimit } from "@/lib/auth/redis-auth";
import { requireAuth } from "@/lib/auth/session";
import { CACHE_TAGS, invalidateFoldersCache } from "@/lib/cache";
import { toFolders } from "@/lib/mappers/folder.mapper";
import { FolderDocument } from "@/types/database.types";
import { Folder } from "@/types/types";
import { ObjectId } from "mongodb";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const user = await requireAuth();
    // Rate limiting using user's email
    const rateLimit = await checkRateLimit(user.email, "get_folder", 100, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
    const getCachedFolders = unstable_cache(
      async (): Promise<{ folders: Folder[]; total: number }> => {
        const db = await getDatabase();
        const folderDocs = await db
          .collection<FolderDocument>("folders")
          .find({
            userId: new ObjectId(user.userId),
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();
        const total = await db
          .collection<FolderDocument>("folders")
          .countDocuments({ userId: new ObjectId(user.userId) });
        return { folders: toFolders(folderDocs), total };
      },
      [`folders-page-${page}-limit-${limit}`],
      {
        tags: [CACHE_TAGS.folders],
        revalidate: 60,
      }
    );
    // console.table(folders);
    const { folders, total } = await getCachedFolders();

    // console.table(folders);
    return NextResponse.json(
      {
        folders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    console.error("GET folder error:", error);
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const rateLimit = await checkRateLimit(user.email, "get_folder", 100, 60);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const db = await getDatabase();

    const folderDoc = {
      name: body.name,
      color: body.color,
      userId: new ObjectId(body.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<FolderDocument>("folders")
      .insertOne(folderDoc);
    invalidateFoldersCache();

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
