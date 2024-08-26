import { useState, useEffect, useRef } from 'react';
import { TextField, IconButton, Tooltip, AppBar, Toolbar, Typography, Avatar, Menu, MenuItem, Button, Snackbar, Alert } from '@mui/material';
import { Send as SendIcon, School as SchoolIcon, Logout as LogoutIcon, LightMode, DarkMode } from '@mui/icons-material';
import { styled } from '@mui/system';
import { Box } from '@mui/material';
import MessageBubble from './MessageBubble';
import { auth } from '@/lib/firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

const GlassBox = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[3],
    transform: 'translateY(-2px)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 1)',
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 1)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 0 0 2px rgba(76, 201, 240, 0.3)'
        : '0 0 0 2px rgba(58, 134, 255, 0.3)',
    },
  },
}));

export default function ChatInterface({ darkMode, setDarkMode }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const chatEndRef = useRef(null);
  const [user, loading, error] = useAuthState(auth);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const userMessage = { id: Date.now(), text: input, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ message: input }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = { id: Date.now() + 1, text: '', isUser: false };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        aiResponse.text += chunk;
      }

      if (aiResponse.text.trim() === '' || aiResponse.text.trim() === input.trim()) {
        throw new Error('Invalid or empty response from AI');
      }

      setMessages(prevMessages => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
      
      // Add a placeholder response
      const placeholderResponse = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        isUser: false
      };
      setMessages(prevMessages => [...prevMessages, placeholderResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmitLink = async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ url: input }),
      });
      const data = await response.json();
      console.log('Link submitted:', data);
      setInput('');
      setSnackbar({ open: true, message: 'Link submitted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error submitting link:', error);
      setSnackbar({ open: true, message: `Error submitting link: ${error.message}`, severity: 'error' });
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
      setSnackbar({ open: true, message: `Error signing in: ${error.message}`, severity: 'error' });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      setSnackbar({ open: true, message: `Error signing out: ${error.message}`, severity: 'error' });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
            ProfSageAI
          </Typography>
          <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
          {user ? (
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar src={user.photoURL || "/placeholder.svg"} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={handleLogin}>Login</Button>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto', display: 'flex', flexDirection: 'column' }}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && (
            <MessageBubble
              message={{ id: 'typing', text: 'AI is thinking...', isUser: false }}
            />
          )}
          <div ref={chatEndRef} />
        </Box>
      </Box>
      <GlassBox sx={{ p: 2, mx: 3, mb: 3, display: 'flex', alignItems: 'center' }}>
        <StyledTextField
          fullWidth
          variant="outlined"
          placeholder="Ask about a professor or paste a Rate My Professor link..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          sx={{ mr: 1 }}
          disabled={!user}
        />
        <Tooltip title="Send message">
          <IconButton 
            color="primary" 
            onClick={handleSend}
            sx={{ 
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { 
                bgcolor: 'primary.main', 
                color: 'primary.contrastText',
                transform: 'translateY(-2px)',
                boxShadow: 3,
              },
              transition: 'all 0.3s ease-in-out',
            }}
            disabled={!user}
          >
            <SendIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Submit professor link">
          <IconButton 
            color="secondary" 
            onClick={handleSubmitLink} 
            sx={{ 
              ml: 1,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { 
                bgcolor: 'secondary.main', 
                color: 'secondary.contrastText',
                transform: 'translateY(-2px)',
                boxShadow: 3,
              },
              transition: 'all 0.3s ease-in-out',
            }}
            disabled={!user}
          >
            <SchoolIcon />
          </IconButton>
        </Tooltip>
      </GlassBox>
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}