// Script to fix Chat implementation for Firestore Rules
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const copyFile = promisify(fs.copyFile);
const exists = promisify(fs.exists);

/**
 * Update Chat files to work with new Firestore rules
 */
async function updateChatFiles() {
  try {
    console.log('🔍 Checking ChatService files...');

    // 1. Check if we have the fixed service file
    const serviceFixedPath = path.resolve(__dirname, '../services/ChatService.fixed.js');
    const serviceOrigPath = path.resolve(__dirname, '../services/ChatService.js');
    const serviceBackupPath = path.resolve(__dirname, '../services/ChatService.backup.js');

    if (!(await exists(serviceFixedPath))) {
      console.error('❌ ChatService.fixed.js not found. Cannot proceed with the update.');
      return;
    }

    // 2. Back up original files if needed
    console.log('💾 Backing up original files...');

    if (await exists(serviceOrigPath) && !(await exists(serviceBackupPath))) {
      await copyFile(serviceOrigPath, serviceBackupPath);
      console.log('✅ Backed up ChatService.js');
    }

    // Candidate chat screen
    const candidateScreenPath = path.resolve(__dirname, '../screen/candidate/ChatScreen.js');
    const candidateScreenBackup = path.resolve(__dirname, '../screen/candidate/ChatScreen.backup.js');
    const candidateScreenImproved = path.resolve(__dirname, '../screen/candidate/ChatScreen.improved.js');

    if (await exists(candidateScreenPath) && !(await exists(candidateScreenBackup))) {
      await copyFile(candidateScreenPath, candidateScreenBackup);
      console.log('✅ Backed up candidate ChatScreen.js');
    }

    // Recruiter chat screen
    const recruiterScreenPath = path.resolve(__dirname, '../screen/recruiter/ChatScreen.js');
    const recruiterScreenBackup = path.resolve(__dirname, '../screen/recruiter/ChatScreen.backup.js');
    const recruiterScreenImproved = path.resolve(__dirname, '../screen/recruiter/ChatScreen.improved.js');

    if (await exists(recruiterScreenPath) && !(await exists(recruiterScreenBackup))) {
      await copyFile(recruiterScreenPath, recruiterScreenBackup);
      console.log('✅ Backed up recruiter ChatScreen.js');
    }

    // 3. Apply the fixes
    console.log('🔧 Applying fixes...');

    // Copy fixed service
    await copyFile(serviceFixedPath, serviceOrigPath);
    console.log('✅ Updated ChatService.js with fixed implementation');

    // If improved screens exist, use them
    if (await exists(candidateScreenImproved)) {
      await copyFile(candidateScreenImproved, candidateScreenPath);
      console.log('✅ Updated candidate ChatScreen.js');
    } else {
      console.warn('⚠️ Improved candidate ChatScreen not found, skipping');
    }

    if (await exists(recruiterScreenImproved)) {
      await copyFile(recruiterScreenImproved, recruiterScreenPath);
      console.log('✅ Updated recruiter ChatScreen.js');
    } else {
      console.warn('⚠️ Improved recruiter ChatScreen not found, skipping');
    }

    console.log('🎉 Chat implementation has been successfully updated!');
    console.log('ℹ️ If you encounter issues, you can restore the original files using the .backup versions');

  } catch (error) {
    console.error('❌ Error updating chat files:', error);
  }
}

// Execute the update
updateChatFiles().catch(console.error);
