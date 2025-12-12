// types/database.types.ts (MongoDB layer)
import { ObjectId } from "mongodb";

export interface NoteDocument {
  _id?: ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: ObjectId;
  folderId: ObjectId | null;
}

export interface FolderDocument {
  _id?: ObjectId;
  name: string;
  color: string;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument {
  _id?: ObjectId;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionAuditDocument {
  _id?: ObjectId;
  userId: ObjectId;
  sessionToken: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface PasswordResetDocument {
  _id?: ObjectId;
  userId: ObjectId;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
}
