import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, StyleSheet, View } from 'react-native';
import { Text, Title, useTheme } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';

// Import components
import FormButton from '../../components/form/FormButton';
import FormField from '../../components/form/FormField';
import ContentContainer from '../../components/layout/ContentContainer';
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppButton from '../../components/ui/AppButton';
import AppDivider from '../../components/ui/AppDivider';

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser } = useContext(AuthContext);
  const theme = useTheme();

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/auth/login/`, data);

      // Store token and user data
      setUser({
        id: response.data.user.id,
        token: response.data.token,
        ...response.data.user
      });

    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.message ||
        'Failed to login. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ContentContainer scrollable={false} style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Title style={styles.title}>Welcome Back</Title>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <FormField
            control={control}
            name="email"
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            }}
            left={<MaterialCommunityIcons name="email" size={20} color="#666" />}
          />

          <FormField
            control={control}
            name="password"
            label="Password"
            secureTextEntry
            rules={{ required: 'Password is required' }}
            left={<MaterialCommunityIcons name="lock" size={20} color="#666" />}
          />

          <AppButton
            mode="text"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordButton}
          >
            Forgot Password?
          </AppButton>

          <FormButton
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
            icon="login"
          >
            Sign In
          </FormButton>

          <AppDivider style={styles.divider} />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <AppButton
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.registerButton}
            >
              Sign Up
            </AppButton>
          </View>
        </View>
      </ContentContainer>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  errorText: {
    marginLeft: 10,
    flex: 1,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -5,
    marginBottom: 10,
  },
  divider: {
    marginVertical: 20,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
  },
  registerButton: {
    marginLeft: 5,
  },
});

export default LoginScreen;