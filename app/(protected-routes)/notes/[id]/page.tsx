"use client";
import { useAppContext } from "@/hooks/AppContext";
import { RichTextEditor } from "@/components/RichTextEditor";
import AIGeneration from "@/components/AIGeneration";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, use } from "react";
import {
  ArrowLeftIcon,
  TrashIcon,
  FolderIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import noteService from "@/services/noteService";
import { useAuth } from "@/hooks/AuthContext";

export default function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { notes, folders, currentNote, setCurrentNote, setIsRefetch } =
    useAppContext();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(`
    <p>
    Start typing here
    </p>    
    
    
    
    
    
    
    
    
    
    `);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("default");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);

  const isNewNote = id === "new";
  const folderId = searchParams?.get("folderId") || "default";

  useEffect(() => {
    const getNote = async () => {
      const note = await noteService.getNoteById(id);

      if (note) {
        setCurrentNote(note);
        setTitle(note.title ?? "");
        setContent(note.content ?? "");
        setSelectedFolderId(note.folderId || "default");
        console.log(note.content);
      }
    };
    if (isNewNote) {
      setCurrentNote(null);
      setTitle("");
      setContent("");
      setSelectedFolderId(folderId);
    } else {
      getNote();
    }
  }, [notes, id, setCurrentNote, isNewNote, folderId]);
  // console.log(content);
  const handleSave = async () => {
    setIsSaving(true);
    console.table(params);

    try {
      if (isNewNote) {
        console.log(content);
        const note = await noteService.addNote({
          title: title || "Untitled Note",
          content,
          folderId: selectedFolderId,
          userId: user?._id ?? "",
        });
        console.table(note);
        setLastSaved(new Date());
        router.push("/notes/" + note._id);
      } else {
        if (!currentNote) return;
        const note = await noteService.updateNote(currentNote._id ?? "", {
          title,
          content,
          folderId: selectedFolderId,
        });
        setLastSaved(new Date());
        console.table("updating note");

        console.table(note);
      }
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsRefetch(true);
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (currentNote && confirm("Are you sure you want to delete this note?")) {
      noteService.deleteNote(currentNote._id ?? "");
      router.push("/notes");
      setIsRefetch(true);
    }
  };

  const selectedFolder = folders.find((f) => f._id === selectedFolderId);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* AI Generation Component */}

        {/* Header */}
        <div className="sticky top-0 sm:top-0 z-45 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 mb-6 transition-all duration-300">
          {/* Top Row: Back button, Title, Actions */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <Link
              href="/notes"
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors shrink-0"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
            </Link>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 text-xl sm:text-2xl font-bold border-none outline-none bg-transparent placeholder-gray-400 min-w-0"
              placeholder="Note title..."
            />

            <div className="flex items-center gap-2 shrink-0">
              {lastSaved && (
                <span className="hidden md:flex text-xs text-green-600 items-center">
                  <CheckIcon className="h-3 w-3 mr-1" />
                  {lastSaved.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}

              <button
                onClick={handleSave}
                name="save-note"
                disabled={isSaving}
                className={`flex items-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors ${
                  isSaving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSaving ? "..." : isNewNote ? "Create" : "Save"}
              </button>

              {!isNewNote && (
                <button
                  name="delete-note"
                  aria-label="delete-note"
                  onClick={handleDelete}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row: Folder Selection */}
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <FolderIcon className="h-4 w-4 text-gray-500 mr-2" />
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {folders.map((folder) => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedFolder && (
              <div
                data-testid="color-note"
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: selectedFolder.color }}
              >
                {selectedFolder.name}
              </div>
            )}

          </div>
        </div>
            <AIGeneration content={content} onContentChange={setContent} />
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
