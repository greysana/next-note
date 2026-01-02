import { getDatabase } from "@/db/mongodb";
import { requireAuth } from "@/lib/auth/session";
import { invalidateFolderCache, invalidateFoldersCache } from "@/lib/cache";
import { isValidObjectId } from "@/lib/helper/helpers";
import {
  compose,
  logger,
  RouteContext,
  withErrorHandling,
  withLogging,
  withRateLimit,
  withSanitization,
  withValidation,
} from "@/lib/middlewares";
import { logError } from "@/lib/middlewares/logger-utils";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import z from "zod";

const folderIdSchema = z.object({
  id: z.string().refine((id) => isValidObjectId(id), {
    message: "Invalid Folder ID format",
  }),
});
const updateFolderSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  color: z.string().optional(),
  userId: z.string().nullable().optional(),
});

async function getFolderHandler(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params;
  try {
    const db = await getDatabase();
    const folder = await db.collection("folders").findOne({
      _id: new ObjectId(id),
    });

    if (!folder) {
      logger.warn("Note not found", {
        folderId: id,
      });
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }
    // console.table(folder);

    return NextResponse.json({ folder });
  } catch (error) {
    logError(error as Error, "Failed to fetch folder", {
      folderId: id,
    });
    return NextResponse.json(
      { error: "Failed to fetch folder" },
      { status: 500 }
    );
  }
}

async function updateFolderHandler(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params;
  const user = await requireAuth();

  try {
    const db = await getDatabase();

    const body = await request.json();
    const result = await db.collection("folders").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "folder not Found" }, { status: 404 });
    }
    // console.table(result);
    // console.table(body);
    // console.table(request);
    invalidateFoldersCache();
    invalidateFolderCache(id);
    return NextResponse.json({
      success: true,
      modified: result.modifiedCount > 0,
    });
  } catch (error) {
    logError(error as Error, "Failed to update note", {
      folderId: id,
      userId: user.userId,
    });
    throw error;
  }
}

async function deleteFolderHandler(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params;
  const user = await requireAuth();

  try {
    const db = await getDatabase();
    const result = await db.collection("folders").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "folder not Found" }, { status: 404 });
    }
    invalidateFoldersCache();
    invalidateFolderCache(id);
    // console.table(result);
    return NextResponse.json({
      success: true,
      deleted: result.deletedCount > 0,
    });
  } catch (error) {
    logError(error as Error, "Failed to delete note", {
      noteId: id,
      userId: user.userId,
    });
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}

export const GET = compose(
  withErrorHandling(),
  // withLogging(),
  withValidation({ params: folderIdSchema, body: updateFolderSchema }),
  withRateLimit({
    max: 100,
    windowMs: 60000,
    useUserIdentifier: true,
    action: "get_folder",
  })
)(getFolderHandler);

export const PUT = compose(
  withErrorHandling(),
  withLogging(),
  withSanitization(),
  withValidation({
    params: folderIdSchema,
    body: updateFolderSchema,
  }),
  withRateLimit({
    max: 50,
    windowMs: 60000,
    useUserIdentifier: true,
    action: "update_folder",
  })
)(updateFolderHandler);

export const DELETE = compose(
  withErrorHandling(),
  withLogging(),
  withValidation({ params: folderIdSchema }),
  withRateLimit({
    max: 30,
    windowMs: 6000,
    useUserIdentifier: true,
    action: "delete_folder",
  })
)(deleteFolderHandler);
