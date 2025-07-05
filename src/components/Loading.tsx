import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      flexDirection="column"
      gap={2}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <CircularProgress 
        size={60} 
        sx={{ 
          color: 'white',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }} 
      />
      <Typography 
        variant="h6" 
        color="white" 
        sx={{ 
          fontWeight: 500,
          textAlign: 'center',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;
