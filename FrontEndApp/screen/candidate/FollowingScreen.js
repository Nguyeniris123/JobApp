import { useContext, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import CompanyCard from "../../components/ui/CompanyCard";
import { AuthContext } from "../../contexts/AuthContext";
import { CompanyContext } from "../../contexts/CompanyContext";

const FollowingScreen = ({ navigation }) => {
    const { loading, followedCompanies, unfollowCompany } = useContext(CompanyContext);
    const { isAuthenticated } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);

    const handleUnfollow = (companyId) => {
        unfollowCompany(companyId);
    };

    const renderCompanyItem = ({ item }) => (
        <CompanyCard
            company={item}
            onPress={() => navigation.navigate("CompanyDetail", { companyId: item.id })}
            onUnfollow={() => handleUnfollow(item.id)}
        />
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E88E5" />
            </View>
        );
    }

    if (!isAuthenticated) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Bạn cần đăng nhập để xem danh sách theo dõi</Text>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate("Login")}
                    style={styles.loginButton}
                >
                    Đăng nhập ngay
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Công ty đang theo dõi</Text>
            </View>

            {followedCompanies.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Bạn chưa theo dõi công ty nào</Text>
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate("Companies")}
                        style={styles.browseButton}
                    >
                        Khám phá công ty
                    </Button>
                </View>
            ) : (
                <FlatList
                    data={followedCompanies}
                    renderItem={renderCompanyItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.companyList}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                />
            )}
        </View>
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: "#757575",
        textAlign: "center",
        marginBottom: 20,
    },
    loginButton: {
        marginTop: 20,
        backgroundColor: "#1E88E5",
    },
    browseButton: {
        marginTop: 20,
    },
    companyList: {
        padding: 16,
    },
});

export default FollowingScreen;