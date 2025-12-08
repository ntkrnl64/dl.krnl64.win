import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  // Fluent UI v9 Components
  FluentProvider,
  Text,
  Link,
  Button,
  Breadcrumb, // Fluent UI Breadcrumb component
  BreadcrumbItem, // Fluent UI Breadcrumb Item component
  BreadcrumbDivider,
  BreadcrumbButton,
  // DataGrid components
  DataGrid,
  DataGridBody,
  DataGridRow,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridCell,
  TableCellLayout,
  type TableColumnDefinition,
  createTableColumn,
  // Styling
  makeStyles,
  shorthands,
  // Theming
  webLightTheme,
  webDarkTheme,
  type Theme,
} from '@fluentui/react-components';

import {
  // Common icons
  DocumentRegular,
  FolderRegular,
  DocumentPdfRegular, // Specific icon for PDF
  FolderZipRegular, // Specific icon for Zip
  // Custom icons for the app
  ArrowDownloadRegular, // For 'Download' button
  LinkRegular, // For 'Copy Download URL'
  ArrowDownloadFilled, // For 'Download Folder Contents'
  AppsRegular, // Generic app for .exe
  ImageRegular, // For images
  WeatherSunnyRegular, // For light mode icon
  WeatherMoonRegular, // For dark mode icon
  CalendarMonthFilled,
  CalendarMonthRegular,
  bundleIcon,
} from '@fluentui/react-icons';

const CalendarMonth = bundleIcon(CalendarMonthFilled, CalendarMonthRegular);


// Import types only
import type { FileSystemItem, FileItem, FolderItem } from './data';

interface AppConfig {
  siteTitle: string;
  favicon: string;
  footerHtml?: string; // Optional: Custom HTML content for the footer
}

