import { ObjectId } from "mongodb";

export type Note = {
  _id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  folderId: string | null;
};

export type Folder = {
  _id?: string;
  name: string;
  color: string;
  notes?: Note[];
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type User = {
  _id?: string;
  name: string;
  email: string;
  folders: Folder[];
};

export interface CreateDto {
  title: string;
  content: string;
}

export interface UpdateDto {
  title?: string;
  content?: string;
}

export interface SessionAudit {
  _id: ObjectId;
  userId: ObjectId;
  sessionToken: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

// password_resets collection (for audit trail)
export interface PasswordReset {
  _id: ObjectId;
  userId: ObjectId;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
}

// Session management
export interface Session {
  userId: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export interface Token {
  userId: string;
  type: "password_reset" | "email_verification" | "magic_link";
  createdAt: number;
  expiresAt: number;
  used?: boolean;
}
