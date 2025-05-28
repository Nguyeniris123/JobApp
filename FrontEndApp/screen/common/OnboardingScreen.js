import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, FlatList, Image, StyleSheet, View } from "react-native"
import { Button, Text } from "react-native-paper"

const { width, height } = Dimensions.get("window")

const slides = [
    {
        id: "1",
        title: "Tìm việc làm bán thời gian",
        description: "Hàng ngàn công việc bán thời gian đang chờ bạn khám phá",
        image: "../../assets/images/title1.png",
    },
    {
        id: "2",
        title: "Ứng tuyển dễ dàng",
        description: "Chỉ với vài thao tác đơn giản, bạn đã có thể ứng tuyển vào công việc mong muốn",
        image: "https://via.placeholder.com/300",
    },
    {
        id: "3",
        title: "Kết nối với nhà tuyển dụng",
        description: "Trò chuyện trực tiếp với nhà tuyển dụng để hiểu rõ hơn về công việc",
        image: "../../assets/images/title2.png",
    },
]

const OnboardingScreen = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const flatListRef = useRef(null)
    const scrollX = useRef(new Animated.Value(0)).current

    useEffect(() => {
        const checkOnboarding = async () => {
            const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding")
            if (hasSeenOnboarding) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "HomeTab" }],
                })
            }
        }
        checkOnboarding()
    }, [])

    const renderItem = ({ item }) => (
        <View style={styles.slide}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
    )

    const renderDots = () => {
        return slides.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width]
            const dotSize = scrollX.interpolate({
                inputRange,
                outputRange: [8, 12, 8],
                extrapolate: "clamp",
            })
            return <Animated.View key={index} style={[styles.dot, { width: dotSize, height: dotSize }]} />
        })
    }

    const handleNext = async () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current.scrollToIndex({ index: currentIndex + 1 })
            setCurrentIndex(currentIndex + 1)
        } else {
            await AsyncStorage.setItem("hasSeenOnboarding", "true")
            navigation.reset({
                index: 0,
                routes: [{ name: "HomeTab" }],
            })
        }
    }

    const handleSkip = async () => {
        await AsyncStorage.setItem("hasSeenOnboarding", "true")
        navigation.reset({
            index: 0,
            routes: [{ name: "HomeTab" }],
        })
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: false,
                })}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width)
                    setCurrentIndex(index)
                }}
            />
            <View style={styles.dotsContainer}>{renderDots()}</View>
            <View style={styles.buttonsContainer}>
                <Button mode="text" onPress={handleSkip}>
                    Bỏ qua
                </Button>
                <Button mode="contained" onPress={handleNext}>
                    {currentIndex === slides.length - 1 ? "Bắt đầu" : "Tiếp theo"}
                </Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    slide: {
        width,
        height,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    image: {
        width: width * 0.7,
        height: height * 0.4,
        resizeMode: "contain",
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#212121",
        textAlign: "center",
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: "#757575",
        textAlign: "center",
        paddingHorizontal: 20,
    },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#1E88E5",
        marginHorizontal: 5,
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 40,
    },
})

export default OnboardingScreen
