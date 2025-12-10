import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  FluentProvider,
  Text,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbDivider,
  BreadcrumbButton,
  webLightTheme,
  webDarkTheme,
  type Theme,
} from '@fluentui/react-components';

import {
  WeatherSunnyRegular,
  WeatherMoonRegular,
  LinkRegular,
} from '@fluentui/react-icons';

import type { FileSystemItem, FileItem, FolderItem } from './data';
import { FileListView } from './components/FileListView';
import { FileDetailView } from './components/FileDetailView';
import { NotFoundPage } from './components/NotFoundPage';
import { useStyles } from './components/styles';

interface AppConfig {
  siteTitle: string;
  favicon: string;
  footerHtml?: string;
}

// --- Helper to recursively get all file URLs in a folder ---
const getAllFileUrlsInFolder = (folder: FolderItem): string[] => {
  let urls: string[] = [];
  folder.children.forEach((item) => {
    if (item.type === 'file') {
      urls.push(item.url);
    } else {
      urls = urls.concat(getAllFileUrlsInFolder(item));
    }
  });
  return urls;
};

// --- Main App Component ---
function App() {
  const styles = useStyles();

  const [currentPath, setCurrentPath] = useState<string[]>(() => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    return pathSegments;
  });
  const [fileSystemData, setFileSystemData] = useState<FileSystemItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 640);
  const [appConfig, setAppConfig] = useState<AppConfig>({ siteTitle: 'Loading...', favicon: '' });

  // --- Handle window resize for mobile detection ---
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- URL Routing: Update URL when currentPath changes ---
  useEffect(() => {
    const path = currentPath.length === 0 ? '/' : '/' + currentPath.join('/');
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, [currentPath]);

  // --- URL Routing: Handle browser back/forward buttons ---
  useEffect(() => {
    const handlePopState = () => {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      setCurrentPath(pathSegments);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // --- Fetch config.json ---
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/config.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const config: AppConfig = await response.json();
        setAppConfig({
          ...config,
          footerHtml: config.footerHtml || `&copy; ${new Date().getFullYear()} ${config.siteTitle || 'Download Station'}. All rights reserved.`,
        });
      } catch (e: unknown) {
        console.error("Failed to load config.json:", (e as Error).message);
        setAppConfig({
          siteTitle: 'Download Station',
          favicon: '/vite.svg',
          footerHtml: `&copy; ${new Date().getFullYear()} Download Station. All rights reserved.`,
        });
      }
    };
    fetchConfig();
  }, []);

  // --- Update document title and favicon based on config ---
  useEffect(() => {
    document.title = appConfig.siteTitle;

    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = appConfig.favicon;
  }, [appConfig]);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/files.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: FileSystemItem[] = await response.json();
        setFileSystemData(data);
      } catch (e: unknown) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Theme Management ---
  const currentFluentTheme: Theme = isDarkMode ? webDarkTheme : webLightTheme;

  // --- File System Logic ---
  const getItemsForPath = (path: string[], data: FileSystemItem[] | null): FileSystemItem[] => {
    if (!data) return [];
    let currentLevel: FileSystemItem[] = data;
    for (const segment of path) {
      const folder = currentLevel.find(
        (item) => item.type === 'folder' && item.name === segment
      ) as FolderItem;
      if (folder) {
        currentLevel = folder.children;
      } else {
        return [];
      }
    }
    return currentLevel;
  };

  // --- Find file by path ---
  const getFileByPath = (path: string[], data: FileSystemItem[] | null): FileItem | null => {
    if (!data || path.length === 0) return null;
    
    let currentLevel: FileSystemItem[] = data;
    
    for (let i = 0; i < path.length - 1; i++) {
      const folder = currentLevel.find(
        (item) => item.type === 'folder' && item.name === path[i]
      ) as FolderItem;
      if (folder) {
        currentLevel = folder.children;
      } else {
        return null;
      }
    }
    
    const fileName = path[path.length - 1];
    const file = currentLevel.find(
      (item) => item.type === 'file' && item.name === fileName
    ) as FileItem;
    
    return file || null;
  };

  const currentItems = getItemsForPath(currentPath, fileSystemData);
  const currentFile = getFileByPath(currentPath, fileSystemData);

  // Determine if we should show 404 page
  const shouldShow404 = currentPath.length > 0 && !currentFile && currentItems.length === 0;

  // --- Action Handlers ---
  const handleGetDownloadUrl = React.useCallback((file: FileItem) => {
    const absoluteUrl = new URL(file.url, window.location.origin).href;
    navigator.clipboard.writeText(absoluteUrl).then(() => {
      setCopyMessage('链接已复制到剪贴板');
      setTimeout(() => setCopyMessage(null), 3000);
    }).catch(err => {
      setCopyMessage(`复制失败: ${String(err)}`);
      setTimeout(() => setCopyMessage(null), 3000);
    });
  }, []);

  const handleDownloadFolder = React.useCallback((folder: FolderItem) => {
    const urls = getAllFileUrlsInFolder(folder);
    if (urls.length === 0) {
      alert(`Folder '${folder.name}' is empty or contains no downloadable files.`);
      return;
    }
    const content = urls.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folder.name}_download_urls.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // --- Render Loading/Error States ---
  if (loading) {
    return (
      <div className={styles.container}>
        <Text as="h1" className={styles.headerRow}>Loading...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Text as="h1" className={styles.headerRow} style={{ color: 'red' }}>Error: {error}</Text>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <FluentProvider theme={currentFluentTheme} className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <Text as="h1" className={styles.siteTitleText}>{appConfig.siteTitle}</Text>
        <Button
          appearance="subtle"
          icon={isDarkMode ? <WeatherMoonRegular /> : <WeatherSunnyRegular />}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onClick={() => setIsDarkMode(!isDarkMode)}
        />
      </div>

      {/* Breadcrumb - Hidden on 404 page */}
      {!shouldShow404 && (
        <div className={styles.breadcrumbContainer}>
          <Breadcrumb aria-label="File system breadcrumb">
            <BreadcrumbItem>
              <BreadcrumbButton href="#" onClick={() => setCurrentPath([])}>Home</BreadcrumbButton>
            </BreadcrumbItem>
            {currentPath.map((segment, index) => {
              const pathSegments = currentPath.slice(0, index + 1);
              const isLast = index === currentPath.length - 1;
              return (
                <React.Fragment key={segment + index}>
                  <BreadcrumbDivider />
                  <BreadcrumbItem>
                    <BreadcrumbButton
                      href="#"
                      onClick={() => setCurrentPath(pathSegments)}
                      current={isLast}>
                      {segment}
                    </BreadcrumbButton>
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </Breadcrumb>
        </div>
      )}

      {/* Main Content */}
      {shouldShow404 ? (
        <NotFoundPage onNavigateHome={() => setCurrentPath([])} />
      ) : currentFile ? (
        <FileDetailView
          file={currentFile}
          copyMessage={copyMessage}
          onCopyDownloadUrl={handleGetDownloadUrl}
        />
      ) : (
        <FileListView
          items={currentItems}
          currentPath={currentPath}
          isMobile={isMobile}
          onNavigate={(newPath) => setCurrentPath(newPath)}
          onDownloadFolder={handleDownloadFolder}
        />
      )}

      {currentItems.length === 0 && !currentFile && !shouldShow404 && !loading && (
        <Text style={{ marginTop: '10px' }}>This folder is empty.</Text>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <div dangerouslySetInnerHTML={{ __html: appConfig.footerHtml || '' }} />
      </div>

      {/* Fixed bottom left button for GitHub link */}
      <div className={styles.bottomLeftButtonContainer}>
        <Button
          appearance="subtle"
          icon={<LinkRegular />}
          title="GitHub Repository"
          as="a"
          href="https://github.com/ntkrnl64/dl.krnl64.win"
          target="_blank"
          rel="noopener noreferrer"
        />
      </div>
    </FluentProvider>
  );
}

export default App;
