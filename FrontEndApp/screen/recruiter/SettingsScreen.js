import { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Button, Divider, List, Surface, Text } from "react-native-paper";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { AuthContext } from "../../contexts/AuthContext";

const SettingsScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);

    return (
        <ScreenContainer>
            <Surface style={styles.header}>
                <Avatar.Image
                    source={{ uri: user?.avatar || "https://via.placeholder.com/150" }}
                    size={80}
                />
                <View style={styles.headerInfo}>
                    <Text style={styles.name}>{user?.username || "Nhà tuyển dụng"}</Text>
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
                        title="Đánh giá của tôi"
                        description="Xem danh sách đánh giá bạn đã viết"
                        left={props => <List.Icon {...props} icon="comment-text-multiple" />}
                        onPress={() => navigation.navigate("MyReviews")}
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
                onPress={logout}
                style={styles.logoutButton}
            >
                Đăng xuất
            </Button>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
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
});

export default SettingsScreen;

