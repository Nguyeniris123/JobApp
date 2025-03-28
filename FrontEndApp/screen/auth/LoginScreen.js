import { MaterialCommunityIcons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, StyleSheet, View } from 'react-native';
import { Text, Title, useTheme } from 'react-native-paper';
import * as yup from 'yup';

import { AuthContext } from "../../contexts/AuthContext";

// Import components
import FormButton from '../../components/form/FormButton';
import FormField from '../../components/form/FormField';
import ContentContainer from '../../components/layout/ContentContainer';
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppButton from '../../components/ui/AppButton';
import AppDivider from '../../components/ui/AppDivider';

// ✅ Schema validation bằng Yup
const loginSchema = yup.object().shape({
    email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
    password: yup.string().min(6, 'Mật khẩu ít nhất 6 ký tự').required('Vui lòng nhập mật khẩu'),
});

const LoginScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);

    const { login, error } = useContext(AuthContext);
    const [role, setRole] = useState("Recruiter")
    const theme = useTheme();

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema),
        mode: 'onBlur',
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // ✅ Hàm xử lý đăng nhập
    const onSubmit = async (data) => {
        try {
            setLoading(true);
            login(data.email, data.password, role)

        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            setError(
                error.response?.data?.message ||
                'Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại!'
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
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Title style={styles.title}>Chào mừng trở lại</Title>
                    <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
                </View>

                {/* Hiển thị lỗi từ API (nếu có) */}
                {error && (
                    <View style={styles.errorContainer}>
                        <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.error} />
                        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
                    </View>
                )}


                <AppButton
                    mode={role === "recruiter" ? "contained" : "outlined"}
                    onPress={() => setRole("recruiter")}
                    style={styles.toggleButton}
                >
                    Nhà tuyển dụng
                </AppButton>
                <AppButton
                    mode={role === "candidate" ? "contained" : "outlined"}
                    onPress={() => setRole("candidate")}
                    style={styles.toggleButton}
                >
                    Người tìm việc
                </AppButton>

                <View style={styles.formContainer}>
                    {/* ✅ Email */}
                    <FormField
                        control={control}
                        name="email"
                        label="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                        errorText={errors.email?.message}
                        left={<MaterialCommunityIcons name="email" size={20} color="#666" />}
                    />

                    {/* ✅ Mật khẩu */}
                    <FormField
                        control={control}
                        name="password"
                        label="Mật khẩu"
                        secureTextEntry
                        error={errors.password}
                        errorText={errors.password?.message}
                        left={<MaterialCommunityIcons name="lock" size={20} color="#666" />}
                    />

                    {/* Quên mật khẩu */}
                    <AppButton
                        mode="text"
                        onPress={() => navigation.navigate('ForgotPassword')}
                        style={styles.forgotPasswordButton}
                    >
                        Quên mật khẩu?
                    </AppButton>

                    {/* Nút Đăng nhập */}
                    <FormButton
                        onPress={handleSubmit(onSubmit)}
                        loading={loading}
                        disabled={loading}
                        icon="login"
                    >
                        Đăng nhập
                    </FormButton>

                    <AppDivider style={styles.divider} />

                    {/* Chuyển sang trang Đăng ký */}
                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>Chưa có tài khoản?</Text>
                        <AppButton
                            mode="text"
                            onPress={() => navigation.navigate('Register')}
                            style={styles.registerButton}
                        >
                            Đăng ký
                        </AppButton>
                    </View>
                </View>
            </ContentContainer>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
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
