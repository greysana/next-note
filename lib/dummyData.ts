import { User, Folder } from '@/types/types'

export const dummyUser: User = {
  _id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  folders: [],
}

export const dummyFolders: Folder[] = [
  {
    _id: 'folder-1',
    name: 'Personal',
    userId: 'user-1',
    notes: [
      {
        _id: 'note-1',
        title: 'Shopping List',
        content: '<p>Milk, Eggs, Bread</p>',
        createdAt: new Date('2025-05-01'),
        updatedAt: new Date('2025-05-01'),
        userId: 'user-1',
        folderId: null
      },
      {
        _id: 'note-2',
        title: 'Project Ideas',
        content: '<p>Build a notes app with Tiptap</p>',
        createdAt: new Date('2025-05-10'),
        updatedAt: new Date('2025-05-15'),
        userId: 'user-1',
        folderId: null
      },
    ],
    color: ''
  },
  {
    _id: 'folder-2',
    name: 'Work',
    userId: 'user-1',
    notes: [
      {
        _id: 'note-3',
        title: 'Meeting Notes',
        content: '<p>Discuss project timeline</p>',
        createdAt: new Date('2025-05-05'),
        updatedAt: new Date('2025-05-05'),
        userId: 'user-1',
        folderId: null
      },
    ],
    color: '',
  },
]
