import { getDatabase } from "@/db/mongodb";
import { requireAuth } from "@/lib/auth/session";
import { CACHE_TAGS, invalidateFoldersCache } from "@/lib/cache";
import { toFolders } from "@/lib/mappers/folder.mapper";
import {
  compose,
  withErrorHandling,
  withLogging,
  withRateLimit,
  withValidation,
} from "@/lib/middlewares";
import { logError } from "@/lib/middlewares/logger-utils";
import { FolderDocument } from "@/types/database.types";
import { Folder } from "@/types/types";
import { ObjectId } from "mongodb";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import z from "zod";

const createFolderSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  color: z.string().optional(),
  userId: z.string().nullable().optional(),
});
async function getFoldersHandler(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;
  const user = await requireAuth();
  try {
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
    invalidateFoldersCache();
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
    logError(error as Error, "failed to fetch folders", {
      userId: user.userId,
    });

    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

async function createFolderHandler(request: Request): Promise<NextResponse> {
  const user = await requireAuth();
  try {
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
    logError(error as Error, "failed to fetch notes", { userId: user.userId });
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}

export const GET = compose(
  withErrorHandling(),
  withRateLimit({
    max: 100,
    windowMs: 60000,
    useUserIdentifier: true,
    action: "get_folders",
  })
)(getFoldersHandler);

export const POST = compose(
  withErrorHandling(),
  withLogging(),
  withValidation({ body: createFolderSchema }),
  withRateLimit({
    max: 100,
    windowMs: 60000,
    useUserIdentifier: true,
    action: "create_folder",
  })
)(createFolderHandler);
