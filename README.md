# GE Counter - Event Space Capacity Management

A modern, minimalistic web application for managing event space capacity and attendance with real-time updates and an administrative dashboard.

## Technology Stack

- **Frontend**: React with TypeScript, Vite, Material-UI
- **Backend/Database**: Firebase Firestore
- **State Management**: React Context API

## Features

### Core Features
- **Google Authentication**: Secure Firebase Auth with Google OAuth
- **Admin Role Management**: Role-based access control for area management
- **Home Dashboard**: Real-time overview of all event spaces
- **Area Management**: Full CRUD operations for event areas (admin-only)
- **Manual Counter**: Real-time entry/exit tracking with visual feedback
- **Per-Area Auditing**: Individual audit documents for each area
- **Real-time Sync**: Live updates across all connected clients
- **Mobile Responsive**: Optimized for all device sizes

### User Interface
- Modern and minimalistic design
- Material-UI components with custom theming
- Responsive layout for desktop and mobile
- Toast notifications for user feedback
- Progress indicators and status chips

## Project Structure

```
ge-counter/
├── src/
│   ├── components/          # React components
│   │   ├── Layout.tsx       # Main layout with navigation
│   │   ├── Login.tsx        # Authentication component
│   │   ├── SelectArea.tsx   # Area selection interface
│   │   ├── ManualCounter.tsx # Counter interface
│   │   └── AdminDashboard.tsx # Admin management panel
│   ├── contexts/            # React contexts
│   │   └── AppContext.tsx   # Global state management
│   ├── services/            # External service integrations
│   │   ├── firebase.ts      # Firebase configuration
│   │   └── firestore.ts     # Firestore operations
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Interface definitions
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── .env                     # Environment variables
```

## Setup Instructions

### 1. Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase project with Firestore enabled

### 2. Firebase Setup

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Follow the setup wizard

2. **Enable Authentication**:
   - In your Firebase project, go to "Authentication"
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Google" sign-in provider
   - Add your domain (localhost:5173 for development)
   - Configure OAuth consent screen if prompted

3. **Enable Firestore**:
   - In your Firebase project, go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Select your preferred location

4. **Get Firebase Configuration**:
   - Go to Project Settings → General
   - Scroll down to "Your apps" section
   - Click "Add app" → Web app
   - Register your app and copy the configuration

5. **Configure Firestore Security Rules** (Updated for Authentication):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // For development - allow authenticated users
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
       
       // For public demo (less secure, development only)
       // match /{document=**} {
       //   allow read, write: if true;
       // }
     }
   }
   ```

### 3. Local Development Setup

1. **Clone and Install Dependencies**:
   ```bash
   cd ge-counter
   npm install
   ```

2. **Environment Configuration**:
   Update the `.env` file with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   Open your browser and navigate to `http://localhost:5173`

### 4. Production Build

```bash
npm run build
npm run preview
```

## Usage Guide

### Authentication
- Click "Continue with Google" to sign in
- Uses secure Firebase Authentication
- Your Google profile info is used for personalization
- The system will log you in and redirect to the dashboard

### Admin Setup (First Time)

**Option 1: Development Script (Recommended)**
1. **Download Service Account Key**: 
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in project root
2. **Run Admin Setup Script**:
   ```bash
   npm run add-admin
   ```
3. **Follow the prompts** to enter admin email
4. **Sign in** with Google using that email address

**Option 2: Manual Database Setup**
1. **Add First Administrator**: 
   - Go to Firebase Console → Firestore Database
   - Create collection `admins`
   - Add document with your email as ID:
   ```json
   {
     "email": "your-email@example.com",
     "addedAt": "2025-01-15T10:00:00.000Z",
     "addedBy": "system",
     "status": "active"
   }
   ```
   - Sign in with Google using that email address

**Option 3: Browser Tool**
1. **Configure and open** `scripts/add-admin-browser.html`
2. **Update Firebase config** in the HTML file
3. **Enter admin email** and click "Add Administrator"

2. **Verify Admin Access**: Check that you can see "Admin Dashboard" in the menu

