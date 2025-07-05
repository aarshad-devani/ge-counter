import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  QrCode,
  Dashboard,
  Logout,
  Home,
  AccountCircle,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { signOutUser } from '../services/auth';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onNavigate?: (route: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title, onNavigate }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, showSnackbar } = useApp();

  const handleLogout = async () => {
    try {
      await signOutUser();
      showSnackbar('Logged out successfully', 'info');
      setDrawerOpen(false);
      setAnchorEl(null);
      if (onNavigate) onNavigate('/login');
    } catch (error) {
      showSnackbar('Error logging out', 'error');
    }
  };

  const handleNavigation = (route: string) => {
    setDrawerOpen(false);
    if (onNavigate) onNavigate(route);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    {
      text: 'Home',
      icon: <Home />,
      onClick: () => handleNavigation('/home'),
      disabled: false,
    },
    {
      text: 'Scan QR',
      icon: <QrCode />,
      onClick: () => showSnackbar('QR Scanner coming soon', 'info'),
      disabled: true,
    },
    ...(user?.isAdmin ? [{
      text: 'Admin Dashboard',
      icon: <Dashboard />,
      onClick: () => handleNavigation('/admin'),
      disabled: false,
    }] : []),
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {user && (
            <>
              <IconButton
                color="inherit"
                onClick={handleProfileMenuOpen}
                sx={{ mr: 1 }}
              >
                {user.photoURL ? (
                  <Avatar
                    src={user.photoURL}
                    alt={user.displayName || user.email || 'User'}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="menu"
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Signed in as
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {user?.displayName || user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Navigation Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={item.onClick}
                  disabled={item.disabled}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1, p: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
