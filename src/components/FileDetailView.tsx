import React, { useState, useEffect } from 'react';
import { Text, Button, Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions } from '@fluentui/react-components';
import {
  DocumentRegular,
  DocumentPdfRegular,
  FolderZipRegular,
  ArrowDownloadRegular,
  LinkRegular,
  ImageRegular,
  AppsRegular,
} from '@fluentui/react-icons';
import type { FileItem } from '../data';
import { useStyles } from './styles';

interface FileDetailViewProps {
  file: FileItem;
  copyMessage: string | null;
  onCopyDownloadUrl: (file: FileItem) => void;
  downloadDialogTitle?: string;
  downloadDialogContent?: string;
  downloadDialogConfirmLabel?: string;
  downloadDialogEnableAfterSeconds?: number;
}

export const FileDetailView: React.FC<FileDetailViewProps> = ({
  file,
  copyMessage,
  onCopyDownloadUrl,
  downloadDialogTitle,
  downloadDialogContent,
  downloadDialogConfirmLabel,
  downloadDialogEnableAfterSeconds,
}) => {
  const styles = useStyles();
  const [showDialog, setShowDialog] = useState(false);
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

  const getFileIcon = (fileName: string) => {
    if (fileName.includes('.pdf')) return <DocumentPdfRegular style={{ fontSize: '32px' }} />;
    if (
      fileName.includes('.jpg') ||
      fileName.includes('.jpeg') ||
      fileName.includes('.png')
    )
      return <ImageRegular style={{ fontSize: '32px' }} />;
    if (fileName.includes('.zip') || fileName.includes('.rar'))
      return <FolderZipRegular style={{ fontSize: '32px' }} />;
    if (fileName.includes('.exe') || fileName.includes('.msi'))
      return <AppsRegular style={{ fontSize: '32px' }} />;
    return <DocumentRegular style={{ fontSize: '32px' }} />;
  };

  return (
    <div className={styles.datagridContainer}>

      <div
        style={{
          padding: '20px',
          backgroundColor: 'var(--colorNeutralBackground2)',
          borderRadius: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
          {getFileIcon(file.name)}
          <div style={{ wordBreak: 'break-word', overflow: 'visible', whiteSpace: 'normal' }}>
            <Text as="h1" size={700}>
              {file.name}
            </Text>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px', marginBottom: '24px' }}>
          <Text weight="semibold">文件大小：</Text>
          <Text>{file.size}</Text>

          <Text weight="semibold">修改日期：</Text>
          <Text>{file.date}</Text>

          {file.description && (
            <>
              <Text weight="semibold">说明：</Text>
              <Text>{file.description}</Text>
            </>
          )}
        </div>

        {copyMessage && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--colorStatusSuccessBackground1)',
              borderRadius: '4px',
              marginBottom: '24px',
            }}
          >
            <Text>{copyMessage}</Text>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            appearance="primary"
            icon={<ArrowDownloadRegular />}
            onClick={() => setShowDialog(true)}
          >
            下载文件
          </Button>
          <Button
            appearance="outline"
            icon={<LinkRegular />}
            onClick={() => onCopyDownloadUrl(file)}
          >
            复制下载链接
          </Button>
        </div>
        <Dialog open={showDialog} onOpenChange={(_, data) => setShowDialog(data.open)}>
          <DialogSurface>
            <DialogTitle>{downloadDialogTitle || '下载'}</DialogTitle>
            <DialogBody>{downloadDialogContent || `即将下载：${file.name}`}</DialogBody>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setShowDialog(false)}>取消</Button>
              <Button
                appearance="primary"
                as="a"
                href={file.url}
                download
                disabled={remainingSeconds > 0}
                onClick={() => setShowDialog(false)}
              >
                {(downloadDialogConfirmLabel || '确定') + (remainingSeconds > 0 ? ` (${remainingSeconds}s)` : '')}
              </Button>
            </DialogActions>
          </DialogSurface>
        </Dialog>
      </div>
    </div>
  );
};
