import { getDatabase } from "@/db/mongodb";
import { requireAuth } from "@/lib/auth/session";
import {
  CACHE_TAGS,
  invalidateNoteCache,
  invalidateNotesCache,
} from "@/lib/cache";
import { isValidObjectId } from "@/lib/helper/helpers";
import { toNote } from "@/lib/mappers/note.mapper";
import {
  compose,
  logger,
  RouteContext,
  withErrorHandling,
  withLogging,
  withRateLimit,
  withValidation,
} from "@/lib/middlewares";
import { logError } from "@/lib/middlewares/logger-utils";
import { NoteDocument } from "@/types/database.types";
import { Note } from "@/types/types";
import { ObjectId } from "mongodb";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import z from "zod";

const noteIdSchema = z.object({
  id: z.string().refine((id) => isValidObjectId(id), {
    message: "Invalid note ID format",
  }),
});
const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  folderId: z.string().nullable().optional(),
});

async function getNoteHandler(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const user = await requireAuth();
  const { id } = await context.params;

  const getCachedNote = unstable_cache(
    async (noteId: string, userId: string): Promise<Note | null> => {
      if (process.env.NODE_ENV === "development") {
        logger.debug("Cache miss - fetching note from database", {
          noteId,
          userId,
        });
      }
      try {
        const db = await getDatabase();

        const noteDoc = await db.collection<NoteDocument>("notes").findOne({
          _id: new ObjectId(noteId),
          userId: new ObjectId(userId),
        });

        return noteDoc ? toNote(noteDoc) : null;
      } catch (error) {
        logError(error as Error, "Database query failed", {
          operation: "findOne",
          collection: "notes",
          noteId,
          userId,
        });
        throw error;
      }
    },
    [`note-${id}-${user.userId}`],
    {
      tags: [CACHE_TAGS.note(id)],
      revalidate: 60,
    }
  );

  const note = await getCachedNote(id, user.userId);
  if (!note) {
    logger.warn("Note not found", {
      noteId: id,
      userId: user.userId,
    });
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ ...note });
}

async function updateNoteHandler(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params;
  const user = await requireAuth();

  try {
    const db = await getDatabase();
    const body = await request.json();

    const updateData: Partial<NoteDocument> = {
      title: body.title,
      content: body.content,
      updatedAt: new Date(),
    };

    // Handle folderId conversion
    if (body.folderId !== undefined) {
      updateData.folderId = body.folderId ? new ObjectId(body.folderId) : null;
    }

    const result = await db.collection<NoteDocument>("notes").updateOne(
      {
        _id: new ObjectId(id),
        userId: new ObjectId(user.userId), // Convert to ObjectId
      },
      {
        $set: updateData,
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    invalidateNotesCache();
    invalidateNoteCache(id);
    return NextResponse.json({
      success: true,
      modified: result.modifiedCount > 0,
    });
  } catch (error) {
    logError(error as Error, "Failed to update note", {
      noteId: id,
      userId: user.userId,
    });
    throw error;
  }
}
async function deleteNoteHandler(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const user = await requireAuth();
  const { id } = await context.params;
  try {
    const db = await getDatabase();
    const result = await db.collection<NoteDocument>("notes").deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user.userId), // Convert to ObjectId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    invalidateNotesCache();
    invalidateNoteCache(id);

    return NextResponse.json({
      success: true,
      deleted: result.deletedCount > 0,
    });
  } catch (error) {
    logError(error as Error, "Failed to delete note", {
      noteId: id,
      userId: user.userId,
    });
    throw error;
  }
}

export const GET = compose(
  withErrorHandling(),
  // withLogging(),
  withValidation({ params: noteIdSchema }),
  withRateLimit({
    max: 100,
    windowMs: 60000,
    useUserIdentifier: true,
    action: "get_note",
  })
)(getNoteHandler);

export const PUT = compose(
  withErrorHandling(),
  withLogging(),
  // withSanitization(),// this affects the styling of the rich text editor
  withValidation({
    params: noteIdSchema,
    body: updateNoteSchema,
  }),
  withRateLimit({
    max: 50,
    windowMs: 60000,
    useUserIdentifier: true,
    action: "update_note",
  })
)(updateNoteHandler);

export const DELETE = compose(
  withErrorHandling(),
  withLogging(),
  withValidation({ params: noteIdSchema }),
  withRateLimit({
    max: 30,
    windowMs: 6000,
    useUserIdentifier: true,
    action: "delete_note",
  })
)(deleteNoteHandler);
