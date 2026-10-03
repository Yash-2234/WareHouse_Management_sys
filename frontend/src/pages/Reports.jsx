import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';

import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import AssessmentIcon from '@mui/icons-material/Assessment';

import LoadingSpinner from '../components/common/LoadingSpinner';
import { reportService } from '../services/reportService';

const Reports = () => {
  const [reportType, setReportType] = useState('inventory');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'inventory') {
        const res = await reportService.getInventoryReport();
        if (res.success) setReportData(res.report);
      } else if (reportType === 'movement') {
        const res = await reportService.getMovementReport();
        if (res.success) setReportData(res.report);
      } else if (reportType === 'rfid') {
        const res = await reportService.getRfidReport();
        if (res.success) setReportData(res.tags);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'inventory') {
      csvContent += 'SKU,Product Name,Category,Quantity,Location,Warehouse,Status\n';
      reportData.forEach((row) => {
        csvContent += `"${row.sku}","${row.productName}","${row.category}",${row.quantity},"${row.location}","${row.warehouse}","${row.status}"\n`;
      });
    } else {
      csvContent += 'ID,Date,Detail,Status\n';
      reportData.forEach((row, i) => {
        csvContent += `"${i + 1}","${new Date().toLocaleDateString()}","${row.epc || row.rfidTag || 'Record'}","Active"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WMS_${reportType.toUpperCase()}_REPORT.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary">
            Warehouse Operations & RFID Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate and export custom inventory summaries, RFID transponder distributions, and movement logs.
          </Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ backgroundColor: '#FFFFFF' }}>
            Print Report
          </Button>
          <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Filter Control Bar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Report Type</InputLabel>
              <Select value={reportType} label="Select Report Type" onChange={(e) => setReportType(e.target.value)}>
                <MenuItem value="inventory">Inventory Catalog & Stock Report</MenuItem>
                <MenuItem value="movement">Stock Movement Audit Report</MenuItem>
                <MenuItem value="rfid">RFID Tag Registry Report</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Report Table */}
      {loading ? (
        <LoadingSpinner message="Generating report matrix..." />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
          <Table>
            <TableHead>
              {reportType === 'inventory' ? (
                <TableRow>
                  <TableCell>SKU</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell>Warehouse Location</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell>EPC / Identifier</TableCell>
                  <TableCell>Assigned Entity</TableCell>
                  <TableCell>Location / Route</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              )}
            </TableHead>
            <TableBody>
              {reportData.map((row, idx) => (
                <TableRow key={row._id || idx} hover>
                  {reportType === 'inventory' ? (
                    <>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{row.sku}</TableCell>
                      <TableCell fontWeight={600}>{row.productName}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell align="right" fontWeight={800}>{row.quantity} {row.unit}</TableCell>
                      <TableCell>{row.location} ({row.warehouse})</TableCell>
                      <TableCell><Chip label={row.status} size="small" color={row.status === 'In Stock' ? 'success' : 'warning'} /></TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ fontFamily: 'monospace', color: '#2563EB', fontWeight: 700 }}>{row.epc || row.rfidTag || `ROW-${idx + 1}`}</TableCell>
                      <TableCell fontWeight={600}>{row.product ? row.product.productName : 'General Item'}</TableCell>
                      <TableCell>{row.fromLocation ? `${row.fromLocation} -> ${row.toLocation}` : row.warehouseLocation || 'Warehouse Alpha'}</TableCell>
                      <TableCell><Chip label="Active" size="small" color="success" /></TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Reports;
