import { getDatabase } from "@/db/mongodb";
import { NextResponse } from "next/server";
import { CACHE_TAGS, invalidateNotesCache } from "@/lib/cache";
import { unstable_cache } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { Note } from "@/types/types";
import { NoteDocument } from "@/types/database.types";
import { ObjectId } from "mongodb";
import { toNotes } from "@/lib/mappers/note.mapper";
import z from "zod";
import {
  compose,
  withErrorHandling,
  withLogging,
  withRateLimit,
  withValidation,
} from "@/lib/middlewares";
import { logError } from "@/lib/middlewares/logger-utils";

const createNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  folderId: z.string().nullable().optional(),
  userId: z.string(),
});
async function getNotesHandler(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const user = await requireAuth();
  try {
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;

    const getCachedNotes = unstable_cache(
      async (): Promise<{ notes: Note[]; total: number }> => {
        const db = await getDatabase();
        const noteDocs = await db
          .collection<NoteDocument>("notes")
          .find({ userId: new ObjectId(user.userId) })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();

        const total = await db
          .collection<NoteDocument>("notes")
          .countDocuments({ userId: new ObjectId(user.userId) });
        return { notes: toNotes(noteDocs), total };
      },
      [`notes-page-${page}-limit-${limit}`],
      {
        tags: [CACHE_TAGS.notes],
        revalidate: 60,
      }
    );
    const { notes, total } = await getCachedNotes();

    // console.table(notes);
    return NextResponse.json({
      notes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError(error as Error, "failed to fetch notes", { userId: user.userId });
    throw error;
  }
}

async function createNoteHandler(request: Request): Promise<NextResponse> {
  const user = await requireAuth();

  try {
    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const noteDoc = {
      title: body.title,
      content: body.content,
      folderId: body.folderId ? new ObjectId(body.folderId) : null,
      userId: new ObjectId(body.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db
      .collection<NoteDocument>("notes")
      .insertOne(noteDoc);
    invalidateNotesCache();
    // console.table(result);
    return NextResponse.json({
      success: true,
      _id: result.insertedId.toString(),
    });
  } catch (error) {
    logError(error as Error, "Failed to create the note", {
      userId: user.userId,
    });
    throw error;
  }
}

export const GET = compose(
  withErrorHandling(),
  // withLogging(),
  // withValidation({ params: createNoteSchema }),
  withRateLimit({
    max: 100,
    windowMs: 60000,
    useUserIdentifier: true,
    action: "get_notes",
  })
)(getNotesHandler);

export const POST = compose(
  withErrorHandling(),
  withLogging(),
  withValidation({ body: createNoteSchema }),
  withRateLimit({
    max: 100,
    windowMs: 60000,
    useUserIdentifier: true,
    action: "create_note",
  })
)(createNoteHandler);
