import { createTheme } from '@mui/material/styles';

const baseTypography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  h1: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
  h2: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
  h3: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
  h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
  h5: { fontFamily: "'Outfit', sans-serif", fontWeight: 500 },
  h6: { fontFamily: "'Outfit', sans-serif", fontWeight: 500 },
  subtitle1: { fontFamily: "'Inter', sans-serif", fontWeight: 500 },
  subtitle2: { fontFamily: "'Inter', sans-serif", fontWeight: 500 },
  body1: { fontFamily: "'Inter', sans-serif" },
  body2: { fontFamily: "'Inter', sans-serif" },
  button: { fontFamily: "'Inter', sans-serif", textTransform: 'none' as const, fontWeight: 500 },
  caption: { fontFamily: "'Inter', sans-serif" },
  overline: { fontFamily: "'Inter', sans-serif", fontWeight: 600 },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5', // Indigo 600
      light: '#6366f1',
      dark: '#4338ca',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0d9488', // Teal 600
      light: '#14b8a6',
      dark: '#0f766e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Slate 50
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // Slate 900
      secondary: '#64748b', // Slate 500
    },
    divider: '#e2e8f0', // Slate 200
  },
  typography: baseTypography,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          padding: '8px 16px',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          border: '1px solid #e2e8f0',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          color: '#0f172a',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#e2e8f0',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo 500
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#14b8a6', // Teal 500
      light: '#2dd4bf',
      dark: '#0d9488',
      contrastText: '#ffffff',
    },
    background: {
      default: '#020617', // Slate 950
      paper: '#0f172a', // Slate 900
    },
    text: {
      primary: '#f8fafc', // Slate 50
      secondary: '#94a3b8', // Slate 400
    },
    divider: '#1e293b', // Slate 800
  },
  typography: baseTypography,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          padding: '8px 16px',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          border: '1px solid #1e293b',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #1e293b',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#1e293b',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#0f172a',
        },
      },
    },
  },
});
