
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useContext } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { AuthContext } from "../../contexts/AuthContext";

const SettingScreen = () => {
    const { isAuthenticated, user, logout } = useContext(AuthContext);

    const navigation = useNavigation();

    return (
        <ScrollView style={styles.container}>
            {/* Header với gradient + search */}
            <LinearGradient colors={["#0033ff", "#00aaff"]} style={styles.header}>
                <Text style={styles.menuText}>Menu</Text>
                <Ionicons name="search-outline" size={24} color="white" />
            </LinearGradient>

            {
                isAuthenticated == false ? (
                    <View style={styles.signInContainer}>
                        <Image
                            source={{ uri: "https://i.pravatar.cc/150" }} // Thay bằng ảnh của bạn
                            style={styles.avatar}
                        />
                        <Text style={styles.signInText}>Sign in to apply!</Text>
                        <TouchableOpacity
                            style={styles.signInButton}
                            onPress={() => navigation.navigate("Login")}
                        >
                            <Text style={styles.signInButtonText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.userContainer}>
                        {/* <Image source={{ uri: user.avatar }} style={styles.avatar} /> */}
                        {/* <Text style={styles.username}>{user.name}</Text> */}
                        <TouchableOpacity style={styles.signOutButton} onPress={logout}>
                            <Text style={styles.signOutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                )
            }

            {/* Featured Companies (Giao diện, chưa có API) */}
            <Text style={styles.sectionTitle}>Featured Companies</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.companyCard}>
                    <Image
                        source={{
                            uri: "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png",
                        }}
                        style={styles.companyLogo}
                    />
                    <Text style={styles.companyName}>JavaScript Corp</Text>
                    <Text style={styles.newJobTag}>New job</Text>
                </View>

                <View style={styles.companyCard}>
                    <Image
                        source={{
                            uri: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
                        }}
                        style={styles.companyLogo}
                    />
                    <Text style={styles.companyName}>React Ltd</Text>
                    <Text style={styles.newJobTag}>New job</Text>
                </View>
            </ScrollView>

            {/* Account Settings */}
            <Text style={styles.sectionTitle}>Account Setting</Text>
            <TouchableOpacity style={styles.settingItem}>
                <Ionicons name="globe-outline" size={22} color="#333" />
                <Text style={styles.settingText}>Language</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
                <Ionicons name="help-circle-outline" size={22} color="#333" />
                <Text style={styles.settingText}>FAQ</Text>
            </TouchableOpacity>

            {/* Phiên bản */}
            <Text style={styles.version}>Version 3.7.0</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    // Header
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 40,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    menuText: { fontSize: 22, color: "white", fontWeight: "bold" },
    signInText: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    signInButton: {
        backgroundColor: "#ff7043",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
    },
    signInButtonText: { color: "white", fontWeight: "bold" },
    userContainer: {
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        elevation: 5,
        width: "90%",
    },
    username: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 10 },
    signOutButton: {
        backgroundColor: "#d9534f",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 10,
    },
    signOutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    // Section Title
    sectionTitle: { fontSize: 18, fontWeight: "bold", margin: 20 },

    // Featured Companies
    companyCard: {
        backgroundColor: "#f9f9f9",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: 10,
    },
    companyLogo: { width: 50, height: 50, marginBottom: 5 },
    companyName: { fontSize: 14, fontWeight: "bold", color: "#333" },
    newJobTag: {
        backgroundColor: "#007aff",
        color: "#fff",
        fontSize: 12,
        paddingVertical: 2,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginTop: 5,
    },

    // Account Settings
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    settingText: { fontSize: 16, marginLeft: 10, color: "#333" },

    // Version
    version: {
        textAlign: "center",
        color: "#aaa",
        fontSize: 14,
        marginVertical: 20,
    },
});

export default SettingScreen;

