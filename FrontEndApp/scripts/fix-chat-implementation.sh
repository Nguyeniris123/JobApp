#!/bin/bash
# Script to fix Chat implementation for Firestore Rules

echo "🔍 Checking ChatService files..."

# Define paths
SERVICE_FIXED="./services/ChatService.fixed.js"
SERVICE_ORIG="./services/ChatService.js"
SERVICE_BACKUP="./services/ChatService.backup.js"

CANDIDATE_SCREEN="./screen/candidate/ChatScreen.js"
CANDIDATE_BACKUP="./screen/candidate/ChatScreen.backup.js"
CANDIDATE_IMPROVED="./screen/candidate/ChatScreen.improved.js"

RECRUITER_SCREEN="./screen/recruiter/ChatScreen.js"
RECRUITER_BACKUP="./screen/recruiter/ChatScreen.backup.js"
RECRUITER_IMPROVED="./screen/recruiter/ChatScreen.improved.js"

# Check if fixed service exists
if [ ! -f "$SERVICE_FIXED" ]; then
  echo "❌ ChatService.fixed.js not found. Cannot proceed with the update."
  exit 1
fi

# Backup original files
echo "💾 Backing up original files..."

if [ -f "$SERVICE_ORIG" ] && [ ! -f "$SERVICE_BACKUP" ]; then
  cp "$SERVICE_ORIG" "$SERVICE_BACKUP"
  echo "✅ Backed up ChatService.js"
fi

if [ -f "$CANDIDATE_SCREEN" ] && [ ! -f "$CANDIDATE_BACKUP" ]; then
  cp "$CANDIDATE_SCREEN" "$CANDIDATE_BACKUP"
  echo "✅ Backed up candidate ChatScreen.js"
fi

if [ -f "$RECRUITER_SCREEN" ] && [ ! -f "$RECRUITER_BACKUP" ]; then
  cp "$RECRUITER_SCREEN" "$RECRUITER_BACKUP"
  echo "✅ Backed up recruiter ChatScreen.js"
fi

# Apply fixes
echo "🔧 Applying fixes..."

# Copy fixed service
cp "$SERVICE_FIXED" "$SERVICE_ORIG"
echo "✅ Updated ChatService.js with fixed implementation"

# Update chat screens if improved versions exist
if [ -f "$CANDIDATE_IMPROVED" ]; then
  cp "$CANDIDATE_IMPROVED" "$CANDIDATE_SCREEN"
  echo "✅ Updated candidate ChatScreen.js"
else
  echo "⚠️ Improved candidate ChatScreen not found, skipping"
fi

if [ -f "$RECRUITER_IMPROVED" ]; then
  cp "$RECRUITER_IMPROVED" "$RECRUITER_SCREEN"
  echo "✅ Updated recruiter ChatScreen.js"
else
  echo "⚠️ Improved recruiter ChatScreen not found, skipping"
fi

echo "🎉 Chat implementation has been successfully updated!"
echo "ℹ️ If you encounter issues, you can restore the original files using the .backup versions"
