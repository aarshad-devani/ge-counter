import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Snackbar, Alert } from '@mui/material';
import { AppProvider, useApp } from './contexts/AppContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Home from './components/Home';
import ManualCounter from './components/ManualCounter';
import AdminDashboard from './components/AdminDashboard';
import Loading from './components/Loading';
import { Area } from './types';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    error: {
      main: '#d32f2f',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

type Route = 'login' | 'home' | 'manual-counter' | 'admin' | 'ticker';

const AppContent: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const { user, loading, snackbar, setSnackbar } = useApp();

  const handleLogin = () => {
    setCurrentRoute('home');
  };

  const handleAreaSelected = (area: Area, mode: 'manual' | 'scan' | 'ticker') => {
    setSelectedArea(area);
    if (mode === 'manual' || mode === 'ticker') {
      setCurrentRoute('manual-counter');
    }
  };

  const handleChangeArea = () => {
    setCurrentRoute('home');
    setSelectedArea(null);
  };

  const handleNavigation = (route: string) => {
    switch (route) {
      case '/login':
        setCurrentRoute('login');
        break;
      case '/home':
        setCurrentRoute('home');
        break;
      case '/admin':
        setCurrentRoute('admin');
        break;
      case '/ticker':
        setCurrentRoute('ticker');
        break;
      default:
        break;
    }
  };

  const getTitle = () => {
    switch (currentRoute) {
      case 'login':
        return 'GE Counter';
      case 'home':
        return 'GE Counter - Dashboard';
      case 'manual-counter':
        return `GE Counter - ${selectedArea?.name || 'Manual Counter'}`;
      case 'admin':
        return 'GE Counter - Admin Dashboard';
      case 'ticker':
        return `GE Counter - Ticker - ${selectedArea?.name || 'Area'}`;
      default:
        return 'GE Counter';
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return <Loading message="Initializing GE Counter..." />;
  }

  // Show login if user is not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentRoute) {
      case 'home':
        return (
          <Home 
            onAreaSelected={handleAreaSelected}
            onNavigateToAdmin={() => handleNavigation('/admin')}
          />
        );
      case 'manual-counter':
        return selectedArea ? (
          <ManualCounter
            initialArea={selectedArea}
            onChangeArea={handleChangeArea}
          />
        ) : (
          <Home 
            onAreaSelected={handleAreaSelected}
            onNavigateToAdmin={() => handleNavigation('/admin')}
          />
        );
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <Home 
            onAreaSelected={handleAreaSelected}
            onNavigateToAdmin={() => handleNavigation('/admin')}
          />
        );
    }
  };

  return (
    <>
      <Layout title={getTitle()} onNavigate={handleNavigation}>
        {renderContent()}
      </Layout>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
