/* eslint-disable @typescript-eslint/no-explicit-any */
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/notes"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock folder service BEFORE the component imports
jest.mock("../../../services/folderService", () => ({
  __esModule: true,
  default: {
    deleteFolder: jest.fn(),
  },
}));

// Mock useDebounce hook
jest.mock("../../../hooks/useDebounce", () => ({
  useDebounce: (value: any) => value, // Return value immediately for testing
}));

// Mock the child components - use doMock to ensure they're set up before imports
jest.mock("../../../components/notes/folder/NewFolder", () => ({
  __esModule: true,
  default: function NewFolderModal() {
    return <div data-testid="new-folder-modal">New Folder Modal</div>;
  },
}));

jest.mock("../../../components/notes/folder/UpdateFolder", () => ({
  __esModule: true,
  default: function UpdateFolderModal() {
    return <div data-testid="update-folder-modal">Update Folder Modal</div>;
  },
}));

jest.mock("../../../components/notes/folder/Folder", () => ({
  __esModule: true,
  default: function FolderCard({ note }: any) {
    return (
      <div key={`note-card-${note._id}`} data-testid={`note-card-${note._id}`}>
        {note.title || "Untitled"}
      </div>
    ); 
  },
}));
import {
  renderWithProviders,
  createMockNote,
  createMockFolder,
  createMockUser,
  createNotesInFolder,
  resetAllMocks,
} from "../../utils/test-utils";

// Import component after mocks
import NotesPage from "../../../app/(protected-routes)/notes/page";
import folderService from "../../../services/folderService";

