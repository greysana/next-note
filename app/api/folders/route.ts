import { getDatabase } from "@/db/mongodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // const { searchParams } = new URL(request.url);

    // const page = parseInt(searchParams.get("page") || "1");
    // const limit = parseInt(searchParams.get("limit") || "10");
    // const skip = (page - 1) * limit;

    const db = await getDatabase();
    const folders = await db.collection("folders").find({}).toArray();
    console.table(folders);
    return NextResponse.json({ folders });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const result = await db.collection("folders").insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({
      success: true,
      id: result.insertedId,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
