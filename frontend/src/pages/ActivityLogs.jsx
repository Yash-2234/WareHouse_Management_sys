import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';

import LoadingSpinner from '../components/common/LoadingSpinner';
import { activityService } from '../services/reportService';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await activityService.getActivityLogs(100);
      if (res.success) setLogs(res.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} color="primary">
          System Activity Audit Logs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Security audit record tracking user logons, product edits, RFID tag registrations, and inventory updates.
        </Typography>
      </Box>

      {loading ? (
        <LoadingSpinner message="Fetching activity logs..." />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Audit Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell fontWeight={700}>{log.user}</TableCell>
                  <TableCell>
                    <Chip label={log.action} size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                  </TableCell>
                  <TableCell fontWeight={600}>{log.module}</TableCell>
                  <TableCell>{log.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ActivityLogs;
