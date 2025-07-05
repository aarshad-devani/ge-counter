#!/usr/bin/env node

/**
 * DEV ONLY SCRIPT: Add First Admin User
 * 
 * This script helps developers add the first administrator to the GE Counter application.
 * It should only be used during development setup.
 * 
 * Usage: npm run add-admin
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const readline = require('readline');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════════════════════════╗
║                    GE Counter - Admin Setup                     ║
║                      Development Script                         ║
╚══════════════════════════════════════════════════════════════════╝
${colors.reset}`);

console.log(`${colors.yellow}⚠️  WARNING: This is a development-only script!${colors.reset}`);
console.log(`${colors.yellow}   Do not use this in production environments.${colors.reset}\n`);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Main function
async function addFirstAdmin() {
  try {
    console.log(`${colors.blue}Setting up your first administrator...${colors.reset}\n`);

    // Get email from user
    let email;
    while (true) {
      email = await ask(`${colors.cyan}Enter the admin email address: ${colors.reset}`);
      
      if (!email.trim()) {
        console.log(`${colors.red}❌ Email cannot be empty. Please try again.${colors.reset}\n`);
        continue;
      }
      
      if (!isValidEmail(email.trim())) {
        console.log(`${colors.red}❌ Invalid email format. Please enter a valid email address.${colors.reset}\n`);
        continue;
      }
      
      break;
    }

    email = email.trim().toLowerCase();

    // Confirm with user
    console.log(`\n${colors.yellow}You are about to add the following user as an administrator:${colors.reset}`);
    console.log(`${colors.bright}Email: ${email}${colors.reset}`);
    
    const confirm = await ask(`\n${colors.cyan}Do you want to proceed? (y/N): ${colors.reset}`);
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log(`${colors.yellow}Operation cancelled.${colors.reset}`);
      rl.close();
      return;
    }

    // Initialize Firebase Admin
    console.log(`\n${colors.blue}Initializing Firebase connection...${colors.reset}`);
    
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
      console.log(`\n${colors.yellow}Please download your Firebase service account key and save it as:${colors.reset}`);
      console.log(`${colors.bright}   • serviceAccountKey.json${colors.reset}`);
      console.log(`${colors.bright}   • firebase-service-account.json${colors.reset}`);
      console.log(`${colors.bright}   • config/serviceAccountKey.json${colors.reset}`);
      console.log(`\n${colors.cyan}How to get the service account key:${colors.reset}`);
      console.log(`1. Go to Firebase Console → Project Settings → Service Accounts`);
      console.log(`2. Click "Generate new private key"`);
      console.log(`3. Save the downloaded file as serviceAccountKey.json in your project root`);
      rl.close();
      return;
    }

    // Initialize Firebase
    const serviceAccount = require(path.resolve(serviceAccountPath));
    
    if (!serviceAccount.project_id) {
      console.log(`${colors.red}❌ Invalid service account key format!${colors.reset}`);
      rl.close();
      return;
    }

    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    const db = getFirestore();

    console.log(`${colors.green}✅ Connected to Firebase project: ${serviceAccount.project_id}${colors.reset}`);

    // Check if admin already exists
    console.log(`\n${colors.blue}Checking if admin already exists...${colors.reset}`);
    const adminDoc = await db.collection('admins').doc(email).get();
    
    if (adminDoc.exists()) {
      const adminData = adminDoc.data();
      console.log(`\n${colors.yellow}⚠️  Admin already exists!${colors.reset}`);
      console.log(`${colors.bright}Email: ${adminData.email}${colors.reset}`);
      console.log(`${colors.bright}Status: ${adminData.status}${colors.reset}`);
      console.log(`${colors.bright}Added by: ${adminData.addedBy}${colors.reset}`);
      console.log(`${colors.bright}Added at: ${new Date(adminData.addedAt).toLocaleString()}${colors.reset}`);
      
      const overwrite = await ask(`\n${colors.cyan}Do you want to update this admin? (y/N): ${colors.reset}`);
      
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log(`${colors.yellow}Operation cancelled.${colors.reset}`);
        rl.close();
        return;
      }
    }

    // Add/update admin
    console.log(`\n${colors.blue}Adding administrator...${colors.reset}`);
    
    const adminData = {
      email: email,
      addedAt: new Date().toISOString(),
      addedBy: 'dev-script',
      status: 'active'
    };

    await db.collection('admins').doc(email).set(adminData);

    console.log(`\n${colors.green}${colors.bright}🎉 SUCCESS! Administrator added successfully!${colors.reset}`);
    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log(`1. ${colors.bright}Sign in to the GE Counter app using Google OAuth${colors.reset}`);
    console.log(`2. ${colors.bright}Use the exact email: ${email}${colors.reset}`);
    console.log(`3. ${colors.bright}You will automatically have admin privileges${colors.reset}`);
    console.log(`4. ${colors.bright}Access Admin Dashboard from the hamburger menu${colors.reset}`);

    console.log(`\n${colors.yellow}Remember to:${colors.reset}`);
    console.log(`• Delete this script from production environments`);
    console.log(`• Keep your service account key secure`);
    console.log(`• Use the admin panel to add additional administrators`);

  } catch (error) {
    console.log(`\n${colors.red}❌ Error adding administrator:${colors.reset}`);
    console.log(`${colors.red}${error.message}${colors.reset}`);
    
    if (error.code === 'permission-denied') {
      console.log(`\n${colors.yellow}💡 This might be a Firestore permissions issue.${colors.reset}`);
      console.log(`Check your Firebase service account permissions.`);
    } else if (error.code === 'not-found') {
      console.log(`\n${colors.yellow}💡 Make sure your Firebase project exists and Firestore is enabled.${colors.reset}`);
    }
  } finally {
    rl.close();
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log(`\n\n${colors.yellow}Script interrupted. Goodbye!${colors.reset}`);
  rl.close();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  addFirstAdmin().catch((error) => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}

module.exports = { addFirstAdmin };
