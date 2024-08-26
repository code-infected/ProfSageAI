//MessageBubble.js
import React from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProfessorInfo from './ProfessorInfo';

const StyledBubble = styled(motion.div)(({ theme, isUser }) => ({
  maxWidth: '70%',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.background.paper,
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: theme.shadows[1],
  marginBottom: theme.spacing(1),
  position: 'relative',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    [isUser ? 'right' : 'left']: -10,
    borderStyle: 'solid',
    borderWidth: '10px 10px 0',
    borderColor: `${isUser ? theme.palette.primary.main : theme.palette.background.paper} transparent transparent transparent`,
  },
}));

const MessageWrapper = styled(Box)(({ isUser }) => ({
  display: 'flex',
  justifyContent: isUser ? 'flex-end' : 'flex-start', // Aligns to the right for user and left for AI
  width: '100%',
}));

export default function MessageBubble({ message }) {
  return (
    <MessageWrapper isUser={message.isUser}>
      <StyledBubble
        isUser={message.isUser}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }} // Corrected y value for animation
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.text}
        </ReactMarkdown>
        {message.professorInfo && <ProfessorInfo info={message.professorInfo} />}
      </StyledBubble>
    </MessageWrapper>
  );
}
