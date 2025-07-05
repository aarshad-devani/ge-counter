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
} from '@mui/material';
import { useApp } from '../contexts/AppContext';
import { Area, LogEntry } from '../types';
import {
  subscribeToArea,
  incrementAreaCount,
  decrementAreaCount,
  addLogEntry,
} from '../services/firestore';

interface ManualCounterProps {
  initialArea: Area;
  onChangeArea: () => void;
}

const ManualCounter: React.FC<ManualCounterProps> = ({ initialArea, onChangeArea }) => {
  const [area, setArea] = useState<Area>(initialArea);
  const { user, showSnackbar } = useApp();

  useEffect(() => {
    const unsubscribe = subscribeToArea(initialArea.id, (updatedArea) => {
      if (updatedArea) {
        setArea(updatedArea);
      }
    });

    return () => unsubscribe();
  }, [initialArea.id]);

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
      showSnackbar('Entry Successful! Entry recorded.', 'success');
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
        showSnackbar('Exit Successful! Exit recorded.', 'success');
      } else {
        showSnackbar('Cannot exit: current count is already 0', 'warning');
      }
    } catch (error) {
      console.error('Error recording exit:', error);
      showSnackbar('Error recording exit', 'error');
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
            Manual Counter
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Area: {area.name} (ID: {area.id})
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
                  Tracking as: {user.displayName || user.email}
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
              Enter
            </Button>
            
            <Button
              variant="contained"
              size="large"
              onClick={handleExit}
              sx={{ py: 2, fontSize: '1.2rem' }}
              color="error"
            >
              Exit
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={onChangeArea}
              sx={{ py: 1.5 }}
            >
              Change Area
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ManualCounter;
