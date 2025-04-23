import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useContext, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Button, Text, TextInput, Title } from "react-native-paper";
import { API_ENDPOINTS } from "../../apiConfig";
import { AuthContext } from "../../contexts/AuthContext";

const EditProfileScreen = ({ navigation }) => {
    const { user, updateUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(user?.avatar || null);
    const [formData, setFormData] = useState({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        bio: user?.bio || "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                bio: user.bio || "",
            });
            setProfileImage(user.avatar || null);
        }
    }, [user]);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1], // Square aspect ratio
                quality: 1,
            });

            if (!result.canceled) {
                setProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            console.log("Error picking image:", error);
            Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.");
        }
    };

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Create form data for multipart upload
            const updatedData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    updatedData.append(key, formData[key]);
                }
            });

            // Add profile image if changed
            if (profileImage && profileImage !== user?.avatar) {
                const filename = profileImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || "");
                const type = match ? `image/${match[1]}` : "image/jpeg";
                
                updatedData.append('avatar', {
                    uri: profileImage,
                    name: filename || 'profile.jpg',
                    type
                });
            }

            // Determine endpoint based on role
            const endpoint = user.role === "recruiter" 
                ? API_ENDPOINTS.RECRUITERS_UPDATE(user.id)
                : API_ENDPOINTS.CANDIDATES_UPDATE(user.id);

            const response = await axios.patch(endpoint, updatedData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${user.access_token}`,
                }
            });

            if (response.status === 200) {
                // Update local user data
                await updateUser({
                    ...user,
                    ...formData,
                    avatar: profileImage
                });
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

            <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={pickImage}>
                    <Avatar.Image 
                        source={profileImage ? { uri: profileImage } : require('../../assets/user-icon.png')} 
                        size={120} 
                        style={styles.avatar} 
                    />
                    <View style={styles.editIconContainer}>
                        <MaterialCommunityIcons name="camera" size={24} color="#FFFFFF" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.changePhotoText}>Thay đổi ảnh đại diện</Text>
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

                <TextInput
                    label="Số điện thoại"
                    value={formData.phone}
                    onChangeText={(text) => handleInputChange("phone", text)}
                    mode="outlined"
                    keyboardType="phone-pad"
                    style={styles.input}
                />

                <TextInput
                    label="Địa chỉ"
                    value={formData.address}
                    onChangeText={(text) => handleInputChange("address", text)}
                    mode="outlined"
                    style={styles.input}
                />

                <TextInput
                    label="Giới thiệu bản thân"
                    value={formData.bio}
                    onChangeText={(text) => handleInputChange("bio", text)}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    style={styles.bioInput}
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
