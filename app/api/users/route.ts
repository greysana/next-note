import { getDatabase } from "@/db/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDatabase();
    const users = await db.collection("users").find({}).toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const result = await db.collection("user").insertOne({
      ...body,
      createdAt: new Date(),
    });
    return NextResponse.json({
      success: true,
      id: result.insertedId,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
