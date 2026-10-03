import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import industrialTheme from './theme/industrialTheme';
import { AuthProvider, useAuth } from './context/AuthContext';

import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import RFIDRegistration from './pages/RFIDRegistration';
import RFIDScannerPage from './pages/RFIDScannerPage';
import Inventory from './pages/Inventory';
import ProductMovement from './pages/ProductMovement';
import Reports from './pages/Reports';
import Users from './pages/Users';
import ActivityLogs from './pages/ActivityLogs';
import Settings from './pages/Settings';
import LoadingSpinner from './components/common/LoadingSpinner';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="rfid-registration" element={<RFIDRegistration />} />
        <Route path="rfid-scanner" element={<RFIDScannerPage />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="movement" element={<ProductMovement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<ProtectedRoute requireAdmin><Users /></ProtectedRoute>} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={industrialTheme}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
