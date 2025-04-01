import { MaterialCommunityIcons } from "@expo/vector-icons"
import axios from 'axios'
import * as ImagePicker from "expo-image-picker"
import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { Button, Card, Chip, Divider, HelperText, Snackbar, Text, TextInput } from "react-native-paper"
import { AuthContext } from "../../contexts/AuthContext"

const CompanyProfileScreen = ({ navigation }) => {
    const { state } = useContext(AuthContext)
    const { user } = state
    const { t } = useTranslation()

    // Default empty company data
    const emptyCompanyData = {
        name: "",
        logo: "https://via.placeholder.com/150",
        industry: "",
        size: "",
        website: "",
        description: "",
        address: "",
        phone: "",
        email: "",
    }

    const [companyData, setCompanyData] = useState(emptyCompanyData)
    const [logo, setLogo] = useState(emptyCompanyData.logo)
    const [editing, setEditing] = useState(false)
    const [errors, setErrors] = useState({})
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState("")

    // Fetch company data on component mount
    useEffect(() => {
        fetchCompanyData()
    }, [])

    const fetchCompanyData = async () => {
        try {
            const response = await axios.get('http://192.168.1.5:8000/company/profile/')
            if (response.data) {
                setCompanyData(response.data)
                setLogo(response.data.logo)
            }
        } catch (error) {
            console.error("Error fetching company data:", error)
            setSnackbarMessage("Không thể tải thông tin công ty")
            setSnackbarVisible(true)
        }
    }

    const updateCompanyData = (field, value) => {
        setCompanyData({
            ...companyData,
            [field]: value,
        })
        // Xóa lỗi khi người dùng nhập
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: null,
            })
        }
    }

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            })

            if (!result.canceled) {
                setLogo(result.assets[0].uri)
                updateCompanyData("logo", result.assets[0].uri)
            }
        } catch (error) {
            console.log("Error picking image:", error)
        }
    }

    const validateForm = () => {
        const newErrors = {}
        let isValid = true

        if (!companyData.name || companyData.name.trim() === "") {
            newErrors.name = "Tên công ty là bắt buộc"
            isValid = false
        }

        if (!companyData.industry || companyData.industry.trim() === "") {
            newErrors.industry = "Ngành nghề là bắt buộc"
            isValid = false
        }

        if (!companyData.description || companyData.description.trim() === "") {
            newErrors.description = "Mô tả công ty là bắt buộc"
            isValid = false
        }

        if (!companyData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyData.email)) {
            newErrors.email = "Email không hợp lệ"
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSave = async () => {
        if (!validateForm()) {
            return
        }

        try {
            const response = await axios.put('http://192.168.1.5:8000/company/profile/', companyData)
            if (response.data) {
                setEditing(false)
                setSnackbarMessage("Cập nhật thông tin công ty thành công")
                setSnackbarVisible(true)
                fetchCompanyData() // Refresh data
            }
        } catch (error) {
            console.error("Error updating company data:", error)
            setSnackbarMessage("Cập nhật thông tin thất bại")
            setSnackbarVisible(true)
        }
    }

    const handleCancel = () => {
        fetchCompanyData() // Reload original data
        setEditing(false)
        setErrors({})
    }

    // Danh sách ngành nghề
    const industries = [
        "Công nghệ thông tin",
        "Tài chính - Ngân hàng",
        "Giáo dục - Đào tạo",
        "Bán lẻ",
        "Sản xuất",
        "Dịch vụ",
        "Y tế",
        "Xây dựng",
        "Khác",
    ]

    // Danh sách quy mô công ty
    const companySizes = [
        "Dưới 10 nhân viên",
        "10-50 nhân viên",
        "50-200 nhân viên",
        "200-500 nhân viên",
        "500-1000 nhân viên",
        "Trên 1000 nhân viên",
    ]

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Hồ sơ công ty</Text>
            </View>

            <View style={styles.logoContainer}>
                <Image source={{ uri: logo }} style={styles.logo} />
                {editing && (
                    <TouchableOpacity style={styles.editLogoButton} onPress={pickImage}>
                        <MaterialCommunityIcons name="camera" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Thông tin cơ bản</Text>
                        {!editing && (
                            <Button mode="text" onPress={() => setEditing(true)}>
                                Chỉnh sửa
                            </Button>
                        )}
                    </View>

                    {editing ? (
                        <View>
                            <TextInput
                                label="Tên công ty *"
                                value={companyData.name}
                                onChangeText={(text) => updateCompanyData("name", text)}
                                mode="outlined"
                                style={styles.input}
                                error={!!errors.name}
                            />
                            {errors.name && <HelperText type="error">{errors.name}</HelperText>}

                            <Text style={styles.inputLabel}>Ngành nghề *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
                                {industries.map((industry, index) => (
                                    <Chip
                                        key={index}
                                        selected={companyData.industry === industry}
                                        onPress={() => updateCompanyData("industry", industry)}
                                        style={styles.chip}
                                        selectedColor="#1E88E5"
                                    >
                                        {industry}
                                    </Chip>
                                ))}
                            </ScrollView>
                            {errors.industry && <HelperText type="error">{errors.industry}</HelperText>}

                            <Text style={styles.inputLabel}>Quy mô công ty</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
                                {companySizes.map((size, index) => (
                                    <Chip
                                        key={index}
                                        selected={companyData.size === size}
                                        onPress={() => updateCompanyData("size", size)}
                                        style={styles.chip}
                                        selectedColor="#1E88E5"
                                    >
                                        {size}
                                    </Chip>
                                ))}
                            </ScrollView>

                            <TextInput
                                label="Website"
                                value={companyData.website}
                                onChangeText={(text) => updateCompanyData("website", text)}
                                mode="outlined"
                                style={styles.input}
                            />

                            <TextInput
                                label="Địa chỉ"
                                value={companyData.address}
                                onChangeText={(text) => updateCompanyData("address", text)}
                                mode="outlined"
                                style={styles.input}
                            />

                            <TextInput
                                label="Số điện thoại"
                                value={companyData.phone}
                                onChangeText={(text) => updateCompanyData("phone", text)}
                                mode="outlined"
                                style={styles.input}
                                keyboardType="phone-pad"
                            />

                            <TextInput
                                label="Email liên hệ *"
                                value={companyData.email}
                                onChangeText={(text) => updateCompanyData("email", text)}
                                mode="outlined"
                                style={styles.input}
                                keyboardType="email-address"
                                error={!!errors.email}
                            />
                            {errors.email && <HelperText type="error">{errors.email}</HelperText>}

                            <TextInput
                                label="Mô tả công ty *"
                                value={companyData.description}
                                onChangeText={(text) => updateCompanyData("description", text)}
                                mode="outlined"
                                style={styles.input}
                                multiline
                                numberOfLines={5}
                                error={!!errors.description}
                            />
                            {errors.description && <HelperText type="error">{errors.description}</HelperText>}

                            <View style={styles.buttonContainer}>
                                <Button mode="outlined" onPress={handleCancel} style={styles.cancelButton}>
                                    Hủy
                                </Button>
                                <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                                    Lưu
                                </Button>
                            </View>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Tên công ty:</Text>
                                <Text style={styles.infoValue}>{companyData.name}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Ngành nghề:</Text>
                                <Text style={styles.infoValue}>{companyData.industry}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Quy mô:</Text>
                                <Text style={styles.infoValue}>{companyData.size}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Website:</Text>
                                <Text style={styles.infoValue}>{companyData.website}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Địa chỉ:</Text>
                                <Text style={styles.infoValue}>{companyData.address}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Số điện thoại:</Text>
                                <Text style={styles.infoValue}>{companyData.phone}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Email liên hệ:</Text>
                                <Text style={styles.infoValue}>{companyData.email}</Text>
                            </View>

                            <Divider style={styles.divider} />

                            <Text style={styles.infoLabel}>Mô tả công ty:</Text>
                            <Text style={styles.description}>{companyData.description}</Text>
                        </View>
                    )}
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.cardTitle}>Thống kê</Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>12</Text>
                            <Text style={styles.statLabel}>Tin đăng</Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>45</Text>
                            <Text style={styles.statLabel}>Ứng viên</Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>8</Text>
                            <Text style={styles.statLabel}>Đã tuyển</Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.cardTitle}>Đánh giá</Text>

                    <View style={styles.ratingContainer}>
                        <Text style={styles.ratingValue}>4.5</Text>
                        <View style={styles.starsContainer}>
                            <MaterialCommunityIcons name="star" size={24} color="#FFC107" />
                            <MaterialCommunityIcons name="star" size={24} color="#FFC107" />
                            <MaterialCommunityIcons name="star" size={24} color="#FFC107" />
                            <MaterialCommunityIcons name="star" size={24} color="#FFC107" />
                            <MaterialCommunityIcons name="star-half" size={24} color="#FFC107" />
                        </View>
                        <Text style={styles.reviewCount}>(15 đánh giá)</Text>
                    </View>

                    <Button
                        mode="outlined"
                        icon="comment-multiple-outline"
                        onPress={() => navigation.navigate("Review")}
                        style={styles.viewReviewsButton}
                    >
                        Xem đánh giá
                    </Button>
                </Card.Content>
            </Card>

            <View style={styles.bottomSpace} />

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: "Đóng",
                    onPress: () => setSnackbarVisible(false),
                }}
            >
                {snackbarMessage}
            </Snackbar>
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
    logoContainer: {
        alignItems: "center",
        marginTop: -40,
        marginBottom: 20,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: "#FFFFFF",
    },
    editLogoButton: {
        position: "absolute",
        bottom: 0,
        right: "35%",
        backgroundColor: "#1E88E5",
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    card: {
        margin: 16,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#212121",
    },
    input: {
        marginBottom: 16,
        backgroundColor: "#FFFFFF",
    },
    inputLabel: {
        fontSize: 14,
        color: "#757575",
        marginBottom: 8,
    },
    chipsContainer: {
        flexDirection: "row",
        marginBottom: 16,
    },
    chip: {
        margin: 4,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        marginRight: 8,
    },
    saveButton: {
        flex: 1,
        marginLeft: 8,
    },
    infoItem: {
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: "#757575",
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: "#212121",
    },
    divider: {
        marginVertical: 16,
    },
    description: {
        fontSize: 16,
        color: "#212121",
        lineHeight: 24,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 16,
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1E88E5",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: "#757575",
    },
    ratingContainer: {
        alignItems: "center",
        marginVertical: 16,
    },
    ratingValue: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#212121",
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: "row",
        marginBottom: 8,
    },
    reviewCount: {
        fontSize: 14,
        color: "#757575",
    },
    viewReviewsButton: {
        marginTop: 16,
    },
    bottomSpace: {
        height: 24,
    },
})

export default CompanyProfileScreen

