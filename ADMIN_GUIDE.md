# Admin Management & Per-Area Auditing Guide

## 🔐 Admin System Overview

The GE Counter now includes a robust admin management system where only designated administrators can access admin functions and create/manage areas.

## 🚀 Major Updates

### 📊 **Per-Area Audit System**
- **Individual Audit Documents**: Each area now has its own audit document under `audits/{areaId}`
- **Efficient Queries**: Faster retrieval of area-specific logs
- **Better Scalability**: Prevents single document size limitations
- **Automatic Cleanup**: When an area is deleted, its audit log is also removed

### 👨‍💼 **Admin Role Management**
- **Admin-Only Access**: Only designated admins can access the admin dashboard
- **Email-Based Admin System**: Add admins by their email addresses
- **Admin Status Tracking**: Active/inactive admin status management
- **Self-Service Restrictions**: Admins cannot remove themselves
- **Access Control**: Non-admin users see "Access Denied" message

## 📋 **How to Add the First Administrator**

### Method 1: Direct Database Addition (Recommended for Setup)

1. **Access Firebase Console**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to Firestore Database

2. **Create Admin Collection**:
   - Click "Start collection"
   - Collection ID: `admins`
   - Document ID: Use the admin's email address (e.g., `admin@company.com`)

3. **Add Admin Document**:
   ```javascript
   {
     "email": "admin@company.com",
     "addedAt": "2025-01-15T10:00:00.000Z",
     "addedBy": "system",
     "status": "active"
   }
   ```

4. **Verify Setup**:
   - The user with email `admin@company.com` must sign in using Google OAuth
   - They will automatically have admin privileges

### Method 2: Using Firebase Admin SDK (For Developers)

```javascript
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

async function addFirstAdmin(email) {
  await db.collection('admins').doc(email).set({
    email: email,
    addedAt: new Date().toISOString(),
    addedBy: 'system',
    status: 'active'
  });
  console.log(`Admin added: ${email}`);
}

// Usage
addFirstAdmin('admin@company.com');
```

## 🔄 **New Data Structure**

### Areas Collection (`areas/{areaId}`)
```typescript
{
  id: string;              // Auto-generated document ID
  name: string;            // Area name
  maxCapacity: number;     // Maximum capacity
  currentCount: number;    // Current occupancy
  status: 'enabled' | 'disabled';
  createdAt: string;       // ISO timestamp
  createdBy: string;       // Email of creator
}
```

### Per-Area Audits (`audits/{areaId}`)
```typescript
{
  areaId: string;          // Reference to area ID
  areaName: string;        // Area name for reference
  lastUpdated: string;     // Last modification timestamp
  logEntries: [            // Array of log entries
    {
      type: 'IN' | 'OUT';  // Entry or exit
      areaId: string;      // Area reference
      timestamp: string;   // ISO timestamp
      userId: string;      // User who made the entry
      userEmail: string;   // User's email
      userDisplayName?: string; // User's display name
    }
  ]
}
```

### Admin Collection (`admins/{email}`)
```typescript
{
  email: string;           // Admin's email address
  addedAt: string;         // When admin was added
  addedBy: string;         // Who added this admin
  status: 'active' | 'inactive'; // Admin status
}
```

## 🔒 **Security Rules Update**

The Firestore security rules now enforce admin-only access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Areas - Read for all, Write for admins only
    match /areas/{areaId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email)) &&
        get(/databases/$(database)/documents/admins/$(request.auth.token.email)).data.status == 'active';
    }
    
    // Audits - Read/Write for authenticated users
    match /audits/{areaId} {
      allow read, write: if request.auth != null;
    }
    
    // Admins - Read/Write for admins only
    match /admins/{adminId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email)) &&
        get(/databases/$(database)/documents/admins/$(request.auth.token.email)).data.status == 'active';
    }
  }
}
```

## 👥 **User Experience Changes**

### For Regular Users:
- **Dashboard**: Can view all areas and track attendance
- **Counter**: Can increment/decrement counts for any area
- **No Admin Access**: Admin dashboard is hidden from navigation
- **Add Area**: "Add New Area" cards are hidden for non-admins

### For Administrators:
- **Full Dashboard Access**: Can manage areas and other admins
- **Admin Panel**: Two-tab interface (Area Management | Admin Management)
- **User Management**: Can add/remove other administrators
- **Area Creation**: Can create, edit, delete, and toggle areas

## 🛠️ **Admin Management Workflow**

### Adding New Admins:
1. Navigate to Admin Dashboard → Admin Management tab
2. Enter the user's email address
3. Click "Add Admin"
4. User must sign in with Google using that exact email
5. They will automatically gain admin privileges

### Managing Existing Admins:
- **View All Admins**: See who added whom and when
- **Remove Admins**: Deactivate admin privileges (cannot remove yourself)
- **Status Tracking**: Active/inactive status display

## 📊 **Audit System Benefits**

### Performance Improvements:
- **Faster Queries**: Area-specific audit retrieval
- **Better Scalability**: No single document size limits
- **Efficient Real-time**: Live updates per area

### Data Organization:
- **Logical Separation**: Each area has its own audit trail
- **Easy Analysis**: Query specific area logs
- **Automatic Cleanup**: Audit logs deleted with areas

## 🚨 **Migration Notes**

If you have existing data from the previous single-document audit system:

1. **Backup Existing Data**: Export current audit logs
2. **Run Migration Script**: Convert single document to per-area documents
3. **Update Security Rules**: Apply new admin-based rules
4. **Add First Admin**: Use the methods described above

## 🔧 **Troubleshooting**

### "Access Denied" Issues:
1. **Check Admin Status**: Verify user is in `admins` collection with `status: 'active'`
2. **Email Match**: Ensure Google sign-in email exactly matches admin document ID
3. **Security Rules**: Verify Firestore rules are properly deployed

### Admin Cannot Be Added:
1. **Authentication**: Ensure you're signed in as an existing admin
2. **Email Format**: Use exact email address format
3. **Firestore Rules**: Check if rules allow admin operations

### Area Creation Fails:
1. **Admin Check**: Verify current user has admin privileges
2. **Network**: Check Firebase connection
3. **Permissions**: Ensure Firestore write permissions are correct

## 📱 **Mobile Considerations**

- **Responsive Design**: Admin panels work on mobile devices
- **Touch-Friendly**: Large buttons and easy navigation
- **Hidden Elements**: Non-admin users see streamlined interface
- **Floating Actions**: Quick admin access on mobile (admin-only)

## 🎯 **Best Practices**

### Admin Management:
- **Limit Admins**: Only add necessary administrators
- **Regular Review**: Periodically review admin list
- **Email Accuracy**: Double-check email addresses before adding
- **Documentation**: Keep track of who has admin access

### Security:
- **Strong Authentication**: Google OAuth provides secure login
- **Role-Based Access**: Clear separation between admin and user roles
- **Audit Trail**: All admin actions are logged
- **Regular Updates**: Keep Firebase security rules current

## 🎉 **Summary**

The enhanced GE Counter now provides:
- ✅ **Secure Admin System**: Role-based access control
- ✅ **Scalable Auditing**: Per-area audit documents
- ✅ **User-Friendly Interface**: Clear admin vs user experiences
- ✅ **Production Ready**: Robust security and error handling
- ✅ **Easy Management**: Intuitive admin panel for all operations

This system ensures that only authorized personnel can manage event spaces while maintaining full audit trails and providing an excellent user experience for all attendees.
