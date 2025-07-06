import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { RestartAlt as ResetIcon } from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { Area, LogEntry } from '../types';
import {
  subscribeToArea,
  incrementAreaCount,
  decrementAreaCount,
  addLogEntry,
  updateArea,
} from '../services/firestore';

interface ManualCounterProps {
  initialArea: Area;
  onChangeArea: () => void;
}

const ManualCounter: React.FC<ManualCounterProps> = ({ initialArea, onChangeArea }) => {
  const [area, setArea] = useState<Area>(initialArea);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const { user, showSnackbar } = useApp();

  // Check if user has ticker access (admin or volunteer)
  const canAccessTicker = user?.isAdmin || user?.isVolunteer;
  // Only admins can reset counters
  const canResetCounter = user?.isAdmin;

  useEffect(() => {
    const unsubscribe = subscribeToArea(initialArea.id, (updatedArea) => {
      if (updatedArea) {
        setArea(updatedArea);
      }
    });

    return () => unsubscribe();
  }, [initialArea.id]);

  // Show access denied if user doesn't have ticker permissions
  if (!canAccessTicker) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Card sx={{ width: '100%', maxWidth: 600 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom color="error">
              Access Denied
            </Typography>
            <Typography variant="h6" gutterBottom>
              Ticker Access Required
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You need volunteer or admin privileges to access the ticker functionality.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your email: <strong>{user?.email}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please contact an administrator to request volunteer access.
            </Typography>
            <Button
              variant="outlined"
              onClick={onChangeArea}
              sx={{ mt: 2 }}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const handleEntry = async () => {
    if (!user) {
      showSnackbar('User not authenticated', 'error');
      return;
    }

    try {
      await incrementAreaCount(area.id);
      
      const logEntry: LogEntry = {
        type: 'IN',
        areaId: area.id,
        timestamp: new Date().toISOString(),
        userId: user.uid,
        userEmail: user.email || '',
        userDisplayName: user.displayName || undefined,
      };
      
      await addLogEntry(logEntry);
      showSnackbar('Entry Marked! Person entry recorded successfully.', 'success');
    } catch (error) {
      console.error('Error recording entry:', error);
      showSnackbar('Error recording entry', 'error');
    }
  };

  const handleExit = async () => {
    if (!user) {
      showSnackbar('User not authenticated', 'error');
      return;
    }

    try {
      if (area.currentCount > 0) {
        await decrementAreaCount(area.id);
        
        const logEntry: LogEntry = {
          type: 'OUT',
          areaId: area.id,
          timestamp: new Date().toISOString(),
          userId: user.uid,
          userEmail: user.email || '',
          userDisplayName: user.displayName || undefined,
        };
        
        await addLogEntry(logEntry);
        showSnackbar('Exit Marked! Person exit recorded successfully.', 'success');
      } else {
        showSnackbar('Cannot exit: current count is already 0', 'warning');
      }
    } catch (error) {
      console.error('Error recording exit:', error);
      showSnackbar('Error recording exit', 'error');
    }
  };

  const handleResetCounter = async () => {
    if (!user) {
      showSnackbar('User not authenticated', 'error');
      return;
    }

    try {
      await updateArea(area.id, { currentCount: 0 });
      showSnackbar('Counter Reset! Area count has been reset to 0.', 'success');
      setResetDialogOpen(false);
    } catch (error) {
      console.error('Error resetting counter:', error);
      showSnackbar('Error resetting counter', 'error');
    }
  };

  const percentage = Math.round((area.currentCount / area.maxCapacity) * 100);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <Card sx={{ width: '100%', maxWidth: 600 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Ticker Screen
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Area: {area.name}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="h3" align="center" sx={{ mb: 1 }}>
                {area.currentCount} / {area.maxCapacity}
              </Typography>
              <Typography variant="h6" align="center" color="text.secondary">
                Current / Max
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Box display="flex" justifyContent="center">
                <Chip
                  label={`${percentage}% Full`}
                  color={percentage > 80 ? 'error' : percentage > 60 ? 'warning' : 'success'}
                />
              </Box>
            </Box>

            {user && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Volunteer: {user.displayName || user.email}
                </Typography>
                <br />
                <Typography variant="caption" color="text.secondary">
                  Role: {user.isAdmin ? 'Administrator' : 'Volunteer'}
                </Typography>
              </Box>
            )}
          </Box>

          <Stack spacing={3}>
            <Button
              variant="contained"
              size="large"
              onClick={handleEntry}
              sx={{ py: 2, fontSize: '1.2rem' }}
              color="success"
            >
              Mark IN
            </Button>
            
            <Button
              variant="contained"
              size="large"
              onClick={handleExit}
              sx={{ py: 2, fontSize: '1.2rem' }}
              color="error"
            >
              Mark OUT
            </Button>
            
            {canResetCounter && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => setResetDialogOpen(true)}
                startIcon={<ResetIcon />}
                sx={{ py: 1.5 }}
                color="warning"
              >
                Reset Counter
              </Button>
            )}
            
            <Button
              variant="outlined"
              size="large"
              onClick={onChangeArea}
              sx={{ py: 1.5 }}
            >
              Back to Dashboard
            </Button>
          </Stack>
        </CardContent>
      </Card>
      
      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset Counter</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset the counter for "{area.name}" to 0?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Current count: <strong>{area.currentCount}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetCounter} color="warning" variant="contained">
            Reset to 0
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManualCounter;
