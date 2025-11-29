import { revalidatePath, revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  notes: "notes",
  note: (id: string) => `note-${id}`,
} as const;

export function invalidateNotesCache() {
  revalidateTag(CACHE_TAGS.notes);
}
export function invalidateNoteCache(id: string) {
  revalidateTag(CACHE_TAGS.note(id));
}

// export function invalidateAllNotes() {
//   revalidatePath("api/note");
// }
