import { yupResolver } from "@hookform/resolvers/yup";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Image, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import * as yup from "yup";

// Import components
import FormButton from "../../components/form/FormButton";
import FormField from "../../components/form/FormField";
import ContentContainer from "../../components/layout/ContentContainer";
import ScreenContainer from "../../components/layout/ScreenContainer";
import ScreenHeader from "../../components/layout/ScreenHeader";
import AppButton from "../../components/ui/AppButton";
import AppDivider from "../../components/ui/AppDivider";

// ✅ Schema validation bằng Yup
const registerSchema = yup.object().shape({
    fullName: yup.string().required("Vui lòng nhập họ và tên"),
    email: yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
    password: yup.string().min(6, "Mật khẩu ít nhất 6 ký tự").required("Vui lòng nhập mật khẩu"),
    confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Mật khẩu không khớp").required("Vui lòng xác nhận mật khẩu"),
    companyName: yup.string().when("userType", {
        is: "employer",
        then: (schema) => schema.required("Vui lòng nhập tên công ty"),
    }),
    taxId: yup.string().when("userType", {
        is: "employer",
        then: (schema) => schema.required("Vui lòng nhập mã số thuế"),
    }),
});

const RegisterScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userType, setUserType] = useState("jobSeeker"); // "jobSeeker" | "employer"
    const [cv, setCv] = useState(null);
    const [companyImages, setCompanyImages] = useState([]);
    const theme = useTheme();

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(registerSchema),
        mode: "onBlur",
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            companyName: "",
            taxId: "",
        },
    });

    // Xử lý tải lên CV
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
                copyToCacheDirectory: true,
            });
            if (result.type === "success") {
                setCv(result);
            }
        } catch (error) {
            console.error("Error picking document:", error);
        }
    };

    // Xử lý tải lên hình ảnh công ty
    const pickImages = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsMultipleSelection: true,
                selectionLimit: 10,
                mediaTypes: [ImagePicker.MediaType.IMAGE], // ✅ Cập nhật ở đây
            });
    
            if (!result.canceled) {
                const newImages = result.assets.map((asset) => asset.uri);
                setCompanyImages((prevImages) => [...prevImages, ...newImages].slice(0, 10));
            }
        } catch (error) {
            console.error("Error picking images:", error);
        }
    };

    // Xóa ảnh khỏi danh sách
    const removeImage = (index) => {
        setCompanyImages(companyImages.filter((_, i) => i !== index));
    };

    const onSubmit = (data) => {
        if (userType === "employer" && companyImages.length < 3) {
            Alert.alert("Lỗi", "Vui lòng tải lên ít nhất 3 ảnh về công ty.");
            return;
        }

        console.log("Register Data:", { ...data, userType, cv, companyImages });
    };

    return (
        <ScreenContainer>
            <ScreenHeader 
                title="Tạo tài khoản" 
                subtitle="Hãy nhập thông tin của bạn" 
            />
            <ContentContainer scrollable={false} style={styles.container}>
                {/* Lựa chọn loại tài khoản */}
                <View style={styles.toggleContainer}>
                    <AppButton 
                        mode={userType === "jobSeeker" ? "contained" : "outlined"} 
                        onPress={() => setUserType("jobSeeker")}
                        style={styles.toggleButton}
                    >
                        Người tìm việc
                    </AppButton>
                    <AppButton 
                        mode={userType === "employer" ? "contained" : "outlined"} 
                        onPress={() => setUserType("employer")}
                        style={styles.toggleButton}
                    >
                        Nhà tuyển dụng
                    </AppButton>
                </View>

                <View style={styles.formContainer}>
                    <FormField control={control} name="fullName" label="Họ và Tên" autoCapitalize="words" />
                    <FormField control={control} name="email" label="Email" keyboardType="email-address" autoCapitalize="none" />
                    <FormField control={control} name="password" label="Mật khẩu" secureTextEntry />
                    <FormField control={control} name="confirmPassword" label="Xác nhận mật khẩu" secureTextEntry />

                    {userType === "jobSeeker" && (
                        <>
                            <AppButton mode="outlined" onPress={pickDocument} icon="file-upload">
                                {cv ? "Thay đổi CV" : "Tải lên CV"}
                            </AppButton>
                            {cv && <Text style={styles.fileName}>{cv.name}</Text>}
                        </>
                    )}

                    {userType === "employer" && (
                        <>
                            <FormField control={control} name="companyName" label="Tên công ty" autoCapitalize="words" />
                            <FormField control={control} name="taxId" label="Mã số thuế" keyboardType="numeric" />

                            <AppButton mode="outlined" onPress={pickImages} icon="image-multiple">
                                Tải lên hình ảnh công ty (Tối thiểu 3 ảnh)
                            </AppButton>

                            <View style={styles.imagePreview}>
                                {companyImages.map((uri, index) => (
                                    <View key={index} style={styles.imageContainer}>
                                        <Image source={{ uri }} style={styles.image} />
                                        <AppButton mode="text" onPress={() => removeImage(index)} icon="close-circle" />
                                    </View>
                                ))}
                            </View>

                            {companyImages.length < 3 && (
                                <Text style={styles.errorText}>Cần ít nhất 3 ảnh</Text>
                            )}
                        </>
                    )}

                    <FormButton onPress={handleSubmit(onSubmit)} loading={loading} disabled={loading}>
                        Đăng Ký
                    </FormButton>

                    <AppDivider style={styles.divider} />

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Đã có tài khoản?</Text>
                        <AppButton mode="text" onPress={() => navigation.navigate("Login")} style={styles.loginButton}>
                            Đăng Nhập
                        </AppButton>
                    </View>
                </View>
            </ContentContainer>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: { paddingHorizontal: 20 },
    toggleContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
    toggleButton: { marginHorizontal: 5 },
    uploadButton: { marginVertical: 10 },
    fileName: { textAlign: "center", color: "#666" },
    imagePreview: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
    imageContainer: { position: "relative", margin: 5 },
    image: { width: 80, height: 80, borderRadius: 5 },
    errorText: { color: "red", textAlign: "center", marginTop: 5 },
    divider: { marginVertical: 20 },
});

export default RegisterScreen;
