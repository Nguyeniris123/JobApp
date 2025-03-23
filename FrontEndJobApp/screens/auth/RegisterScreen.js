import React, { useContext, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Surface, Title, Caption, useTheme, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { AuthContext } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RegisterScreen = ({ navigation, route }) => {
  const { register, loading, error } = useContext(AuthContext);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const theme = useTheme();

  // Get selected role from route params or default to candidate
  const selectedRole = route.params?.role || 'candidate';

  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    }
  });

  const password = watch('password');

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.cancelled) {
      setAvatar(result.uri);
    }
  };

  const onSubmit = async (data) => {
    // Create form data for multipart/form-data (for avatar upload)
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('first_name', data.firstName);
    formData.append('last_name', data.lastName);
    formData.append('role', selectedRole);

    if (avatar) {
      const filename = avatar.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';

      formData.append('avatar', {
        uri: avatar,
        name: filename,
        type,
      });
    }

    const success = await register(formData);
    if (success) {
      // Registration successful, user will be automatically logged in
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Surface style={styles.formContainer}>
          <Title style={styles.title}>Create Account</Title>
          <Caption style={styles.subtitle}>
            Register as a {selectedRole === 'candidate' ? 'Job Seeker' :
                          selectedRole === 'recruiter' ? 'Recruiter' : 'Admin'}
          </Caption>

          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="camera" size={40} color={theme.colors.primary} />
                <Text style={styles.avatarText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.row}>
            <Controller
              control={control}
              rules={{
                required: 'First name is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="First Name"
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={!!errors.firstName}
                />
              )}
              name="firstName"
            />

            <Controller
              control={control}
              rules={{
                required: 'Last name is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Last Name"
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={!!errors.lastName}
                />
              )}
              name="lastName"
            />
          </View>

          <Controller
            control={control}
            rules={{
              required: 'Username is required',
              minLength: {
                value: 4,
                message: 'Username must be at least 4 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Username"
                mode="outlined"
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.username}
              />
            )}
            name="username"
          />
          {errors.username && (
            <HelperText type="error">{errors.username.message}</HelperText>
          )}

          <Controller
            control={control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email"
                mode="outlined"
                left={<TextInput.Icon icon="email" />}
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
              />
            )}
            name="email"
          />
          {errors.email && (
            <HelperText type="error">{errors.email.message}</HelperText>
          )}

          <Controller
            control={control}
            rules={{
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                mode="outlined"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={secureTextEntry ? "eye" : "eye-off"}
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                  />
                }
                secureTextEntry={secureTextEntry}
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.password}
              />
            )}
            name="password"
          />
          {errors.password && (
            <HelperText type="error">{errors.password.message}</HelperText>
          )}

          <Controller
            control={control}
            rules={{
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirm Password"
                mode="outlined"
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={confirmSecureTextEntry ? "eye" : "eye-off"}
                    onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)}
                  />
                }
                secureTextEntry={confirmSecureTextEntry}
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.confirmPassword}
              />
            )}
            name="confirmPassword"
          />
          {errors.confirmPassword && (
            <HelperText type="error">{errors.confirmPassword.message}</HelperText>
          )}

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Register
          </Button>

          <View style={styles.footer}>
            <Text>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: theme.colors.primary }}>Login</Text>
            </TouchableOpacity>
          </View>
        </Surface>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  formContainer: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 5,
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    marginTop: 5,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: 10,
  },
  halfInput: {
    width: '48%',
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default RegisterScreen;