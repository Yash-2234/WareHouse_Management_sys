import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Grid
} from '@mui/material';

import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { inventoryService } from '../services/inventoryService';

const ProductMovement = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getMovements();
      if (res.success) {
        setMovements(res.movements);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} color="primary">
          Internal Product Movement Tracking
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Audit trail of product relocations, staging transfers, and dock dispatch movements within warehouse zones.
        </Typography>
      </Box>

      {/* Visual Flow Overview */}
      <Card sx={{ mb: 4, p: 2, background: 'linear-gradient(135deg, #0A192F 0%, #1E293B 100%)', color: '#FFFFFF' }}>
        <Typography variant="subtitle2" sx={{ color: '#38BDF8', fontWeight: 700, mb: 2, letterSpacing: '0.05em' }}>
          TYPICAL WAREHOUSE MOVEMENT ROUTE PATHWAY
        </Typography>
        <Stepper activeStep={3} alternativeLabel>
          {['Inbound Gate 01', 'Inspection & Staging Zone', 'Main Storage Rack (A/B/C)', 'Outbound Dispatch Dock'].map((label, index) => (
            <Step key={label} completed>
              <StepLabel
                StepIconProps={{ sx: { color: '#2563EB !important' } }}
                componentsProps={{ label: { style: { color: '#F8FAFC', fontWeight: 600, fontSize: '0.8rem' } } }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Card>

      {/* Movement Records Table */}
      {loading ? (
        <LoadingSpinner message="Loading location transfer logs..." />
      ) : movements.length === 0 ? (
        <EmptyState title="No Product Movements Logged" message="No product movements recorded yet." />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>RFID EPC Code</TableCell>
                <TableCell>Origin Location</TableCell>
                <TableCell>Destination Location</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Movement Type</TableCell>
                <TableCell>Operator</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movements.map((mv) => (
                <TableRow key={mv._id} hover>
                  <TableCell>{new Date(mv.timestamp).toLocaleString()}</TableCell>
                  <TableCell fontWeight={600}>
                    {mv.product ? mv.product.productName : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: '#2563EB', fontWeight: 700 }}>
                    {mv.rfidTag}
                  </TableCell>
                  <TableCell>
                    <Chip label={mv.fromLocation} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={mv.toLocation} size="small" color="secondary" />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    {mv.quantity}
                  </TableCell>
                  <TableCell>
                    <Chip label={mv.movementType || 'Internal Transfer'} size="small" color="primary" />
                  </TableCell>
                  <TableCell>{mv.user ? mv.user.name : 'System Operator'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ProductMovement;
