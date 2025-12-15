// tests/utils/test-utils.tsx
import React, { ReactNode } from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AppContext } from "@/hooks/AppContext";
import { AuthContext } from "@/hooks/AuthContext";
import { Note, Folder, User } from "@/types/types";

// Create mock functions
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockRefresh = jest.fn();
const mockBack = jest.fn();
const mockForward = jest.fn();
const mockPrefetch = jest.fn().mockResolvedValue(undefined);

// Export router mocks for assertions in tests
export const routerMocks = {
  push: mockPush,
  replace: mockReplace,
  refresh: mockRefresh,
  back: mockBack,
  forward: mockForward,
  prefetch: mockPrefetch,
};

// Mock fetch globally
global.fetch = jest.fn();

// Helper to reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks();
  mockPush.mockClear();
  mockReplace.mockClear();
  mockRefresh.mockClear();
  mockBack.mockClear();
  mockForward.mockClear();
  mockPrefetch.mockClear();
  (global.fetch as jest.Mock).mockReset();
};

// Factory functions for creating mock data
export const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  _id: `note-${Math.random().toString(36).substr(2, 9)}`,
  title: "Test Note",
  content: "Test content",
  folderId: null,
  userId: "user-123",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockFolder = (overrides: Partial<Folder> = {}): Folder => ({
  _id: `folder-${Math.random().toString(36).substr(2, 9)}`,
  name: "Test Folder",
  color: "#3B82F6",
  userId: "user-123",
  notes: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  _id: `user-${Math.random().toString(36).substr(2, 9)}`,
  name: "Test User",
  email: "test@example.com",
  folders: [],
  ...overrides,
});

// Mock context values matching your actual implementations
interface MockAppContextValue {
  notes: Note[];
  folders: Folder[];
  currentNote: Note | null;
  isRefetch: boolean;
  setIsRefetch: jest.Mock;
  setCurrentNote: jest.Mock;
  duplicateNote: jest.Mock;
  duplicateFolder: jest.Mock;
  getNotesByFolder: jest.Mock;
}

interface MockAuthContextValue {
  user: User | null;
  loading: boolean;
  logout: jest.Mock;
  refreshUser: jest.Mock;
}

const createMockAppContext = (
  overrides: Partial<MockAppContextValue> = {}
): MockAppContextValue => ({
  notes: [],
  folders: [],
  currentNote: null,
  isRefetch: false,
  setIsRefetch: jest.fn(),
  setCurrentNote: jest.fn(),
  duplicateNote: jest.fn(),
  duplicateFolder: jest.fn(),
  getNotesByFolder: jest.fn((folderId: string | null) => {
    const notes = overrides.notes || [];
    return notes.filter((note) => note.folderId === folderId);
  }),
  ...overrides,
});

const createMockAuthContext = (
  overrides: Partial<MockAuthContextValue> = {}
): MockAuthContextValue => ({
  user: null,
  loading: false,
  logout: jest.fn(),
  refreshUser: jest.fn(),
  ...overrides,
});

// Custom render options
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  appContextValue?: Partial<MockAppContextValue>;
  authContextValue?: Partial<MockAuthContextValue>;
}

// Main render function with all providers
export function renderWithProviders(
  ui: React.ReactElement,
  {
    appContextValue = {},
    authContextValue = {},
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  const mockAppContext = createMockAppContext(appContextValue);
  const mockAuthContext = createMockAuthContext(authContextValue);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthContext.Provider value={mockAuthContext}>
        <AppContext.Provider value={mockAppContext}>
          {children}
        </AppContext.Provider>
      </AuthContext.Provider>
    );
  }

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    mockAppContext,
    mockAuthContext,
  };
}

// Utility to mock successful API responses
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockSuccessfulFetch = (data: any) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
};

// Utility to mock failed API responses
export const mockFailedFetch = (status = 500, message = "Server error") => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ error: message }),
  });
};

// Utility to mock pending API responses

export const mockPendingFetch = () => {
  (global.fetch as jest.Mock).mockImplementationOnce(
    () =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ok: true,
              json: async () => ({}),
            }),
          100
        )
      )
  );
};

// Utility to create multiple mock notes at once
export const createMockNotes = (
  count: number,
  overrides: Partial<Note> = {}
): Note[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockNote({
      title: `Test Note ${i + 1}`,
      ...overrides,
    })
  );
};

// Utility to create multiple mock folders at once
export const createMockFolders = (
  count: number,
  overrides: Partial<Folder> = {}
): Folder[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockFolder({
      name: `Test Folder ${i + 1}`,
      ...overrides,
    })
  );
};

// Utility to create notes with specific folder relationships
export const createNotesInFolder = (
  folderId: string,
  count: number
): Note[] => {
  return createMockNotes(count, { folderId });
};

// Helper to wait for async operations
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Re-export everything from testing-library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
