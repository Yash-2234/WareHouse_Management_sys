import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

const StatCard = ({ title, value, icon: Icon, color = '#2563EB', subtitle, borderAccent }) => {
  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: borderAccent ? `4px solid ${color}` : undefined,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 15px -3px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5, color: 'text.primary' }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          <Avatar
            sx={{
              backgroundColor: `${color}15`,
              color: color,
              width: 48,
              height: 48,
              borderRadius: 2
            }}
          >
            {Icon && <Icon fontSize="medium" />}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
