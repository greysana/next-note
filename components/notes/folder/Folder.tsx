import { useAppContext } from "@/hooks/AppContext";
import { Note } from "@/types/types";
import {
  DocumentTextIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { Dispatch, SetStateAction, useRef } from "react";
import noteService from '../../../services/noteService';

type FolderProps = {
  note: Note;
  viewMode: string;
  activeNoteMenu: string;
  setActiveNoteMenu: Dispatch<SetStateAction<string>>;
  setActiveFolderMenu: Dispatch<SetStateAction<string>>;
};

const FolderCard = ({
  note,
  viewMode,
  activeNoteMenu,
  setActiveNoteMenu,
  setActiveFolderMenu,
}: FolderProps) => {
  const { duplicateNote } = useAppContext();
  const noteMenuRef = useRef<HTMLDivElement>(null);

  const handleDeleteNote = (noteId: string | undefined) => {
    noteService.deleteNote(noteId ?? "");
    setActiveNoteMenu("");
  };

  const handleDuplicateNote = (noteId: string | undefined) => {
    duplicateNote(noteId ?? "");
    setActiveNoteMenu("");
  };

  const toggleNoteMenu = (noteId: SetStateAction<string>) => {
    setActiveFolderMenu("");
    setActiveNoteMenu(activeNoteMenu === noteId ? "" : noteId);
  };
  return (
    <div key={note._id} className="relative">
      <Link
        href={`/notes/${note._id}`}
        className={`block p-4 rounded-xl transition-all duration-200
        ${
          viewMode === "grid"
            ? "bg-white hover:shadow-md border border-gray-100 hover:border-gray-200 transform hover:scale-105"
            : "bg-white/80 hover:bg-white border border-transparent hover:border-gray-200 flex justify-between items-center"
        }`}
      >
        <div className="flex-grow">
          <div
            className={`flex items-start justify-between ${viewMode === "grid" ? "mb-2" : ""}`}
          >
            <h3 className="font-semibold text-gray-800 truncate flex-1 pr-2">
              {note.title || "Untitled"}
            </h3>
            {viewMode === "grid" && (
              <DocumentTextIcon className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
            )}
          </div>
          {viewMode === "grid" && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {note.content.replace(/<[^>]*>/g, "").substring(0, 100) ||
                "No content"}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {new Date(note.updatedAt).toLocaleDateString()}
            {viewMode === "list" &&
              note.content.replace(/<[^>]*>/g, "").substring(0, 30) && (
                <span className="text-gray-400 ml-2">
                  - {note.content.replace(/<[^>]*>/g, "").substring(0, 30)}
                  ...
                </span>
              )}
          </p>
        </div>
        {viewMode === "list" && (
          <DocumentTextIcon className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
        )}
      </Link>

      <button
        onClick={() => toggleNoteMenu(note._id!)}
        className={`absolute p-1 rounded-full hover:bg-gray-200 transition-colors
                                        ${
                                          viewMode === "grid"
                                            ? "top-3 right-3 text-gray-400 hover:text-gray-600"
                                            : "top-1/2 right-10 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        }`}
        // Add this style if the Link is not relative: style={{ zIndex: 10 }}
      >
        <EllipsisVerticalIcon className="h-5 w-5" />
      </button>

      {/* Note Actions Menu */}
      {activeNoteMenu === note._id && (
        <div
          ref={noteMenuRef}
          className={`absolute right-0 mt-2 w-40 bg-white rounded-md shadow-xl z-20 border border-gray-200 py-1 ${viewMode === "grid" ? "top-8" : "top-full"}`}
        >
          <button
            onClick={() => handleDuplicateNote(note._id)}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <Square2StackIcon className="h-4 w-4 mr-2" /> Duplicate
          </button>
          <Link
            href={`/notes/${note._id}?edit=true`} // Or however you handle editing
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-2" /> Edit
          </Link>
          <button
            onClick={() => handleDeleteNote(note._id)}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <TrashIcon className="h-4 w-4 mr-2" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default FolderCard;
