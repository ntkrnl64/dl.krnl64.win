export interface FileItem {
  type: 'file';
  name: string;
  size: string;
  date: string;
  url: string; // Assuming a download URL
  description?: string; // Optional description field
}

export interface FolderItem {
  type: 'folder';
  name: string;
  children: (FileItem | FolderItem)[];
  description?: string; // Optional description field
}

export type FileSystemItem = FileItem | FolderItem;