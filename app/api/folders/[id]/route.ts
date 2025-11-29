import { getDatabase } from "@/db/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const db = await getDatabase();
    const folder = await db.collection("folders").findOne({
      _id: new ObjectId(id),
    });

    if (!folder) {
      return NextResponse.json({ error: "folder not Found" }, { status: 404 });
    }
    console.table(folder);
    return NextResponse.json({ folder });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch folder" },
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
    console.table(result);
    console.table(body);
    console.table(request);

    return NextResponse.json({
      success: true,
      modified: result.modifiedCount > 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const db = await getDatabase();
    const result = await db.collection("folders").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "folder not Found" }, { status: 404 });
    }
    console.table(result);
    return NextResponse.json({
      success: true,
      deleted: result.deletedCount > 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}
