import { makeStyles, shorthands } from '@fluentui/react-components';

export const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding('10px'), // Default padding for small screens
    minHeight: '100vh',
    position: 'relative',
    zIndex: 0,
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
    '& [role="row"]': {
      height: 'auto',
    },
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
  nameCell: {
    maxWidth: '300px',
    overflow: 'visible',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    '@media (max-width: 640px)': {
      maxWidth: '200px',
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
