# Firebase Debug Guide

This guide explains how to use the Firebase Debug feature to diagnose and fix the "Missing or insufficient permissions" error in the Firebase chat implementation.

## Accessing the Firebase Debug Screen

There are several ways to access the Firebase Debug screen:

1. **From the Candidate Home Screen**:
   - On the Home screen, you'll see a "Firebase Debug" button in the header
   - Tap on this button to open the Firebase Debug screen

2. **From the Recruiter Home Screen**:
   - On the Home screen, there is a "Firebase Debug" button under the company name
   - Tap on this button to access the debug screen

3. **Using the Floating Debug Button**:
   - A floating "Debug" button is available in development mode
   - This button appears in the bottom-right corner of the screen
   - You can access it from anywhere in the app

4. **Via Navigation**:
   - You can navigate directly to the debug screen using:
   ```javascript
   navigation.navigate('FirebaseDebug');
   ```

## Using the Firebase Debug Screen

Once you've accessed the Firebase Debug screen:

1. Tap the "Test Firebase Connection" button to check if your app can connect to Firebase
2. The screen will display one of two results:
   - **Success**: Your Firebase connection is working correctly
   - **Failure**: There is an issue with your Firebase connection

## Fixing Firebase Permission Errors

If the test shows a connection failure:

1. Check the console logs for specific error messages
2. If you see "Missing or insufficient permissions", follow these steps:

### Option 1: Update Firebase Security Rules

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project ("jobappchat")
3. Navigate to **Firestore Database** → **Rules**
4. Replace the existing rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chatRooms/{roomId} {
      allow read, write: if true;
      
      match /messages/{messageId} {
        allow read, write: if true;
      }
    }
    
    match /test_collection/{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Click "Publish"
6. Return to the app and test the connection again

### Option 2: Use the Deploy Script

If you have the Firebase CLI installed:

1. Open a command prompt
2. Navigate to your project directory
3. Run:
```
cd d:\after173\HK2Nam3\CNNLTHD\JobApp\FrontEndApp
node scripts/deploy-firebase-rules.js
```

## Security Warning

The rules above are for development only and allow unrestricted access to your database.

See `docs/firebase-permissions-solution.md` for secure production options.
