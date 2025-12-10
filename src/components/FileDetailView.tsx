import React from 'react';
import { Text, Button } from '@fluentui/react-components';
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
}

export const FileDetailView: React.FC<FileDetailViewProps> = ({
  file,
  copyMessage,
  onCopyDownloadUrl,
}) => {
  const styles = useStyles();

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
            as="a"
            href={file.url}
            download
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
      </div>
    </div>
  );
};
