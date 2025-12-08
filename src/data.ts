export interface FileItem {
  type: 'file';
  name: string;
  size: string;
  date: string;
  url: string; // Assuming a download URL
}

export interface FolderItem {
  type: 'folder';
  name: string;
  children: (FileItem | FolderItem)[];
}

export type FileSystemItem = FileItem | FolderItem;