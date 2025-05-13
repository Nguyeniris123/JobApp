import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Tests Firebase connection and permissions
 */
const testFirebaseConnection = async () => {
  console.log('Testing Firebase connection...');
  
  try {
    // Test writing to a test document
    const testDocRef = doc(db, 'test_collection', 'test_doc');
    await setDoc(testDocRef, {
      timestamp: new Date().toISOString(),
      message: 'Test connection successful'
    });
    console.log('✅ Write test passed');
    
    // Test reading from the test collection
    const querySnapshot = await getDocs(collection(db, 'test_collection'));
    console.log('✅ Read test passed');
    console.log(`Documents found: ${querySnapshot.docs.length}`);
    querySnapshot.forEach(doc => {
      console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
    });
    
    console.log('Firebase connection test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    
    // Check for specific error types
    if (error.code === 'permission-denied') {
      console.error('This is a permissions issue. Check your Firestore security rules.');
    } else if (error.code === 'unavailable') {
      console.error('Firebase may be temporarily unavailable or you may have network issues.');
    }
    
    return false;
  }
};

export default testFirebaseConnection;
