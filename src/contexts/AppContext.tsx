import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Area, AuthUser } from '../types';
import { subscribeToAreas, checkUserIsAdmin } from '../services/firestore';
import { onAuthStateChange } from '../services/auth';

interface AppContextType {
  areas: Area[];
  selectedArea: Area | null;
  setSelectedArea: (area: Area | null) => void;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  loading: boolean;
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
  setSnackbar: (snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribeAuth = onAuthStateChange(async (authUser) => {
      console.log('🔍 Auth state changed:', authUser);
      
      if (authUser) {
        console.log('👤 User authenticated:', authUser.email);
        
        // Check if user is admin
        console.log('🔍 Checking admin status for:', authUser.email);
        const isAdmin = await checkUserIsAdmin(authUser.uid);
        console.log('🔐 Admin check result:', isAdmin);
        
        // Also check by email (fallback)
        const isAdminByEmail = await checkUserIsAdmin(authUser.email || '');
        console.log('🔐 Admin check by email result:', isAdminByEmail);
        
        const finalAdminStatus = isAdmin || isAdminByEmail;
        console.log('✅ Final admin status:', finalAdminStatus);
        
        setUser({ ...authUser, isAdmin: finalAdminStatus });
      } else {
        console.log('❌ User not authenticated');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Subscribe to areas collection only if user is authenticated
    if (user) {
      const unsubscribeAreas = subscribeToAreas((updatedAreas) => {
        setAreas(updatedAreas);
      });

      return () => unsubscribeAreas();
    } else {
      setAreas([]);
    }
  }, [user]);

  const value: AppContextType = {
    areas,
    selectedArea,
    setSelectedArea,
    user,
    setUser,
    loading,
    showSnackbar,
    snackbar,
    setSnackbar,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
