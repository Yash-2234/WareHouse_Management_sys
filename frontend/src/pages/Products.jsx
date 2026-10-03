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

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';

import StatusChip from '../components/common/StatusChip';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { productService } from '../services/productService';
import { rfidService } from '../services/rfidService';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Industrial Bearings',
  'Steel Components',
  'Electrical Motors',
  'Hydraulic Pumps',
  'Safety Equipment',
  'Packaging Materials',
  'Machine Parts',
  'Fasteners & Hardware'
];

const Products = () => {
  const { isManager, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [rfidTags, setRfidTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Dialog States
  const [openModal, setOpenModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    category: 'Industrial Bearings',
    description: '',
    quantity: 0,
    minStock: 10,
    unit: 'Units',
    location: 'Rack A-01',
    warehouse: 'Warehouse Alpha',
    rfidTagId: ''
  });

  // Snackbar Notification State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({
        search,
        category: categoryFilter,
        status: statusFilter
      });
      if (res.success) {
        setProducts(res.products);
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRFIDTags = async () => {
    try {
      const res = await rfidService.getTags();
      if (res.success) {
        setRfidTags(res.tags);
      }
    } catch (err) {
      console.error('Failed to load RFID tags:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchRFIDTags();
  }, [search, categoryFilter, statusFilter]);

  const handleOpenAddModal = () => {
    setEditItem(null);
    setFormData({
      productName: '',
      sku: '',
      category: 'Industrial Bearings',
      description: '',
      quantity: 0,
      minStock: 10,
      unit: 'Units',
      location: 'Rack A-01',
      warehouse: 'Warehouse Alpha',
      rfidTagId: ''
    });
    setOpenModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditItem(product);
    setFormData({
      productName: product.productName,
      sku: product.sku,
      category: product.category,
      description: product.description || '',
      quantity: product.quantity,
      minStock: product.minStock,
      unit: product.unit || 'Units',
      location: product.location,
      warehouse: product.warehouse,
      rfidTagId: product.rfidTag ? product.rfidTag._id : ''
    });
    setOpenModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await productService.updateProduct(editItem._id, formData);
        showSnackbar('Product updated successfully', 'success');
      } else {
        await productService.createProduct(formData);
        showSnackbar('Product added successfully', 'success');
      }
      setOpenModal(false);
      fetchProducts();
      fetchRFIDTags();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await productService.deleteProduct(deleteId);
      showSnackbar('Product deleted successfully', 'success');
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <Box>
      {/* Header Toolbar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary">
            Product Master Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage inventory items, SKUs, storage locations, and assigned RFID transponder tags.
          </Typography>
        </Box>
        {isManager && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
            Add Product
          </Button>
        )}
      </Box>

      {/* Search & Filter Bar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Product Name, SKU, ID..."
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
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)}>
                <MenuItem value="">All Categories</MenuItem>
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Stock Status</InputLabel>
              <Select value={statusFilter} label="Stock Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="In Stock">In Stock</MenuItem>
                <MenuItem value="Low Stock">Low Stock</MenuItem>
                <MenuItem value="Out of Stock">Out of Stock</MenuItem>
                <MenuItem value="Reserved">Reserved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2} textCenter>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={() => {
                setSearch('');
                setCategoryFilter('');
                setStatusFilter('');
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Products Data Table */}
      {loading ? (
        <LoadingSpinner message="Fetching product catalog..." />
      ) : products.length === 0 ? (
        <EmptyState title="No Products Found" message="No products match your search or filter parameters." actionLabel="Add New Product" onAction={handleOpenAddModal} />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU / ID</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>RFID EPC Code</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Min Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                      {product.sku}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.productId}
                    </Typography>
                  </TableCell>
                  <TableCell fontWeight={600}>{product.productName}</TableCell>
                  <TableCell>
                    <Chip label={product.category} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{product.location}</Typography>
                    <Typography variant="caption" color="text.secondary">{product.warehouse}</Typography>
                  </TableCell>
                  <TableCell>
                    {product.rfidTag ? (
                      <Chip
                        label={product.rfidTag.epc}
                        size="small"
                        color="secondary"
                        sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.7rem' }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.disabled">Unassigned</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {product.quantity} {product.unit}
                  </TableCell>
                  <TableCell align="right" color="text.secondary">
                    {product.minStock}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={product.status} />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton size="small" color="info" onClick={() => setViewItem(product)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {isManager && (
                      <Tooltip title="Edit Product">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(product)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {isAdmin && (
                      <Tooltip title="Delete Product">
                        <IconButton size="small" color="error" onClick={() => setDeleteId(product._id)}>
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

      {/* Add / Edit Product Modal Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle fontWeight={700}>
            {editItem ? 'Edit Product Details' : 'Add New Product'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  required
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SKU Code"
                  required
                  placeholder="e.g. SKU-BRG-900"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assign Registered RFID EPC Tag</InputLabel>
                  <Select
                    value={formData.rfidTagId}
                    label="Assign Registered RFID EPC Tag"
                    onChange={(e) => setFormData({ ...formData, rfidTagId: e.target.value })}
                  >
                    <MenuItem value="">-- Unassigned --</MenuItem>
                    {rfidTags.map((tag) => (
                      <MenuItem key={tag._id} value={tag._id}>
                        {tag.epc} ({tag.tagId})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Initial Quantity"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Min Stock Threshold"
                  required
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Unit of Measurement"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Warehouse Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Facility / Warehouse"
                  value={formData.warehouse}
                  onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description & Specifications"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenModal(false)} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {editItem ? 'Save Changes' : 'Create Product'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Product Details Modal Dialog */}
      <Dialog open={Boolean(viewItem)} onClose={() => setViewItem(null)} maxWidth="sm" fullWidth>
        {viewItem && (
          <>
            <DialogTitle fontWeight={700}>
              Product Details: {viewItem.productName}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">SKU Code</Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ fontFamily: 'monospace' }}>{viewItem.sku}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Product ID</Typography>
                  <Typography variant="body1" fontWeight={600}>{viewItem.productId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <Typography variant="body1">{viewItem.category}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box mt={0.5}><StatusChip status={viewItem.status} /></Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Stock Quantity</Typography>
                  <Typography variant="body1" fontWeight={700} color="primary">{viewItem.quantity} {viewItem.unit}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Min Reorder Level</Typography>
                  <Typography variant="body1">{viewItem.minStock} {viewItem.unit}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Location</Typography>
                  <Typography variant="body1">{viewItem.location}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Warehouse</Typography>
                  <Typography variant="body1">{viewItem.warehouse}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Assigned RFID EPC</Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ fontFamily: 'monospace', color: '#2563EB' }}>
                    {viewItem.rfidTag ? viewItem.rfidTag.epc : 'No RFID tag assigned'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  <Typography variant="body2" color="text.secondary">{viewItem.description || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setViewItem(null)} variant="contained" color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      {/* Snackbar Alert */}
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

export default Products;
