import { createTheme } from '@mui/material/styles';

const industrialTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0A192F', // Deep Industrial Navy
      light: '#1E293B',
      dark: '#020C1B',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#2563EB', // Steel Blue
      light: '#3B82F6',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF'
    },
    accent: {
      main: '#F59E0B', // Operational Amber / Warning
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#F8FAFC', // Slate cool light grey
      paper: '#FFFFFF'
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8'
    },
    success: {
      main: '#10B981',
      light: '#D1FAE5'
    },
    warning: {
      main: '#F59E0B',
      light: '#FEF3C7'
    },
    error: {
      main: '#EF4444',
      light: '#FEE2E2'
    },
    info: {
      main: '#06B6D4',
      light: '#CFFAFE'
    },
    divider: '#E2E8F0'
  },
  typography: {
    fontFamily: '"Roboto", "Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.2rem' },
    h2: { fontWeight: 700, fontSize: '1.8rem' },
    h3: { fontWeight: 600, fontSize: '1.5rem' },
    h4: { fontWeight: 600, fontSize: '1.25rem' },
    h5: { fontWeight: 600, fontSize: '1.1rem' },
    h6: { fontWeight: 600, fontSize: '0.95rem' },
    subtitle1: { fontSize: '0.95rem', fontWeight: 500 },
    subtitle2: { fontSize: '0.85rem', fontWeight: 500 },
    body1: { fontSize: '0.9rem' },
    body2: { fontSize: '0.825rem' },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: 'none',
          padding: '6px 16px',
          fontWeight: 600,
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }
        },
        containedPrimary: {
          backgroundColor: '#0A192F',
          '&:hover': {
            backgroundColor: '#1E293B'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
          border: '1px solid #E2E8F0'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F1F5F9',
          '& .MuiTableCell-head': {
            fontWeight: 700,
            color: '#334155',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6
        }
      }
    }
  }
});

export default industrialTheme;