### Area Management (Admin Only)
1. Access via hamburger menu → "Admin Dashboard"
2. **Add New Areas**: Enter name and capacity, click "Add Area"
3. **Manage Existing Areas**: 
   - Edit: Modify name, capacity, or enable/disable status
   - Toggle: Enable/disable areas (disabled areas reset counter to 0)
   - Delete: Remove areas permanently (with confirmation)
4. **Admin Management**: Add/remove other administrators by email

### Dashboard & Area Selection
1. **Home Dashboard**: View all active areas with real-time occupancy
2. **Quick Stats**: See total capacity, current occupancy, and usage percentages
3. **Area Cards**: Click any area card to start tracking attendance
4. **Visual Indicators**: Color-coded progress bars and percentage chips

### Manual Counting
1. Click on any area from the dashboard or select from dropdown
2. Use "Enter" button to increment count
3. Use "Exit" button to decrement count
4. Monitor real-time capacity percentage and visual indicators
5. Use "Change Area" to return to dashboard

### Real-time Features
- All connected clients see live updates
- Changes in admin panel immediately reflect in counter screens
- Audit logs track all entry/exit activities with timestamps

## Firestore Data Model

### Areas Collection (`areas/{areaId}`)
```typescript
{
  id: string;              // Auto-generated document ID
  name: string;            // Area name (e.g., "Main Hall")
  maxCapacity: number;     // Maximum allowed capacity
  currentCount: number;    // Current occupancy count
  status: 'enabled' | 'disabled'; // Area availability status
  createdAt: string;       // ISO timestamp of creation
  createdBy: string;       // Email of admin who created it
}
```

### Per-Area Audit Collection (`audits/{areaId}`)
```typescript
{
  areaId: string;          // Reference to area ID
  areaName: string;        // Area name for reference
  lastUpdated: string;     // Last modification timestamp
  logEntries: [            // Array of log entries
    {
      type: 'IN' | 'OUT';  // Entry or exit
      areaId: string;      // Reference to area
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

## Key Features Explained

### Per-Area Audit System
- Each area has its own audit document for better scalability
- Uses Firestore's `arrayUnion` for efficient log entry appending
- Prevents single document size limitations
- Automatic cleanup when areas are deleted

### Admin Role Management
- Email-based admin system for secure access control
- Only admins can create, modify, or delete areas
- Admin management interface for adding/removing administrators
- Clear separation between admin and user experiences

### Real-time Synchronization
- Utilizes Firestore's `onSnapshot` for live updates
- Counter screens update instantly when entries/exits occur
- Admin changes propagate immediately to all connected clients

### Reset Counter Logic
- When an area is disabled and re-enabled, counter resets to 0
- Provides convenient event reset functionality
- Maintains data integrity across sessions

## Development Notes

### State Management
- Uses React Context API for global state
- Minimal overhead for this application scale
- Easy to extend for additional features

### Error Handling
- Comprehensive try-catch blocks for all Firestore operations
- User-friendly error messages via toast notifications
- Graceful degradation for network issues

### Performance Considerations
- Efficient Firestore queries with real-time listeners
- Optimized re-renders using React best practices
- Lazy loading and code splitting opportunities for larger scales

## Future Enhancements

- QR code scanning functionality
- User authentication with roles
- Advanced analytics and reporting
- Export capabilities for audit logs
- Multi-event support
- Mobile app version

## Troubleshooting

### Common Issues

1. **Firebase Connection Errors**:
   - Verify `.env` configuration
   - Check Firebase project settings
   - Ensure Firestore is enabled

2. **Build Errors**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run lint`

3. **Real-time Updates Not Working**:
   - Check browser console for WebSocket errors
   - Verify Firestore security rules
   - Test with multiple browser tabs

## Support

For issues and questions:
1. Check the browser console for error messages
2. Verify Firebase configuration and connectivity
3. Review Firestore security rules
4. Test with different browsers/devices

## License

This project is for demonstration purposes. Adjust licensing as needed for your use case.
