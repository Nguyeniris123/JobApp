"use client"

import * as DocumentPicker from "expo-document-picker"
import * as FileSystem from "expo-file-system"
import { useContext, useState } from "react"
import { Alert, ScrollView, StyleSheet, View } from "react-native"
import { Button, Checkbox, Divider, HelperText, Text, TextInput } from "react-native-paper"
import { JobContext } from "../../contexts/JobContext"

const ApplyScreen = ({ route, navigation }) => {
    const { jobId } = route.params
    const { jobs, applyForJob } = useContext(JobContext)
    const job = jobs.find((job) => job.id === jobId)

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        coverLetter: "",
    })
    const [resume, setResume] = useState(null)
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

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

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ],
                copyToCacheDirectory: true,
            })

            if (result.type === "success") {
                // Read the file content and convert to base64
                const base64 = await FileSystem.readAsStringAsync(result.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                })
                setResume({
                    ...result,
                    base64: base64,
                })
                if (errors.resume) {
                    setErrors({
                        ...errors,
                        resume: null,
                    })
                }
            }
        } catch (error) {
            console.log("Error picking document:", error)
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
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
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
            return
        }

        setLoading(true)

        try {
            const applicationData = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                cv: resume.base64,
                jobDetail: {
                    title: job.title,
                    specialized: job.specialized,
                    description: job.description,
                    salary: job.salary,
                    working_hours: job.working_hours,
                    location: job.location,
                    company: {
                        name: job.company.name,
                        tax_code: job.company.tax_code,
                        description: job.company.description,
                        location: job.company.location,
                        is_verified: job.company.is_verified,
                    },
                },
            }

            const result = await applyForJob(jobId, applicationData)

            if (result.success) {
                Alert.alert("Thành công", "Đơn ứng tuyển của bạn đã được gửi thành công", [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate("ApplicationStatus"),
                    },
                ])
            } else {
                Alert.alert("Lỗi", result.message || "Có lỗi xảy ra khi gửi đơn ứng tuyển")
            }
        } catch (error) {
            Alert.alert("Lỗi", "Có lỗi xảy ra khi gửi đơn ứng tuyển")
        } finally {
            setLoading(false)
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
                    icon="file-upload"
                    onPress={pickDocument}
                    style={[styles.uploadButton, errors.resume && styles.errorButton]}
                >
                    {resume ? "Đã chọn: " + resume.name : "Tải lên CV của bạn *"}
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
                    loading={loading}
                    disabled={loading}
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

