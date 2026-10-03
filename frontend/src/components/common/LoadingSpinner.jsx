import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading warehouse data...' }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={6}
      width="100%"
    >
      <CircularProgress size={40} thickness={4} color="secondary" />
      <Typography variant="body2" color="text.secondary" mt={2} fontWeight={500}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
