// Debug floating button component
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * A floating action button for accessing the Firebase debug screen
 * Only visible in development environments
 */
const DebugButton = () => {
  const navigation = useNavigation();

  // Check if we're in development mode
  // In production, this component would not render anything
  if (__DEV__ === false) {
    return null;
  }

  const navigateToFirebaseDebug = () => {
    navigation.navigate('FirebaseDebug');
  };

  return (
    <TouchableOpacity 
      style={styles.debugButton}
      onPress={navigateToFirebaseDebug}
    >
      <MaterialCommunityIcons name="firebase" size={20} color="#FFFFFF" />
      <Text style={styles.buttonText}>Debug</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  debugButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255, 82, 82, 0.9)',
    borderRadius: 30,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1000,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  }
});

export default DebugButton;
