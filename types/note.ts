import { Note } from "./types";

export type Folder = {
  _id: string;
  name: string;
  color: string;
  notes?: Note[];
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
