# Firebase Chat Implementation Guide

This document provides an overview of the Firebase chat implementation in the JobApp application.

## Setup Instructions

1. **Create a Firebase project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project 
   - Enable Firestore Database

2. **Update Firebase configuration**:
   - Open the file `firebase/config.js`
   - Replace the placeholder values with your actual Firebase configuration:
     ```javascript
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
     };
     ```

3. **Set up Firestore security rules**:
   - In Firebase Console, navigate to Firestore Database
   - Go to Rules tab
   - Update the rules to secure your chat data:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /chatRooms/{roomId} {
           allow read, write: if request.auth != null && 
             request.auth.uid in resource.data.participants;
             
           match /messages/{messageId} {
             allow read, write: if request.auth != null && 
               get(/databases/$(database)/documents/chatRooms/$(roomId)).data.participants[request.auth.uid] != null;
           }
         }
         
         // Other rules for your database
       }
     }
     ```

## Chat Structure

The chat functionality is built around these components:

1. **ChatService (`services/ChatService.js`)**: 
   - Handles all interaction with Firebase Firestore
   - Manages chat rooms and messages
   - Provides methods for sending, receiving, and querying messages

2. **ChatScreen components**:
   - `screen/candidate/ChatScreen.js`: For candidate users 
   - `screen/recruiter/ChatScreen.js`: For recruiter users

3. **ChatListScreen components**:
   - `screen/candidate/ChatListScreen.js`: For candidate users to see their conversations
   - `screen/recruiter/ChatListScreen.js`: For recruiter users to see their conversations

4. **ChatItem component**:
   - `components/business/ChatItem.js`: Reusable component for displaying chat messages

## Database Structure

The chat data is organized in Firebase Firestore as follows:

```
chatRooms/
  ├── {roomId}/
  │   ├── recruiterId: string
  │   ├── candidateId: string
  │   ├── jobId: string (optional)
  │   ├── participants: array of strings
  │   ├── createdAt: timestamp
  │   ├── lastMessage: string
  │   ├── lastMessageTimestamp: timestamp
  │   └── messages/
  │       ├── {messageId}/
  │       │   ├── senderId: string
  │       │   ├── text: string
  │       │   ├── timestamp: timestamp
  │       │   ├── read: boolean
  │       │   └── sender: string ('recruiter' or 'candidate')
```

## Usage

1. **Start a new chat**:
   - When a candidate applies for a job, a chat room can be created
   - When a recruiter wants to contact a candidate, a chat room can be created

2. **Send messages**:
   - Type a message in the input field at the bottom of the ChatScreen
   - Press the send button or hit Enter to send

3. **View chat list**:
   - Navigate to the ChatListScreen to see all conversations
   - Each conversation shows the other person's name and the last message

4. **Real-time updates**:
   - Messages are updated in real-time using Firebase Firestore listeners
   - When a new message arrives, it will automatically appear in the chat

## Additional Information

- The chat implements proper error handling and loading states
- Messages are timestamped and ordered chronologically
- The UI adapts to both recruiter and candidate user roles

For any issues or questions, please contact the development team.
