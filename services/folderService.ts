import { Folder, Note } from "@/types/types";

export interface CreateFolderDto {
  name?: string;
  color?: string;
  notes?: Note[];
  userId?: string;
}

export interface UpdateFolderDto {
  name?: string;
  color?: string;
  notes?: Note[];
  userId?: string;
}
const API_URL = process.env.NEXT_PUBLIC_SITE_URL;

class FolderService {
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

  async getFolders(): Promise<Folder[]> {
    try {
      const response = await fetch(`${API_URL}/api/folders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      return this.handleResponse<Folder[]>(response);
    } catch (error) {
      console.error("Error fetching Folders:", error);
      throw error;
    }
  }

  async getFolderById(id: string): Promise<Folder> {
    try {
      const response = await fetch(`${API_URL}/api/folders/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      return this.handleResponse<Folder>(response);
    } catch (error) {
      console.error(`Error fetching Folder ${id}:`, error);
      throw error;
    }
  }

  async addFolder(Folder: CreateFolderDto): Promise<Folder> {
    try {
      const response = await fetch(`${API_URL}/api/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Folder),
      });
      return this.handleResponse<Folder>(response);
    } catch (error) {
      console.error("Error adding Folder:", error);
      throw error;
    }
  }

  async updateFolder(id: string, Folder: UpdateFolderDto): Promise<Folder> {
    try {
      const response = await fetch(`${API_URL}/api/folders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Folder),
      });
      return this.handleResponse<Folder>(response);
    } catch (error) {
      console.error(`Error updating Folder ${id}:`, error);
      throw error;
    }
  }

  async deleteFolder(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/folders/${id}`, {
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
      console.error(`Error deleting Folder ${id}:`, error);
      throw error;
    }
  }
}

export const folderService = new FolderService();
export default folderService;