// --- Styling with makeStyles ---
const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding('10px'), // Default padding for small screens
    minHeight: '100vh',
    // Background and color are handled by FluentProvider and theme
    '@media (min-width: 640px)': {
      ...shorthands.padding('20px'),
    },
    '@media (min-width: 1024px)': {
      ...shorthands.padding('30px'),
    },
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '24px', // Default font size for small screens
    fontWeight: '600',
    marginBottom: '20px',
    '@media (min-width: 640px)': {
      fontSize: '28px',
    },
    '@media (min-width: 1024px)': {
      fontSize: '32px',
    },
  },
  actionButtons: {
    display: 'flex',
    ...shorthands.gap('5px'),
  },
  datagridContainer: {
    flexGrow: 1, // Allow DataGrid to take available height
    overflowX: 'auto', // Enable horizontal scrolling for DataGrid
  },
  // Custom styles for DataGrid cells if needed, e.g., icon styling
  fileIcon: {
    fontSize: '16px',
    verticalAlign: 'middle',
  },
  breadcrumbContainer: {
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    marginBottom: '10px',
    fontSize: '12px', // Default font size for small screens
    '@media (min-width: 640px)': {
      fontSize: '14px',
    },
  },
  siteTitleText: {
    fontSize: '28px', // Default for small screens
    '@media (min-width: 640px)': {
      fontSize: '32px',
    },
    '@media (min-width: 1024px)': {
      fontSize: '36px',
    },
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20px',
    padding: '10px',
    fontSize: '12px',
    // Potentially add some background or border for visual separation
  },
  bottomLeftButtonContainer: { // Renamed from fixedButtonContainer
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    zIndex: 100,
  },
});

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
  const styles = useStyles(); // Initialize v9 styles


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

  // --- Effect to update screenWidth on resize ---
  // No longer needed after refactoring DataGrid responsiveness.
  //
  // const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);
  // useEffect(() => {
  //   const handleResize = () => {
  //     setScreenWidth(window.innerWidth);
  //   };
  //   window.addEventListener('resize', handleResize);
  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, []);
  const [appConfig, setAppConfig] = useState<AppConfig>({ siteTitle: 'Loading...', favicon: '' });


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
        // Set a default config or handle error state
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

  // --- Theme Management in App.tsx ---
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

  const currentItems = getItemsForPath(currentPath, fileSystemData);

  // --- Action Handlers ---
  const handleGetDownloadUrl = React.useCallback((url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      alert(`Download URL copied to clipboard:\n${url}`);
    }).catch(err => {
      alert(`Failed to copy URL: ${url}\nError: ${err}`);
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

  // --- Render Functions for DataGrid ---
  // Define types for DataGrid items for clearer column definitions
  interface DataGridItem {
    id: string; // Unique ID for each row
    name: { label: string; icon: React.ReactElement; };
    size: string;
    date: string;
    actions: FileSystemItem; // Pass the whole item for actions
  }

  // Helper to map FileSystemItem to DataGridItem
  const mapToDataGridItem = (item: FileSystemItem): DataGridItem => {
    const isFolder = item.type === 'folder';
    let icon = <DocumentRegular className={styles.fileIcon} />; // Default icon
    if (isFolder) icon = <FolderRegular className={styles.fileIcon} />;
    if (item.name.includes('.pdf')) icon = <DocumentPdfRegular className={styles.fileIcon} />;
    if (item.name.includes('.docx') || item.name.includes('.doc')) icon = <DocumentRegular className={styles.fileIcon} />;
    if (item.name.includes('.xlsx') || item.name.includes('.xls')) icon = <DocumentRegular className={styles.fileIcon} />;
    if (item.name.includes('.pptx') || item.name.includes('.ppt')) icon = <DocumentRegular className={styles.fileIcon} />;
    if (item.name.includes('.jpg') || item.name.includes('.jpeg') || item.name.includes('.png')) icon = <ImageRegular className={styles.fileIcon} />;
    if (item.name.includes('.zip') || item.name.includes('.rar')) icon = <FolderZipRegular className={styles.fileIcon} />;
    if (item.name.includes('.exe') || item.name.includes('.msi')) icon = <AppsRegular className={styles.fileIcon} />;


    return {
      id: item.name + (item.type === 'file' ? item.url : ''), // Unique ID
      name: {
        label: item.name,
        icon: icon,
      },
      size: item.type === 'file' ? item.size : '-',
      date: item.type === 'file' ? item.date : '-',
      actions: item, // Original FileSystemItem
    };
  };

  const dataGridItems: DataGridItem[] = React.useMemo(
    () => currentItems.map(mapToDataGridItem),
    [currentItems]
  );

  const columns: TableColumnDefinition<DataGridItem>[] = React.useMemo(
    () => [
      createTableColumn<DataGridItem>({
        columnId: 'name',
        compare: (a, b) => a.name.label.localeCompare(b.name.label),
        renderHeaderCell: () => <Text>Name</Text>,
        renderCell: (item) => (
          <TableCellLayout media={item.name.icon}>
            {item.actions.type === 'folder' ? (
              <Link onClick={() => setCurrentPath([...currentPath, item.name.label])}>
                {item.name.label}
              </Link>
            ) : (
              <Text>{item.name.label}</Text>
            )}
          </TableCellLayout>
        ),
      }),
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
          const fileSystemItem = item.actions; // Original FileSystemItem
          const isFile = fileSystemItem.type === 'file';
          return (
            <div className={styles.actionButtons}>              {isFile ? (
                <>
                  <Button
                    title="Download File"
                    icon={<ArrowDownloadRegular />}
                    appearance="subtle"
                    as="a"
                    href={(fileSystemItem as FileItem).url}
                    download
                  />                  <Button
                    title="Copy Download URL"
                    icon={<LinkRegular />}
                    appearance="subtle"
                    onClick={() => handleGetDownloadUrl((fileSystemItem as FileItem).url)}
                  />
                </>
              ) : (
                <Button
                  title="Download Folder Contents"
                  icon={<ArrowDownloadFilled />}
                  appearance="subtle"
                  onClick={() => handleDownloadFolder(fileSystemItem as FolderItem)}
                />)}
            </div>
          );
        },
      }),
    ],
    [styles, currentPath, setCurrentPath, handleGetDownloadUrl, handleDownloadFolder]
  );

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
      <div className={styles.headerRow}>
        <Text as="h1" className={styles.siteTitleText}>{appConfig.siteTitle}</Text>
        <Button
          appearance="subtle"
          icon={isDarkMode ? <WeatherMoonRegular /> : <WeatherSunnyRegular />}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onClick={() => setIsDarkMode(!isDarkMode)}
        />
      </div>

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
                    current={isLast}
                    {...(index === 1 && { icon: <CalendarMonth /> })} // Add icon to second item, mimicking sample
                  >
                    {segment}
                  </BreadcrumbButton>
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </Breadcrumb>
      </div>

      <div className={styles.datagridContainer}>
        <DataGrid
          items={dataGridItems}
          columns={columns}
        >
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
                {({ renderCell }) => (
                  <DataGridCell>{renderCell(item)}</DataGridCell>
                )}
              </DataGridRow>
            )}
          </DataGridBody>
        </DataGrid>
      </div>

      {currentItems.length === 0 && !loading && (
        <Text style={{ marginTop: '10px' }}>This folder is empty.</Text>
      )}

      <div className={styles.footer}>
        {/*
          WARNING: dangerouslySetInnerHTML is used here to allow custom HTML in the footer
          via config.json. Ensure that the content of `appConfig.footerHtml` is trusted
          to prevent XSS vulnerabilities. Since config.json is a local file, it is
          assumed to be trusted.
        */}
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
          target="_blank" // Open in new tab
          rel="noopener noreferrer" // Security best practice for target="_blank"
        />
      </div>
    </FluentProvider>
  );
}

export default App;