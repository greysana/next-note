import { MongoClient, Db, MongoClientOptions } from "mongodb";
import { initializeIndexes } from "./init-indexes";

// Remove the immediate check - we'll check at runtime instead
const uri = process.env.MONGODB_URI as string;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let indexesInitialized = false;

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  tls: true,
  tlsAllowInvalidCertificates: false,
  retryWrites: true,
  retryReads: true,
};

function ensureClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("Please add your MongoDB URI to .env file");
  }

  if (clientPromise) {
    return clientPromise;
  }

  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
      _indexesInitialized?: boolean;
    };
    
    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise!;
    indexesInitialized = globalWithMongo._indexesInitialized || false;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

// Export a promise that initializes on first use
export default new Proxy({} as Promise<MongoClient>, {
  get(target, prop) {
    return ensureClient()[prop as keyof Promise<MongoClient>];
  }
}) as Promise<MongoClient>;

export async function getDatabase(dbName?: string): Promise<Db> {
  try {
    const client = await ensureClient();
    const db = client.db(dbName);

    // Initialize indexes once per application lifecycle
    if (!indexesInitialized) {
      await initializeIndexes(db);
      indexesInitialized = true;

      // Persist in global for development mode
      if (process.env.NODE_ENV === "development") {
        const globalWithMongo = global as typeof globalThis & {
          _indexesInitialized?: boolean;
        };
        globalWithMongo._indexesInitialized = true;
      }
    }

    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}