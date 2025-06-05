import { yupResolver } from "@hookform/resolvers/yup";
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Image, StyleSheet, View } from "react-native";
import { Text, Title, useTheme } from "react-native-paper";
import * as yup from "yup";
import { register as registerService } from '../../services/authService';

// Import components
import FormButton from "../../components/form/FormButton";
import FormField from "../../components/form/FormField";
import ContentContainer from "../../components/layout/ContentContainer";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppButton from "../../components/ui/AppButton";
import AppDivider from "../../components/ui/AppDivider";

// ✅ Schema validation bằng Yup
const registerSchema = yup.object().shape({
    username: yup.string().required("Vui lòng nhập tên đăng nhập"),
    email: yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
    password: yup.string().min(6, "Mật khẩu ít nhất 6 ký tự").required("Vui lòng nhập mật khẩu"),
    confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Mật khẩu không khớp").required("Vui lòng xác nhận mật khẩu"),
    companyName: yup.string().when("userType", {
        is: "employer",
        then: (schema) => schema.required("Vui lòng nhập tên công ty"),
    }),
    description: yup.string().when("userType", {
        is: "employer",
        then: (schema) => schema.required("Vui lòng nhập mô tả công ty"),
    }),
    location: yup.string().when("userType", {
        is: "employer",
        then: (schema) => schema.required("Vui lòng nhập địa chỉ công ty"),
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
    const [companyImages, setCompanyImages] = useState([]);
    const [avatar, setAvatar] = useState(null);
    const theme = useTheme();

    const { control, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(registerSchema),
        mode: "onBlur",
        defaultValues: {
            firstname: "",
            lastname: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            companyName: "",
            description: "",
            location: "",
            taxId: "",
            avatar: "",
        },
    });

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [1, 1], // Ensure a square aspect ratio for round profile images
                quality: 1,
                mediaTypes: ImagePicker.MediaTypeOptions.Images
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

    const removeImage = (index) => {
        setCompanyImages(companyImages.filter((_, i) => i !== index));
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError(null);
            if (userType === "employer" && companyImages.length < 3) {
                Alert.alert("Lỗi", "Cần ít nhất 3 ảnh công ty.");
                setLoading(false);
                return;
            }
            const result = await registerService(data, userType, avatar, companyImages);
            if (result.status === 201) {
                Alert.alert("Thành công", "Đăng ký tài khoản thành công!");
                navigation.navigate("Login");
            } else {
                if (result.status === 400) {
                    let errorMsg = 'Đăng ký thất bại!!! \nTrùng tên đăng nhập hoặc email \nVui lòng đổi tên đăng nhập hoặc email khác';
                    // Kiểm tra nếu errorMsg là một đối tượng, chuyển đổi nó thành chuỗi
                    if (typeof errorMsg === 'object') errorMsg = JSON.stringify(errorMsg);
                    Alert.alert("Lỗi", errorMsg);
                }
                else {
                    let errorMsg = result.error?.detail || result.error?.message || result.error || 'Đăng ký thất bại!!! \nVui lòng thử lại sau';
                    // Kiểm tra nếu errorMsg là một đối tượng, chuyển đổi nó thành chuỗi
                    if (typeof errorMsg === 'object') errorMsg = JSON.stringify(errorMsg);
                    Alert.alert("Lỗi", errorMsg);
                };
        }
        } catch (error) {
        Alert.alert("Lỗi", "Đăng ký thất bại!, error: " + error.message);
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
                <FormField control={control} name="username" label="Tên đăng nhập" autoCapitalize="none" />
                <FormField control={control} name="email" label="Email" keyboardType="email-address" autoCapitalize="none" />
                <FormField control={control} name="password" label="Mật khẩu" secureTextEntry />
                <FormField control={control} name="confirmPassword" label="Xác nhận mật khẩu" secureTextEntry />
                <AppButton mode="outlined" onPress={pickImage} icon="image-multiple">
                    Tải ảnh đại diện
                </AppButton>

                {avatar && <Image source={{ uri: avatar }} style={{ width: 100, height: 100, borderRadius: 50 }} />}




                {userType === "employer" && (
                    <>
                        <FormField control={control} name="companyName" label="Tên công ty" autoCapitalize="words" />
                        <FormField control={control} name="description" label="Mô tả công ty" multiline numberOfLines={4} />
                        <FormField control={control} name="location" label="Địa chỉ công ty" autoCapitalize="words" />
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