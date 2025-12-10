import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
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
  downloadDialogTitle?: string;
  downloadDialogContent?: string;
  downloadDialogConfirmLabel?: string;
  downloadDialogEnableAfterSeconds?: number;
}

export const FileListView: React.FC<FileListViewProps> = ({
  items,
  currentPath,
  isMobile,
  onNavigate,
  onDownloadFolder,
  downloadDialogTitle,
  downloadDialogContent,
  downloadDialogConfirmLabel,
  downloadDialogEnableAfterSeconds,
}) => {
  const styles = useStyles();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  useEffect(() => {
    let timer: number | undefined;
    if (showDialog) {
      const start = downloadDialogEnableAfterSeconds && downloadDialogEnableAfterSeconds > 0 ? downloadDialogEnableAfterSeconds : 0;
      setRemainingSeconds(start);
      if (start > 0) {
        timer = window.setInterval(() => {
          setRemainingSeconds(prev => {
            if (prev <= 1) {
              if (timer) window.clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      setRemainingSeconds(0);
    }

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [showDialog, downloadDialogEnableAfterSeconds]);

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
                        onClick={() => { setSelectedFileUrl((fileSystemItem as FileItem).url); setSelectedFolder(null); setShowDialog(true); }}
                      />
                    </>
                  ) : (
                    <Button
                      title="Download Folder Contents"
                      icon={<ArrowDownloadFilled />}
                      appearance="subtle"
                      onClick={() => { setSelectedFolder(fileSystemItem as FolderItem); setSelectedFileUrl(null); setShowDialog(true); }}
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
      <Dialog open={showDialog} onOpenChange={(_, data) => setShowDialog(data.open)}>
        <DialogSurface>
          <DialogTitle>{downloadDialogTitle || '下载'}</DialogTitle>
          <DialogBody>
            {downloadDialogContent || (selectedFileUrl ? '即将下载所选文件。' : selectedFolder ? `即将下载文件夹：${selectedFolder.name}` : '')}
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setShowDialog(false)}>取消</Button>
            <Button
              appearance="primary"
              disabled={remainingSeconds > 0}
              onClick={() => {
                if (selectedFileUrl) {
                  const a = document.createElement('a');
                  a.href = selectedFileUrl;
                  a.download = '';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                } else if (selectedFolder) {
                  onDownloadFolder(selectedFolder);
                }
                setShowDialog(false);
              }}
            >
              {(downloadDialogConfirmLabel || '确定') + (remainingSeconds > 0 ? ` (${remainingSeconds}s)` : '')}
            </Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
