import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useContext, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Button, Divider, List, Snackbar, Surface, Text } from "react-native-paper";
import ScreenContainer from "../../components/layout/ScreenContainer";
import { AuthContext } from "../../contexts/AuthContext";

const SettingsScreen = ({ navigation }) => {
    const { user, logout, changeAvatar } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const pickImage = async () => {
        try {
            // Kiểm tra quyền truy cập thư viện ảnh
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                setSnackbarMessage('Cần cấp quyền truy cập thư viện ảnh để thực hiện chức năng này');
                setSnackbarVisible(true);
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setLoading(true);
                try {
                    // Gọi API để cập nhật avatar
                    await changeAvatar(result.assets[0].uri);
                    setSnackbarMessage('Cập nhật ảnh đại diện thành công');
                    setSnackbarVisible(true);
                } catch (error) {
                    console.error('Lỗi khi cập nhật avatar:', error);
                    setSnackbarMessage('Không thể cập nhật ảnh đại diện. Vui lòng thử lại sau.');
                    setSnackbarVisible(true);
                } finally {
                    setLoading(false);
                }
            }
        } catch (error) {
            console.log("Lỗi chọn ảnh:", error);
            setSnackbarMessage('Đã xảy ra lỗi khi chọn ảnh');
            setSnackbarVisible(true);
        }
    };
    const handleLogout = () => {
            Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
                { text: "Hủy", style: "cancel" },
                { text: "Đăng xuất", onPress: () => logout() },
            ]);
        };

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.header}>
                    <TouchableOpacity onPress={pickImage} disabled={loading}>
                        <Avatar.Image
                            source={{ uri: user?.avatar || "https://via.placeholder.com/150" }}
                            size={80}
                            loading={loading}
                        />
                        <View style={styles.editIconContainer}>
                            <MaterialCommunityIcons name="camera" size={16} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.name}>{`${user?.first_name} ${user?.last_name}` || "Nhà tuyển dụng"}</Text>
                        <Text style={styles.email}>{user?.email || "email@example.com"}</Text>
                        <Button
                            mode="contained"
                            onPress={() => navigation.navigate("CompanyProfile")}
                            style={styles.profileButton}
                            labelStyle={styles.buttonLabel}
                        >
                            Hồ sơ công ty
                        </Button>
                    </View>
                </Surface>

                <Surface style={styles.section}>
                    <List.Section>
                        <List.Subheader>Tài khoản</List.Subheader>
                        <List.Item
                            title="Chỉnh sửa thông tin"
                            left={props => <List.Icon {...props} icon="account-edit" />}
                            onPress={() => navigation.navigate("EditProfile")}
                        />
                        <Divider />
                        <List.Item
                            title="Đổi mật khẩu"
                            left={props => <List.Icon {...props} icon="lock-reset" />}
                            onPress={() => {}}
                        />
                    </List.Section>
                </Surface>

                <Surface style={styles.section}>
                    <List.Section>
                        <List.Subheader>Cài đặt ứng dụng</List.Subheader>
                        <List.Item
                            title="Ngôn ngữ"
                            description="Tiếng Việt"
                            left={props => <List.Icon {...props} icon="translate" />}
                            onPress={() => {}}
                        />
                        <Divider />
                        <List.Item
                            title="Thông báo"
                            left={props => <List.Icon {...props} icon="bell-outline" />}
                            onPress={() => {}}
                        />
                        <Divider />
                        <List.Item
                            title="Chế độ tối"
                            left={props => <List.Icon {...props} icon="brightness-6" />}
                            onPress={() => {}}
                        />
                    </List.Section>
                </Surface>

                <Surface style={styles.section}>
                    <List.Section>
                        <List.Subheader>Hỗ trợ</List.Subheader>
                        <List.Item
                            title="Trung tâm hỗ trợ"
                            left={props => <List.Icon {...props} icon="help-circle" />}
                            onPress={() => {}}
                        />
                        <Divider />
                        <List.Item
                            title="Điều khoản sử dụng"
                            left={props => <List.Icon {...props} icon="file-document" />}
                            onPress={() => {}}
                        />
                    </List.Section>
                </Surface>

                <Button
                    mode="outlined"
                    icon="logout"
                    onPress={handleLogout}
                    style={styles.logoutButton}
                >
                    Đăng xuất
                </Button>
            </ScrollView>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: 'OK',
                    onPress: () => setSnackbarVisible(false),
                }}>
                {snackbarMessage}
            </Snackbar>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 24, // Add bottom padding for better scroll experience
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        margin: 16,
        elevation: 2,
        borderRadius: 8,
    },
    headerInfo: {
        marginLeft: 16,
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
    },
    email: {
        color: "#666",
        marginBottom: 8,
    },
    profileButton: {
        marginTop: 8,
        alignSelf: "flex-start",
    },
    buttonLabel: {
        fontSize: 12,
    },
    section: {
        marginHorizontal: 16,
        marginVertical: 8,
        elevation: 2,
        borderRadius: 8,
    },
    logoutButton: {
        marginVertical: 24,
        marginHorizontal: 16,
        borderColor: "#d32f2f",
        borderWidth: 1,
    },
    editIconContainer: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#1E88E5",
        borderRadius: 15,
        padding: 4,
        borderWidth: 1,
        borderColor: "white",
    },
});

export default SettingsScreen;

