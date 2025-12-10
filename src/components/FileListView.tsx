import React from 'react';
import {
  Text,
  Button,
  Link,
  DataGrid,
  DataGridBody,
  DataGridRow,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridCell,
  TableCellLayout,
  type TableColumnDefinition,
  createTableColumn,
} from '@fluentui/react-components';
import {
  DocumentRegular,
  FolderRegular,
  DocumentPdfRegular,
  FolderZipRegular,
  ArrowDownloadRegular,
  ArrowDownloadFilled,
  AppsRegular,
  ImageRegular,
} from '@fluentui/react-icons';
import type { FileSystemItem, FileItem, FolderItem } from '../data';
import { useStyles } from './styles';

interface DataGridItem {
  id: string;
  name: { label: string; icon: React.ReactElement };
  size: string;
  date: string;
  actions: FileSystemItem;
}

interface FileListViewProps {
  items: FileSystemItem[];
  currentPath: string[];
  isMobile: boolean;
  onNavigate: (path: string[]) => void;
  onDownloadFolder: (folder: FolderItem) => void;
}

export const FileListView: React.FC<FileListViewProps> = ({
  items,
  currentPath,
  isMobile,
  onNavigate,
  onDownloadFolder,
}) => {
  const styles = useStyles();

  const mapToDataGridItem = (item: FileSystemItem): DataGridItem => {
    const isFolder = item.type === 'folder';
    let icon = <DocumentRegular className={styles.fileIcon} />;
    if (isFolder) icon = <FolderRegular className={styles.fileIcon} />;
    if (item.name.includes('.pdf')) icon = <DocumentPdfRegular className={styles.fileIcon} />;
    if (item.name.includes('.docx') || item.name.includes('.doc'))
      icon = <DocumentRegular className={styles.fileIcon} />;
    if (item.name.includes('.xlsx') || item.name.includes('.xls'))
      icon = <DocumentRegular className={styles.fileIcon} />;
    if (item.name.includes('.pptx') || item.name.includes('.ppt'))
      icon = <DocumentRegular className={styles.fileIcon} />;
    if (
      item.name.includes('.jpg') ||
      item.name.includes('.jpeg') ||
      item.name.includes('.png')
    )
      icon = <ImageRegular className={styles.fileIcon} />;
    if (item.name.includes('.zip') || item.name.includes('.rar'))
      icon = <FolderZipRegular className={styles.fileIcon} />;
    if (item.name.includes('.exe') || item.name.includes('.msi'))
      icon = <AppsRegular className={styles.fileIcon} />;

    return {
      id: item.name + (item.type === 'file' ? (item as FileItem).url : ''),
      name: {
        label: item.name,
        icon: icon,
      },
      size: item.type === 'file' ? (item as FileItem).size : '-',
      date: item.type === 'file' ? (item as FileItem).date : '-',
      actions: item,
    };
  };

  const dataGridItems: DataGridItem[] = React.useMemo(
    () => items.map(mapToDataGridItem),
    [items]
  );

  const columns: TableColumnDefinition<DataGridItem>[] = React.useMemo(
    () => {
      const baseColumns = [
        createTableColumn<DataGridItem>({
          columnId: 'name',
          compare: (a, b) => a.name.label.localeCompare(b.name.label),
          renderHeaderCell: () => <Text>Name</Text>,
          renderCell: (item) => (
            <TableCellLayout media={item.name.icon}>
              <div className={styles.nameCell} title={item.name.label}>
                <Link onClick={() => onNavigate([...currentPath, item.name.label])}>
                  {item.name.label}
                </Link>
              </div>
            </TableCellLayout>
          ),
        }),
      ];

      if (!isMobile) {
        baseColumns.push(
          createTableColumn<DataGridItem>({
            columnId: 'size',
            compare: (a, b) => a.size.localeCompare(b.size),
            renderHeaderCell: () => <Text>Size</Text>,
            renderCell: (item) => <Text>{item.size}</Text>,
          }),
          createTableColumn<DataGridItem>({
            columnId: 'date',
            compare: (a, b) => a.date.localeCompare(b.date),
            renderHeaderCell: () => <Text>Date Modified</Text>,
            renderCell: (item) => <Text>{item.date}</Text>,
          }),
          createTableColumn<DataGridItem>({
            columnId: 'actions',
            renderHeaderCell: () => <Text>Action</Text>,
            renderCell: (item) => {
              const fileSystemItem = item.actions;
              const isFile = fileSystemItem.type === 'file';
              return (
                <div className={styles.actionButtons}>
                  {isFile ? (
                    <>
                      <Button
                        title="Download File"
                        icon={<ArrowDownloadRegular />}
                        appearance="subtle"
                        as="a"
                        href={(fileSystemItem as FileItem).url}
                        download
                      />
                    </>
                  ) : (
                    <Button
                      title="Download Folder Contents"
                      icon={<ArrowDownloadFilled />}
                      appearance="subtle"
                      onClick={() => onDownloadFolder(fileSystemItem as FolderItem)}
                    />
                  )}
                </div>
              );
            },
          })
        );
      }

      return baseColumns;
    },
    [isMobile, currentPath, onNavigate, onDownloadFolder, styles]
  );

  return (
    <div className={styles.datagridContainer}>
      <DataGrid items={dataGridItems} columns={columns}>
        <DataGridHeader>
          <DataGridRow>
            {({ renderHeaderCell }) => (
              <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
            )}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<DataGridItem>>
          {({ item, rowId }) => (
            <DataGridRow<DataGridItem> key={rowId}>
              {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
            </DataGridRow>
          )}
        </DataGridBody>
      </DataGrid>
    </div>
  );
};
