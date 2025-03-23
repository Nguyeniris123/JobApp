import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text, Title, Caption, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RoleSelectionScreen = ({ navigation }) => {
  const theme = useTheme();

  const selectRole = (role) => {
    navigation.navigate('Register', { role });
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Choose Your Role</Title>
      <Caption style={styles.subtitle}>Select how you want to use the app</Caption>

      <TouchableOpacity onPress={() => selectRole('candidate')}>
        <Surface style={styles.card}>
          <MaterialCommunityIcons
            name="account-search"
            size={50}
            color={theme.colors.primary}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Job Seeker</Text>
            <Text style={styles.cardDescription}>
              Find part-time jobs, apply to positions, and connect with employers
            </Text>
          </View>
        </Surface>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => selectRole('recruiter')}>
        <Surface style={styles.card}>
          <MaterialCommunityIcons
            name="briefcase"
            size={50}
            color={theme.colors.primary}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Recruiter</Text>
            <Text style={styles.cardDescription}>
              Post job openings, review applications, and find the perfect candidates
            </Text>
          </View>
        </Surface>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: theme.colors.primary }}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    marginLeft: 20,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
});

export default RoleSelectionScreen;