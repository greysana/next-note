"use client";
import Link from "next/link";
import { useAppContext } from "@/hooks/AppContext";
import {
  FolderIcon,
  DocumentTextIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { notes, folders } = useAppContext();

  const recentNotes = [...notes]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 6);

  const getFolderName = (folderId: string | null) => {
    const folder = folders.find((f) => f._id === folderId);
    return folder?.name || "Uncategorized";
  };
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    console.log(user);
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            NextNote
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Organize your thoughts beautifully with folders and rich text
            editing
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Notes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {notes.length}
                </p>
              </div>
              <DocumentTextIcon className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Folders</p>
                <p className="text-3xl font-bold text-gray-900">
                  {folders.length}
                </p>
              </div>
              <FolderIcon className="h-12 w-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Recent Activity
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {recentNotes.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Quick Actions
            </h2>
            <div className="space-y-4">
              <Link
                href="/notes"
                className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <FolderIcon className="h-6 w-6 mr-3" />
                <span className="font-semibold">Browse All Notes</span>
              </Link>

              <Link
                href="/notes/new"
                className="flex items-center p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <PlusIcon className="h-6 w-6 mr-3" />
                <span className="font-semibold">Create New Note</span>
              </Link>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Recent Notes
            </h2>
            {recentNotes.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentNotes.map((note) => (
                  <Link
                    key={note._id}
                    href={`/notes/${note._id}`}
                    className="block p-4 hover:bg-white/50 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
                  >
                    <h3 className="font-semibold text-gray-800 mb-1 truncate">
                      {note.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {getFolderName(note.folderId)}
                      </span>
                      <span>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  No notes yet. Create your first note!
                </p>
                <Link
                  href="/notes/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to organize your thoughts?
          </h2>
          <p className="mb-6 opacity-90">
            Start creating and organizing your notes with our intuitive folder
            system.
          </p>
          <Link
            href="/notes/new"
            className="inline-flex items-center bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Your First Note
          </Link>
        </div>
      </div>
    </div>
  );
}
