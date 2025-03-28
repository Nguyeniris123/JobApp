import { yupResolver } from "@hookform/resolvers/yup";
import axios from 'axios';
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Image, StyleSheet, View } from "react-native";
import { Text, Title, useTheme } from "react-native-paper";
import * as yup from "yup";
import { API_URL } from "../../config";

// Import components
import FormButton from "../../components/form/FormButton";
import FormField from "../../components/form/FormField";
import ContentContainer from "../../components/layout/ContentContainer";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppButton from "../../components/ui/AppButton";
import AppDivider from "../../components/ui/AppDivider";

// ✅ Schema validation bằng Yup
const registerSchema = yup.object().shape({
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
    const [userType, setUserType] = useState("jobSeeker");
    const [cv, setCv] = useState(null);
    const [companyImages, setCompanyImages] = useState([]);
    const [avatar, setAvatar] = useState(null);
    const theme = useTheme();

    const { control, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(registerSchema),
        mode: "onBlur",
        defaultValues: {
            firstname: "",
            lastname: "",
            email: "",
            password: "",
            confirmPassword: "",
            companyName: "",
            taxId: "",
            avatar: "",
        },
    });

    // 📌 Chọn Avatar (chỉ lấy 1 ảnh)
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
            });

            if (!result.canceled) {
                const selectedAvatar = result.assets[0].uri;
                setAvatar(selectedAvatar);
                setValue("avatar", selectedAvatar); // ✅ Cập nhật vào form validation
            }
        } catch (error) {
            console.error("Lỗi khi chọn ảnh:", error);
        }
    };

    // 📌 Chọn CV (PDF)
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

    // 📌 Chọn nhiều ảnh công ty
    const pickImages = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsMultipleSelection: true,
                selectionLimit: 10,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });

            if (!result.canceled) {
                const newImages = result.assets.map((asset) => asset.uri);
                setCompanyImages((prevImages) => [...prevImages, ...newImages].slice(0, 10));
            }
        } catch (error) {
            console.error("Error picking images:", error);
        }
    };

    // 📌 Xóa ảnh công ty
    const removeImage = (index) => {
        setCompanyImages(companyImages.filter((_, i) => i !== index));
    };

    // 📌 Gửi thông tin đăng ký
    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError(null);
    
            if (userType === "employer" && companyImages.length < 3) {
                Alert.alert("Lỗi", "Cần ít nhất 3 ảnh công ty.");
                setLoading(false);
                return;
            }
    
            const formData = new FormData();
            formData.append("first_name", data.firstname);
            formData.append("last_name", data.lastname);
            formData.append("username", data.email);
            formData.append("password", data.password);
    
            if (avatar) {
                formData.append("avatar", avatar.uri);
            }
    
            const apiEndpoint = userType === "jobSeeker" ? "/candidates/" : "/recruiters/";
            const response = await axios.post(`${API_URL}${apiEndpoint}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
    
            console.log("✅ Đăng ký thành công:", response.data);
            Alert.alert("Thành công", "Đăng ký tài khoản thành công!");
            navigation.navigate("Login");
        } catch (error) {
            console.error("❌ Lỗi API:", "Người dùng đã tồn tại");
    
            if (error.response) {
                console.error("🔹 Response Data:", error.response.data);
                console.error("🔹 Status Code:", error.response.status);
    
                // Hiển thị lỗi cụ thể từ server
                Alert.alert("Lỗi", `Lỗi ${error.response.status}: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                console.error("🔹 Không có phản hồi từ server:", error.request);
                Alert.alert("Lỗi", "Không có phản hồi từ server. Vui lòng kiểm tra kết nối.");
            } else {
                console.error("🔹 Lỗi không xác định:", error.message);
                Alert.alert("Lỗi", "Đăng ký thất bại. Lỗi không xác định.");
            }
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <ScreenContainer>
            <ContentContainer scrollable={true} style={styles.container}>
                <View style={styles.headerContainer}>
                    <Title style={styles.title}>Tạo tài khoản</Title>
                    <Text style={styles.subtitle}>Hãy nhập thông tin của bạn</Text>
                </View>

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
                    <FormField control={control} name="firstname" label="Họ" autoCapitalize="words" />
                    <FormField control={control} name="lastname" label="Tên" autoCapitalize="words" />
                    <FormField control={control} name="email" label="Email" keyboardType="email-address" autoCapitalize="none" />
                    <FormField control={control} name="password" label="Mật khẩu" secureTextEntry />
                    <FormField control={control} name="confirmPassword" label="Xác nhận mật khẩu" secureTextEntry />
                    <AppButton mode="outlined" onPress={pickImage} icon="image-multiple">
                        Tải ảnh đại diện
                    </AppButton>

                    {avatar && <Image source={{ uri: avatar }} style={{ width: 100, height: 100, borderRadius: 50 }} />}


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
                            <FormField control={control} name="Description" label="Mô tả" autoCapitalize="words" />

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

                    <FormButton
                        onPress={handleSubmit(
                            onSubmit,
                            (errors) => {
                                console.log("Validation Errors:", errors); // Kiểm tra lỗi validation trên console
                                Alert.alert("Lỗi", "Vui lòng kiểm tra lại thông tin đăng ký!");
                            }
                        )}
                        loading={loading}
                        disabled={loading}
                    >
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
    headerContainer: { justifyContent: "center", marginBottom: "20" },
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