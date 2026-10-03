import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ContactlessIcon from '@mui/icons-material/Contactless';
import SensorsIcon from '@mui/icons-material/Sensors';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import WarehouseIcon from '@mui/icons-material/Warehouse';

import { useAuth } from '../../context/AuthContext';

const drawerWidth = 260;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const menuGroups = [
    {
      title: 'CORE OPERATIONAL',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
        { label: 'Inventory', path: '/inventory', icon: Inventory2Icon },
        { label: 'Product Movement', path: '/movement', icon: LocalShippingIcon }
      ]
    },
    {
      title: 'CATALOG & RFID',
      items: [
        { label: 'All Products', path: '/products', icon: WarehouseIcon },
        { label: 'RFID Registration', path: '/rfid-registration', icon: ContactlessIcon },
        { label: 'RFID Simulator', path: '/rfid-scanner', icon: SensorsIcon, badge: 'LIVE' }
      ]
    },
    {
      title: 'ANALYTICS & REPORTS',
      items: [
        { label: 'Reports', path: '/reports', icon: AssessmentIcon }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        ...(isAdmin ? [{ label: 'User Management', path: '/users', icon: PeopleIcon }] : []),
        { label: 'Activity Audit Logs', path: '/activity-logs', icon: ReceiptLongIcon },
        { label: 'Settings', path: '/settings', icon: SettingsIcon }
      ]
    }
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0A192F', color: '#94A3B8' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}
        >
          <SensorsIcon />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#FFFFFF', fontWeight: 800, lineHeight: 1.1, letterSpacing: '0.03em' }}>
            RFID
          </Typography>
          <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 700, letterSpacing: '0.1em' }}>
            WAREHOUSE
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Navigation List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, py: 2 }}>
        {menuGroups.map((group, gIdx) => (
          <Box key={gIdx} sx={{ mb: 2.5 }}>
            <Typography
              variant="caption"
              sx={{ px: 1.5, pb: 1, display: 'block', color: '#64748B', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.7rem' }}
            >
              {group.title}
            </Typography>
            <List disablePadding>
              {group.items.map((item, iIdx) => {
                const isActive = location.pathname === item.path;
                const IconComp = item.icon;
                return (
                  <ListItemButton
                    key={iIdx}
                    onClick={() => {
                      navigate(item.path);
                      if (mobileOpen) handleDrawerToggle();
                    }}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.5,
                      py: 1,
                      px: 1.5,
                      backgroundColor: isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      borderLeft: isActive ? '3px solid #2563EB' : '3px solid transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#F8FAFC'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: isActive ? '#38BDF8' : '#64748B' }}>
                      <IconComp fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500 }}
                    />
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: '#F59E0B',
                          color: '#000'
                        }}
                      />
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* User Footer */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#38BDF8', display: 'block' }}>
            {user?.role || 'Operator'}
          </Typography>
        </Box>
        <ListItemButton onClick={logout} sx={{ borderRadius: 1.5, p: 1, color: '#EF4444', minWidth: 'auto' }}>
          <LogoutIcon fontSize="small" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop Permanent Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #E2E8F0' }
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
