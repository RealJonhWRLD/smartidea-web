import { createTheme } from '@mui/material/styles';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#6C4FFF', // O Roxo principal
        },
        secondary: {
            main: '#624DE3',
        },
        background: {
            default: '#F6F7FB', // Fundo cinza bem claro
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1A1A1A',
            secondary: '#6E6E6E',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
    },
    shape: {
        borderRadius: 16, // Bordas arredondadas padrão
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none', // Remove letras maiúsculas automáticas
                    borderRadius: '8px',
                    fontWeight: 600,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                },
            },
        },
    },
});