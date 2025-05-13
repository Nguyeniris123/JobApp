// This script deploys Firebase security rules
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to your rules file
const rulesPath = path.join(__dirname, '..', 'firebase', 'firestore.rules');

// Log in to Firebase (Make sure you've run firebase login first)
function deployRules() {
  try {
    console.log('Deploying Firestore rules to Firebase...');
    console.log('Rules path:', rulesPath);
    
    // Read the rules file to verify it exists
    if (fs.existsSync(rulesPath)) {
      const rules = fs.readFileSync(rulesPath, 'utf8');
      console.log('Rules found, length:', rules.length);
    } else {
      console.error('Rules file not found at:', rulesPath);
      return;
    }
    
    // Use command line to deploy rules - more reliable than the Node.js API
    const command = 'firebase deploy --only firestore:rules --project jobappchat';
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        console.log('Make sure you have firebase-tools installed globally:');
        console.log('npm install -g firebase-tools');
        console.log('And that you are logged in:');
        console.log('firebase login');
        return;
      }
      
      console.log('Command output:', stdout);
      console.log('Firestore rules deployed successfully!');
    });
  } catch (error) {
    console.error('Error deploying Firestore rules:', error);
  }
}

deployRules();
