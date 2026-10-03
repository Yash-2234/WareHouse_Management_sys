import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Button,
  TextField,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Avatar,
  Divider
} from '@mui/material';

import SensorsIcon from '@mui/icons-material/Sensors';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import SearchIcon from '@mui/icons-material/Search';

import StatusChip from '../components/common/StatusChip';
import { rfidService } from '../services/rfidService';

const RFIDScannerPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedEPC, setScannedEPC] = useState('E20000172211014418901000');
  const [customInputEPC, setCustomInputEPC] = useState('');
  const [readingStrength, setReadingStrength] = useState(92);
  const [scanCount, setScanCount] = useState(0);

  const [matchResult, setMatchResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const timerRef = useRef(null);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchScanHistory = async () => {
    try {
      const res = await rfidService.getScans(15);
      if (res.success) {
        setScanHistory(res.scans);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchScanHistory();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const triggerScanMatch = async (epcToScan) => {
    setLoading(true);
    try {
      const res = await rfidService.scanRFID(epcToScan, 'RFID-GATEWAY-READER-01');
      if (res.success && res.data) {
        setMatchResult(res.data);
        setScannedEPC(res.data.scannedValue);
        setScanCount((prev) => prev + 1);
        setReadingStrength(Math.floor(Math.random() * 20 + 80));

        if (res.data.status === 'MATCHED') {
          showSnackbar(res.data.message || 'RFID matched successfully!', 'success');
        } else {
          showSnackbar('Unknown RFID detected. No product pattern matched.', 'warning');
        }
        fetchScanHistory();
      }
    } catch (err) {
      showSnackbar('Scan service error', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Start Scanner simulation loop
  const handleStartScanner = () => {
    setIsScanning(true);
    showSnackbar('RFID Reader Antenna activated and broadcasting...', 'info');

    // Run immediate scan
    triggerRandomScan();

    timerRef.current = setInterval(() => {
      triggerRandomScan();
    }, 4500);
  };

  const handleStopScanner = () => {
    setIsScanning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    showSnackbar('RFID Reader antenna stopped.', 'info');
  };

  const triggerRandomScan = () => {
    // 80% chance of registered tag, 20% unknown
    const sampleRegisteredEPCs = [
      'E20000172211014418901000',
      'E20000172211014418901001',
      'E20000172211014418901002',
      'E20000172211014418901003',
      'E20000172211014418901004',
      'E20000172211014418901005',
      'E20000172211014418909999' // Unknown tag
    ];
    const randomEpc = sampleRegisteredEPCs[Math.floor(Math.random() * sampleRegisteredEPCs.length)];
    triggerScanMatch(randomEpc);
  };

  const handleManualScanSubmit = (e) => {
    e.preventDefault();
    if (!customInputEPC) return;
    triggerScanMatch(customInputEPC);
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} color="primary">
          RFID Gate Reader & Simulator
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Simulate UHF RFID transponder readings, test backend pattern matching algorithms, and verify confidence scoring.
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        {/* Left Column: Reader Controls */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', borderLeft: isScanning ? '5px solid #10B981' : '5px solid #94A3B8' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: isScanning ? '#10B981' : '#64748B' }}>
                  <SensorsIcon />
                </Avatar>
              }
              title={<Typography variant="h6" fontWeight={700}>RFID READER GATEWAY</Typography>}
              subheader="Status: RFID-GATE-NORTH-DOCK-01"
            />
            <CardContent>
              {/* Scanner Control Buttons */}
              <Box display="flex" gap={2} mb={3}>
                {!isScanning ? (
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleStartScanner}
                    sx={{ py: 1.5, fontWeight: 700 }}
                  >
                    Start Scanner
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<StopIcon />}
                    onClick={handleStopScanner}
                    sx={{ py: 1.5, fontWeight: 700 }}
                  >
                    Stop Scanner
                  </Button>
                )}
              </Box>

              {/* Status Indicator */}
              <Box p={2} borderRadius={2} bgcolor="#F1F5F9" mb={3}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      SCANNER STATUS
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: isScanning ? '#10B981' : '#64748B',
                          boxShadow: isScanning ? '0 0 10px #10B981' : 'none'
                        }}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        {isScanning ? 'Connected / Scanning' : 'Idle / Ready'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      READING STRENGTH
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <SignalCellularAltIcon color={isScanning ? 'success' : 'action'} />
                      <Typography variant="subtitle2" fontWeight={700}>
                        {isScanning ? `${readingStrength}%` : '0%'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Stat Counters */}
              <Box display="flex" justifyContent="space-between" mb={3} px={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">TOTAL SCANS IN SESSION</Typography>
                  <Typography variant="h5" fontWeight={800} color="primary">{scanCount}</Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="caption" color="text.secondary">ANTENNA POWER</Typography>
                  <Typography variant="h5" fontWeight={800} color="secondary">30 dBm</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Manual EPC Tester Input */}
              <form onSubmit={handleManualScanSubmit}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Manual EPC Hex Signal Input:
                </Typography>
                <Box display="flex" gap={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. E2000017221101441890ABCD"
                    value={customInputEPC}
                    onChange={(e) => setCustomInputEPC(e.target.value.toUpperCase())}
                    inputProps={{ style: { fontFamily: 'monospace', fontWeight: 'bold' } }}
                  />
                  <Button type="submit" variant="contained" color="secondary" startIcon={<SearchIcon />}>
                    Scan
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Pattern Matching Result Card */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight={700}>REAL-TIME PATTERN MATCHING SERVICE</Typography>}
              subheader="rfidPatternMatcher.js execution telemetry"
            />
            <CardContent>
              {loading && <LinearProgress color="secondary" sx={{ mb: 2 }} />}

              {/* Scanned EPC Banner */}
              <Box p={2.5} borderRadius={2} bgcolor="#0A192F" color="#FFFFFF" mb={3}>
                <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 700, letterSpacing: '0.05em' }}>
                  SCANNED RFID EPC HEX STRING
                </Typography>
                <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 800, mt: 0.5, letterSpacing: '0.08em' }}>
                  {scannedEPC || 'NO SIGNAL'}
                </Typography>
              </Box>

              {matchResult ? (
                <Card variant="outlined" sx={{ p: 2.5, borderColor: matchResult.status === 'MATCHED' ? '#10B981' : '#F59E0B' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {matchResult.status === 'MATCHED' ? (
                        <CheckCircleIcon color="success" fontSize="large" />
                      ) : (
                        <WarningAmberIcon color="warning" fontSize="large" />
                      )}
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {matchResult.status === 'MATCHED' ? 'Product Identified' : 'Unknown RFID Tag'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {matchResult.message}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={`Confidence: ${matchResult.confidence}%`}
                      color={matchResult.confidence > 90 ? 'success' : 'warning'}
                      sx={{ fontWeight: 800, fontSize: '0.85rem' }}
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {matchResult.matchedProduct ? (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Product Name</Typography>
                        <Typography variant="subtitle1" fontWeight={700}>{matchResult.matchedProduct.productName}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">SKU Code</Typography>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ fontFamily: 'monospace' }}>{matchResult.matchedProduct.sku}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Category</Typography>
                        <Typography variant="body2">{matchResult.matchedProduct.category}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Storage Location</Typography>
                        <Typography variant="body2">{matchResult.matchedProduct.location} ({matchResult.matchedProduct.warehouse})</Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      No product registered for this EPC transponder in database.
                    </Alert>
                  )}
                </Card>
              ) : (
                <Box py={4} textAlign="center" color="text.secondary">
                  <SensorsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body1">Click 'Start Scanner' to begin simulated RFID readings.</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* RFID Scan Telemetry Log Table */}
      <Card>
        <CardHeader title={<Typography variant="h6" fontWeight={700}>RFID Gate Scan Audit History</Typography>} />
        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Reader Gateway</TableCell>
                <TableCell>Scanned EPC Code</TableCell>
                <TableCell>Matched Product</TableCell>
                <TableCell>Confidence Score</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scanHistory.map((scan) => (
                <TableRow key={scan._id} hover>
                  <TableCell>{new Date(scan.timestamp).toLocaleTimeString()}</TableCell>
                  <TableCell fontWeight={600}>{scan.readerId}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>
                    {scan.scannedValue}
                  </TableCell>
                  <TableCell fontWeight={600}>
                    {scan.matchedProduct ? scan.matchedProduct.productName : 'Unrecognized'}
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

export default RFIDScannerPage;
