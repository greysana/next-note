import { revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  notes: "notes",
  users: "users",
  folders: "users",

  note: (id: string) => `note-${id}`,
  user: (id: string) => `user-${id}`,
  folder: (id: string) => `folder-${id}`,
} as const;

export function invalidateNotesCache() {
  revalidateTag(CACHE_TAGS.notes);
}
export function invalidateNoteCache(id: string) {
  revalidateTag(CACHE_TAGS.note(id));
}

export function invalidateUsersCache() {
  revalidateTag(CACHE_TAGS.users);
}
export async function invalidateUserCache(id: string) {
  revalidateTag(CACHE_TAGS.user(id));
}

export function invalidateFoldersCache() {
  revalidateTag(CACHE_TAGS.folders);
}
export function invalidateFolderCache(id: string) {
  revalidateTag(CACHE_TAGS.folder(id));
}

export async function invalidateAllCache() {
  revalidateTag(CACHE_TAGS.notes);
  revalidateTag(CACHE_TAGS.users);
  revalidateTag(CACHE_TAGS.folders);
}
// export function invalidateAllNotes() {
//   revalidatePath("api/note");
// }
