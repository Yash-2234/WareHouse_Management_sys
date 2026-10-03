import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';

import RefreshIcon from '@mui/icons-material/Refresh';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ContactlessIcon from '@mui/icons-material/Contactless';
import SensorsIcon from '@mui/icons-material/Sensors';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import WarningIcon from '@mui/icons-material/Warning';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import AssessmentIcon from '@mui/icons-material/Assessment';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';

import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusChip from '../components/common/StatusChip';
import { reportService } from '../services/reportService';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#0A192F', '#2563EB', '#F59E0B', '#10B981', '#6366F1', '#EC4899', '#8B5CF6'];

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await reportService.getDashboardAnalytics();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Error loading dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return <LoadingSpinner message="Aggregating warehouse operations & RFID telemetry..." />;
  }

  const { stats, charts, tables } = data;

  return (
    <Box>
      {/* Top Welcome Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary">
            Welcome back, {user?.name || 'Operator'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Real-time warehouse telemetry, RFID scanner status, and inventory metrics.
          </Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDashboard}
            sx={{ backgroundColor: '#FFFFFF' }}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>

      {/* 8 Operational Metric Stat Cards */}
      <Grid container spacing={2.5} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Inventory2Icon}
            color="#2563EB"
            borderAccent
            subtitle="Registered SKU Master Catalog"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Stock Units"
            value={stats.totalInventory}
            icon={WarehouseIcon}
            color="#0A192F"
            borderAccent
            subtitle="Physical On-Hand Inventory"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active RFID Tags"
            value={stats.totalRFIDTags}
            icon={ContactlessIcon}
            color="#10B981"
            borderAccent
            subtitle="Registered EPC Transponders"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Scans Today"
            value={stats.scansToday}
            icon={SensorsIcon}
            color="#6366F1"
            borderAccent
            subtitle="RFID Reader Gate Events"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Stock In Today"
            value={`+${stats.stockInToday}`}
            icon={ArrowDownwardIcon}
            color="#10B981"
            subtitle="Inbound Stock Movement"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Stock Out Today"
            value={`-${stats.stockOutToday}`}
            icon={ArrowUpwardIcon}
            color="#EF4444"
            subtitle="Outbound Dispatch Units"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockCount}
            icon={WarningIcon}
            color="#F59E0B"
            borderAccent
            subtitle="Below Reorder Threshold"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Warehouse Capacity"
            value={`${stats.capacityUsagePercentage}%`}
            icon={AssessmentIcon}
            color="#0A192F"
            subtitle={`${stats.totalInventory.toLocaleString()} / ${stats.warehouseCapacity.toLocaleString()} Units`}
          />
        </Grid>
      </Grid>

      {/* Analytics Charts Grid */}
      <Grid container spacing={3} mb={4}>
        {/* Chart 1: Stock In vs Stock Out Area Trend */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 380 }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight={700}>Stock Movement Flow (Stock In vs Stock Out)</Typography>}
              subheader="Weekly movement comparisons across warehouse docks"
            />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.stockInVsOutData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="stockIn" name="Stock In" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
                  <Area type="monotone" dataKey="stockOut" name="Stock Out" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 2: Product Category Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 380 }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight={700}>Inventory by Category</Typography>}
              subheader="Stock allocation percentage breakdown"
            />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 3: RFID Scanning Activity Trend */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 340 }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight={700}>Daily RFID Scanning Telemetry</Typography>}
              subheader="Automatic gate reader detection count per day"
            />
            <CardContent sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.rfidScanActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="scans" name="RFID Scans" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 4: Monthly Warehouse Activity Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 340 }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight={700}>Monthly Logistics Volume</Typography>}
              subheader="Aggregated inbound, outbound, and internal transfers"
            />
            <CardContent sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="stockIn" name="Stock In" fill="#0A192F" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="stockOut" name="Stock Out" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="transfers" name="Transfers" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Tables Grid */}
      <Grid container spacing={3}>
        {/* Table 1: Recent RFID Gate Scans */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={<Typography variant="h6" fontWeight={700}>Recent RFID Gate Scans</Typography>}
              subheader="Real-time scan logs from RFID reader antennas"
            />
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Scanned EPC</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tables.recentScans.map((scan) => (
                    <TableRow key={scan._id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>
                        {scan.scannedValue}
                      </TableCell>
                      <TableCell fontWeight={600}>
                        {scan.matchedProduct ? scan.matchedProduct.productName : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${scan.confidence}%`}
                          size="small"
                          color={scan.confidence > 90 ? 'success' : 'warning'}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusChip status={scan.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Table 2: Low Stock Alert Products */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={<Typography variant="h6" fontWeight={700} color="warning.main">Low Stock Warning List</Typography>}
              subheader="Products below or approaching minimum stock thresholds"
            />
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Current Qty</TableCell>
                    <TableCell>Min Stock</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tables.lowStockProducts.map((p) => (
                    <TableRow key={p._id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.sku}</TableCell>
                      <TableCell fontWeight={600}>{p.productName}</TableCell>
                      <TableCell sx={{ color: 'error.main', fontWeight: 700 }}>{p.quantity}</TableCell>
                      <TableCell>{p.minStock}</TableCell>
                      <TableCell>
                        <StatusChip status={p.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
