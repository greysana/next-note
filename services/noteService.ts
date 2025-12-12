import { Note } from "@/types/types";

export interface CreateNoteDto {
  id?: string;
  title: string;
  content: string;
  userId: string;
  folderId: string | null;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  folderId?: string;
}

const API_URL = process.env.NEXT_PUBLIC_SITE_URL;
class NoteService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "An error occurred" }));
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`
      );
    }
    return response.json();
  }

  async getNotes(page: number, limit: number): Promise<Note[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/note?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          next: {
            revalidate: 60,
            tags: ["notes"],
          },
        }
      );
      return this.handleResponse<Note[]>(response);
    } catch (error) {
      console.error("Error fetching notes:", error);
      throw error;
    }
  }

  async getNoteById(id: string): Promise<Note> {
    try {
      const response = await fetch(`${API_URL}/api/note/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: {
          revalidate: 60,
          tags: [`note-${id}`],
        },
      });
      
      return this.handleResponse<Note>(response);
    } catch (error) {
      console.error(`Error fetching note ${id}:`, error);
      throw error;
    }
  }

  async addNote(note: CreateNoteDto): Promise<Note> {
    try {
      const response = await fetch(`${API_URL}/api/note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });
      return this.handleResponse<Note>(response);
    } catch (error) {
      console.error("Error adding note:", error);
      throw error;
    }
  }

  async updateNote(id: string, note: UpdateNoteDto): Promise<Note> {
    try {
      const response = await fetch(`${API_URL}/api/note/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });
      return this.handleResponse<Note>(response);
    } catch (error) {
      console.error(`Error updating note ${id}:`, error);
      throw error;
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/note/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "An error occurred" }));
        throw new Error(
          error.message || `HTTP error! status: ${response.status}`
        );
      }
    } catch (error) {
      console.error(`Error deleting note ${id}:`, error);
      throw error;
    }
  }
}

export const noteService = new NoteService();
export default noteService;
