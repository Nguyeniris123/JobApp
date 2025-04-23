import { useContext } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, List, Text } from "react-native-paper";
import { AuthContext } from "../../contexts/AuthContext";

const SettingsScreen = ({ navigation }) => {
    const { logout, role } = useContext(AuthContext);

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

            <List.Section>
                {role === 'recruiter' && (
                    <>
                        <List.Item
                            title="Hồ sơ công ty"
                            description="Chỉnh sửa thông tin công ty"
                            left={(props) => <List.Icon {...props} icon="domain" />}
                            onPress={() => navigation.navigate('CompanyProfile')}
                        />
                        <Divider />
                    </>
                )}

                <List.Item
                    title="Tài khoản"
                    description="Chỉnh sửa thông tin cá nhân"
                    left={(props) => <List.Icon {...props} icon="account-outline" />}
                    onPress={() => navigation.navigate('EditProfile')}
                />
            </List.Section>

            <Divider />

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
