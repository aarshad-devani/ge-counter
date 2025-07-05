import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
} from '@mui/material';
import { useApp } from '../contexts/AppContext';
import { Area } from '../types';

interface SelectAreaProps {
  onAreaSelected: (area: Area, mode: 'manual' | 'scan') => void;
}

const SelectArea: React.FC<SelectAreaProps> = ({ onAreaSelected }) => {
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const { areas, showSnackbar } = useApp();

  const enabledAreas = areas.filter(area => area.status === 'enabled');
  const selectedArea = enabledAreas.find(area => area.id === selectedAreaId);

  const handleManualCounter = () => {
    if (selectedArea) {
      onAreaSelected(selectedArea, 'manual');
    } else {
      showSnackbar('Please select an area first', 'warning');
    }
  };

  const handleScanCounter = () => {
    showSnackbar('Scan-based counter coming soon', 'info');
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <Card sx={{ width: '100%', maxWidth: 500 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Select Area
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Area</InputLabel>
            <Select
              value={selectedAreaId}
              label="Area"
              onChange={(e) => setSelectedAreaId(e.target.value)}
            >
              {enabledAreas.map((area) => (
                <MenuItem key={area.id} value={area.id}>
                  {area.name} (Capacity: {area.maxCapacity})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              onClick={handleManualCounter}
              disabled={!selectedArea}
              sx={{ py: 1.5 }}
            >
              Manual Counter (Ticker)
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleScanCounter}
              disabled={true}
              sx={{ py: 1.5 }}
            >
              Scan based counter
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SelectArea;
