import { getDatabase } from "@/db/mongodb";
import {
  CACHE_TAGS,
  invalidateNoteCache,
  invalidateNotesCache,
} from "@/lib/cache";
import { isValidObjectId } from "@/lib/helper/helpers";
import { ObjectId } from "mongodb";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const getCachedNote = unstable_cache(
      async (noteId: string) => {
        const db = await getDatabase();
        return db.collection("notes").findOne({
          _id: new ObjectId(noteId),
        });
      },
      [`note-${id}`],
      {
        tags: [CACHE_TAGS.note(id)],
        revalidate: 60,
      }
    );
    const note = await getCachedNote(id);
    if (!note) {
      return NextResponse.json({ error: "Note not Found" }, { status: 404 });
    }
    console.table(note);
    return NextResponse.json({ note });
  } catch (error) {
    console.error(error);
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
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
  }
  try {
    const db = await getDatabase();

    const body = await request.json();
    const result = await db.collection("notes").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          title: body.title,
          content: body.content,
        },
        $currentDate: {
          updatedAt: true,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Note not Found" }, { status: 404 });
    }
    invalidateNoteCache(id);
    invalidateNotesCache();

    console.table(result);
    return NextResponse.json({
      success: true,
      modified: result.modifiedCount > 0,
    });
  } catch (error) {
    console.error(error);
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
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
  }
  try {
    const db = await getDatabase();
    const result = await db.collection("notes").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Note not Found" }, { status: 404 });
    }

    invalidateNoteCache(id);
    invalidateNotesCache();
    console.table(result);
    return NextResponse.json({
      success: true,
      deleted: result.deletedCount > 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
