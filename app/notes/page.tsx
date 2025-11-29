/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useRef, SetStateAction, useMemo } from "react";
import { useAppContext } from "@/hooks/AppContext";
import Link from "next/link";
import {
  FolderIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  Square2StackIcon,
  ListBulletIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import NewFolderModal from "@/components/notes/folder/NewFolder";
import { Folder } from "@/types/note";
import UpdateFolderModal from "@/components/notes/folder/UpdateFolder";
import FolderCard from "@/components/notes/folder/Folder";
import folderService from "@/services/folderService";

export default function NotesPage() {
  const { notes, folders, getNotesByFolder, duplicateFolder } = useAppContext();

  console.table(notes);

  const [searchTerm, setSearchTerm] = useState("");
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#3B82F6");

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

  // --- Folder Edit Functions ---
  const openEditFolderModal = (folder: Folder) => {
    setEditingFolder(folder);
    setEditedFolderName(folder.name);
    setEditedFolderColor(folder.color);
    setShowEditFolderModal(true);
    setActiveFolderMenu("");
  };

  // --- Folder & Note Action Handlers ---
  const handleDuplicateFolder = (folderId: string) => {
    duplicateFolder(folderId);
    setActiveFolderMenu("");
  };

  const handleDeleteFolder = (folderId: string) => {
    folderService.deleteFolder(folderId);
    setActiveFolderMenu("");
  };

  const filteredNotes = useMemo(() => {
    notes?.filter(
      (note) =>
        note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, notes]);

  const toggleFolderMenu = (folderId: SetStateAction<string>) => {
    setActiveNoteMenu("");
    setActiveFolderMenu(activeFolderMenu === folderId ? "" : folderId);
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
              ? filteredNotes.filter((note) => note.folderId === folder._id)
              : getNotesByFolder(folder._id!);

            return (
              <div
                key={folder._id}
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
                        href={`/notes/new?folderId=${folder._id}`}
                        className="flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors text-sm"
                      >
                        <PlusIcon className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Add Note</span>
                      </Link>

                      {folder._id !== "default" && ( // Assuming 'default' folder cannot be modified/deleted extensively
                        <button
                          name="folder-actions-button"
                          onClick={() => toggleFolderMenu(folder._id!)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>
                      )}
                      {/* Folder Actions Menu */}
                      {activeFolderMenu === folder._id &&
                        folder._id !== "default" && (
                          <div
                            ref={folderMenuRef}
                            className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-xl z-20 border border-gray-200 py-1"
                          >
                            <button
                              onClick={() =>
                                openEditFolderModal({
                                  ...folder,
                                  _id: folder._id!,
                                })
                              }
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <PencilIcon className="h-4 w-4 mr-2" /> Edit
                            </button>
                            <button
                              onClick={() => handleDuplicateFolder(folder._id!)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Square2StackIcon className="h-4 w-4 mr-2" />{" "}
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleDeleteFolder(folder._id!)}
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
                        <FolderCard
                          key={note._id}
                          note={note}
                          viewMode={viewMode}
                          activeNoteMenu={activeNoteMenu}
                          setActiveNoteMenu={setActiveNoteMenu}
                          setActiveFolderMenu={setActiveFolderMenu}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">
                        No notes in this folder yet
                      </p>
                      <Link
                        href={`/notes/new?folderId=${folder._id}`}
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
          <NewFolderModal
            newFolderName={newFolderName}
            newFolderColor={newFolderColor}
            setNewFolderName={setNewFolderName}
            setNewFolderColor={setNewFolderColor}
            setShowNewFolderModal={setShowNewFolderModal}
            colors={colors}
          />
        )}

        {/* Edit Folder Modal */}
        {showEditFolderModal && editingFolder && (
          <UpdateFolderModal
            editedFolderName={editedFolderName}
            editedFolderColor={editedFolderColor}
            editingFolder={editingFolder}
            colors={colors}
            setEditingFolder={setEditingFolder}
            setEditedFolderName={setEditedFolderName}
            setEditedFolderColor={setEditedFolderColor}
            setShowEditFolderModal={setShowEditFolderModal}
          />
        )}
      </div>
    </div>
  );
}
