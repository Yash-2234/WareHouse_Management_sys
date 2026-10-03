import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Snackbar,
  Alert,
  Chip,
  Tabs,
  Tab
} from '@mui/material';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

import StatusChip from '../components/common/StatusChip';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { inventoryService } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
  const { isManager } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);

  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog State
  const [actionType, setActionType] = useState(null); // 'STOCK_IN', 'STOCK_OUT', 'TRANSFER', 'ADJUSTMENT'
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    quantity: 10,
    location: '',
    toLocation: 'Rack B-04',
    remarks: ''
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getInventory({ search });
      if (res.success) {
        setInventory(res.inventory);
        setTransactions(res.recentTransactions);
      }
    } catch (err) {
      showSnackbar('Failed to fetch inventory data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [search]);

  const handleOpenModal = (item, type) => {
    setSelectedItem(item);
    setActionType(type);
    setFormData({
      quantity: 10,
      location: item.location,
      toLocation: 'Rack B-04',
      remarks: ''
    });
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      if (actionType === 'STOCK_IN') {
        await inventoryService.stockIn({
          productId: selectedItem._id,
          quantity: formData.quantity,
          remarks: formData.remarks
        });
        showSnackbar(`Stock In successful: +${formData.quantity} units added`, 'success');
      } else if (actionType === 'STOCK_OUT') {
        await inventoryService.stockOut({
          productId: selectedItem._id,
          quantity: formData.quantity,
          remarks: formData.remarks
        });
        showSnackbar(`Stock Out successful: -${formData.quantity} units removed`, 'success');
      } else if (actionType === 'TRANSFER') {
        await inventoryService.transfer({
          productId: selectedItem._id,
          fromLocation: selectedItem.location,
          toLocation: formData.toLocation,
          quantity: formData.quantity,
          remarks: formData.remarks
        });
        showSnackbar(`Product transferred to ${formData.toLocation}`, 'success');
      } else if (actionType === 'ADJUSTMENT') {
        await inventoryService.adjust({
          productId: selectedItem._id,
          newQuantity: formData.quantity,
          remarks: formData.remarks
        });
        showSnackbar(`Inventory balance adjusted to ${formData.quantity}`, 'success');
      }

      setActionType(null);
      fetchInventoryData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} color="primary">
          Warehouse Inventory Balances
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Perform stock operations (Inbound Stock-In, Outbound Stock-Out, Location Transfer, Count Adjustment).
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)}>
          <Tab label="Live Stock Balances" sx={{ fontWeight: 700 }} />
          <Tab label="Transaction History Audit" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <>
          {/* Search bar */}
          <Card sx={{ p: 2, mb: 3 }}>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search Product, SKU, Location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon fontSize="small" sx={{ color: '#64748B', mr: 1 }} />
                }}
              />
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchInventoryData}>
                Refresh
              </Button>
            </Box>
          </Card>

          {loading ? (
            <LoadingSpinner message="Calculating real-time inventory balances..." />
          ) : inventory.length === 0 ? (
            <EmptyState title="No Inventory Items" message="No stock items match your search term." />
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>SKU Code</TableCell>
                    <TableCell>Assigned RFID</TableCell>
                    <TableCell align="right">On-Hand Qty</TableCell>
                    <TableCell>Warehouse / Location</TableCell>
                    <TableCell>Stock Status</TableCell>
                    <TableCell align="center">Stock Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item._id} hover>
                      <TableCell fontWeight={600}>{item.product.productName}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{item.sku}</TableCell>
                      <TableCell>
                        <Chip label={item.rfidTag} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.95rem', color: item.quantity <= item.minStock ? 'error.main' : 'text.primary' }}>
                        {item.quantity} {item.product.unit}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{item.location}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.warehouse}</Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={item.status} />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={0.5} justifyContent="center">
                          <Tooltip title="Stock In (+ Add Stock)">
                            <IconButton size="small" color="success" onClick={() => handleOpenModal(item, 'STOCK_IN')}>
                              <ArrowDownwardIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Stock Out (- Dispatch Stock)">
                            <IconButton size="small" color="error" onClick={() => handleOpenModal(item, 'STOCK_OUT')}>
                              <ArrowUpwardIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Relocate / Transfer">
                            <IconButton size="small" color="secondary" onClick={() => handleOpenModal(item, 'TRANSFER')}>
                              <SwapHorizIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {isManager && (
                            <Tooltip title="Audit Count Adjustment">
                              <IconButton size="small" color="primary" onClick={() => handleOpenModal(item, 'ADJUSTMENT')}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {tabIndex === 1 && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tx ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Quantity Change</TableCell>
                <TableCell>Previous &rarr; New</TableCell>
                <TableCell>Operator</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx._id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{tx.transactionId}</TableCell>
                  <TableCell>{new Date(tx.date).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={tx.type}
                      size="small"
                      color={
                        tx.type === 'STOCK_IN' ? 'success' :
                        tx.type === 'STOCK_OUT' ? 'error' :
                        tx.type === 'TRANSFER' ? 'secondary' : 'info'
                      }
                      sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                    />
                  </TableCell>
                  <TableCell fontWeight={600}>{tx.product ? tx.product.productName : 'N/A'}</TableCell>
                  <TableCell fontWeight={700}>
                    {tx.type === 'STOCK_IN' ? `+${tx.quantity}` : tx.type === 'STOCK_OUT' ? `-${tx.quantity}` : `${tx.quantity}`}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {tx.previousQuantity} → {tx.newQuantity}
                  </TableCell>
                  <TableCell>{tx.user ? tx.user.name : 'System'}</TableCell>
                  <TableCell variant="caption">{tx.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Action Modals */}
      <Dialog open={Boolean(actionType)} onClose={() => setActionType(null)} maxWidth="xs" fullWidth>
        {selectedItem && (
          <form onSubmit={handleActionSubmit}>
            <DialogTitle fontWeight={700}>
              {actionType === 'STOCK_IN' && `Stock In: ${selectedItem.product.productName}`}
              {actionType === 'STOCK_OUT' && `Stock Out: ${selectedItem.product.productName}`}
              {actionType === 'TRANSFER' && `Relocate: ${selectedItem.product.productName}`}
              {actionType === 'ADJUSTMENT' && `Audit Adjust: ${selectedItem.product.productName}`}
            </DialogTitle>
            <DialogContent dividers>
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Current Stock Balance: <strong>{selectedItem.quantity} {selectedItem.product.unit}</strong> ({selectedItem.location})
                </Typography>

                {actionType === 'TRANSFER' ? (
                  <>
                    <TextField
                      fullWidth
                      label="From Origin Location"
                      disabled
                      value={selectedItem.location}
                    />
                    <TextField
                      fullWidth
                      label="Destination Location (toLocation)"
                      required
                      placeholder="e.g. Rack B-04 / Dispatch Area"
                      value={formData.toLocation}
                      onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                    />
                  </>
                ) : (
                  <TextField
                    fullWidth
                    type="number"
                    label={actionType === 'ADJUSTMENT' ? 'New Total Quantity' : 'Units Quantity'}
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  />
                )}

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Remarks & Operator Notes"
                  placeholder="e.g. PO #8812 Inbound Delivery"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setActionType(null)} variant="outlined" color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color={actionType === 'STOCK_OUT' ? 'error' : 'primary'}>
                Confirm Transaction
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Inventory;
