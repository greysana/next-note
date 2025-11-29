import { getDatabase } from "./mongodb";

export async function initializeIndexes() {
  try {
    const db = await getDatabase();
    const collection = db.collection("notes");

    await collection.createIndex({ userId: 1, createdAt: -1 });

    await collection.createIndex({ userId: 1, updatedAt: -1 });
  } catch (error) {
    console.error("Failed to create indexes:", error);
  }
}
