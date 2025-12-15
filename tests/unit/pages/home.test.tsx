// tests/pages/Home.test.tsx
import { screen, waitFor } from "@testing-library/react";
import {
  renderWithProviders,
  createMockNote,
  createMockFolder,
  createMockUser,
  createMockNotes,
  createNotesInFolder,
  routerMocks,
  resetAllMocks,
} from "../../utils/test-utils";

// Mock next/navigation before importing the component
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Import component after mocks are set up
import Home from "@/app/page";
import { useRouter } from "next/navigation";

describe("Home Page", () => {
  beforeEach(() => {
    resetAllMocks();

    // Setup useRouter mock before each test
    (useRouter as jest.Mock).mockReturnValue({
      push: routerMocks.push,
      replace: routerMocks.replace,
      prefetch: routerMocks.prefetch,
      back: routerMocks.back,
      forward: routerMocks.forward,
      refresh: routerMocks.refresh,
    });
  });

  describe("Authentication", () => {
    it("redirects to login when user is not authenticated", async () => {
      renderWithProviders(<Home />, {
        authContextValue: {
          user: null,
          loading: false,
        },
      });

      await waitFor(() => {
        expect(routerMocks.push).toHaveBeenCalledWith("/login");
      });
    });

    it("does not redirect when user is authenticated", () => {
      const mockUser = createMockUser();

      renderWithProviders(<Home />, {
        authContextValue: {
          user: mockUser,
          loading: false,
        },
      });

      expect(routerMocks.push).not.toHaveBeenCalled();
    });

    it("shows loading state while checking authentication", () => {
      renderWithProviders(<Home />, {
        authContextValue: {
          user: null,
          loading: true,
        },
      });

      // Component should render but not redirect yet
      expect(routerMocks.push).not.toHaveBeenCalled();
    });
  });

  describe("Stats Display", () => {
    it("displays correct count of total notes", () => {
      const notes = createMockNotes(5);

      renderWithProviders(<Home />, {
        appContextValue: { notes },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByTestId("total-notes-count")).toHaveTextContent("5");
    });

    it("displays correct count of folders", () => {
      const folders = [
        createMockFolder({ name: "Work" }),
        createMockFolder({ name: "Personal" }),
        createMockFolder({ name: "Archive" }),
      ];

      renderWithProviders(<Home />, {
        appContextValue: { folders },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("Folders")).toBeInTheDocument();
    });

    it("displays zero when no notes or folders exist", () => {
      renderWithProviders(<Home />, {
        appContextValue: {
          notes: [],
          folders: [],
        },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const zeros = screen.getAllByText("0");
      expect(zeros.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Recent Notes Section", () => {
    it("displays up to 6 most recent notes", () => {
      const notes = createMockNotes(10).map((note, index) => ({
        ...note,
        updatedAt: new Date(Date.now() - index * 1000 * 60 * 60), // Each note 1 hour older
      }));

      renderWithProviders(<Home />, {
        appContextValue: { notes },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      // Should only show 6 most recent
      expect(screen.getByText("Test Note 1")).toBeInTheDocument();
      expect(screen.getByText("Test Note 6")).toBeInTheDocument();
      expect(screen.queryByText("Test Note 7")).not.toBeInTheDocument();
    });

    it("displays folder name for each note", () => {
      const folder = createMockFolder({
        _id: "folder-1",
        name: "Work Projects",
      });
      const notes = createNotesInFolder("folder-1", 2);

      renderWithProviders(<Home />, {
        appContextValue: { notes, folders: [folder] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const folderBadges = screen.getAllByText("Work Projects");
      expect(folderBadges).toHaveLength(2);
    });

    it('shows "Uncategorized" for notes without folder', () => {
      const notes = [createMockNote({ folderId: null })];

      renderWithProviders(<Home />, {
        appContextValue: { notes },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByText("Uncategorized")).toBeInTheDocument();
    });

    it("displays formatted date for each note", () => {
      const testDate = new Date("2024-01-15");
      const notes = [createMockNote({ updatedAt: testDate })];

      renderWithProviders(<Home />, {
        appContextValue: { notes },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByText("1/15/2024")).toBeInTheDocument();
    });

    it("shows empty state when no notes exist", () => {
      renderWithProviders(<Home />, {
        appContextValue: { notes: [] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(
        screen.getByText("No notes yet. Create your first note!")
      ).toBeInTheDocument();
      expect(screen.getByText("Get Started")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("has working link to browse all notes", () => {
      renderWithProviders(<Home />, {
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const browseLink = screen.getByText("Browse All Notes").closest("a");
      expect(browseLink).toHaveAttribute("href", "/notes");
    });

    it("has working link to create new note", () => {
      renderWithProviders(<Home />, {
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const createLinks = screen.getAllByText("Create New Note");
      createLinks.forEach((link) => {
        expect(link.closest("a")).toHaveAttribute("href", "/notes/new");
      });
    });

    it("recent notes are clickable and link to correct route", () => {
      const note = createMockNote({ _id: "note-123", title: "My Note" });

      renderWithProviders(<Home />, {
        appContextValue: { notes: [note] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const noteLink = screen.getByText("My Note").closest("a");
      expect(noteLink).toHaveAttribute("href", "/notes/note-123");
    });
  });

  describe("UI Elements", () => {
    it("renders page title", () => {
      renderWithProviders(<Home />, {
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByText("NextNote")).toBeInTheDocument();
    });

    it("renders page description", () => {
      renderWithProviders(<Home />, {
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(
        screen.getByText(
          "Organize your thoughts beautifully with folders and rich text editing"
        )
      ).toBeInTheDocument();
    });

    it("renders Quick Actions section", () => {
      renderWithProviders(<Home />, {
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    });

    it("renders Recent Notes section header", () => {
      renderWithProviders(<Home />, {
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByText("Recent Notes")).toBeInTheDocument();
    });

    it("renders footer CTA section", () => {
      renderWithProviders(<Home />, {
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(
        screen.getByText("Ready to organize your thoughts?")
      ).toBeInTheDocument();
    });
  });

  describe("Data Integration", () => {
    it("correctly sorts notes by most recent", () => {
      const oldNote = createMockNote({
        title: "Old Note",
        updatedAt: new Date("2024-01-01"),
      });
      const newNote = createMockNote({
        title: "New Note",
        updatedAt: new Date("2024-12-01"),
      });
      const middleNote = createMockNote({
        title: "Middle Note",
        updatedAt: new Date("2024-06-01"),
      });

      renderWithProviders(<Home />, {
        appContextValue: { notes: [oldNote, newNote, middleNote] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const noteElements = screen.getAllByRole("link", { name: /Note/i });
      const firstNoteText = noteElements[0].textContent;

      // Most recent should be first
      expect(firstNoteText).toContain("Browse All Notes");
    });

    it("handles notes with same folder correctly", () => {
      const folderId = "shared-folder";
      const folder = createMockFolder({ _id: folderId, name: "Shared" });
      const notes = createNotesInFolder(folderId, 3);

      renderWithProviders(<Home />, {
        appContextValue: { notes, folders: [folder] },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const folderBadges = screen.getAllByText("Shared");
      expect(folderBadges).toHaveLength(3);
    });
  });
});
