import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Chip,
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOn,
  ToggleOff,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { Area, AdminUser } from '../types';
import {
  addArea,
  updateArea,
  deleteArea,
  addAdmin,
  getAdmins,
  removeAdmin,
} from '../services/firestore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { areas, user, showSnackbar } = useApp();
  const [tabValue, setTabValue] = useState(0);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaCapacity, setNewAreaCapacity] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    maxCapacity: '',
    status: 'enabled' as 'enabled' | 'disabled',
  });

  // Admin management states
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Check if current user is admin
  const isAdmin = user?.isAdmin || false;

  useEffect(() => {
    if (isAdmin) {
      loadAdmins();
    }
  }, [isAdmin]);

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const adminList = await getAdmins();
      setAdmins(adminList);
    } catch (error) {
      showSnackbar('Error loading admin list', 'error');
    } finally {
      setLoadingAdmins(false);
    }
  };

  // Show access denied if user is not admin
  if (!isAdmin) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography>
            You don't have administrator privileges. Please contact an administrator to get access.
          </Typography>
        </Alert>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              How to become an admin?
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              To gain administrator access, an existing admin needs to add your email address to the admin list.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your email: <strong>{user?.email}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please share this email with an administrator to request access.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const handleAddArea = async () => {
    if (!newAreaName.trim() || !newAreaCapacity.trim()) {
      showSnackbar('Please fill in both area name and capacity', 'warning');
      return;
    }

    const capacity = parseInt(newAreaCapacity);
    if (isNaN(capacity) || capacity <= 0) {
      showSnackbar('Please enter a valid capacity number', 'error');
      return;
    }

    if (!user) {
      showSnackbar('User not authenticated', 'error');
      return;
    }

    try {
      await addArea(newAreaName.trim(), capacity, user.uid, user.email || '');
      showSnackbar(`Area Added: ${newAreaName} has been successfully added.`, 'success');
      setNewAreaName('');
      setNewAreaCapacity('');
    } catch (error) {
      console.error('Error adding area:', error);
      showSnackbar('Error adding area', 'error');
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      showSnackbar('Please enter an email address', 'warning');
      return;
    }

    if (!user) {
      showSnackbar('User not authenticated', 'error');
      return;
    }

    try {
      await addAdmin(newAdminEmail.trim(), user.uid, user.email || '');
      showSnackbar(`Admin Added: ${newAdminEmail} has been added as an administrator.`, 'success');
      setNewAdminEmail('');
      loadAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      showSnackbar('Error adding admin', 'error');
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    try {
      await removeAdmin(adminId);
      showSnackbar('Admin removed successfully', 'success');
      loadAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
      showSnackbar('Error removing admin', 'error');
    }
  };

  const handleEditArea = (area: Area) => {
    setSelectedArea(area);
    setEditForm({
      name: area.name,
      maxCapacity: area.maxCapacity.toString(),
      status: area.status,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedArea) return;

    const capacity = parseInt(editForm.maxCapacity);
    if (isNaN(capacity) || capacity <= 0) {
      showSnackbar('Please enter a valid capacity number', 'error');
      return;
    }

    try {
      const updates: Partial<Area> = {
        name: editForm.name.trim(),
        maxCapacity: capacity,
        status: editForm.status,
      };

      // Reset count to 0 when enabling a disabled area
      if (selectedArea.status === 'disabled' && editForm.status === 'enabled') {
        updates.currentCount = 0;
      }

      await updateArea(selectedArea.id, updates);
      showSnackbar('Area Updated', 'success');
      setEditDialogOpen(false);
      setSelectedArea(null);
    } catch (error) {
      console.error('Error updating area:', error);
      showSnackbar('Error updating area', 'error');
    }
  };

  const handleToggleStatus = async (area: Area) => {
    try {
      const newStatus = area.status === 'enabled' ? 'disabled' : 'enabled';
      const updates: Partial<Area> = { status: newStatus };

      // Reset count to 0 when enabling a disabled area
      if (area.status === 'disabled' && newStatus === 'enabled') {
        updates.currentCount = 0;
      }

      await updateArea(area.id, updates);
      showSnackbar(
        `Area Status Changed: ${area.name} is now ${newStatus}.`,
        'success'
      );
    } catch (error) {
      console.error('Error updating area status:', error);
      showSnackbar('Error updating area status', 'error');
    }
  };

  const handleDeleteArea = (area: Area) => {
    setSelectedArea(area);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedArea) return;

    try {
      await deleteArea(selectedArea.id);
      showSnackbar(`Area ${selectedArea.name} has been deleted.`, 'success');
      setDeleteDialogOpen(false);
      setSelectedArea(null);
    } catch (error) {
      console.error('Error deleting area:', error);
      showSnackbar('Error deleting area', 'error');
    }
  };

  const getPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Card sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Area Management" />
          <Tab label="Admin Management" />
        </Tabs>
      </Card>

      {/* Area Management Tab */}
      <TabPanel value={tabValue} index={0}>
        {/* Add New Area Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Add New Area
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="end">
              <TextField
                label="Area Name"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Capacity Limit"
                type="number"
                value={newAreaCapacity}
                onChange={(e) => setNewAreaCapacity(e.target.value)}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleAddArea}
                sx={{ minWidth: 120 }}
              >
                Add Area
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Current Areas Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Area Capacities & Management
            </Typography>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Area Name</TableCell>
                    <TableCell align="center">Current / Max</TableCell>
                    <TableCell align="center">Percentage Full</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Created By</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {areas.map((area) => (
                    <TableRow key={area.id}>
                      <TableCell>{area.name}</TableCell>
                      <TableCell align="center">
                        {area.currentCount} / {area.maxCapacity}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${getPercentage(area.currentCount, area.maxCapacity)}%`}
                          color={
                            getPercentage(area.currentCount, area.maxCapacity) > 80
                              ? 'error'
                              : getPercentage(area.currentCount, area.maxCapacity) > 60
                              ? 'warning'
                              : 'success'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={area.status}
                          color={area.status === 'enabled' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption" color="text.secondary">
                          {area.createdBy || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleEditArea(area)}
                          size="small"
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleToggleStatus(area)}
                          size="small"
                          color={area.status === 'enabled' ? 'warning' : 'success'}
                        >
                          {area.status === 'enabled' ? <ToggleOff /> : <ToggleOn />}
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteArea(area)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Admin Management Tab */}
      <TabPanel value={tabValue} index={1}>
        {/* Add New Admin Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Add New Administrator
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Add users by their email address. They must sign in with Google using this email to gain admin access.
              </Typography>
            </Alert>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="end">
              <TextField
                label="Admin Email Address"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                fullWidth
                placeholder="user@example.com"
              />
              <Button
                variant="contained"
                onClick={handleAddAdmin}
                startIcon={<PersonAddIcon />}
                sx={{ minWidth: 140 }}
              >
                Add Admin
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Current Admins Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Administrators
            </Typography>
            {loadingAdmins ? (
              <Typography>Loading administrators...</Typography>
            ) : (
              <List>
                {admins.map((admin) => (
                  <ListItem key={admin.uid} divider>
                    <ListItemText
                      primary={admin.email}
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={admin.status}
                            color={admin.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Added by: {admin.addedBy}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            • {new Date(admin.addedAt).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      {admin.status === 'active' && admin.email !== user?.email && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemoveAdmin(admin.uid)}
                        >
                          Remove
                        </Button>
                      )}
                      {admin.email === user?.email && (
                        <Chip label="You" size="small" color="primary" />
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {admins.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No administrators found"
                      secondary="Add the first administrator using the form above"
                    />
                  </ListItem>
                )}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Admin Instructions */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <AdminIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Administrator Instructions
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Adding Admins:</strong> Enter the email address of users you want to make administrators. 
              They must sign in to the application using Google OAuth with the exact email address you specify.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Admin Privileges:</strong> Administrators can add/edit/delete areas, manage other administrators, 
              and access this admin dashboard.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Security:</strong> Only active administrators can access this panel. 
              Users without admin privileges will see an access denied message.
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Important:</strong> Be careful when adding administrators. 
                They will have full control over the system including the ability to add/remove other admins.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Area</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Area Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Capacity Limit"
              type="number"
              value={editForm.maxCapacity}
              onChange={(e) => setEditForm({ ...editForm, maxCapacity: e.target.value })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.status === 'enabled'}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.checked ? 'enabled' : 'disabled',
                    })
                  }
                />
              }
              label="Enable Area"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the area "{selectedArea?.name}"? 
            This action cannot be undone and will also delete all associated audit logs.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
