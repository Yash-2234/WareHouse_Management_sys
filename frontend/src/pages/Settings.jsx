import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert
} from '@mui/material';

import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [snackbar, setSnackbar] = useState(false);

  const [settings, setSettings] = useState({
    facilityName: 'Main Distribution Center Alpha',
    defaultMinStock: 10,
    rfidReaderFreq: '865 - 868 MHz (EU) / 902 - 928 MHz (US)',
    autoInventoryUpdateOnScan: true,
    emailAlerts: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSnackbar(true);
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} color="primary">
          Warehouse & RFID Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure facility profile, RFID scanner operating frequencies, and inventory alert limits.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Facility & RFID Gateway Parameters
              </Typography>
              <form onSubmit={handleSave}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Primary Facility Name"
                      value={settings.facilityName}
                      onChange={(e) => setSettings({ ...settings, facilityName: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Default Low Stock Threshold"
                      value={settings.defaultMinStock}
                      onChange={(e) => setSettings({ ...settings, defaultMinStock: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="RFID Antenna Frequency Spectrum"
                      value={settings.rfidReaderFreq}
                      onChange={(e) => setSettings({ ...settings, rfidReaderFreq: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoInventoryUpdateOnScan}
                          onChange={(e) => setSettings({ ...settings, autoInventoryUpdateOnScan: e.target.checked })}
                          color="primary"
                        />
                      }
                      label="Automatically adjust inventory count on verified RFID Gate scans"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.emailAlerts}
                          onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                          color="primary"
                        />
                      }
                      label="Send instant low-stock notifications to Warehouse Managers"
                    />
                  </Grid>
                  <Grid item xs={12} mt={1}>
                    <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />}>
                      Save Configuration
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Operator Profile Summary
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Name</Typography>
                  <Typography variant="subtitle2" fontWeight={700}>{user?.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Email Address</Typography>
                  <Typography variant="subtitle2">{user?.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Current System Role</Typography>
                  <Typography variant="subtitle2" color="secondary.main" fontWeight={700}>{user?.role}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Department</Typography>
                  <Typography variant="subtitle2">{user?.department}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSnackbar(false)}>
          Configuration settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
