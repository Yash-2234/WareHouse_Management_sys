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
  InputAdornment
} from '@mui/material';

import ContactlessIcon from '@mui/icons-material/Contactless';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import StatusChip from '../components/common/StatusChip';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';

import { rfidService } from '../services/rfidService';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';

const RFIDRegistration = () => {
  const { isManager, isAdmin } = useAuth();
  const [tags, setTags] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Dialog States
  const [openModal, setOpenModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    epc: '',
    productId: '',
    pattern: 'GEN2v2-STANDARD-EPC',
    warehouseLocation: 'Warehouse Alpha / Dock A',
    status: 'Active'
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await rfidService.getTags({ search, status: statusFilter });
      if (res.success) setTags(res.tags);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to load RFID tags', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productService.getProducts();
      if (res.success) setProducts(res.products);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchProducts();
  }, [search, statusFilter]);

  const handleGenerateRandomEPC = () => {
    const hexChars = '0123456789ABCDEF';
    let epc = 'E200001722';
    for (let i = 0; i < 14; i++) {
      epc += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
    }
    setFormData((prev) => ({ ...prev, epc }));
  };

  const handleOpenAddModal = () => {
    setEditItem(null);
    setFormData({
      epc: '',
      productId: '',
      pattern: 'GEN2v2-STANDARD-EPC',
      warehouseLocation: 'Warehouse Alpha / Dock A',
      status: 'Active'
    });
    handleGenerateRandomEPC();
    setOpenModal(true);
  };

  const handleOpenEditModal = (tag) => {
    setEditItem(tag);
    setFormData({
      epc: tag.epc,
      productId: tag.product ? tag.product._id : '',
      pattern: tag.pattern || 'GEN2v2-STANDARD-EPC',
      warehouseLocation: tag.warehouseLocation || 'Warehouse Alpha',
      status: tag.status || 'Active'
    });
    setOpenModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await rfidService.updateTag(editItem._id, formData);
        showSnackbar('RFID tag updated successfully', 'success');
      } else {
        await rfidService.registerTag(formData);
        showSnackbar('RFID tag registered successfully', 'success');
      }
      setOpenModal(false);
      fetchTags();
      fetchProducts();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to save RFID tag', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await rfidService.deleteTag(deleteId);
      showSnackbar('RFID tag deleted successfully', 'success');
      setDeleteId(null);
      fetchTags();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleToggleAssign = async (tag, productObj) => {
    try {
      if (productObj) {
        // Unassign
        await rfidService.updateTag(tag._id, { productId: '' });
        showSnackbar(`Unassigned tag from ${productObj.productName}`, 'info');
      }
      fetchTags();
      fetchProducts();
    } catch (err) {
      showSnackbar('Assignment update failed', 'error');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary">
            RFID Transponder Registry
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Register ISO 18000-6C Gen2 UHF RFID EPC transponders and bind them to inventory catalog items.
          </Typography>
        </Box>
        {isManager && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
            Register RFID Tag
          </Button>
        )}
      </Box>

      {/* Search & Filter */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search EPC Hex Code, Tag ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#64748B' }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Tag Status</InputLabel>
              <Select value={statusFilter} label="Tag Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="In-Transit">In-Transit</MenuItem>
                <MenuItem value="Deallocated">Deallocated</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="outlined" fullWidth startIcon={<RefreshIcon />} onClick={() => { setSearch(''); setStatusFilter(''); }}>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* RFID Table */}
      {loading ? (
        <LoadingSpinner message="Querying RFID transponder database..." />
      ) : tags.length === 0 ? (
        <EmptyState title="No RFID Tags Registered" message="No registered RFID tags match your filter criteria." actionLabel="Register Tag" onAction={handleOpenAddModal} />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tag ID</TableCell>
                <TableCell>EPC Hex Code</TableCell>
                <TableCell>Assigned Product</TableCell>
                <TableCell>Pattern Encoding</TableCell>
                <TableCell>Warehouse Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag._id} hover>
                  <TableCell fontWeight={700}>{tag.tagId}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>
                    {tag.epc}
                  </TableCell>
                  <TableCell>
                    {tag.product ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {tag.product.productName}
                        </Typography>
                        <Chip label={tag.product.sku} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.disabled">Unassigned</Typography>
                    )}
                  </TableCell>
                  <TableCell>{tag.pattern}</TableCell>
                  <TableCell>{tag.warehouseLocation}</TableCell>
                  <TableCell>
                    <StatusChip status={tag.status} />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton size="small" color="info" onClick={() => setViewItem(tag)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {isManager && (
                      <Tooltip title="Edit Tag">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(tag)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {isAdmin && (
                      <Tooltip title="Delete Tag">
                        <IconButton size="small" color="error" onClick={() => setDeleteId(tag._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit RFID Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle fontWeight={700}>
            {editItem ? 'Edit Registered RFID Tag' : 'Register New RFID EPC Transponder'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" gap={1} alignItems="center">
                  <TextField
                    fullWidth
                    label="EPC Hex Code (96-Bit RFID Standard)"
                    required
                    value={formData.epc}
                    onChange={(e) => setFormData({ ...formData, epc: e.target.value.toUpperCase() })}
                    inputProps={{ style: { fontFamily: 'monospace', fontWeight: 'bold' } }}
                  />
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleGenerateRandomEPC}
                    startIcon={<AutoAwesomeIcon />}
                    sx={{ whiteSpace: 'nowrap', py: 1.8 }}
                  >
                    Generate
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Bind to Catalog Product</InputLabel>
                  <Select
                    value={formData.productId}
                    label="Bind to Catalog Product"
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  >
                    <MenuItem value="">-- Leave Unassigned --</MenuItem>
                    {products.map((p) => (
                      <MenuItem key={p._id} value={p._id}>
                        {p.productName} ({p.sku})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tag Encoding Pattern"
                  value={formData.pattern}
                  onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tag Operational Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Tag Operational Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="In-Transit">In-Transit</MenuItem>
                    <MenuItem value="Deallocated">Deallocated</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Warehouse Zone / Location"
                  value={formData.warehouseLocation}
                  onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenModal(false)} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {editItem ? 'Update RFID Tag' : 'Register Tag'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Tag Modal */}
      <Dialog open={Boolean(viewItem)} onClose={() => setViewItem(null)} maxWidth="xs" fullWidth>
        {viewItem && (
          <>
            <DialogTitle fontWeight={700}>
              RFID Tag Details
            </DialogTitle>
            <DialogContent dividers>
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Tag ID</Typography>
                  <Typography variant="body1" fontWeight={700}>{viewItem.tagId}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">EPC Hex Code</Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ fontFamily: 'monospace', color: '#2563EB' }}>
                    {viewItem.epc}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Product Assignment</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewItem.product ? viewItem.product.productName : 'Unassigned'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box mt={0.5}><StatusChip status={viewItem.status} /></Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Location</Typography>
                  <Typography variant="body2">{viewItem.warehouseLocation}</Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setViewItem(null)} variant="contained" color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete RFID Tag"
        message="Are you sure you want to delete this RFID Tag entry?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

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

export default RFIDRegistration;
