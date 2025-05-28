import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useContext, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Button, Card, Divider, List, Snackbar, Text } from "react-native-paper";
import { AuthContext } from "../../contexts/AuthContext";

const ProfileScreen = ({ navigation }) => {
    const { user, changeAvatar, logout, role } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const username = useMemo(() => user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : "Người dùng", [user]);
    const profileImage = useMemo(() => user?.avatar || "https://via.placeholder.com/150", [user]);
    const availableForWork = useMemo(() => user?.availableForWork ?? true, [user]);

    const pickImage = useCallback(async () => {
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
    }, [changeAvatar]);

    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
            { text: "Hủy", style: "cancel" },
            { text: "Đăng xuất", onPress: () => logout() },
        ]);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={pickImage} disabled={loading}>
                    <Avatar.Image 
                        source={{ uri: profileImage }} 
                        size={100} 
                        style={styles.avatar} 
                        loading={loading}
                    />
                    <View style={styles.editIconContainer}>
                        <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.name}>{username}</Text>
                <Text style={styles.email}>{user?.email || "user@example.com"}</Text>
            </View>

            {/* Các nút thao tác tài khoản */}
            <View style={styles.buttonContainer}>
                <Button 
                    mode="contained" 
                    onPress={() => navigation.navigate("MyReviews")} 
                    style={styles.reviewsButton} 
                    icon="comment-text-multiple"
                >
                    Đánh giá của tôi
                </Button>
                <Button 
                    mode="contained" 
                    onPress={() => navigation.navigate("EditProfile")} 
                    style={styles.settingsButton} 
                    icon="account-outline"
                >
                    Chỉnh sửa thông tin cá nhân
                </Button>
            </View>

            {/* Nút đăng xuất */}
            <View style={styles.buttonContainer}>
                <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton} icon="logout">
                    Đăng xuất
                </Button>
            </View>

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
        </ScrollView>
    );
};

const CardSection = ({ title, items }) => (
    <Card style={styles.card}>
        <Card.Content>
            <Text style={styles.sectionTitle}>{title}</Text>
            {items.map((item, index) => (
                <View key={index}>
                    <List.Item title={item.title} description={item.description} left={(props) => <List.Icon {...props} icon={item.icon} />} />
                    {index < items.length - 1 && <Divider />}
                </View>
            ))}
        </Card.Content>
    </Card>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F5F5" },
    header: { backgroundColor: "#1E88E5", padding: 20, alignItems: "center" },
    avatar: { backgroundColor: "#FFFFFF" },
    editIconContainer: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#1E88E5", borderRadius: 20, padding: 5 },
    name: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginTop: 10 },
    email: { fontSize: 16, color: "#FFFFFF" },
    statusContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
    statusLabel: { color: "#FFFFFF", fontSize: 16 },
    statusToggle: { flexDirection: "row", alignItems: "center" },
    statusText: { marginRight: 10, color: "#FFFFFF", fontSize: 16 },
    card: { margin: 10 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    buttonContainer: { margin: 20 },
    reviewsButton: { marginTop: 10, marginBottom: 10, backgroundColor: "#4CAF50" },
    settingsButton: { marginTop: 10 },
    logoutButton: { marginTop: 10 }
});

export default ProfileScreen;
