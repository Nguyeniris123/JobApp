// Script to test if chat functionality is working properly
const ChatService = require('../services/ChatService').default;

// Test user IDs
const TEST_RECRUITER_ID = 'test_recruiter_123';
const TEST_CANDIDATE_ID = 'test_candidate_456';
const TEST_JOB_ID = 'test_job_789';

/**
 * Tests the chat functionality with the current implementation
 */
async function testChat() {
  console.log('🧪 Testing chat functionality with current implementation...\n');

  try {
    // Step 1: Test creating/getting a chat room
    console.log('1️⃣ Testing createOrGetChatRoom()...');
    const roomId = await ChatService.createOrGetChatRoom(
      TEST_RECRUITER_ID, 
      TEST_CANDIDATE_ID,
      TEST_JOB_ID
    );
    console.log(`✅ Successfully created/got chat room with ID: ${roomId}`);
    
    // Step 2: Test sending a message
    console.log('\n2️⃣ Testing message sending from recruiter...');
    const recruiterMsgId = await ChatService.sendMessage(
      roomId,
      TEST_RECRUITER_ID,
      'Test message from recruiter',
      'recruiter'
    );
    console.log(`✅ Successfully sent message from recruiter, ID: ${recruiterMsgId}`);
    
    // Step 3: Test sending a message from candidate
    console.log('\n3️⃣ Testing message sending from candidate...');
    const candidateMsgId = await ChatService.sendMessage(
      roomId,
      TEST_CANDIDATE_ID,
      'Test message from candidate',
      'candidate'
    );
    console.log(`✅ Successfully sent message from candidate, ID: ${candidateMsgId}`);
    
    // Step 4: Test subscribing to messages (just brief test)
    console.log('\n4️⃣ Testing subscription to messages (will run for 3 seconds)...');
    let messageCount = 0;
    const unsubscribe = ChatService.subscribeToMessages(
      roomId,
      (messages) => {
        messageCount = messages.length;
        console.log(`Received ${messages.length} messages from room ${roomId}`);
      },
      (error) => {
        console.error('Error in subscription:', error);
      }
    );
    
    // Wait 3 seconds to see if we get messages
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Clean up subscription
    if (unsubscribe) {
      unsubscribe();
    }
    
    if (messageCount > 0) {
      console.log(`✅ Successfully received ${messageCount} messages via subscription`);
    } else {
      console.warn('⚠️ No messages received via subscription within timeout');
    }
    
    console.log('\n🎉 All chat tests completed successfully!');
    console.log('🔍 The chat implementation appears to be working correctly with the Firestore rules.');
    
  } catch (error) {
    console.error('\n❌ Chat test failed:', error);
    console.error('\nThe chat implementation is not working correctly with the current Firestore rules.');
    console.error('Please apply the fixes as described in README.chat-fix.md');
  }
}

// Run the test
testChat().catch(err => {
  console.error('Fatal error in test:', err);
});
