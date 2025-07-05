import React from 'react';
import { Fab, useTheme, useMediaQuery } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { signOutUser } from '../services/auth';
import { useApp } from '../contexts/AppContext';

const FloatingLogoutButton: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSnackbar } = useApp();

  const handleLogout = async () => {
    try {
      await signOutUser();
      showSnackbar('Logged out successfully', 'info');
    } catch (error) {
      showSnackbar('Error logging out', 'error');
    }
  };

  // Only show on mobile when there's limited space
  if (!isMobile) return null;

  return (
    <Fab
      color="secondary"
      aria-label="logout"
      onClick={handleLogout}
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 1000,
      }}
    >
      <Logout />
    </Fab>
  );
};

export default FloatingLogoutButton;
