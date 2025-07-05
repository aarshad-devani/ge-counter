# 🛠️ Development Scripts - Add First Admin

This directory contains development-only scripts to help you set up the first administrator for your GE Counter application.

## ⚠️ **Important: Development Only**

These scripts are **ONLY for development environments**. Never use them in production. Always remove them before deploying to production.

## 📂 **Available Scripts**

### 1. **Node.js Script** (`add-first-admin.js`)
A command-line script that uses Firebase Admin SDK to add administrators.

**Usage:**
```bash
npm run add-admin
```

**Prerequisites:**
- Node.js installed
- Firebase Admin SDK dependency (`firebase-admin`)
- Service account key file

**Features:**
- ✅ Interactive email input with validation
- ✅ Checks for existing admins
- ✅ Colorful terminal output
- ✅ Error handling and helpful messages
- ✅ Confirmation prompts

### 2. **Browser Tool** (`add-admin-browser.html`)
A web-based tool that uses Firebase Web SDK to add administrators.

**Usage:**
1. Update Firebase configuration in the HTML file
2. Open `add-admin-browser.html` in your browser
3. Enter admin email and click "Add Administrator"

**Prerequisites:**
- Firebase Web SDK (loaded via CDN)
- Firebase configuration (from your `.env` file)

**Features:**
- ✅ User-friendly web interface
- ✅ Real-time Firebase integration
- ✅ Visual feedback and instructions
- ✅ No server required

## 🚀 **Quick Setup Guide**

### Method 1: Using Node.js Script (Recommended)

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Get Firebase Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in project root

3. **Run the Script:**
   ```bash
   npm run add-admin
   ```

4. **Follow the Prompts:**
   - Enter the admin email address
   - Confirm the action
   - The script will create the admin document

### Method 2: Using Browser Tool

1. **Configure Firebase:**
   - Open `scripts/add-admin-browser.html`
   - Replace the Firebase configuration with your actual config:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

2. **Open in Browser:**
   - Open the HTML file in any modern web browser
   - Enter the admin email address
   - Click "Add Administrator"

## 📋 **What These Scripts Do**

Both scripts create a document in the `admins` collection with this structure:

```json
{
  "email": "admin@yourcompany.com",
  "addedAt": "2025-01-15T10:00:00.000Z", 
  "addedBy": "dev-script", // or "dev-tool"
  "status": "active"
}
```

The document ID is the admin's email address, and this enables the admin role checking in the application.

## 🔧 **Troubleshooting**

### Node.js Script Issues

**Error: Service account key not found**
- Make sure you've downloaded the Firebase service account key
- Save it as `serviceAccountKey.json` in the project root
- Alternatively, set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

**Error: Permission denied**
- Check your Firebase service account permissions
- Make sure Firestore is enabled in your Firebase project
- Verify your service account has Firestore write permissions

**Error: Invalid project ID**
- Ensure your service account key is for the correct Firebase project
- Check that the project ID matches your Firestore database

### Browser Tool Issues

**Error: Firebase not configured**
- Update the Firebase configuration in the HTML file
- Use the exact values from your `.env` file
- Make sure all configuration values are correct

**Error: Failed to initialize Firebase**
- Check browser console for detailed error messages
- Verify your Firebase configuration is valid
- Ensure your Firebase project allows web access

## 🔒 **Security Notes**

### For Node.js Script:
- **Never commit service account keys to version control**
- The `.gitignore` file excludes common service account file names
- Store service account keys securely and share them safely
- Delete service account keys when no longer needed

### For Browser Tool:
- **Never deploy this HTML file to production**
- The Firebase configuration in the HTML file is client-side visible
- Use this tool only in development environments
- Remove the script from production builds

## 📝 **After Adding an Admin**

1. **Test Admin Access:**
   - Sign in to GE Counter using Google OAuth
   - Use the exact email address you added as admin
   - Verify you can see "Admin Dashboard" in the menu

2. **Add More Admins:**
   - Use the admin panel in the GE Counter app
   - Navigate to Admin Dashboard → Admin Management
   - Add additional administrators through the web interface

3. **Clean Up:**
   - Delete the service account key file if no longer needed
   - Remove these scripts from production deployments
   - Document who has admin access for your team

## 🎯 **Best Practices**

1. **Limit Initial Admins**: Only add 1-2 initial administrators
2. **Use Work Emails**: Use official company/organization email addresses
3. **Document Access**: Keep track of who has admin privileges
4. **Regular Review**: Periodically review and update admin list
5. **Secure Keys**: Always handle service account keys securely

## 🗑️ **Removing Scripts for Production**

Before deploying to production:

1. **Delete Scripts Directory:**
   ```bash
   rm -rf scripts/
   ```

2. **Remove npm Script:**
   - Remove `"add-admin": "node scripts/add-first-admin.js"` from `package.json`

3. **Remove Dev Dependencies:**
   ```bash
   npm uninstall firebase-admin
   ```

4. **Delete Service Account Keys:**
   ```bash
   rm serviceAccountKey.json
   ```

This ensures your production deployment doesn't include development tools that could be security risks.

---

**Remember**: These tools are powerful and should only be used by developers during initial setup. Always follow security best practices and remove them from production environments.
