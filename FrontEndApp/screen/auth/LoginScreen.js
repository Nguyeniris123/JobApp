import { CLIENT_ID, CLIENT_SECRET } from '@env';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, StyleSheet, View } from 'react-native';
import { Text, Title, useTheme } from 'react-native-paper';
import * as yup from 'yup';
import { API_ENDPOINTS } from '../../apiConfig';

import { AuthContext } from "../../contexts/AuthContext";

// Import components
import FormButton from '../../components/form/FormButton';
import FormField from '../../components/form/FormField';
import ContentContainer from '../../components/layout/ContentContainer';
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppButton from '../../components/ui/AppButton';
import AppDivider from '../../components/ui/AppDivider';

// ✅ Schema validation bằng Yup - Đổi email thành username
const loginSchema = yup.object().shape({
    username: yup.string().required('Vui lòng nhập tên đăng nhập'),
    password: yup.string().min(6, 'Mật khẩu ít nhất 6 ký tự').required('Vui lòng nhập mật khẩu'),
});

const LoginScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const { login } = useContext(AuthContext);
    const theme = useTheme();

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema),
        mode: 'onBlur',
        defaultValues: {
            username: '',
            password: '',
        },
    });

    // ✅ Xử lý đăng nhập    
    const onSubmit = async (data) => {        try {
            setLoading(true);
            setLoginError(null); // Reset error state when attempting login
            const jsondata = {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                username: data.username, // Sử dụng username thay vì email
                password: data.password,
                grant_type: "password",
            };

            console.log("Request gửi đi:", jsondata);

            const response = await axios.post(API_ENDPOINTS.LOGIN, jsondata);
            const { access_token, refresh_token, user } = response.data;

            console.log("===========================\n",access_token, refresh_token,user)
            await login(access_token, refresh_token, user);

        } catch (error) {
            if (error.response) {
                // Lỗi từ server (ví dụ: 400, 401, 403, ...)
                console.log("Lỗi response:", error.response.data);
                const errorMessage = error.response.status === 401 
                    ? "Tên đăng nhập hoặc mật khẩu không chính xác"
                    : error.response.data.detail || "Đăng nhập thất bại, vui lòng kiểm tra lại!";
                setLoginError(errorMessage);
            } else if (error.request) {
                // Không có phản hồi từ server (mất mạng, lỗi API)
                console.log("Lỗi request:", error.request);
                setLoginError("Không thể kết nối đến máy chủ, vui lòng thử lại sau.");
            } else {
                // Lỗi bất thường
                console.log("Lỗi khác:", error.message);
                setLoginError("Có lỗi xảy ra, vui lòng thử lại!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <ContentContainer scrollable={false} style={styles.container}>
                {/* Logo và tiêu đề */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Title style={styles.title}>Chào mừng trở lại</Title>
                    <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
                </View>                {/* Hiển thị lỗi từ API (nếu có) */}
                {loginError && (
                    <View style={styles.errorContainer}>
                        <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.error} />
                        <Text style={[styles.errorText, { color: theme.colors.error }]}>{loginError}</Text>
                    </View>
                )}

                {/* Form đăng nhập */}
                <View style={styles.formContainer}>
                    {/* ✅ Username - thay thế Email */}
                    <FormField
                        control={control}
                        name="username"
                        label="Tên đăng nhập"
                        autoCapitalize="none"
                        error={errors.username}
                        errorText={errors.username?.message}
                        left={<MaterialCommunityIcons name="account" size={20} color="#666" />}
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
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    toggleButton: {
        marginHorizontal: 10,
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
    },    registerText: {
        color: '#666',
    },    registerButton: {
        marginLeft: 5,
    },
});

export default LoginScreen;
