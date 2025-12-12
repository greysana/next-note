import { FolderDocument } from "@/types/database.types";
import { Folder } from "@/types/types";

export function toFolder(doc: Omit<FolderDocument, "notes">): Folder {
  if (!doc._id) {
    throw new Error("Document missing _id");
  }
  return {
    _id: doc?._id.toString(),
    name: doc.name,
    color: doc.color,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    userId: doc.userId.toString(),
  };
}

export function toFolders(docs: FolderDocument[]): Folder[] {
  return docs.map(toFolder);
}
