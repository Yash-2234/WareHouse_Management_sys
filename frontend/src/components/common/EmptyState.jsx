import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

const EmptyState = ({ title = 'No records found', message = 'There are no items matching your criteria.', actionLabel, onAction }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={6}
      px={2}
      textAlign="center"
    >
      <InboxIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
      <Typography variant="h6" color="text.primary" fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" maxWidth={400} mt={0.5} mb={2}>
        {message}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" color="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
