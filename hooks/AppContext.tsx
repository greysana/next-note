"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { Note, Folder } from "@/types/types";

interface AppContextProps {
  notes: Note[];
  folders: Folder[];
  currentNote: Note | null;
  setCurrentNote: (note: Note | null) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  duplicateNote: (id: string) => void;
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt'>) => void;
  editFolder: (id: string, updates: Partial<Omit<Folder, 'id' | 'createdAt'>>) => void;
  deleteFolder: (id: string) => void;
  duplicateFolder: (id: string) => void;
  getNotesByFolder: (folderId: string | null) => Note[];
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('nextnote-notes');
    const savedFolders = localStorage.getItem('nextnote-folders');
    
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: Note) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      setNotes(parsedNotes);
    }
    
    if (savedFolders) {
      const parsedFolders = JSON.parse(savedFolders).map((folder: Folder) => ({
        ...folder,
        createdAt: new Date(folder?.createdAt??'')
      }));
      setFolders(parsedFolders);
    } else {
      const defaultFolder = {
        id: 'default',
        name: 'General',
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'default-user',
        notes: []
      };
      setFolders([defaultFolder]);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('nextnote-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('nextnote-folders', JSON.stringify(folders));
  }, [folders]);

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setNotes(prev => [...prev, newNote]);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev =>
      prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n)
    );
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    // Clear current note if it's the one being deleted
    if (currentNote?.id === id) {
      setCurrentNote(null);
    }
  };

  const duplicateNote = (id: string) => {
    const noteToClone = notes.find(n => n.id === id);
    if (noteToClone) {
      const duplicatedNote: Note = {
        ...noteToClone,
        id: Date.now().toString(),
        title: `${noteToClone.title} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setNotes(prev => [...prev, duplicatedNote]);
    }
  };

  const addFolder = (folderData: Omit<Folder, 'id' | 'createdAt'>) => {
    const newFolder: Folder = {
      ...folderData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const editFolder = (id: string, updates: Partial<Omit<Folder, 'id' | 'createdAt'>>) => {
    setFolders(prev =>
      prev.map(folder => folder.id === id ? { ...folder, ...updates } : folder)
    );
  };

  const deleteFolder = (id: string) => {
    // Don't delete if it's the last folder or default folder
    if (folders.length <= 1 || id === 'default') return;
    
    // Move notes from deleted folder to default folder
    setNotes(prev => 
      prev.map(note => 
        note.folderId === id ? { ...note, folderId: 'default', updatedAt: new Date() } : note
      )
    );
    setFolders(prev => prev.filter(f => f.id !== id));
  };

  const duplicateFolder = (id: string) => {
    const folderToClone = folders.find(f => f.id === id);
    if (folderToClone) {
      const newFolderId = Date.now().toString();
      const duplicatedFolder: Folder = {
        ...folderToClone,
        id: newFolderId,
        name: `${folderToClone.name} (Copy)`,
        createdAt: new Date()
      };
      
      // Add the new folder
      setFolders(prev => [...prev, duplicatedFolder]);
      
      // Clone all notes from the original folder to the new folder
      const folderNotes = notes.filter(note => note.folderId === id);
      const duplicatedNotes = folderNotes.map(note => ({
        ...note,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Ensure unique IDs
        folderId: newFolderId,
        title: `${note.title} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      if (duplicatedNotes.length > 0) {
        setNotes(prev => [...prev, ...duplicatedNotes]);
      }
    }
  };

  const getNotesByFolder = (folderId: string | null) => {
    return notes.filter(note => note.folderId === folderId);
  };

  return (
    <AppContext.Provider
      value={{
        notes,
        folders,
        currentNote,
        setCurrentNote,
        addNote,
        updateNote,
        deleteNote,
        duplicateNote,
        addFolder,
        editFolder,
        deleteFolder,
        duplicateFolder,
        getNotesByFolder
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}