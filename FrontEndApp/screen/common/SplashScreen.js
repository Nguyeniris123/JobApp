import { useNavigation } from "@react-navigation/native"
import { useEffect, useRef } from "react"
import { Animated, Image, StyleSheet, View } from "react-native"
import { Text } from "react-native-paper"

const SplashScreen = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current
    const navigation = useNavigation()

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 3500,
            useNativeDriver: true,
        }).start()

        // Chuyển sang màn hình Onboarding hoặc Home sau 4 giây
        const timer = setTimeout(() => {
            navigation.navigate("Onboarding") // Hoặc "Home" nếu đã xem Onboarding
        }, 4000)

        return () => clearTimeout(timer) // Xóa timer nếu component unmount
    }, [])

    return (
        <View style={styles.container}>
            <Animated.View style={{ opacity: fadeAnim }}>
                <Image source={{ uri: "https://via.placeholder.com/200" }} style={styles.logo} />
                <Text style={styles.title}>JobFinder</Text>
                <Text style={styles.subtitle}>Tìm việc làm bán thời gian dễ dàng</Text>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: "contain",
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1E88E5",
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#757575",
        textAlign: "center",
    },
})

export default SplashScreen
