"use client"

import { useContext, useState } from "react"
import { Alert, ScrollView, StyleSheet, View } from "react-native"
import { Button, Dialog, Divider, List, Portal, Switch, Text, TextInput } from "react-native-paper"
import { AuthContext } from "../../contexts/AuthContext"

const SettingsScreen = ({ navigation }) => {
    const { logout } = useContext(AuthContext)
    const { t } = useTranslation()

    const [pushNotifications, setPushNotifications] = useState(true)
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [jobAlerts, setJobAlerts] = useState(true)
    const [darkMode, setDarkMode] = useState(false)
    const [language, setLanguage] = useState(i18n.getLocale())
    const [visible, setVisible] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [languageDialogVisible, setLanguageDialogVisible] = useState(false)

    const showDialog = () => setVisible(true)
    const hideDialog = () => {
        setVisible(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
    }

    const handleChangePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin")
            return
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu mới không khớp")
            return
        }

        // Giả lập API call
        setTimeout(() => {
            // Theo dõi sự kiện đổi mật khẩu
            analyticsService.trackEvent("change_password")

            Alert.alert("Thành công", "Mật khẩu đã được thay đổi")
            hideDialog()
        }, 1000)
    }

    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
            {
                text: "Hủy",
                style: "cancel",
            },
            {
                text: "Đăng xuất",
                onPress: () => {
                    // Theo dõi sự kiện đăng xuất
                    analyticsService.trackEvent("logout")

                    logout()
                },
            },
        ])
    }

    const handleDeleteAccount = () => {
        Alert.alert("Xóa tài khoản", "Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.", [
            {
                text: "Hủy",
                style: "cancel",
            },
            {
                text: "Xóa tài khoản",
                onPress: () => {
                    // Giả lập API call
                    setTimeout(() => {
                        // Theo dõi sự kiện xóa tài khoản
                        analyticsService.trackEvent("delete_account")

                        Alert.alert("Thành công", "Tài khoản đã được xóa")
                        logout()
                    }, 1000)
                },
                style: "destructive",
            },
        ])
    }

    const handleChangeLanguage = (newLanguage) => {
        setLanguage(newLanguage)
        i18n.setLocale(newLanguage)
        setLanguageDialogVisible(false)

        // Theo dõi sự kiện thay đổi ngôn ngữ
        analyticsService.trackEvent("change_language", {
            language: newLanguage,
        })
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Cài đặt</Text>
            </View>

            <List.Section>
                <List.Subheader>Thông báo</List.Subheader>
                <List.Item
                    title="Thông báo đẩy"
                    description="Nhận thông báo về ứng viên mới và tin nhắn"
                    left={(props) => <List.Icon {...props} icon="bell-outline" />}
                    right={(props) => (
                        <Switch
                            value={pushNotifications}
                            onValueChange={(value) => {
                                setPushNotifications(value)
                                // Theo dõi sự kiện thay đổi cài đặt
                                analyticsService.trackEvent("toggle_push_notifications", {
                                    enabled: value,
                                })
                            }}
                            color="#1E88E5"
                        />
                    )}
                />
                <Divider />
                <List.Item
                    title="Thông báo email"
                    description="Nhận email về ứng viên mới và tin nhắn"
                    left={(props) => <List.Icon {...props} icon="email-outline" />}
                    right={(props) => (
                        <Switch
                            value={emailNotifications}
                            onValueChange={(value) => {
                                setEmailNotifications(value)
                                // Theo dõi sự kiện thay đổi cài đặt
                                analyticsService.trackEvent("toggle_email_notifications", {
                                    enabled: value,
                                })
                            }}
                            color="#1E88E5"
                        />
                    )}
                />
                <Divider />
                <List.Item
                    title="Cảnh báo ứng viên"
                    description="Nhận thông báo khi có ứng viên phù hợp"
                    left={(props) => <List.Icon {...props} icon="account-search" />}
                    right={(props) => (
                        <Switch
                            value={jobAlerts}
                            onValueChange={(value) => {
                                setJobAlerts(value)
                                // Theo dõi sự kiện thay đổi cài đặt
                                analyticsService.trackEvent("toggle_job_alerts", {
                                    enabled: value,
                                })
                            }}
                            color="#1E88E5"
                        />
                    )}
                />
            </List.Section>

            <Divider />

            <List.Section>
                <List.Subheader>Giao diện</List.Subheader>
                <List.Item
                    title="Chế độ tối"
                    description="Thay đổi giao diện sang chế độ tối"
                    left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
                    right={(props) => (
                        <Switch
                            value={darkMode}
                            onValueChange={(value) => {
                                setDarkMode(value)
                                // Theo dõi sự kiện thay đổi cài đặt
                                analyticsService.trackEvent("toggle_dark_mode", {
                                    enabled: value,
                                })
                            }}
                            color="#1E88E5"
                        />
                    )}
                />
            </List.Section>

            <Divider />

            <List.Section>
                <List.Subheader>Tài khoản</List.Subheader>
                <List.Item
                    title="Đổi mật khẩu"
                    left={(props) => <List.Icon {...props} icon="lock-outline" />}
                    onPress={showDialog}
                />
                <Divider />
                <List.Item
                    title="Hồ sơ công ty"
                    left={(props) => <List.Icon {...props} icon="domain" />}
                    onPress={() => navigation.navigate("CompanyProfile")}
                />
                <Divider />
                <List.Item
                    title="Ngôn ngữ"
                    description={language === "vi" ? "Tiếng Việt" : "English"}
                    left={(props) => <List.Icon {...props} icon="translate" />}
                    onPress={() => setLanguageDialogVisible(true)}
                />
            </List.Section>

            <Divider />

            <List.Section>
                <List.Subheader>Khác</List.Subheader>
                <List.Item
                    title="Về ứng dụng"
                    left={(props) => <List.Icon {...props} icon="information-outline" />}
                    onPress={() => {
                        // Theo dõi sự kiện xem thông tin ứng dụng
                        analyticsService.trackEvent("view_about_app")
                    }}
                />
                <Divider />
                <List.Item
                    title="Điều khoản sử dụng"
                    left={(props) => <List.Icon {...props} icon="file-document-outline" />}
                    onPress={() => {
                        // Theo dõi sự kiện xem điều khoản
                        analyticsService.trackEvent("view_terms")
                    }}
                />
                <Divider />
                <List.Item
                    title="Chính sách bảo mật"
                    left={(props) => <List.Icon {...props} icon="shield-check-outline" />}
                    onPress={() => {
                        // Theo dõi sự kiện xem chính sách bảo mật
                        analyticsService.trackEvent("view_privacy_policy")
                    }}
                />
            </List.Section>

            <View style={styles.buttonContainer}>
                <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton} icon="logout">
                    Đăng xuất
                </Button>
                <Button mode="outlined" onPress={handleDeleteAccount} style={styles.deleteButton} icon="delete" color="#D32F2F">
                    Xóa tài khoản
                </Button>
            </View>

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Đổi mật khẩu</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Mật khẩu hiện tại"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                            mode="outlined"
                            style={styles.input}
                        />
                        <TextInput
                            label="Mật khẩu mới"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            mode="outlined"
                            style={styles.input}
                        />
                        <TextInput
                            label="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            mode="outlined"
                            style={styles.input}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>Hủy</Button>
                        <Button onPress={handleChangePassword}>Xác nhận</Button>
                    </Dialog.Actions>
                </Dialog>

                <Dialog visible={languageDialogVisible} onDismiss={() => setLanguageDialogVisible(false)}>
                    <Dialog.Title>Chọn ngôn ngữ</Dialog.Title>
                    <Dialog.Content>
                        <List.Item
                            title="Tiếng Việt"
                            onPress={() => handleChangeLanguage("vi")}
                            right={(props) => language === "vi" && <List.Icon {...props} icon="check" />}
                        />
                        <List.Item
                            title="English"
                            onPress={() => handleChangeLanguage("en")}
                            right={(props) => language === "en" && <List.Icon {...props} icon="check" />}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setLanguageDialogVisible(false)}>Hủy</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView>
    )
}

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
        marginBottom: 16,
        borderColor: "#1E88E5",
    },
    deleteButton: {
        borderColor: "#D32F2F",
    },
    input: {
        marginBottom: 16,
    },
})

export default SettingsScreen

