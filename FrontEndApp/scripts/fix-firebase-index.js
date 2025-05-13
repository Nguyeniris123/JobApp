// Firebase index deployment script for fixing the query issues
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to your indexes file
const indexesPath = path.join(__dirname, '..', 'firebase', 'firestore.indexes.json');

// Log the current directory and file path
console.log('Script directory:', __dirname);
console.log('Indexes file path:', indexesPath);

// Check if the file exists
if (!fs.existsSync(indexesPath)) {
  console.error(`Error: Indexes file not found at ${indexesPath}`);
  process.exit(1);
}

// Read the indexes file to verify its content
try {
  const indexesContent = fs.readFileSync(indexesPath, 'utf8');
  console.log('Indexes content:', indexesContent);
} catch (err) {
  console.error('Error reading indexes file:', err);
  process.exit(1);
}

// Function to deploy Firebase indexes
function deployIndexes() {
  console.log('Deploying Firestore indexes...');
  
  // Use firebase-tools CLI to deploy the indexes
  // Make sure firebase-tools is installed globally or locally
  const command = `firebase deploy --only firestore:indexes --project jobappchat`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error deploying indexes: ${error.message}`);
      console.log('You may need to install firebase-tools:');
      console.log('npm install -g firebase-tools');
      console.log('Then login with: firebase login');
      return;
    }
    
    if (stderr) {
      console.error(`Deployment stderr: ${stderr}`);
      return;
    }
    
    console.log(`Deployment stdout: ${stdout}`);
    console.log('Firestore indexes deployed successfully!');
    console.log('The "failed-precondition" error should now be resolved.');
  });
}

// Alternative method: Open the index creation URL directly
function openIndexCreationUrl() {
  console.log('Alternative method: Opening index creation URL...');
  
  // URL from the error message
  const indexUrl = 'https://console.firebase.google.com/v1/r/project/jobappchat/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9qb2JhcHBjaGF0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9jaGF0Um9vbXMvaW5kZXhlcy9fEAEaDwoLcmVjcnVpdGVySWQQARoYChRsYXN0TWVzc2FnZVRpbWVzdGFtcBACGgwKCF9fbmFtZV9fEAI';
  
  // Determine the appropriate command based on the OS
  let command;
  if (process.platform === 'win32') {
    command = `start ${indexUrl}`;
  } else if (process.platform === 'darwin') {
    command = `open "${indexUrl}"`;
  } else {
    command = `xdg-open "${indexUrl}"`;
  }
  
  exec(command, (error) => {
    if (error) {
      console.error(`Error opening URL: ${error.message}`);
      console.log('Please manually visit the URL:');
      console.log(indexUrl);
      return;
    }
    
    console.log('Browser opened with the index creation URL');
    console.log('Follow the instructions in the browser to create the index');
  });
}

// Check command line arguments
if (process.argv.includes('--open-url')) {
  openIndexCreationUrl();
} else {
  deployIndexes();
}
