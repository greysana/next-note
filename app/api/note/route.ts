import { getDatabase } from "@/db/mongodb";
import { NextResponse } from "next/server";
import { CACHE_TAGS, invalidateNotesCache } from "@/lib/cache";
import { unstable_cache } from "next/cache";
import { checkRateLimit } from "@/lib/auth/redis-auth";
import { requireAuth } from "@/lib/auth/session";
import { Note } from "@/types/types";
import { NoteDocument } from "@/types/database.types";
import { ObjectId } from "mongodb";
import { toNotes } from "@/lib/mappers/note.mapper";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user = await requireAuth();
    const rateLimit = await checkRateLimit(user.email, "get_note", 100, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

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
    return NextResponse.json(
      {
        notes,
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
    console.error("GET note error:", error);
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const rateLimit = await checkRateLimit(user.email, "get_note", 100, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
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
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    console.error("GET note error:", error);
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
