"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { Note, Folder } from "@/types/types";

interface AppContextProps {
  notes: Note[];
  folders: Folder[];
  currentNote: Note | null;
  isRefetch: boolean;
  setIsRefetch: (note: boolean) => void;
  setCurrentNote: (note: Note | null) => void;
  duplicateNote: (id: string) => void;
  duplicateFolder: (id: string) => void;
  getNotesByFolder: (folderId: string | null) => Note[];
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isRefetch, setIsRefetch] = useState<boolean>(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const notesResponse = await fetch("/api/note");

        if (notesResponse.ok) {
          const { notes: fetchedNotes } = await notesResponse.json();
          const parsedNotes = fetchedNotes.map((note: Note) => ({
            ...note,
            id: note._id,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          }));

          setNotes(parsedNotes);
        }

        const foldersResponse = await fetch("/api/folders");

        if (foldersResponse.ok) {
          const { folders: fetchedFolders } = await foldersResponse.json();
          const parsedFolders = fetchedFolders.map((folder: Folder) => ({
            ...folder,
            id: folder._id,
            createdAt: new Date(folder?.createdAt ?? ""),
          }));
          setFolders(parsedFolders);
          console.table(parsedFolders);
        } else {
          const defaultfolder = {
            id: "default",
            name: "general",
            color: "#3B82F6",
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: "default-user",
            notes: [],
          };
          setFolders([defaultfolder]);
        }
      } catch (error) {
        console.error("failed to fetch data:", error);
        const defaultfolder = {
          id: "default",
          name: "general",
          color: "#3B82F6",
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: "default-user",
          notes: [],
        };
        setFolders([defaultfolder]);
      } finally {
        setIsRefetch(false);
      }
    };
    if (isRefetch) {
      fetchData();
    }
  }, [isRefetch, notes, folders]);

  const duplicateNote = (id: string) => {
    const noteToClone = notes.find((n) => n._id === id);
    if (noteToClone) {
      const duplicatedNote: Note = {
        ...noteToClone,
        _id: Date.now().toString(),
        title: `${noteToClone.title} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes((prev) => [...prev, duplicatedNote]);
    }
  };

  const duplicateFolder = (id: string) => {
    const folderToClone = folders.find((f) => f._id === id);
    if (folderToClone) {
      const newFolderId = Date.now().toString();
      const duplicatedFolder: Folder = {
        ...folderToClone,
        _id: newFolderId,
        name: `${folderToClone.name} (Copy)`,
        createdAt: new Date(),
      };

      // Add the new folder
      setFolders((prev) => [...prev, duplicatedFolder]);

      // Clone all notes from the original folder to the new folder
      const folderNotes = notes.filter((note) => note.folderId === id);
      const duplicatedNotes = folderNotes.map((note) => ({
        ...note,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Ensure unique IDs
        folderId: newFolderId,
        title: `${note.title} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      if (duplicatedNotes.length > 0) {
        setNotes((prev) => [...prev, ...duplicatedNotes]);
      }
    }
  };

  const getNotesByFolder = (folderId: string | null) => {
    return notes.filter((note) => note.folderId === folderId);
  };

  return (
    <AppContext.Provider
      value={{
        notes,
        folders,
        currentNote,
        isRefetch,
        setIsRefetch,
        setCurrentNote,
        duplicateNote,
        duplicateFolder,
        getNotesByFolder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
