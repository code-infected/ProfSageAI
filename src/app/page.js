'use client'

import { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import ChatInterface from '../components/ChatInterface';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3a86ff' },
    secondary: { main: '#ff006e' },
    background: { default: '#f0f4f8', paper: '#ffffff' },
    text: { primary: '#2b2d42', secondary: '#8d99ae' },
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4cc9f0' },
    secondary: { main: '#f72585' },
    background: { default: '#141b2d', paper: '#1f2940' },
    text: { primary: '#e0e0e0', secondary: '#b0b0b0' },
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
});

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <ChatInterface darkMode={darkMode} setDarkMode={setDarkMode} />
      </main>
    </ThemeProvider>
  );
}