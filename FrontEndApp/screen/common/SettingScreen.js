import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useContext } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../contexts/AuthContext";

const SettingScreen = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0033ff", "#00aaff"]} style={styles.header}>
                <Text style={styles.menuText}>Settings</Text>
            </LinearGradient>

            {!isAuthenticated ? (
                <View style={styles.signInContainer}>
                    <Image
                        source={{ uri: "https://i.pravatar.cc/200" }}
                        style={styles.avatar}
                    />
                    <Text style={styles.signInText}>Sign in to unlock features!</Text>
                    <TouchableOpacity
                        style={styles.signInButton}
                        onPress={() => navigation.navigate("Login")}
                    >
                        <Text style={styles.signInButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.loggedInContainer}>
                    <Text style={styles.welcomeText}>Welcome back!</Text>
                    {/* Thêm nội dung khác sau khi đăng nhập */}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    // Header
    header: {
        padding: 40,
        alignItems: "center",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    menuText: { fontSize: 22, color: "white", fontWeight: "bold" },

    // Khi chưa đăng nhập
    signInContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
    signInText: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 10 },
    signInButton: {
        backgroundColor: "#ff7043",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 5,
    },
    signInButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },

    // Khi đã đăng nhập
    loggedInContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    welcomeText: { fontSize: 20, fontWeight: "bold", color: "#333" },
});

export default SettingScreen;
