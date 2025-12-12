// lib/mappers/note.mapper.ts
import { NoteDocument } from "@/types/database.types";
import { Note } from "@/types/types";

export function toNote(doc: NoteDocument): Note {
  if (!doc._id) {
    throw new Error("Document missing _id");
  }
  return {
    _id: doc?._id.toString(),
    title: doc.title,
    content: doc.content,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    userId: doc.userId.toString(),
    folderId: doc.folderId?.toString() ?? null,
  };
}

export function toNotes(docs: NoteDocument[]): Note[] {
  return docs.map(toNote);
}
