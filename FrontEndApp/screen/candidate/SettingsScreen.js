import { useContext, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, List, Switch, Text } from "react-native-paper";
import { AuthContext } from "../../contexts/AuthContext";

const SettingsScreen = () => {
    const { logout } = useContext(AuthContext);

    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);

    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
            { text: "Hủy", style: "cancel" },
            { text: "Đăng xuất", onPress: () => logout() },
        ]);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Cài đặt</Text>
            </View>

            {/* Thông báo */}
            <List.Section>
                <List.Subheader>Thông báo</List.Subheader>
                <List.Item
                    title="Thông báo đẩy"
                    description="Nhận thông báo về trạng thái ứng tuyển và tin nhắn mới"
                    left={(props) => <List.Icon {...props} icon="bell-outline" />}
                    right={(props) => (
                        <Switch value={pushNotifications} onValueChange={setPushNotifications} color="#1E88E5" />
                    )}
                />
                <Divider />
                <List.Item
                    title="Thông báo email"
                    description="Nhận email về trạng thái ứng tuyển và tin nhắn mới"
                    left={(props) => <List.Icon {...props} icon="email-outline" />}
                    right={(props) => (
                        <Switch value={emailNotifications} onValueChange={setEmailNotifications} color="#1E88E5" />
                    )}
                />
            </List.Section>

            <Divider />

            {/* Đăng xuất */}
            <View style={styles.buttonContainer}>
                <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton} icon="logout">
                    Đăng xuất
                </Button>
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
        paddingTop: 40,
        backgroundColor: "#1E88E5",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    buttonContainer: {
        padding: 16,
        marginBottom: 24,
    },
    logoutButton: {
        borderColor: "#D32F2F",
    },
});

export default SettingsScreen;
