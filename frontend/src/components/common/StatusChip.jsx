import React from 'react';
import { Chip } from '@mui/material';

const StatusChip = ({ status, size = 'small' }) => {
  let color = 'default';
  let variant = 'filled';

  switch (status) {
    case 'In Stock':
    case 'Active':
    case 'MATCHED':
      color = 'success';
      break;
    case 'Low Stock':
    case 'In-Transit':
    case 'Reserved':
      color = 'warning';
      break;
    case 'Out of Stock':
    case 'Deallocated':
    case 'MISMATCH':
    case 'Inactive':
      color = 'error';
      break;
    case 'UNKNOWN':
      color = 'info';
      break;
    default:
      color = 'default';
  }

  return (
    <Chip
      label={status}
      color={color}
      size={size}
      variant={variant}
      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
    />
  );
};

export default StatusChip;
