import { getDatabase } from "@/db/mongodb";
import { NextResponse } from "next/server";
import { CACHE_TAGS } from "@/lib/cache";
import { unstable_cache } from "next/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const getCachedNotes = unstable_cache(
      async () => {
        const db = await getDatabase();
        const notes = await db
          .collection("notes")
          .find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();

        const total = await db.collection("notes").countDocuments();
        return { notes, total };
      },
      [`notes-page-${page}-limit-${limit}`],
      {
        tags: [CACHE_TAGS.notes],
        revalidate: 60,
      }
    );
    const { notes, total } = await getCachedNotes();

    console.table(notes);
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
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const result = await db.collection("notes").insertOne({
      title: body.title,
      content: body.content,
      folderId: body.folderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.table(result);
    return NextResponse.json({
      success: true,
      id: result.insertedId,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
