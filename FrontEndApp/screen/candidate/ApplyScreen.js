"use client"

import * as ImagePicker from "expo-image-picker"
import { useContext, useState } from "react"
import { Alert, ScrollView, StyleSheet, View } from "react-native"
import { Button, Checkbox, Divider, HelperText, Text, TextInput } from "react-native-paper"
import { ApplicationContext } from "../../contexts/ApplicationContext"
import { JobContext } from "../../contexts/JobContext"

const ApplyScreen = ({ route, navigation }) => {
    const { jobId } = route.params
    const { jobs, fetchJobById } = useContext(JobContext)
    const { submitApplication, loading: submitting } = useContext(ApplicationContext)
    const job = jobs.find((job) => job.id === jobId)

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        coverLetter: "",
    })
    const [resume, setResume] = useState(null)
    const [errors, setErrors] = useState({})
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [loading, setLoading] = useState(false) // Thêm dòng này để khai báo state loading

    const updateFormData = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        })
        // Clear error when user types
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: null,
            })
        }
    }

    // Thay thế pickDocument bằng pickImage
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
                base64: true,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                setResume({
                    name: selectedImage.fileName || 'image.jpg',
                    uri: selectedImage.uri,
                    size: selectedImage.fileSize,
                    mimeType: selectedImage.type || 'image/jpeg',
                    base64: selectedImage.base64,
                });
                if (errors.resume) {
                    setErrors({ ...errors, resume: null });
                }
            } else {
                console.log("Image picking canceled or failed");
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi chọn ảnh. Vui lòng thử lại.");
        }
    }

    const validateApplicationForm = () => {
        const newErrors = {};
        let isValid = true;

        // Validate fullName
        if (!formData.fullName) {
            newErrors.fullName = "Họ tên là bắt buộc";
            isValid = false;
        } else if (formData.fullName.length < 3) {
            newErrors.fullName = "Họ tên phải có ít nhất 3 ký tự";
            isValid = false;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = "Email là bắt buộc";
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
            isValid = false;
        }

        // Validate phone
        const phoneRegex = /^(84|0[35789])([0-9]{8})$/;
        if (!formData.phone) {
            newErrors.phone = "Số điện thoại là bắt buộc";
            isValid = false;
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = "Số điện thoại không hợp lệ";
            isValid = false;
        }

        // Check resume
        if (!resume) {
            newErrors.resume = "Vui lòng tải lên CV của bạn";
            isValid = false;
        }

        // Check terms
        if (!agreeTerms) {
            newErrors.terms = "Vui lòng đồng ý với điều khoản và điều kiện";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }

    const handleSubmit = async () => {
        if (!validateApplicationForm()) {
            return;
        }

        setLoading(true);

        try {
            // Đảm bảo có job detail đầy đủ
            let currentJob = job;
            if (!currentJob) {
                currentJob = await fetchJobById(jobId);
                if (!currentJob) {
                    Alert.alert("Lỗi", "Không thể lấy thông tin công việc. Vui lòng thử lại.");
                    return;
                }
            }

            const applicationData = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                coverLetter: formData.coverLetter,
                cv: resume.base64,
                jobDetail: {
                    title: currentJob.title,
                    specialized: currentJob.specialized,
                    description: currentJob.description,
                    salary: currentJob.salary,
                    working_hours: currentJob.working_hours,
                    location: currentJob.location,
                    company: {
                        name: currentJob.company.name,
                        tax_code: currentJob.company.tax_code,
                        description: currentJob.company.description,
                        location: currentJob.company.location,
                        is_verified: currentJob.company.is_verified,
                        images: currentJob.company.images || []
                    },
                },
            };

            const result = await submitApplication(jobId, applicationData);

            if (result.success) {
                Alert.alert(
                    "Thành công", 
                    "Đơn ứng tuyển của bạn đã được gửi thành công", 
                    [
                        {
                            text: "Xem trạng thái ứng tuyển",
                            onPress: () => navigation.navigate("ApplicationStatus"),
                        },
                    ]
                );
            } else {
                Alert.alert("Lỗi", result.message || "Có lỗi xảy ra khi gửi đơn ứng tuyển");
            }
        } catch (error) {
            console.error("Error submitting application:", error);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi gửi đơn ứng tuyển. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Ứng tuyển vị trí</Text>
                <Text style={styles.jobTitle}>{job?.title}</Text>
                <Text style={styles.company}>{job?.company?.name}</Text>
            </View>

            <Divider />

            <View style={styles.form}>
                <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

                <TextInput
                    label="Họ và tên *"
                    value={formData.fullName}
                    onChangeText={(text) => updateFormData("fullName", text)}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.fullName}
                />
                {errors.fullName && <HelperText type="error">{errors.fullName}</HelperText>}

                <TextInput
                    label="Email *"
                    value={formData.email}
                    onChangeText={(text) => updateFormData("email", text)}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={!!errors.email}
                />
                {errors.email && <HelperText type="error">{errors.email}</HelperText>}

                <TextInput
                    label="Số điện thoại *"
                    value={formData.phone}
                    onChangeText={(text) => updateFormData("phone", text)}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="phone-pad"
                    error={!!errors.phone}
                />
                {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}

                <Text style={styles.sectionTitle}>Hồ sơ ứng tuyển</Text>

                <Button
                    mode="outlined"
                    icon="image"
                    onPress={pickImage}
                    style={[styles.uploadButton, errors.resume && styles.errorButton]}
                >
                    {resume ? "Đã chọn ảnh: " + resume.name : "Tải lên ảnh đại diện *"}
                </Button>
                {errors.resume && <HelperText type="error">{errors.resume}</HelperText>}

                <TextInput
                    label="Thư giới thiệu (không bắt buộc)"
                    value={formData.coverLetter}
                    onChangeText={(text) => updateFormData("coverLetter", text)}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    numberOfLines={5}
                />

                <View style={styles.checkboxContainer}>
                    <Checkbox
                        status={agreeTerms ? "checked" : "unchecked"}
                        onPress={() => setAgreeTerms(!agreeTerms)}
                        color={errors.terms ? "#F44336" : "#1E88E5"}
                    />
                    <Text style={[styles.checkboxLabel, errors.terms && styles.errorText]}>
                        Tôi đồng ý với các điều khoản và điều kiện
                    </Text>
                </View>
                {errors.terms && <HelperText type="error">{errors.terms}</HelperText>}

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.submitButton}
                    loading={loading || submitting}
                    disabled={loading || submitting}
                >
                    Gửi đơn ứng tuyển
                </Button>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        padding: 20,
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        color: "#757575",
        marginBottom: 8,
    },
    jobTitle: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },
    company: {
        fontSize: 16,
        color: "#757575",
    },
    form: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        marginTop: 16,
        color: "#212121",
    },
    input: {
        marginBottom: 16,
    },
    uploadButton: {
        marginBottom: 16,
    },
    errorButton: {
        borderColor: "#F44336",
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    checkboxLabel: {
        marginLeft: 8,
    },
    errorText: {
        color: "#F44336",
    },
    submitButton: {
        paddingVertical: 8,
    },
})

export default ApplyScreen

