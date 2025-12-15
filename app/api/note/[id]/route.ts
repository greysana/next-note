// app/api/notes/[id]/route.ts
import { getDatabase } from "@/db/mongodb";
import { checkRateLimit } from "@/lib/auth/redis-auth";
import { requireAuth } from "@/lib/auth/session";
import {
  CACHE_TAGS,
  invalidateNoteCache,
  invalidateNotesCache,
} from "@/lib/cache";
import { isValidObjectId } from "@/lib/helper/helpers";
import { toNote } from "@/lib/mappers/note.mapper";
import { NoteDocument } from "@/types/database.types";
import { Note } from "@/types/types";
import { ObjectId } from "mongodb";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const rateLimit = await checkRateLimit(user.email, "get_note", 100, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const getCachedNote = unstable_cache(
      async (noteId: string, userId: string): Promise<Note | null> => {
        console.log(
          `🔴 DATABASE HIT - Fetching note ${noteId} for user ${userId}`
        );

        const db = await getDatabase();

        const noteDoc = await db.collection<NoteDocument>("notes").findOne({
          _id: new ObjectId(noteId),
          userId: new ObjectId(userId),
        });

        return noteDoc ? toNote(noteDoc) : null;
      },
      [`note-${id}-${user.userId}`],
      {
        tags: [CACHE_TAGS.note(id)],
        revalidate: 60,
      }
    );

    // console.log(
    //   `🟢 Attempting to get note ${id} (will use cache if available)`
    // );
    const note = await getCachedNote(id, user.userId);
    // console.log(`✅ Note retrieved: ${note ? "found" : "not found"}`);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ ...note });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    console.error("GET note error:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const rateLimit = await checkRateLimit(user.email, "update_note", 50, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

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
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    console.error("PUT note error:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const rateLimit = await checkRateLimit(user.email, "delete_note", 30, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

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
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    console.error("DELETE note error:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
