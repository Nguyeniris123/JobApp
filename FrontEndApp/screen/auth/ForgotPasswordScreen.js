import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Text, Title, useTheme } from "react-native-paper";
import * as yup from "yup";
import { API_URL } from "../../config";

// Import components
import FormButton from "../../components/form/FormButton";
import FormField from "../../components/form/FormField";
import ContentContainer from "../../components/layout/ContentContainer";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppButton from "../../components/ui/AppButton";

const forgotPasswordSchema = yup.object().shape({
    email: yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
});

const ForgotPasswordScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const theme = useTheme();

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(forgotPasswordSchema),
        mode: "onBlur",
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await axios.post(`${API_URL}/api/auth/password-reset/`, {
                email: data.email,
            });

            setMessage("Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.");
        } catch (error) {
            setError(error.response?.data?.message || "Không thể đặt lại mật khẩu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <ContentContainer scrollable={false} style={styles.container}>
                <View style={styles.headerContainer}>
                    <Title style={styles.title}>Quên Mật Khẩu</Title>
                    <Text style={styles.subtitle}>Nhập email để đặt lại mật khẩu</Text>
                </View>

                {message && <Text style={[styles.feedbackMessage, { color: theme.colors.primary }]}>{message}</Text>}
                {error && <Text style={[styles.feedbackMessage, { color: theme.colors.error }]}>{error}</Text>}

                <View style={styles.formContainer}>
                    <FormField
                        control={control}
                        name="email"
                        label="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                        errorText={errors.email?.message}
                    />

                    <FormButton onPress={handleSubmit(onSubmit)} loading={loading} disabled={loading}>
                        Gửi Yêu Cầu
                    </FormButton>

                    <AppButton mode="text" onPress={() => navigation.goBack()} style={styles.backButton}>
                        Quay lại đăng nhập
                    </AppButton>
                </View>
            </ContentContainer>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
    },
    headerContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginTop: 5,
    },
    formContainer: {
        width: "100%",
    },
    feedbackMessage: {
        textAlign: "center",
        marginBottom: 10,
    },
    backButton: {
        marginTop: 10,
        alignSelf: "center",
    },
});

export default ForgotPasswordScreen;
