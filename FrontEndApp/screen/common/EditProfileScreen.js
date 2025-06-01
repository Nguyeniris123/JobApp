import { useContext, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, TextInput, Title } from "react-native-paper";
import { AuthContext } from "../../contexts/AuthContext";

const EditProfileScreen = ({ navigation }) => {
    const auth = useContext(AuthContext);
    const { user } = auth;
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(user?.avatar || null);
    const [formData, setFormData] = useState({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        email: user?.email || "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
            });
        }
    }, [user]);

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const updatedData = {};
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    updatedData[key] = formData[key];
                }
            });
            const success = await auth.updateUserProfile(updatedData);
            if (success) {
                Alert.alert("Thành công", "Cập nhật thông tin cá nhân thành công");
                navigation.goBack();
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Title style={styles.title}>Chỉnh sửa thông tin cá nhân</Title>
            </View>

            <View style={styles.formContainer}>
                <TextInput
                    label="Họ"
                    value={formData.first_name}
                    onChangeText={(text) => handleInputChange("first_name", text)}
                    mode="outlined"
                    style={styles.input}
                />

                <TextInput
                    label="Tên"
                    value={formData.last_name}
                    onChangeText={(text) => handleInputChange("last_name", text)}
                    mode="outlined"
                    style={styles.input}
                />

                <TextInput
                    label="Email"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange("email", text)}
                    mode="outlined"
                    keyboardType="email-address"
                    style={styles.input}
                />

                <View style={styles.buttonContainer}>
                    <Button 
                        mode="outlined" 
                        onPress={() => navigation.goBack()} 
                        style={styles.cancelButton}
                    >
                        Hủy
                    </Button>
                    <Button 
                        mode="contained" 
                        onPress={handleSubmit} 
                        style={styles.saveButton}
                        loading={loading}
                        disabled={loading}
                    >
                        Lưu thay đổi
                    </Button>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        padding: 20,
        paddingTop: 50,
        backgroundColor: "#1E88E5",
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    avatarContainer: {
        alignItems: "center",
        marginTop: -60,
        marginBottom: 20,
    },
    avatar: {
        backgroundColor: "#FFFFFF",
        borderWidth: 3,
        borderColor: "#FFFFFF",
    },
    editIconContainer: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#1E88E5",
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#FFFFFF",
    },
    changePhotoText: {
        marginTop: 8,
        color: "#1E88E5",
        fontWeight: "500",
    },
    formContainer: {
        padding: 20,
    },
    input: {
        marginBottom: 16,
        backgroundColor: "#FFFFFF",
    },
    bioInput: {
        marginBottom: 20,
        backgroundColor: "#FFFFFF",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        marginBottom: 40,
    },
    cancelButton: {
        flex: 1,
        marginRight: 10,
        borderColor: "#1E88E5",
    },
    saveButton: {
        flex: 2,
        backgroundColor: "#1E88E5",
    },
});

export default EditProfileScreen;
