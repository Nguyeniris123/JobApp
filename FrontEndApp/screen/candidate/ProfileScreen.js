import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useContext, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Button, Card, Divider, List, Switch, Text } from "react-native-paper";
import { AuthContext } from "../../contexts/AuthContext";

const ProfileScreen = ({ navigation }) => {
    const { state } = useContext(AuthContext);
    const { user } = state;

    const [profileImage, setProfileImage] = useState(user?.avatar || "https://via.placeholder.com/150");
    const [availableForWork, setAvailableForWork] = useState(user?.availableForWork ?? true);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            console.log("Error picking image:", error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={pickImage}>
                    <Avatar.Image source={{ uri: profileImage }} size={100} style={styles.avatar} />
                    <View style={styles.editIconContainer}>
                        <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.name}>{user?.name || "Người dùng"}</Text>
                <Text style={styles.email}>{user?.email || "user@example.com"}</Text>

                <View style={styles.statusContainer}>
                    <Text style={styles.statusLabel}>Trạng thái tìm việc:</Text>
                    <View style={styles.statusToggle}>
                        <Text style={styles.statusText}>{availableForWork ? "Đang tìm việc" : "Không tìm việc"}</Text>
                        <Switch value={availableForWork} onValueChange={setAvailableForWork} color="#1E88E5" />
                    </View>
                </View>
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
                    </View>

                    <List.Item title="Số điện thoại" description={user?.phone || "Chưa cập nhật"} left={(props) => <List.Icon {...props} icon="phone" />} />
                    <Divider />
                    <List.Item title="Địa chỉ" description={user?.address || "Chưa cập nhật"} left={(props) => <List.Icon {...props} icon="map-marker" />} />
                    <Divider />
                    <List.Item title="Ngày sinh" description={user?.dob || "Chưa cập nhật"} left={(props) => <List.Icon {...props} icon="calendar" />} />
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Kỹ năng</Text>
                    </View>
                    <View style={styles.skillsContainer}>
                        {(user?.skills || []).map((skill, index) => (
                            <View key={index} style={styles.skillItem}>
                                <Text style={styles.skillText}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Học vấn</Text>
                    </View>
                    {(user?.education || []).map((edu, index) => (
                        <View key={index} style={styles.educationItem}>
                            <Text style={styles.schoolName}>{edu.school}</Text>
                            <Text style={styles.degree}>{edu.degree}</Text>
                            <Text style={styles.year}>{edu.year}</Text>
                        </View>
                    ))}
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Kinh nghiệm làm việc</Text>
                    </View>
                    {(user?.experience || []).map((exp, index) => (
                        <View key={index} style={styles.experienceItem}>
                            <Text style={styles.companyName}>{exp.company}</Text>
                            <Text style={styles.position}>{exp.position}</Text>
                            <Text style={styles.duration}>{exp.duration}</Text>
                            <Text style={styles.description}>{exp.description}</Text>
                        </View>
                    ))}
                </Card.Content>
            </Card>

            <View style={styles.buttonContainer}>
                <Button mode="contained" onPress={() => navigation.navigate("Settings")} style={styles.settingsButton} icon="cog">
                    Cài đặt tài khoản
                </Button>
            </View>
        </ScrollView>
    );
};

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
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: "bold" },
    skillsContainer: { flexDirection: "row", flexWrap: "wrap" },
    skillItem: { backgroundColor: "#E0E0E0", padding: 8, borderRadius: 5, marginRight: 5, marginBottom: 5 },
    skillText: { fontSize: 14 },
    buttonContainer: { alignItems: "center", margin: 20 },
    settingsButton: { backgroundColor: "#1E88E5" },
});

export default ProfileScreen;
