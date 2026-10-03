import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  InputBase,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';

import { useAuth } from '../../context/AuthContext';

const Header = ({ handleDrawerToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard': return 'Warehouse Operations Overview';
      case '/inventory': return 'Inventory Stock Management';
      case '/movement': return 'Product Location & Movement Tracking';
      case '/products': return 'Product Master Catalog';
      case '/rfid-registration': return 'RFID Tag Registry';
      case '/rfid-scanner': return 'RFID Gate Simulator & Scanner';
      case '/reports': return 'Warehouse Operational Reports';
      case '/users': return 'User Access & Permissions';
      case '/activity-logs': return 'System Activity Audit Logs';
      case '/settings': return 'Warehouse Configuration Settings';
      default: return 'Warehouse Management';
    }
  };

  const handleProfileClick = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
        borderBottom: '1px solid #E2E8F0',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            {getPageTitle(location.pathname)}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Global Search bar */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              backgroundColor: '#F1F5F9',
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              width: 240
            }}
          >
            <SearchIcon sx={{ color: '#64748B', mr: 1, fontSize: 20 }} />
            <InputBase
              placeholder="Search products, RFID..."
              sx={{ fontSize: '0.85rem', width: '100%' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/products?search=${e.target.value}`);
                }
              }}
            />
          </Box>

          {/* Notifications */}
          <IconButton size="large" sx={{ color: '#475569' }}>
            <Badge badgeContent={3} color="warning">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Profile */}
          <Box
            display="flex"
            alignItems="center"
            gap={1.5}
            onClick={handleProfileClick}
            sx={{ cursor: 'pointer', p: 0.5, borderRadius: 2, '&:hover': { backgroundColor: '#F1F5F9' } }}
          >
            <Avatar sx={{ bgcolor: '#0A192F', width: 36, height: 36, fontWeight: 700, fontSize: '0.9rem' }}>
              {user?.name ? user.name.charAt(0) : 'U'}
            </Avatar>
            <Box display={{ xs: 'none', md: 'block' }}>
              <Typography variant="subtitle2" fontWeight={700} lineHeight={1.1}>
                {user?.name || 'User'}
              </Typography>
              <Chip
                label={user?.role || 'Operator'}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ height: 16, fontSize: '0.65rem', mt: 0.2 }}
              />
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            PaperProps={{
              sx: { width: 200, mt: 1, borderRadius: 2, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
            }}
          >
            <Box px={2} py={1}>
              <Typography variant="subtitle2" fontWeight={700}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { handleCloseMenu(); navigate('/settings'); }}>
              <PersonIcon fontSize="small" sx={{ mr: 1.5, color: '#64748B' }} /> Profile Settings
            </MenuItem>
            <MenuItem onClick={() => { handleCloseMenu(); navigate('/settings'); }}>
              <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: '#64748B' }} /> Configuration
            </MenuItem>
            <Divider />
            <MenuItem onClick={logout} sx={{ color: 'error.main' }}>
              <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
