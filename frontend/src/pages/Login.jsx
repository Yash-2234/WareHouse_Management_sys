import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Chip,
  InputAdornment,
  IconButton
} from '@mui/material';

import SensorsIcon from '@mui/icons-material/Sensors';
import LockOutlineIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@warehouse.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0A192F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'radial-gradient(circle at 50% 50%, #1E293B 0%, #0A192F 100%)',
        px: 2
      }}
    >
      <Container maxWidth="xs">
        <Card
          sx={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: '#FFFFFF'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Logo Banner */}
            <Box textCenter display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
                }}
              >
                <SensorsIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h5" fontWeight={800} color="#0A192F">
                RFID WAREHOUSE
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.08em">
                ENTERPRISE MANAGEMENT SYSTEM
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon fontSize="small" sx={{ color: '#64748B' }} />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlineIcon fontSize="small" sx={{ color: '#64748B' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.4,
                  backgroundColor: '#0A192F',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  '&:hover': { backgroundColor: '#1E293B' }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In to Portal'}
              </Button>
            </form>

            {/* Quick Demo Credentials Switcher */}
            <Box mt={3} pt={2} borderTop="1px solid #E2E8F0">
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1} textAlign="center">
                QUICK DEMO ROLES LOGINS
              </Typography>
              <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                <Chip
                  label="Admin (Aarav)"
                  size="small"
                  onClick={() => handleDemoLogin('admin@warehouse.com', 'admin123')}
                  color={email === 'admin@warehouse.com' ? 'primary' : 'default'}
                  sx={{ cursor: 'pointer', fontWeight: 600 }}
                />
                <Chip
                  label="Manager (Priya)"
                  size="small"
                  onClick={() => handleDemoLogin('manager@warehouse.com', 'manager123')}
                  color={email === 'manager@warehouse.com' ? 'secondary' : 'default'}
                  sx={{ cursor: 'pointer', fontWeight: 600 }}
                />
                <Chip
                  label="Operator (Rohan)"
                  size="small"
                  onClick={() => handleDemoLogin('operator@warehouse.com', 'operator123')}
                  color={email === 'operator@warehouse.com' ? 'info' : 'default'}
                  sx={{ cursor: 'pointer', fontWeight: 600 }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
