import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#255f85',
    },
    secondary: {
      main: '#2f7d59',
    },
    background: {
      default: '#f7f8fa',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
  },
});
