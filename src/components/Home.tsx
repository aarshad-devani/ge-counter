import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Fab,
  useTheme,
  useMediaQuery,
  // Badge,
  // Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  Login as LoginIcon,
  // Logout as LogoutIcon,
} from "@mui/icons-material";
import { useApp } from "../contexts/AppContext";
import { Area, LogEntry } from "../types";
import { subscribeToAreaLogEntries } from "../services/firestore";

interface HomeProps {
  onAreaSelected: (area: Area, mode: "manual" | "scan" | "ticker") => void;
  onNavigateToAdmin: () => void;
}

const Home: React.FC<HomeProps> = ({ onAreaSelected, onNavigateToAdmin }) => {
  const { areas, user } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [areaLogEntries, setAreaLogEntries] = useState<Record<string, LogEntry[]>>({});

  const enabledAreas = areas.filter((area) => area.status === "enabled");
  const totalCapacity = enabledAreas.reduce(
    (sum, area) => sum + area.maxCapacity,
    0
  );
  const totalOccupancy = enabledAreas.reduce(
    (sum, area) => sum + area.currentCount,
    0
  );
  const averageOccupancy =
    enabledAreas.length > 0 ? (totalOccupancy / totalCapacity) * 100 : 0;

  // Subscribe to log entries for all enabled areas
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    enabledAreas.forEach((area) => {
      const unsubscribe = subscribeToAreaLogEntries(area.id, (entries) => {
        setAreaLogEntries((prev) => ({
          ...prev,
          [area.id]: entries,
        }));
      });
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [enabledAreas.map(area => area.id).join(',')]);

  // Check user permissions
  const canAccessTicker = user?.isAdmin || user?.isVolunteer;
  const isReadOnlyUser = !user?.isAdmin && !user?.isVolunteer;
  
  // Debug logging
  console.log('🏠 Home component - User:', user);
  console.log('🏠 Home component - Can access ticker:', canAccessTicker);
  console.log('🏠 Home component - Is read only:', isReadOnlyUser);

  const getOccupancyColor = (percentage: number) => {
    if (percentage > 80) return "error";
    if (percentage > 60) return "warning";
    return "success";
  };

  const getOccupancyPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getTotalEntriesForArea = (areaId: string) => {
    const entries = areaLogEntries[areaId] || [];
    return entries.filter(entry => entry.type === 'IN').length;
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      {/* Welcome Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.displayName?.split(" ")[0] || "User"}! 👋
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor and manage your event spaces in real-time
          </Typography>
        </Box>

        {/* Quick Logout Button */}
        {/* <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={async () => {
            try {
              const { signOutUser } = await import("../services/auth");
              await signOutUser();
            } catch (error) {
              console.error("Logout error:", error);
            }
          }}
          sx={{
            mt: { xs: 2, sm: 0 },
            minWidth: 120,
          }}
        >
          Sign Out
        </Button> */}
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LocationIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Areas</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {enabledAreas.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active event spaces
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PeopleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Current Occupancy</Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {totalOccupancy}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                People currently inside
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Capacity</Typography>
              </Box>
              <Typography variant="h3" color="info.main">
                {totalCapacity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Maximum capacity
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Usage</Typography>
              </Box>
              <Typography variant="h3" color="warning.main">
                {averageOccupancy.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all areas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Area Cards */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Your Event Spaces
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {canAccessTicker 
            ? "Click on any area to start tracking attendance"
            : "View real-time occupancy data (Tracking requires volunteer access)"
          }
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {enabledAreas.map((area) => {
          const percentage = getOccupancyPercentage(
            area.currentCount,
            area.maxCapacity
          );
          const occupancyColor = getOccupancyColor(percentage);

          return (
            <Grid item xs={12} sm={6} md={4} key={area.id}>
              <Card
                sx={{
                  height: "100%",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": canAccessTicker ? {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[8],
                  } : {},
                  cursor: canAccessTicker ? "pointer" : "default",
                  opacity: isReadOnlyUser ? 0.8 : 1,
                  border: isReadOnlyUser ? "1px solid" : "none",
                  borderColor: isReadOnlyUser ? "grey.300" : "transparent",
                }}
                onClick={canAccessTicker ? () => onAreaSelected(area, "ticker") : undefined}
              >
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="start"
                    mb={2}
                  >
                    <Typography variant="h6" component="h3">
                      {area.name}
                    </Typography>
                    <Chip
                      label={`${percentage}%`}
                      color={occupancyColor}
                      size="small"
                    />
                  </Box>

                  <Typography variant="h4" color="primary" gutterBottom>
                    {area.currentCount}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    of {area.maxCapacity} capacity
                  </Typography>

                  <Box sx={{ mt: 2, mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      color={occupancyColor}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: `${theme.palette[occupancyColor].main}20`,
                      }}
                    />
                  </Box>

                  {/* Total Entries Section */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      backgroundColor: 'rgba(46, 125, 50, 0.08)',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'rgba(46, 125, 50, 0.2)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'rgba(46, 125, 50, 0.12)',
                        borderColor: 'rgba(46, 125, 50, 0.3)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          backgroundColor: 'rgba(46, 125, 50, 0.15)',
                          borderRadius: '50%',
                        }}
                      >
                        <LoginIcon 
                          sx={{ 
                            color: 'success.main', 
                            fontSize: '1.1rem'
                          }} 
                        />
                      </Box>
                      <Box>
                        <Typography 
                          variant="body2" 
                          color="success.main" 
                          fontWeight="600"
                          sx={{ lineHeight: 1.2 }}
                        >
                          Total Entries
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ lineHeight: 1 }}
                        >
                          All time
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 40,
                        height: 32,
                        backgroundColor: 'success.main',
                        borderRadius: 2,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        boxShadow: '0 2px 4px rgba(46, 125, 50, 0.2)',
                      }}
                    >
                      {getTotalEntriesForArea(area.id)}
                    </Box>
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    variant={canAccessTicker ? "contained" : "outlined"}
                    fullWidth
                    disabled={isReadOnlyUser}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canAccessTicker) {
                        onAreaSelected(area, "ticker");
                      }
                    }}
                  >
                    {canAccessTicker ? "Start Ticker" : "View Only"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}

        {/* Add New Area Card (Admin only) */}
        {user?.isAdmin && (
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed",
                borderColor: "primary.main",
                backgroundColor: "primary.50",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "primary.100",
                  transform: "translateY(-4px)",
                },
              }}
              onClick={onNavigateToAdmin}
            >
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <AddIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
                <Typography variant="h6" color="primary">
                  Add New Area
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Create and manage event spaces
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Empty State */}
      {enabledAreas.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            backgroundColor: "grey.50",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <LocationIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No Active Areas
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Get started by creating your first event space
          </Typography>
          {user?.isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onNavigateToAdmin}
              sx={{ mt: 2 }}
            >
              Create First Area
            </Button>
          )}
          {!user?.isAdmin && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Contact an administrator to create event areas.
            </Typography>
          )}
        </Box>
      )}

      {/* Floating Action Button for Mobile */}
      {isMobile && enabledAreas.length > 0 && user?.isAdmin && (
        <Fab
          color="primary"
          aria-label="add area"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
          }}
          onClick={onNavigateToAdmin}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default Home;
