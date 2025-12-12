import { Db } from "mongodb";

export async function initializeIndexes(db: Db) {
  try {
    const collection = db.collection("notes");

    await collection.createIndex({ userId: 1, createdAt: -1 });
    await collection.createIndex({ userId: 1, updatedAt: -1 });
    db.collection("users").createIndex({ email: 1 }, { unique: true })
    db.collection("sessions").createIndex({ sessionToken: 1 }, { unique: true })
    db.collection("sessions").createIndex({ userId: 1 })
    db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    db.collection("password_resets").createIndex({ token: 1 })
    db.collection("password_resets").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

    console.log("MongoDB indexes created successfully");
  } catch (error) {
    console.error("Failed to create indexes:", error);
  }
}
