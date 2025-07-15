/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useRef, SetStateAction } from "react";
import { useAppContext } from "@/hooks/AppContext";
import Link from "next/link";
import {
  FolderIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  PencilIcon, // Added
  Square2StackIcon, // Added
  ListBulletIcon, // Added
  Squares2X2Icon, // Added
  XMarkIcon, // Added for closing modals/menus
} from "@heroicons/react/24/outline";
import { Note } from "@/types/types";

export default function NotesPage() {
  const {
    notes,
    folders,
    getNotesByFolder,
    addFolder,
    deleteFolder,
    editFolder, // Assume added to AppContext
    duplicateFolder, // Assume added to AppContext
    deleteNote, // Assume added to AppContext
    duplicateNote, // Assume added to AppContext
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#3B82F6");

  // --- New State Variables ---
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showEditFolderModal, setShowEditFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<any>({}); // { id, name, color }
  const [editedFolderName, setEditedFolderName] = useState("");
  const [editedFolderColor, setEditedFolderColor] = useState("");

  const [activeFolderMenu, setActiveFolderMenu] = useState("");
  const [activeNoteMenu, setActiveNoteMenu] = useState("");

  const folderMenuRef = useRef<HTMLDivElement>(null);
  const noteMenuRef = useRef<HTMLDivElement>(null);

  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
  ];

  // --- Click Outside Handler for Menus ---
  useEffect(() => {
    function handleClickOutside(event: { target: any }) {
      if (
        folderMenuRef.current &&
        !folderMenuRef.current.contains(event.target)
      ) {
        setActiveFolderMenu("");
      }
      if (noteMenuRef.current && !noteMenuRef.current.contains(event.target)) {
        setActiveNoteMenu("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      addFolder({
        name: newFolderName.trim(),
        color: newFolderColor,
        notes: [],
        userId: "",
      });
      setNewFolderName("");
      setNewFolderColor("#3B82F6");
      setShowNewFolderModal(false);
    }
  };

  // --- Folder Edit Functions ---
  const openEditFolderModal = (folder: {
    id?: string;
    name: any;
    color: any;
    notes?: Note[];
    userId?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) => {
    setEditingFolder(folder);
    setEditedFolderName(folder.name);
    setEditedFolderColor(folder.color);
    setShowEditFolderModal(true);
    setActiveFolderMenu("");
  };

  const handleUpdateFolder = () => {
    if (editingFolder && editedFolderName.trim()) {
      editFolder(editingFolder.id, {
        name: editedFolderName.trim(),
        color: editedFolderColor,
      });
      setShowEditFolderModal(false);
      setEditingFolder("");
    }
  };

  // --- Folder & Note Action Handlers ---
  const handleDuplicateFolder = (folderId: string) => {
    duplicateFolder(folderId);
    setActiveFolderMenu("");
  };

  const handleDeleteFolder = (folderId: string) => {
    // Consider adding a confirmation dialog here
    deleteFolder(folderId);
    setActiveFolderMenu("");
  };

  const handleDuplicateNote = (noteId: string | undefined) => {
    duplicateNote(noteId ?? "");
    setActiveNoteMenu("");
  };

  const handleDeleteNote = (noteId: string | undefined) => {
    // Consider adding a confirmation dialog here
    deleteNote(noteId ?? "");
    setActiveNoteMenu("");
  };

  const filteredNotes = notes?.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFolderMenu = (folderId: SetStateAction<string>) => {
    setActiveNoteMenu(""); // Close note menu if open
    setActiveFolderMenu(activeFolderMenu === folderId ? "" : folderId);
  };

  const toggleNoteMenu = (noteId: SetStateAction<string>) => {
    setActiveFolderMenu(""); // Close folder menu if open
    setActiveNoteMenu(activeNoteMenu === noteId ? "" : noteId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">My Notes</h1>
            <p className="text-gray-600">Organize your thoughts by folders</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-200"}`}
                title="Grid View"
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-200"}`}
                title="List View"
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowNewFolderModal(true)}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              New Folder
            </button>
          </div>
        </div>

        {/* Folders Area */}
        <div
          className={`space-y-8 ${viewMode === "list" ? "divide-y divide-gray-200" : ""}`}
        >
          {folders.map((folder) => {
            const folderNotes = searchTerm
              ? filteredNotes.filter((note) => note.folderId === folder.id)
              : getNotesByFolder(folder.id);

            return (
              <div
                key={folder.id}
                className={`${viewMode === "grid" ? "bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden" : ""}`}
              >
                {/* Folder Header */}
                <div
                  className={`p-4 md:p-6 ${viewMode === "grid" ? "border-b border-gray-200" : ""}`}
                  style={
                    viewMode === "grid"
                      ? { borderTopColor: folder.color, borderTopWidth: "4px" }
                      : {}
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="p-3 rounded-xl mr-4"
                        style={{ backgroundColor: folder.color + "20" }} // '20' for 12.5% opacity
                      >
                        <FolderIcon
                          className="h-6 w-6"
                          style={{ color: folder.color }}
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">
                          {folder.name}
                        </h2>
                        <p className="text-gray-500">
                          {folderNotes.length} notes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 relative">
                      <Link
                        href={`/notes/new?folderId=${folder.id}`}
                        className="flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors text-sm"
                      >
                        <PlusIcon className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Add Note</span>
                      </Link>

                      {folder.id !== "default" && ( // Assuming 'default' folder cannot be modified/deleted extensively
                        <button
                          name="folder-actions-button"
                          onClick={() => toggleFolderMenu(folder.id)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>
                      )}
                      {/* Folder Actions Menu */}
                      {activeFolderMenu === folder.id &&
                        folder.id !== "default" && (
                          <div
                            ref={folderMenuRef}
                            className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-xl z-20 border border-gray-200 py-1"
                          >
                            <button
                              onClick={() => openEditFolderModal(folder)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <PencilIcon className="h-4 w-4 mr-2" /> Edit
                            </button>
                            <button
                              onClick={() => handleDuplicateFolder(folder.id)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Square2StackIcon className="h-4 w-4 mr-2" />{" "}
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleDeleteFolder(folder.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <TrashIcon className="h-4 w-4 mr-2" /> Delete
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Notes Display: Grid or List */}
                <div
                  className={`${viewMode === "grid" ? "p-6" : "pl-6 pr-2 pb-4"}`}
                >
                  {folderNotes.length > 0 ? (
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                          : "space-y-3"
                      }
                    >
                      {folderNotes.map((note) => (
                        <div key={note.id} className="relative">
                          <Link
                            href={`/notes/${note.id}`}
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
                                  {note.content
                                    .replace(/<[^>]*>/g, "")
                                    .substring(0, 100) || "No content"}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                {new Date(note.updatedAt).toLocaleDateString()}
                                {viewMode === "list" &&
                                  note.content
                                    .replace(/<[^>]*>/g, "")
                                    .substring(0, 30) && (
                                    <span className="text-gray-400 ml-2">
                                      -{" "}
                                      {note.content
                                        .replace(/<[^>]*>/g, "")
                                        .substring(0, 30)}
                                      ...
                                    </span>
                                  )}
                              </p>
                            </div>
                            {viewMode === "list" && (
                              <DocumentTextIcon className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
                            )}
                          </Link>
                          {/* Note Actions Button (always visible for simplicity, or position absolutely) */}
                          <button
                            onClick={() => toggleNoteMenu(note.id)}
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
                          {activeNoteMenu === note.id && (
                            <div
                              ref={noteMenuRef}
                              className={`absolute right-0 mt-2 w-40 bg-white rounded-md shadow-xl z-20 border border-gray-200 py-1 ${viewMode === "grid" ? "top-8" : "top-full"}`}
                            >
                              <button
                                onClick={() => handleDuplicateNote(note.id)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <Square2StackIcon className="h-4 w-4 mr-2" />{" "}
                                Duplicate
                              </button>
                              <Link
                                href={`/notes/${note.id}?edit=true`} // Or however you handle editing
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <PencilIcon className="h-4 w-4 mr-2" /> Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                              >
                                <TrashIcon className="h-4 w-4 mr-2" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">
                        No notes in this folder yet
                      </p>
                      <Link
                        href={`/notes/new?folderId=${folder.id}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create First Note
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* New Folder Modal */}
        {showNewFolderModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Create New Folder
                </h3>
                <button
                  title="close-create-folder-modal"
                  onClick={() => setShowNewFolderModal(false)}
                  className="close-create-folder-modal p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter folder name"
                  autoFocus
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewFolderColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${newFolderColor === color ? "border-gray-800 ring-2 ring-offset-1 ring-gray-800" : "border-transparent hover:border-gray-400"}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Folder Modal */}
        {showEditFolderModal && editingFolder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Edit Folder</h3>
                <button
                  onClick={() => setShowEditFolderModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={editedFolderName}
                  onChange={(e) => setEditedFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter folder name"
                  autoFocus
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditedFolderColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${editedFolderColor === color ? "border-gray-800 ring-2 ring-offset-1 ring-gray-800" : "border-transparent hover:border-gray-400"}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditFolderModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateFolder}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
