#!/usr/bin/env node

/**
 * DEBUG SCRIPT: Check Admin Status
 * 
 * This script helps debug admin access issues by checking:
 * 1. If admin document exists in Firestore
 * 2. Admin document structure and data
 * 3. Email comparison between auth and admin document
 * 
 * Usage: npm run debug-admin
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const readline = require('readline');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════════════════════════╗
║                  GE Counter - Admin Debug Tool                  ║
║                      Troubleshooting Script                     ║
╚══════════════════════════════════════════════════════════════════╝
${colors.reset}`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function debugAdmin() {
  try {
    console.log(`${colors.blue}Initializing Firebase connection...${colors.reset}`);
    
    // Try to load service account key
    let serviceAccountPath;
    const possiblePaths = [
      './serviceAccountKey.json',
      './firebase-service-account.json',
      './config/serviceAccountKey.json',
      process.env.GOOGLE_APPLICATION_CREDENTIALS
    ].filter(Boolean);

    for (const pathToTry of possiblePaths) {
      try {
        require.resolve(path.resolve(pathToTry));
        serviceAccountPath = pathToTry;
        break;
      } catch (e) {
        // File doesn't exist, try next
      }
    }

    if (!serviceAccountPath) {
      console.log(`${colors.red}❌ Service account key not found!${colors.reset}`);
      console.log(`Please ensure you have a service account key file.`);
      rl.close();
      return;
    }

    // Initialize Firebase
    const serviceAccount = require(path.resolve(serviceAccountPath));
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    const db = getFirestore();
    console.log(`${colors.green}✅ Connected to Firebase project: ${serviceAccount.project_id}${colors.reset}`);

    // Get email to check
    const email = await ask(`${colors.cyan}Enter the email address to debug: ${colors.reset}`);
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`\n${colors.blue}Debugging admin status for: ${normalizedEmail}${colors.reset}`);

    // Check if admin document exists
    console.log(`\n${colors.yellow}1. Checking admin document...${colors.reset}`);
    const adminDoc = await db.collection('admins').doc(normalizedEmail).get();
    
    if (!adminDoc.exists()) {
      console.log(`${colors.red}❌ Admin document NOT FOUND for email: ${normalizedEmail}${colors.reset}`);
      console.log(`\n${colors.yellow}Possible solutions:${colors.reset}`);
      console.log(`1. Run: npm run add-admin`);
      console.log(`2. Manually create admin document in Firebase Console`);
      console.log(`3. Check if email is spelled correctly`);
      
      // List all existing admins
      console.log(`\n${colors.blue}Checking all existing admins...${colors.reset}`);
      const allAdmins = await db.collection('admins').get();
      
      if (allAdmins.empty) {
        console.log(`${colors.red}❌ No admin documents found in the database!${colors.reset}`);
        console.log(`${colors.yellow}You need to create the first admin using: npm run add-admin${colors.reset}`);
      } else {
        console.log(`${colors.green}Found ${allAdmins.size} admin document(s):${colors.reset}`);
        allAdmins.forEach((doc) => {
          const data = doc.data();
          console.log(`  - ${colors.bright}${doc.id}${colors.reset} (Status: ${data.status}, Added: ${new Date(data.addedAt).toLocaleDateString()})`);
        });
      }
    } else {
      const adminData = adminDoc.data();
      console.log(`${colors.green}✅ Admin document found!${colors.reset}`);
      console.log(`${colors.bright}Document details:${colors.reset}`);
      console.log(`  Email: ${adminData.email}`);
      console.log(`  Status: ${adminData.status}`);
      console.log(`  Added by: ${adminData.addedBy}`);
      console.log(`  Added at: ${new Date(adminData.addedAt).toLocaleString()}`);
      
      // Check status
      if (adminData.status !== 'active') {
        console.log(`${colors.red}❌ Admin status is NOT active: ${adminData.status}${colors.reset}`);
        console.log(`${colors.yellow}Solution: Set status to 'active' in Firebase Console or admin panel${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ Admin status is active${colors.reset}`);
      }
      
      // Check email matching
      if (adminData.email !== normalizedEmail) {
        console.log(`${colors.red}❌ Email mismatch detected!${colors.reset}`);
        console.log(`  Document email: "${adminData.email}"`);
        console.log(`  Checked email: "${normalizedEmail}"`);
        console.log(`${colors.yellow}Solution: Ensure exact email match including case${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ Email matches exactly${colors.reset}`);
      }
    }

    // Check Firestore security rules
    console.log(`\n${colors.yellow}2. Checking Firestore security rules...${colors.reset}`);
    console.log(`${colors.blue}Please verify your Firestore rules include:${colors.reset}`);
    console.log(`
match /admins/{adminId} {
  allow read, write: if request.auth != null && 
    exists(/databases/$(database)/documents/admins/$(request.auth.token.email)) &&
    get(/databases/$(database)/documents/admins/$(request.auth.token.email)).data.status == 'active';
}
    `);

    // Check authentication token
    console.log(`\n${colors.yellow}3. Authentication troubleshooting tips:${colors.reset}`);
    console.log(`${colors.blue}In the browser, check these steps:${colors.reset}`);
    console.log(`1. Open browser DevTools → Console`);
    console.log(`2. Sign in to the app with Google OAuth`);
    console.log(`3. Check if the Google account email exactly matches: ${normalizedEmail}`);
    console.log(`4. Look for any console errors related to Firestore or authentication`);
    
    console.log(`\n${colors.yellow}4. Manual verification steps:${colors.reset}`);
    console.log(`${colors.blue}To verify the admin system is working:${colors.reset}`);
    console.log(`1. Sign out of the GE Counter app`);
    console.log(`2. Sign in using the exact email: ${normalizedEmail}`);
    console.log(`3. Check if "Admin Dashboard" appears in the hamburger menu`);
    console.log(`4. If not visible, check browser console for errors`);

    console.log(`\n${colors.green}${colors.bright}Debug complete!${colors.reset}`);
    
    const createAdmin = await ask(`\n${colors.cyan}Would you like to create/update this admin now? (y/N): ${colors.reset}`);
    
    if (createAdmin.toLowerCase() === 'y' || createAdmin.toLowerCase() === 'yes') {
      const adminData = {
        email: normalizedEmail,
        addedAt: new Date().toISOString(),
        addedBy: 'debug-script',
        status: 'active'
      };
      
      await db.collection('admins').doc(normalizedEmail).set(adminData);
      console.log(`${colors.green}✅ Admin created/updated successfully!${colors.reset}`);
    }

  } catch (error) {
    console.log(`\n${colors.red}❌ Debug error:${colors.reset}`);
    console.log(`${colors.red}${error.message}${colors.reset}`);
    
    if (error.code === 'permission-denied') {
      console.log(`\n${colors.yellow}💡 Permission denied - check your Firebase service account permissions${colors.reset}`);
    }
  } finally {
    rl.close();
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log(`\n\n${colors.yellow}Debug interrupted. Goodbye!${colors.reset}`);
  rl.close();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  debugAdmin().catch((error) => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}
