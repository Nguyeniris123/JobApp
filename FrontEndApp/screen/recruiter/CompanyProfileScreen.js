import * as ImagePicker from "expo-image-picker"
import { useContext, useEffect, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { Button, Card, HelperText, Snackbar, Text, TextInput } from "react-native-paper"
import { AuthContext } from "../../contexts/AuthContext"

const CompanyProfileScreen = ({ navigation }) => {
    const auth = useContext(AuthContext);
    const { user, accessToken } = auth;

    // Default empty company data
    const emptyCompanyData = {
        name: "",
        logo: "https://via.placeholder.com/150",
        tax_code: "",
        description: "",
        location: "",
        is_verified: false,
        images: [],
    }

    const [companyData, setCompanyData] = useState(emptyCompanyData)
    const [logo, setLogo] = useState(emptyCompanyData.logo)
    const [editing, setEditing] = useState(false)
    const [errors, setErrors] = useState({})
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState("")

    // Lấy company data trực tiếp từ user (không gọi API)
    useEffect(() => {
        if (user && user.company) {
            setCompanyData(user.company);
            setLogo(user.company.logo || emptyCompanyData.logo);
        }
    }, [user]);

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

        if (!companyData.description || companyData.description.trim() === "") {
            newErrors.description = "Mô tả công ty là bắt buộc"
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            // Gửi cập nhật thông tin công ty qua API chuẩn trong apiConfig
            const response = await auth.updateCompanyProfile(companyData);
            if (response) {
                setEditing(false);
                setSnackbarMessage("Cập nhật thông tin công ty thành công");
                setSnackbarVisible(true);
                setCompanyData(response);
                setLogo(response.logo || emptyCompanyData.logo);
            }
        } catch (error) {
            console.error("Error updating company data:", error);
            setSnackbarMessage("Cập nhật thông tin thất bại");
            setSnackbarVisible(true);
        }
    }

    const handleCancel = () => {
        // Reset lại dữ liệu từ user
        if (user && user.company) {
            setCompanyData(user.company);
            setLogo(user.company.logo || emptyCompanyData.logo);
        }
        setEditing(false);
        setErrors({});
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Hồ sơ công ty</Text>
                <View style={styles.verifiedContainer}>
                    <Text style={companyData.is_verified ? styles.verifiedText : styles.unverifiedText}>
                        {companyData.is_verified ? 'ĐÃ XÁC THỰC HÌNH ẢNH' : 'CHƯA XÁC THỰC HÌNH ẢNH'}
                    </Text>
                </View>
            </View>
            {/* Thông tin công ty */}
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Thông tin công ty</Text>
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
                            <TextInput
                                label="Mã số thuế"
                                value={companyData.tax_code}
                                onChangeText={(text) => updateCompanyData("tax_code", text)}
                                mode="outlined"
                                style={styles.input}
                            />
                            <TextInput
                                label="Địa chỉ"
                                value={companyData.location}
                                onChangeText={(text) => updateCompanyData("location", text)}
                                mode="outlined"
                                style={styles.input}
                            />
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
                                <Text style={styles.infoLabel}>Mã số thuế:</Text>
                                <Text style={styles.infoValue}>{companyData.tax_code}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Địa chỉ:</Text>
                                <Text style={styles.infoValue}>{companyData.location}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Mô tả công ty:</Text>
                                <Text style={styles.infoValue}>{companyData.description}</Text>
                            </View>
                        </View>
                    )}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    verifiedContainer: {
        marginLeft: 12,
    },
    verifiedText: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: 14,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    unverifiedText: {
        color: '#FFA000',
        fontWeight: 'bold',
        fontSize: 14,
        backgroundColor: '#FFF8E1',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    imagesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    companyImage: {
        width: 110,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyImageBox: {
        borderWidth: 1,
        borderColor: '#BDBDBD',
        backgroundColor: '#FAFAFA',
    },
    emptyImageText: {
        color: '#BDBDBD',
        fontSize: 13,
        textAlign: 'center',
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
    imagesSection: {
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 16,
    },
    imagesHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    imagesSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
    },
    changeImagesButton: {
        borderColor: '#1E88E5',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 2,
    },
})

export default CompanyProfileScreen

