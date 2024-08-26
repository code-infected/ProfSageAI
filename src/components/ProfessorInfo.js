import { useState } from 'react';
import { Typography, Box, Rating, Chip } from '@mui/material';
import { TrendingUp as TrendingUpIcon, Compare as CompareIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Box mb={2}>
      <Typography
        variant="button"
        display="flex"
        alignItems="center"
        onClick={() => setIsOpen(!isOpen)}
        sx={{ 
          cursor: 'pointer', 
          color: 'primary.main',
          fontWeight: 'medium',
          '&:hover': {
            textDecoration: 'underline',
          }
        }}
      >
        {title}
        <ExpandMoreIcon sx={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
          transition: 'transform 0.3s',
          ml: 1
        }} />
      </Typography>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box mt={1}>{children}</Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default function ProfessorInfo({ info }) {
  return (
    <Box mt={2}>
      <Typography variant="h6" color="primary" fontWeight="bold">{info.name}</Typography>
      <Typography variant="body2" color="text.secondary">{info.department}, {info.university}</Typography>
      <Box display="flex" alignItems="center" mt={1} mb={2}>
        <Rating value={info.rating} readOnly precision={0.1} size="small" />
        <Typography variant="body2" ml={1} fontWeight="medium">{info.rating.toFixed(1)}</Typography>
      </Box>
      <Accordion title="Reviews">
        {info.reviews.map((review, index) => (
          <Typography key={index} variant="body2" sx={{ fontStyle: 'italic', my: 1, color: 'text.secondary' }}>
            &quot;{review}&quot;
          </Typography>
        ))}
      </Accordion>
      <Accordion title="Trends">
        <Box display="flex" flexWrap="wrap" gap={1}>
          {info.trends.map((trend, index) => (
            <Chip 
              key={index} 
              icon={<TrendingUpIcon />} 
              label={trend} 
              variant="outlined" 
              size="small" 
              color="primary"
              sx={{ borderRadius: '16px' }}
            />
          ))}
        </Box>
      </Accordion>
      <Accordion title="Comparisons">
        <Box display="flex" flexWrap="wrap" gap={1}>
          {info.comparisons.map((comparison, index) => (
            <Chip 
              key={index} 
              icon={<CompareIcon />} 
              label={comparison} 
              variant="outlined" 
              size="small" 
              color="secondary"
              sx={{ borderRadius: '16px' }}
            />
          ))}
        </Box>
      </Accordion>
    </Box>
  );
}