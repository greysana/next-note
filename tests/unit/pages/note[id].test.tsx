/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock next/navigation FIRST
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/notes/note-123"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock React's use function for params
jest.mock("react", () => {
  const actualReact = jest.requireActual("react");
  return {
    ...actualReact,
    use: jest.fn((promise) => {
      // If it's already resolved or is a plain object, return it
      if (promise && typeof promise.then !== "function") {
        return promise;
      }
      // For promises, we need to handle them synchronously in tests
      throw promise;
    }),
  };
});

// Mock note service
jest.mock("../../../services/noteService", () => ({
  __esModule: true,
  default: {
    getNoteById: jest.fn(),
    addNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
  },
}));

// Mock components
jest.mock("../../../components/RichTextEditor", () => ({
  RichTextEditor: ({ content, onChange }: any) => (
    <div data-testid="rich-text-editor">
      <textarea
        data-testid="editor-content"
        value={content}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

jest.mock("../../../components/AIGeneration", () => ({
  __esModule: true,
  default: ({ content, onContentChange }: any) => (
    <div data-testid="ai-generation">
      <button onClick={() => onContentChange("AI generated content")}>
        Generate with AI
      </button>
    </div>
  ),
}));

// Import dependencies
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  renderWithProviders,
  createMockNote,
  createMockFolder,
  createMockUser,
  resetAllMocks,
  routerMocks,
  mockSuccessfulFetch,
} from "../../utils/test-utils";

import NoteDetailPage from "../../../app/(protected-routes)/notes/[id]/page";
import noteService from "../../../services/noteService";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";

// Helper to create params - now just returns the object directly
// Helper to create params — return plain object at runtime but typed as Promise<{ id: string }>
const createParams = (id: string) =>
  ({ id } as unknown as Promise<{ id: string }>);

describe("Note Detail Page", () => {  
  beforeEach(() => {
    resetAllMocks();

    // Setup useRouter mock
    (useRouter as jest.Mock).mockReturnValue({
      push: routerMocks.push,
      replace: routerMocks.replace, 
      prefetch: routerMocks.prefetch,
      back: routerMocks.back,
      forward: routerMocks.forward,
      refresh: routerMocks.refresh,
    });

    // Setup useSearchParams mock
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());

    // Setup React's use mock to return the params object directly
    (use as jest.Mock).mockImplementation((value) => value);
  });

  describe("Loading Existing Note", () => {
    it("loads and displays existing note data", async () => {
      const mockNote = createMockNote({
        _id: "note-123",
        title: "My Test Note",
        content: "<p>Test content</p>",
        folderId: "folder-1",
      });

      const mockFolder = createMockFolder({
        _id: "folder-1",
        name: "Work",
        color: "#3B82F6",
      });

      (noteService.getNoteById as jest.Mock).mockResolvedValue(mockNote);

      renderWithProviders(
        <NoteDetailPage params={createParams("note-123")} />,
        {
          appContextValue: {
            notes: [mockNote],
            folders: [mockFolder],
          },
          authContextValue: {
            user: createMockUser(),
            loading: false,
          },
        }
      );

      await waitFor(() => {
        expect(noteService.getNoteById).toHaveBeenCalledWith("note-123");
      });

      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText(
          "Note title..."
        ) as HTMLInputElement;
        expect(titleInput.value).toBe("My Test Note");
      });
    });

    it("displays note content in editor", async () => {
      const mockNote = createMockNote({
        _id: "note-123",
        title: "Test Note",
        content: "<p>Test content</p>",
      });

      (noteService.getNoteById as jest.Mock).mockResolvedValue(mockNote);

      renderWithProviders(
        <NoteDetailPage params={createParams("note-123")} />,
        {
          appContextValue: {
            notes: [mockNote],
            folders: [createMockFolder()],
          },
          authContextValue: {
            user: createMockUser(),
            loading: false,
          },
        }
      );

      await waitFor(() => {
        expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();
      });
    });

    it("selects correct folder for note", async () => {
      const mockNote = createMockNote({
        _id: "note-123",
        folderId: "folder-1",
      });

      const mockFolder = createMockFolder({
        _id: "folder-1",
        name: "Work",
      });

      (noteService.getNoteById as jest.Mock).mockResolvedValue(mockNote);

      renderWithProviders(
        <NoteDetailPage params={createParams("note-123")} />,
        {
          appContextValue: {
            notes: [mockNote],
            folders: [mockFolder],
          },
          authContextValue: {
            user: createMockUser(),
            loading: false,
          },
        }
      );

      await waitFor(() => {
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select.value).toBe("folder-1");
      });
    });

    it("displays folder badge with correct color", async () => {
      const mockNote = createMockNote({
        _id: "note-123",
        folderId: "folder-1",
      });

      const mockFolder = createMockFolder({
        _id: "folder-1",
        name: "Work",
        color: "#EF4444",
      });

      (noteService.getNoteById as jest.Mock).mockResolvedValue(mockNote);

      renderWithProviders(
        <NoteDetailPage params={createParams("note-123")} />,
        {
          appContextValue: {
            notes: [mockNote],
            folders: [mockFolder],
          },
          authContextValue: {
            user: createMockUser(),
            loading: false,
          },
        }
      );

      await waitFor(() => {
        const badge = screen.getByTestId("color-note");
        expect(badge).toHaveStyle({ backgroundColor: "#EF4444" });
      });
    });
  });

  describe("Creating New Note", () => {
    it("displays empty form for new note", () => {
      renderWithProviders(<NoteDetailPage params={createParams("new")} />, {
        appContextValue: {
          folders: [createMockFolder()],
        },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const titleInput = screen.getByPlaceholderText(
        "Note title..."
      ) as HTMLInputElement;
      expect(titleInput.value).toBe("");
    });

    it("shows Create Note button for new notes", () => {
      renderWithProviders(<NoteDetailPage params={createParams("new")} />, {
        appContextValue: {
          folders: [createMockFolder()],
        },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByText("Create Note")).toBeInTheDocument();
    });

    it("pre-selects folder from query parameter", () => {
      (useSearchParams as jest.Mock).mockReturnValue(
        new URLSearchParams("?folderId=folder-1")
      );

      const mockFolder = createMockFolder({ _id: "folder-1", name: "Work" });

      renderWithProviders(<NoteDetailPage params={createParams("new")} />, {
        appContextValue: {
          folders: [mockFolder],
        },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("folder-1");
    });

    it("creates new note on save", async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({ _id: "user-123" });
      const createdNote = createMockNote({
        _id: "note-new-123",
        title: "New Note",
        content: "New content",
      });

      (noteService.addNote as jest.Mock).mockResolvedValue(createdNote);

      renderWithProviders(<NoteDetailPage params={createParams("new")} />, {
        appContextValue: {
          folders: [createMockFolder()],
        },
        authContextValue: {
          user: mockUser,
          loading: false,
        },
      });

      const titleInput = screen.getByPlaceholderText("Note title...");
      await user.type(titleInput, "New Note");

      const saveButton = screen.getByRole("button", { name: /Create Note/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(noteService.addNote).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "New Note",
            userId: "user-123",
          })
        );
      });

      await waitFor(() => {
        expect(routerMocks.push).toHaveBeenCalledWith("/notes/note-new-123");
      });
    });

    it("uses default title if empty", async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({ _id: "user-123" });
      const createdNote = createMockNote({
        _id: "note-new-123",
        title: "Untitled Note",
      });

      (noteService.addNote as jest.Mock).mockResolvedValue(createdNote);

      renderWithProviders(<NoteDetailPage params={createParams("new")} />, {
        appContextValue: {
          folders: [createMockFolder()],
        },
        authContextValue: {
          user: mockUser,
          loading: false,
        },
      });

      const saveButton = screen.getByRole("button", { name: /Create Note/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(noteService.addNote).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Untitled Note",
          })
        );
      });
    });
  });

  describe("Updating Existing Note", () => {
    it("shows Save button for existing notes", async () => {
      const mockNote = createMockNote({ _id: "note-123" });

      (noteService.getNoteById as jest.Mock).mockResolvedValue(mockNote);

      renderWithProviders(
        <NoteDetailPage params={createParams("note-123")} />,
        {
          appContextValue: {
            notes: [mockNote],
            folders: [createMockFolder()],
          },
          authContextValue: {
            user: createMockUser(),
            loading: false,
          },
        }
      );

      await waitFor(() => {
        expect(screen.getByText("Save")).toBeInTheDocument();
      });
    });

    it("updates note on save", async () => {
      const user = userEvent.setup();
      const mockNote = createMockNote({
        _id: "note-123",
        title: "Original Title",
        content: "Original content",
      });

      const updatedNote = createMockNote({
        _id: "note-123",
        title: "Updated Title",
        content: "Original content",
      });

      (noteService.getNoteById as jest.Mock).mockResolvedValue(mockNote);
      (noteService.updateNote as jest.Mock).mockResolvedValue(updatedNote);

      renderWithProviders(
        <NoteDetailPage params={createParams("note-123")} />,
        {
          appContextValue: {
            notes: [mockNote],
            folders: [createMockFolder()],
          },
          authContextValue: {
            user: createMockUser(),
            loading: false,
          },
        }
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Original Title")).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText("Note title...");
      await user.clear(titleInput);
      await user.type(titleInput, "Updated Title");

      const saveButton = screen.getByRole("button", { name: /Save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(noteService.updateNote).toHaveBeenCalledWith(
          "note-123",
          expect.objectContaining({
            title: "Updated Title",
          })
        );
      });
    });

    it("shows last saved timestamp after save", async () => {
      const user = userEvent.setup();
      const mockNote = createMockNote({ _id: "note-123" });

      (noteService.getNoteById as jest.Mock).mockResolvedValue(mockNote);
      (noteService.updateNote as jest.Mock).mockResolvedValue(mockNote);

      renderWithProviders(
        <NoteDetailPage params={createParams("note-123")} />,
        {
          appContextValue: {
            notes: [mockNote],
            folders: [createMockFolder()],
          },
          authContextValue: {
            user: createMockUser(),
            loading: false,
          },
        }
      );

      await waitFor(() => {
        expect(screen.getByText("Save")).toBeInTheDocument();
      });

      const saveButton = screen.getByRole("button", { name: /Save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Saved/)).toBeInTheDocument();
      },{
        timeout:300
      });
    });

    it("updates folder selection", async () => {
      const user = userEvent.setup();
      const mockNote = createMockNote({
        _id: "note-123",
        folderId: "folder-1",
      });

      const folder1 = createMockFolder({ _id: "folder-1", name: "Work" });
      const folder2 = createMockFolder({ _id: "folder-2", name: "Personal" });

      (noteService.getNoteById as jest.Mock).mockResolvedValue(mockNote);
      (noteService.updateNote as jest.Mock).mockResolvedValue({
        ...mockNote,
        folderId: "folder-2",
      });

      renderWithProviders(
        <NoteDetailPage params={createParams("note-123")} />,
        {
          appContextValue: {
            notes: [mockNote],
            folders: [folder1, folder2],
          },
          authContextValue: {
            user: createMockUser(),
            loading: false,
          },
        }
      );

      await waitFor(() => {
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select.value).toBe("folder-1");
      });

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "folder-2");

      const saveButton = screen.getByRole("button", { name: /Save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(noteService.updateNote).toHaveBeenCalledWith(
          "note-123",
          expect.objectContaining({
            folderId: "folder-2",
          })
        );
      });
    });
  });

  describe("Deleting Note", () => {
    it("shows delete button for existing notes", async () => {
      const mockNote = createMockNote({ _id: "note-123" });

      (noteService.getNoteById as jest.Mock).mockResolvedValue(mockNote);

      renderWithProviders(
        <NoteDetailPage params={createParams("note-123")} />,
        {
          appContextValue: {
            notes: [mockNote],
            folders: [createMockFolder()],
          },
          authContextValue: {
            user: createMockUser(),
            loading: false,
          },
        }
      );

      await waitFor(() => {
        const deleteButton = screen.getByRole("button", { name: "delete-note" });
        expect(deleteButton).toBeInTheDocument();
      });
    });

    it("does not show delete button for new notes", () => {
      renderWithProviders(<NoteDetailPage params={createParams("new")} />, {
        appContextValue: {
          folders: [createMockFolder()],
        },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const deleteButton = screen.queryByRole("button", { name: "delete-note" });
      expect(deleteButton).not.toBeInTheDocument();
    });

    it("deletes note with confirmation", async () => {
      const user = userEvent.setup();
      const mockNote = createMockNote({ _id: "note-123" });

      (noteService.getNoteById as jest.Mock).mockResolvedValue(mockNote);
      (noteService.deleteNote as jest.Mock).mockResolvedValue(undefined);

      // Mock window.confirm
      global.confirm = jest.fn(() => true);

      renderWithProviders(
        <NoteDetailPage params={createParams("note-123")} />,
        {
          appContextValue: {
            notes: [mockNote],
            folders: [createMockFolder()],
          },
          authContextValue: {
            user: createMockUser(),
            loading: false,
          },
        }
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "delete-note" })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: "delete-note" });
      await user.click(deleteButton);

      expect(global.confirm).toHaveBeenCalledWith(
        "Are you sure you want to delete this note?"
      );

      await waitFor(() => {
        expect(noteService.deleteNote).toHaveBeenCalledWith("note-123");
      });

      expect(routerMocks.push).toHaveBeenCalledWith("/notes");
    });

    it("does not delete if user cancels", async () => {
      const user = userEvent.setup();
      const mockNote = createMockNote({ _id: "note-123" });

      (noteService.getNoteById as jest.Mock).mockResolvedValue(mockNote);

      // Mock window.confirm to return false
      global.confirm = jest.fn(() => false);

      renderWithProviders(
        <NoteDetailPage params={createParams("note-123")} />,
        {
          appContextValue: {
            notes: [mockNote],
            folders: [createMockFolder()],
          },
          authContextValue: {
            user: createMockUser(),
            loading: false,
          },
        }
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "delete-note" })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: "delete-note" });
      await user.click(deleteButton);

      expect(noteService.deleteNote).not.toHaveBeenCalled();
      expect(routerMocks.push).not.toHaveBeenCalled();
    });
  });

  describe("UI Elements", () => {
    it("renders Back to Notes link", async () => {
      const mockNote = createMockNote({ _id: "note-123" });
      (noteService.getNoteById as jest.Mock).mockResolvedValue(mockNote);

      renderWithProviders(
        <NoteDetailPage params={createParams("note-123")} />,
        {
          appContextValue: {
            notes: [mockNote],
            folders: [createMockFolder()],
          },
          authContextValue: {
            user: createMockUser(),
            loading: false,
          },
        }
      );

      const backLink = screen.getByText("Back to Notes").closest("a");
      expect(backLink).toHaveAttribute("href", "/notes");
    });

    it("renders AI generation component", () => {
      renderWithProviders(<NoteDetailPage params={createParams("new")} />, {
        appContextValue: {
          folders: [createMockFolder()],
        },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByTestId("ai-generation")).toBeInTheDocument();
    });

    it("renders rich text editor", () => {
      renderWithProviders(<NoteDetailPage params={createParams("new")} />, {
        appContextValue: {
          folders: [createMockFolder()],
        },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();
    });

    it("renders folder selector with all folders", () => {
      const folders = [
        createMockFolder({ _id: "folder-1", name: "Work" }),
        createMockFolder({ _id: "folder-2", name: "Personal" }),
        createMockFolder({ _id: "folder-3", name: "Archive" }),
      ];

      renderWithProviders(<NoteDetailPage params={createParams("new")} />, {
        appContextValue: {
          folders,
        },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const select = screen.getByRole("combobox");
      const options = Array.from(select.querySelectorAll("option"));
      
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent("Work");
      expect(options[1]).toHaveTextContent("Personal");
      expect(options[2]).toHaveTextContent("Archive");
    });
  });

  describe("Editor Interactions", () => {
    it("updates title field", async () => {
      const user = userEvent.setup();

      renderWithProviders(<NoteDetailPage params={createParams("new")} />, {
        appContextValue: {
          folders: [createMockFolder()],
        },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const titleInput = screen.getByPlaceholderText("Note title...");
      await user.type(titleInput, "My New Title");

      expect(titleInput).toHaveValue("My New Title");
    });

    it("updates content through editor", async () => {
      const user = userEvent.setup();

      renderWithProviders(<NoteDetailPage params={createParams("new")} />, {
        appContextValue: {
          folders: [createMockFolder()],
        },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const editor = screen.getByTestId("editor-content") as HTMLTextAreaElement;
      await user.clear(editor);
      await user.type(editor, "New content");

      expect(editor.value).toBe("New content");
    });

    it("updates content through AI generation", async () => {
      const user = userEvent.setup();

      renderWithProviders(<NoteDetailPage params={createParams("new")} />, {
        appContextValue: {
          folders: [createMockFolder()],
        },
        authContextValue: {
          user: createMockUser(),
          loading: false,
        },
      });

      const aiButton = screen.getByText("Generate with AI");
      await user.click(aiButton);

      const editor = screen.getByTestId("editor-content") as HTMLTextAreaElement;
      expect(editor.value).toBe("AI generated content");
    });
  });

  describe("Loading States", () => {
    it("shows Creating... when saving new note", async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({ _id: "user-123" });

      // Make the save operation pending
      (noteService.addNote as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithProviders(<NoteDetailPage params={createParams("new")} />, {
        appContextValue: {
          folders: [createMockFolder()],
        },
        authContextValue: {
          user: mockUser,
          loading: false,
        },
      });

      const saveButton = screen.getByRole("button", { name: /Create Note/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Creating...")).toBeInTheDocument();
      });
    });

    it("shows Saving... when updating existing note", async () => {
      const user = userEvent.setup();
      const mockNote = createMockNote({ _id: "note-123" });

      (noteService.getNoteById as jest.Mock).mockResolvedValue(mockNote);
      (noteService.updateNote as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithProviders(
        <NoteDetailPage params={createParams("note-123")} />,
        {
          appContextValue: {
            notes: [mockNote],
            folders: [createMockFolder()],
          },
          authContextValue: {
            user: createMockUser(),
            loading: false,
          },
        }
      );

      await waitFor(() => {
        expect(screen.getByText("Save")).toBeInTheDocument();
      });

      const saveButton = screen.getByRole("button", { name: /Save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Saving...")).toBeInTheDocument();
      });
    });

     it("disables save button while saving", async () => { 
      const user = userEvent.setup();
      const mockUser = createMockUser({ _id: "user-123" });
 
      (noteService.addNote as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      renderWithProviders(<NoteDetailPage params={createParams("new")} />, {
        appContextValue: {
          folders: [createMockFolder()],
        },
        authContextValue: {
          user: mockUser,
          loading: false,
        },
      });

      const saveButton = screen.getByRole("button", { name: /Create Note/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(saveButton).toBeDisabled();
      });
    });
  });

  describe("Error Handling", () => {
    it("handles save error gracefully", async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({ _id: "user-123" });
      const consoleError = jest.spyOn(console, "error").mockImplementation();

      (noteService.addNote as jest.Mock).mockRejectedValue(
        new Error("Save failed")
      );

      renderWithProviders(<NoteDetailPage params={createParams("new")} />, {
        appContextValue: {
          folders: [createMockFolder()],
        },
        authContextValue: {
          user: mockUser,
          loading: false,
        },
      });

      const saveButton = screen.getByRole("button", { name: /Create Note/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          "Error saving note:",
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });

    it("handles missing note gracefully", async () => {
      (noteService.getNoteById as jest.Mock).mockResolvedValue(null);

      renderWithProviders(
        <NoteDetailPage params={createParams("note-123")} />,
        {
          appContextValue: {
            notes: [],
            folders: [createMockFolder()],
          },
          authContextValue: {
            user: createMockUser(), 
            loading: false,  
          },
        }
      ); 

      // Should not crash, just show empty form
      expect(screen.getByPlaceholderText("Note title...")).toBeInTheDocument();
    });
  });
}); 