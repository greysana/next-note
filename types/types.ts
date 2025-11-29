export type Note = {
  _id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  folderId: string | null;
};

export type Folder = {
  _id?: string;
  name: string;
  color: string;
  notes: Note[];
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type User = {
  _id?: string;
  name: string;
  email: string;
  folders: Folder[];
};

export interface CreateDto {
  title: string;
  content: string;
}

export interface UpdateDto {
  title?: string;
  content?: string;
}