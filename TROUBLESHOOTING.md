# 🔧 Admin Not Showing Up - Troubleshooting Guide

## 🚨 Quick Troubleshooting Steps

### Step 1: Run the Debug Script
```bash
npm run debug-admin
```
This will check if your admin document exists and is properly configured.

### Step 2: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Sign in to the GE Counter app
4. Look for debug messages starting with 🔍, 👤, 🔐, ✅, or ❌

### Step 3: Verify Admin Document
The admin document should be in Firestore with this exact structure:

**Collection**: `admins`
**Document ID**: Your exact email address (e.g., `user@company.com`)
**Document Data**:
```json
{
  "email": "user@company.com",
  "addedAt": "2025-01-15T10:00:00.000Z",
  "addedBy": "system",
  "status": "active"
}
```

## 🔍 Common Issues & Solutions

### Issue 1: Email Mismatch
**Problem**: Google sign-in email doesn't match admin document ID

**Check**:
- Admin document ID: `john.doe@company.com`
- Google sign-in email: `johndoe@company.com`

**Solution**: 
- Use the EXACT email from Google sign-in as the document ID
- Check for spaces, dots, case differences

### Issue 2: Document Not Found
**Problem**: No admin document exists in Firestore

**Solution**:
```bash
npm run add-admin
```
Or manually create in Firebase Console.

### Issue 3: Wrong Status
**Problem**: Admin document exists but status is not "active"

**Solution**: Update the document in Firebase Console:
```json
{
  "status": "active"
}
```

### Issue 4: Case Sensitivity
**Problem**: Email case doesn't match

**Examples**:
- Document ID: `John.Doe@Company.com`
- Sign-in email: `john.doe@company.com`

**Solution**: Use lowercase for both or ensure exact match.

### Issue 5: Firestore Rules
**Problem**: Security rules prevent admin check

**Check your firestore.rules**:
```javascript
match /admins/{adminId} {
  allow read: if request.auth != null && 
    exists(/databases/$(database)/documents/admins/$(request.auth.token.email)) &&
    get(/databases/$(database)/documents/admins/$(request.auth.token.email)).data.status == 'active';
}
```

## 🛠️ Manual Verification Steps

### 1. Check Exact Email
```bash
# In browser console after signing in:
console.log('My email:', firebase.auth().currentUser.email);
```

### 2. Check Admin Document Exists
```bash
# Run this to see all admin documents:
npm run debug-admin
```

### 3. Test Firebase Connection
```javascript
// In browser console:
import { getFirestore, doc, getDoc } from 'firebase/firestore';
const db = getFirestore();
const adminDoc = await getDoc(doc(db, 'admins', 'your-email@company.com'));
console.log('Admin doc exists:', adminDoc.exists());
console.log('Admin data:', adminDoc.data());
```

## 🔧 Quick Fixes

### Fix 1: Recreate Admin Document
```bash
npm run add-admin
# Enter your exact Google sign-in email
```

### Fix 2: Update Existing Document
1. Go to Firebase Console → Firestore
2. Find `admins` collection
3. Find your email document
4. Set `status` to `"active"`

### Fix 3: Clear Cache and Retry
1. Sign out of the app
2. Clear browser cache
3. Sign in again
4. Check browser console for debug messages

## 📋 Debug Checklist

Use this checklist to systematically check each component:

- [ ] **Firebase Project**: Correct project connected
- [ ] **Firestore Enabled**: Database is active
- [ ] **Admin Document**: Document exists with correct email ID
- [ ] **Document Status**: `status` field is `"active"`
- [ ] **Email Match**: Google sign-in email matches document ID exactly
- [ ] **Security Rules**: Firestore rules allow admin reads
- [ ] **Console Logs**: No errors in browser console
- [ ] **Network**: No network connectivity issues

## 🆘 Still Not Working?

If admin access still doesn't work after these steps:

1. **Check Debug Script Output**:
   ```bash
   npm run debug-admin
   ```

2. **Share Console Output**: Copy the browser console messages starting with 🔍

3. **Verify Firestore Data**: 
   - Firebase Console → Firestore
   - Check `admins` collection
   - Verify document structure

4. **Test with Different Email**: Try creating admin with a different email address

5. **Check Firebase Auth**: Ensure Google OAuth is properly configured

## 🔍 Debug Script Details

The debug script (`npm run debug-admin`) will:
- ✅ Check if admin document exists
- ✅ Verify document structure and data
- ✅ Show all existing admin documents
- ✅ Highlight any mismatches or issues
- ✅ Offer to create/fix admin document

**Example output**:
```
✅ Admin document found!
Document details:
  Email: john@company.com
  Status: active
  Added by: dev-script
  Added at: 1/15/2025, 10:00:00 AM
✅ Admin status is active
✅ Email matches exactly
```

---

**Most Common Fix**: Run `npm run debug-admin` and follow the prompts to recreate the admin document with the correct email address.