describe("Notes Page", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe("Rendering", () => {
    it("renders page title and description", () => {
      renderWithProviders(<NotesPage />, {
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByText("My Notes")).toBeInTheDocument();
      expect(
        screen.getByText("Organize your thoughts by folders")
      ).toBeInTheDocument();
    });

    it("renders search input", () => {
      renderWithProviders(<NotesPage />, {
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const searchInput = screen.getByPlaceholderText("Search notes...");
      expect(searchInput).toBeInTheDocument();
    });

    it("renders New Folder button", () => {
      renderWithProviders(<NotesPage />, {
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByText("New Folder")).toBeInTheDocument();
    });

    it("renders view mode toggle buttons", () => {
      renderWithProviders(<NotesPage />, {
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const gridButton = screen.getByTitle("Grid View");
      const listButton = screen.getByTitle("List View");

      expect(gridButton).toBeInTheDocument();
      expect(listButton).toBeInTheDocument();
    });
  });

  describe("Folders Display", () => {
    it("displays all folders", () => {
      const folders = [
        createMockFolder({ name: "Work", _id: "folder-1" }),
        createMockFolder({ name: "Personal", _id: "folder-2" }),
        createMockFolder({ name: "Archive", _id: "folder-3" }),
      ];

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders, notes: [] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByText("Work")).toBeInTheDocument();
      expect(screen.getByText("Personal")).toBeInTheDocument();
      expect(screen.getByText("Archive")).toBeInTheDocument();
    });

    it("displays correct note count for each folder", () => {
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });
      const notes = createNotesInFolder("folder-1", 5);

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByText("5 notes")).toBeInTheDocument();
    });

    it("displays folder with custom color", () => {
      const folder = createMockFolder({
        name: "Work",
        _id: "folder-1",
        color: "#EF4444",
      });

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes: [] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const folderIcon = screen.getByTestId("folder-icon-folder-1");
      expect(folderIcon).toHaveStyle({ backgroundColor: "#EF444420" });
    });

    it("displays Add Note button for each folder", () => {
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes: [] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const addNoteButton = screen.getByRole("link", { name: /Add Note/i });
      expect(addNoteButton).toHaveAttribute(
        "href",
        "/notes/new?folderId=folder-1"
      );
    });

    it("displays folder actions button for non-default folders", () => {
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes: [] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const actionsButton = screen.getByRole("button", {
        name: "folder-actions-button",
      });
      expect(actionsButton).toBeInTheDocument();
    });

    it("does not display folder actions button for default folder", () => {
      const folder = createMockFolder({ name: "Default", _id: "default" });

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes: [] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const actionsButton = screen.queryByRole("button", {
        name: "folder-actions-button",
      });
      expect(actionsButton).not.toBeInTheDocument();
    });
  });

  describe("Notes Display", () => {
    it("displays notes in their respective folders", () => {
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });
      const notes = [
        createMockNote({ title: "Note 1", folderId: "folder-1" }),
        createMockNote({ title: "Note 2", folderId: "folder-1" }),
      ];

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByText("Note 1")).toBeInTheDocument();
      expect(screen.getByText("Note 2")).toBeInTheDocument();
    });

    it("shows empty state when folder has no notes", () => {
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes: [] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(
        screen.getByText("No notes in this folder yet")
      ).toBeInTheDocument();
      expect(screen.getByText("Create First Note")).toBeInTheDocument();
    });

    it("displays correct number of note cards per folder", () => {
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });
      const notes = createNotesInFolder("folder-1", 3);

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const noteCards = screen.getAllByTestId(/^note-card-/);
      expect(noteCards).toHaveLength(3);
    });
  });

  describe("Search Functionality", () => {
    it("filters notes by title", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });
      const notes = [
        createMockNote({
          title: "React Tutorial",
          folderId: "folder-1",
          _id: "note-1",
        }),
        createMockNote({
          title: "Vue Guide",
          folderId: "folder-1",
          _id: "note-2",
        }),
      ];

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const searchInput = screen.getByPlaceholderText("Search notes...");
      await user.type(searchInput, "React");

      // Wait for debounce (300ms)
      await waitFor(
        () => {
          expect(screen.getByText("React Tutorial")).toBeInTheDocument();
          expect(screen.queryByText("Vue Guide")).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it("filters notes by content", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });
      const notes = [
        createMockNote({
          title: "Note 1",
          content: "JavaScript content",
          folderId: "folder-1",
          _id: "note-1",
        }),
        createMockNote({
          title: "Note 2",
          content: "Python content",
          folderId: "folder-1",
          _id: "note-2",
        }),
      ];

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const searchInput = screen.getByPlaceholderText("Search notes...");
      await user.type(searchInput, "JavaScript");

      await waitFor(
        () => {
          expect(screen.getByText("Note 1")).toBeInTheDocument();
          expect(screen.queryByText("Note 2")).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it("is case insensitive", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });
      const notes = [
        createMockNote({
          title: "React Tutorial",
          folderId: "folder-1",
          _id: "note-1",
        }),
      ];

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const searchInput = screen.getByPlaceholderText("Search notes...");
      await user.type(searchInput, "REACT");

      await waitFor(
        () => {
          expect(screen.getByText("React Tutorial")).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it("shows all notes when search is cleared", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });
      const notes = [
        createMockNote({
          title: "Note 1",
          folderId: "folder-1",
          _id: "note-1",
        }),
        createMockNote({
          title: "Note 2",
          folderId: "folder-1",
          _id: "note-2",
        }),
      ];

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const searchInput = screen.getByPlaceholderText("Search notes...");
      await user.type(searchInput, "Note 1");

      await waitFor(
        () => {
          expect(screen.queryByText("Note 2")).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );

      await user.clear(searchInput);

      await waitFor(
        () => {
          expect(screen.getByText("Note 1")).toBeInTheDocument();
          expect(screen.getByText("Note 2")).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it("updates note count based on search results", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });
      const notes = [
        createMockNote({
          title: "React Tutorial",
          folderId: "folder-1",
          _id: "note-1",
        }),
        createMockNote({
          title: "Vue Guide",
          folderId: "folder-1",
          _id: "note-2",
        }),
        createMockNote({
          title: "React Hooks",
          folderId: "folder-1",
          _id: "note-3",
        }),
      ];

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      // Initially shows all 3 notes
      expect(screen.getByText("3 notes")).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText("Search notes...");
      await user.type(searchInput, "React");

      // After search, should show 2 notes
      await waitFor(
        () => {
          const noteCards = screen.getAllByTestId(/^note-card-/);
          expect(noteCards).toHaveLength(2);
        },
        { timeout: 500 }
      );
    });
  });

  describe("View Mode Toggle", () => {
    it("defaults to grid view", () => {
      renderWithProviders(<NotesPage />, {
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const gridButton = screen.getByTitle("Grid View");
      expect(gridButton).toHaveClass("bg-blue-500");
    });

    it("switches to list view when list button is clicked", async () => {
      const user = userEvent.setup();

      renderWithProviders(<NotesPage />, {
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const listButton = screen.getByTitle("List View");
      await user.click(listButton);

      expect(listButton).toHaveClass("bg-blue-500");
    });

    it("switches back to grid view", async () => {
      const user = userEvent.setup();

      renderWithProviders(<NotesPage />, {
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const listButton = screen.getByTitle("List View");
      const gridButton = screen.getByTitle("Grid View");

      await user.click(listButton);
      expect(listButton).toHaveClass("bg-blue-500");

      await user.click(gridButton);
      expect(gridButton).toHaveClass("bg-blue-500");
    });
  });

  describe("Folder Actions Menu", () => {
    it("opens folder actions menu when ellipsis button is clicked", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes: [] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const actionsButton = screen.getByRole("button", {
        name: "folder-actions-button",
      });
      await user.click(actionsButton);

      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Duplicate")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("closes folder actions menu when clicking outside", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes: [] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const actionsButton = screen.getByRole("button", {
        name: "folder-actions-button",
      });
      await user.click(actionsButton);

      expect(screen.getByText("Edit")).toBeInTheDocument();

      // Click outside
      await user.click(document.body);

      await waitFor(() => {
        expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      });
    });
  });

  describe("Folder Actions", () => {
    it("calls duplicateFolder when duplicate is clicked", async () => {
      const user = userEvent.setup();
      const mockDuplicateFolder = jest.fn();
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });

      renderWithProviders(<NotesPage />, {
        appContextValue: {
          folders: [folder],
          notes: [],
          duplicateFolder: mockDuplicateFolder,
        },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const actionsButton = screen.getByRole("button", {
        name: "folder-actions-button",
      });
      await user.click(actionsButton);

      const duplicateButton = screen.getByText("Duplicate");
      await user.click(duplicateButton);

      expect(mockDuplicateFolder).toHaveBeenCalledWith("folder-1");
    });

    it("calls deleteFolder when delete is clicked", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes: [] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const actionsButton = screen.getByRole("button", {
        name: "folder-actions-button",
      });
      await user.click(actionsButton);

      const deleteButton = screen.getByText("Delete");
      await user.click(deleteButton);

      expect(folderService.deleteFolder).toHaveBeenCalledWith("folder-1");
    });

    it("closes menu after action is performed", async () => {
      const user = userEvent.setup();
      const mockDuplicateFolder = jest.fn();
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });

      renderWithProviders(<NotesPage />, {
        appContextValue: {
          folders: [folder],
          notes: [],
          duplicateFolder: mockDuplicateFolder,
        },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const actionsButton = screen.getByRole("button", {
        name: "folder-actions-button",
      });
      await user.click(actionsButton);

      const duplicateButton = screen.getByText("Duplicate");
      await user.click(duplicateButton);

      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });
  });

  describe("Modals", () => {
    it("opens new folder modal when New Folder button is clicked", async () => {
      const user = userEvent.setup();

      renderWithProviders(<NotesPage />, {
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const newFolderButton = screen.getByText("New Folder");
      await user.click(newFolderButton);

      expect(screen.getByTestId("new-folder-modal")).toBeInTheDocument();
    });

    it("opens edit folder modal when Edit is clicked", async () => {
      const user = userEvent.setup();
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes: [] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const actionsButton = screen.getByRole("button", {
        name: "folder-actions-button",
      });
      await user.click(actionsButton);

      const editButton = screen.getByText("Edit");
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId("update-folder-modal")).toBeInTheDocument();
      });
    });
  });

  describe("Navigation Links", () => {
    it("has correct link for creating a new note in a folder", () => {
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes: [] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const addNoteLink = screen.getByRole("link", { name: /Add Note/i });
      expect(addNoteLink).toHaveAttribute(
        "href",
        "/notes/new?folderId=folder-1"
      );
    });

    it("has correct link for creating first note in empty folder", () => {
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes: [] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const createFirstNoteLink = screen.getByText("Create First Note");
      expect(createFirstNoteLink.closest("a")).toHaveAttribute(
        "href",
        "/notes/new?folderId=folder-1"
      );
    });
  });

  describe("Multiple Folders", () => {
    it("displays notes only in their respective folders", () => {
      const folder1 = createMockFolder({ name: "Work", _id: "folder-1" });
      const folder2 = createMockFolder({ name: "Personal", _id: "folder-2" });
      const notes = [
        createMockNote({
          title: "Work Note",
          folderId: "folder-1",
          _id: "note-1",
        }),
        createMockNote({
          title: "Personal Note",
          folderId: "folder-2",
          _id: "note-2",
        }),
      ];

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder1, folder2], notes },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      // Both notes should be displayed
      expect(screen.getByText("Work Note")).toBeInTheDocument();
      expect(screen.getByText("Personal Note")).toBeInTheDocument();

      // Each folder should show 1 note
      const noteCounts = screen.getAllByText("1 notes");
      expect(noteCounts).toHaveLength(2);
    });

    it("can open different folder action menus independently", async () => {
      const user = userEvent.setup();
      const folder1 = createMockFolder({ name: "Work", _id: "folder-1" });
      const folder2 = createMockFolder({ name: "Personal", _id: "folder-2" });

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder1, folder2], notes: [] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const actionsButtons = screen.getAllByRole("button", {
        name: "folder-actions-button",
      });

      // Open first folder menu
      await user.click(actionsButtons[0]);
      expect(screen.getByText("Edit")).toBeInTheDocument();

      // Opening second folder menu should close the first
      await user.click(actionsButtons[1]);
      const editButtons = screen.getAllByText("Edit");
      expect(editButtons).toHaveLength(1);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty folders array", () => {
      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [], notes: [] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByText("My Notes")).toBeInTheDocument();
      expect(screen.queryByText(/notes/)).not.toBeInTheDocument();
    });


    it("handles notes with null or undefined title", () => {
      const folder = createMockFolder({ name: "Work", _id: "folder-1" });
      const notes = [
        createMockNote({
          title: undefined as any,
          folderId: "folder-1",
          _id: "note-1",
        }),
      ];

      renderWithProviders(<NotesPage />, {
        appContextValue: { folders: [folder], notes },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      // Should still render the note card
      const noteCard = screen.getByTestId("note-card-note-1");
      expect(noteCard).toBeInTheDocument();
      expect(noteCard).toHaveTextContent("Untitled");
    });
  });
});
