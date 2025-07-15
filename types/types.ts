export type Note = {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  userId: string
  folderId: string | null
}

export type Folder = {
  id: string
  name: string
  color: string
  notes: Note[]
  userId: string
  createdAt?: Date
  updatedAt?: Date
}

export type User = {
  id: string
  name: string
  email: string
  folders: Folder[]
}

