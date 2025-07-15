"use client";
import { useAppContext } from "@/hooks/AppContext";
import { RichTextEditor } from "@/components/RichTextEditor";
import AIGeneration from "@/components/AIGeneration"; // Import the AI component
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, use } from "react";
import {
  ArrowLeftIcon,
  TrashIcon,
  FolderIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {
    notes,
    folders,
    currentNote,
    setCurrentNote,
    updateNote,
    deleteNote,
    addNote,
  } = useAppContext();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("default");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);

  const isNewNote = id === "new";
  const folderId = searchParams?.get("folderId") || "default";
 
  useEffect(() => {
    if (isNewNote) {
      setCurrentNote(null);
      setTitle("");
      setContent("");
      setSelectedFolderId(folderId);
    } else {
      const found = notes.find((n) => n.id === id) || null;
      if (found) {
        setCurrentNote(found);
        setTitle(found.title ?? "");
        setContent(found.content ?? "");
        setSelectedFolderId(found.folderId || "default");
      }
    }
  }, [id, notes, setCurrentNote, isNewNote, folderId]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      if (isNewNote) {
        addNote({
          title: title || "Untitled Note",
          content,
          folderId: selectedFolderId,
          userId: ""
        });
        setLastSaved(new Date());
        router.push("/notes");
      } else {
        if (!currentNote) return;
        updateNote(currentNote.id ?? "", {
          title,
          content,
          folderId: selectedFolderId,
        });
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (currentNote && confirm("Are you sure you want to delete this note?")) {
      deleteNote(currentNote.id ?? "");
      router.push("/notes");
    }
  };

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* AI Generation Component */}
        <AIGeneration content={content} onContentChange={setContent} />

        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/notes"
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Notes
            </Link>

            <div className="flex items-center gap-3">
              {lastSaved && (
                <span className="text-sm text-green-600 flex items-center">
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}

              <button
                onClick={handleSave}
                name="save-note"
                disabled={isSaving}
                className={`flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors ${
                  isSaving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSaving
                  ? isNewNote
                    ? "Creating..."
                    : "Saving..."
                  : isNewNote
                    ? "Create Note"
                    : "Save"}
              </button>

              {!isNewNote && (
                <button
                name="delete-note"
                  onClick={handleDelete}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Title and Folder Selection */}
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold border-none outline-none bg-transparent placeholder-gray-400"
              placeholder="Note title..."
            />

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <FolderIcon className="h-5 w-5 text-gray-500 mr-2" />
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedFolder && (
                <div
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: selectedFolder.color }}
                >
                  {selectedFolder.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <RichTextEditor
            content={content}
            onChange={(newContent) => setContent(newContent)}
          />
        </div>
      </div>
    </div>
  );
}
