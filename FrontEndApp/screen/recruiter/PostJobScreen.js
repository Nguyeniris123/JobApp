"use client"

import DateTimePicker from "@react-native-community/datetimepicker"
import { useContext, useEffect, useState } from "react"
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from "react-native"
import { Button, HelperText, Surface, Switch, Text } from "react-native-paper"
import AppInput from "../../components/ui/AppInput"
import { AuthContext } from "../../contexts/AuthContext"
import { JobContext } from "../../contexts/JobContext"

const PostJobScreen = ({ navigation, route }) => {
    const { createJob, updateJob } = useContext(JobContext)
    const { accessToken } = useContext(AuthContext)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")
    const [salary, setSalary] = useState("")
    const [workingHours, setWorkingHours] = useState("")
    const [requirements, setRequirements] = useState("")
    const [benefits, setBenefits] = useState("")
    const [deadline, setDeadline] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [urgent, setUrgent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [specialized, setSpecialized] = useState("")
    const [companyName, setCompanyName] = useState("")
    const [companyTaxCode, setCompanyTaxCode] = useState("")
    const [companyDescription, setCompanyDescription] = useState("")
    const [companyLocation, setCompanyLocation] = useState("")

    const isEditMode = route.params?.jobId;

    useEffect(() => {
        if (isEditMode && route.params.job) {
            const job = route.params.job;
            setTitle(job.title);
            setDescription(job.description);
            setLocation(job.location);
            setSalary(job.salary.toString());
            setWorkingHours(job.working_hours);
            setRequirements(job.requirements.join('\n'));
            setBenefits(job.benefits.join('\n'));
            setDeadline(new Date(job.deadline));
            setUrgent(job.urgent);
        }
    }, [isEditMode]);

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || deadline
        setShowDatePicker(false)
        setDeadline(currentDate)
    }

    const formatDate = (date) => {
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const validateForm = () => {
        if (!title || !description || !location || !salary || !workingHours || !requirements || !benefits) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc")
            return false
        }
        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const jobData = {
                title,
                specialized,
                description,
                location,
                salary: Number(salary),
                working_hours: workingHours,
                requirements: requirements.split('\n').filter(req => req.trim()),
                benefits: benefits.split('\n').filter(ben => ben.trim()),
                deadline,
                urgent,
                company: {
                    name: companyName,
                    tax_code: companyTaxCode,
                    description: companyDescription,
                    location: companyLocation,
                    is_verified: false
                }
            };

            let result;
            if (isEditMode) {
                result = await updateJob(route.params.jobId, jobData, accessToken);
            } else {
                result = await createJob(jobData, accessToken);
            }

            if (result) {
                Alert.alert(
                    "Thành công",
                    isEditMode 
                        ? "Tin tuyển dụng đã được cập nhật thành công"
                        : "Tin tuyển dụng đã được đăng thành công",
                    [{ text: "OK", onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            Alert.alert(
                "Lỗi",
                isEditMode
                    ? "Không thể cập nhật tin. Vui lòng thử lại sau."
                    : "Không thể đăng tin. Vui lòng thử lại sau."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Surface style={styles.header} elevation={2}>
                <Text style={styles.title}>
                    {isEditMode ? "Chỉnh sửa tin tuyển dụng" : "Đăng tin tuyển dụng"}
                </Text>
            </Surface>

            <ScrollView style={styles.container}>
                <View style={styles.form}>
                    <Surface style={styles.section} elevation={1}>
                        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

                        <AppInput
                            label="Tiêu đề công việc *"
                            value={title}
                            onChangeText={setTitle}
                            style={styles.input}
                        />

                        <AppInput
                            label="Mô tả công việc *"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={5}
                            style={styles.input}
                        />

                        <AppInput
                            label="Địa điểm làm việc *"
                            value={location}
                            onChangeText={setLocation}
                            style={styles.input}
                        />

                        <AppInput
                            label="Mức lương (VNĐ) *"
                            value={salary}
                            onChangeText={setSalary}
                            keyboardType="numeric"
                            style={styles.input}
                        />

                        <AppInput
                            label="Số giờ làm việc mỗi tuần *"
                            value={workingHours}
                            onChangeText={setWorkingHours}
                            placeholder="Ví dụ: 20"
                            keyboardType="numeric"
                            style={styles.input}
                        />
                    </Surface>

                    <Surface style={styles.section} elevation={1}>
                        <Text style={styles.sectionTitle}>Thông tin chuyên môn</Text>
                        <AppInput
                            label="Chuyên môn *"
                            value={specialized}
                            onChangeText={setSpecialized}
                            style={styles.input}
                        />
                    </Surface>

                    <Surface style={styles.section} elevation={1}>
                        <Text style={styles.sectionTitle}>Thông tin công ty</Text>
                        <AppInput
                            label="Tên công ty *"
                            value={companyName}
                            onChangeText={setCompanyName}
                            style={styles.input}
                        />
                        <AppInput
                            label="Mã số thuế"
                            value={companyTaxCode}
                            onChangeText={setCompanyTaxCode}
                            style={styles.input}
                        />
                        <AppInput
                            label="Mô tả công ty"
                            value={companyDescription}
                            onChangeText={setCompanyDescription}
                            multiline
                            numberOfLines={4}
                            style={styles.input}
                        />
                        <AppInput
                            label="Địa chỉ công ty"
                            value={companyLocation}
                            onChangeText={setCompanyLocation}
                            style={styles.input}
                        />
                    </Surface>

                    <Surface style={styles.section} elevation={1}>
                        <Text style={styles.sectionTitle}>Yêu cầu và quyền lợi</Text>

                        <AppInput
                            label="Yêu cầu ứng viên *"
                            value={requirements}
                            onChangeText={setRequirements}
                            multiline
                            numberOfLines={5}
                            placeholder="Mỗi yêu cầu một dòng"
                            style={styles.input}
                        />
                        <HelperText type="info">Mỗi yêu cầu viết trên một dòng</HelperText>

                        <AppInput
                            label="Quyền lợi *"
                            value={benefits}
                            onChangeText={setBenefits}
                            multiline
                            numberOfLines={5}
                            placeholder="Mỗi quyền lợi một dòng"
                            style={styles.input}
                        />
                        <HelperText type="info">Mỗi quyền lợi viết trên một dòng</HelperText>
                    </Surface>

                    <Surface style={styles.section} elevation={1}>
                        <Text style={styles.sectionTitle}>Thông tin bổ sung</Text>

                        <View style={styles.datePickerContainer}>
                            <Text style={styles.label}>Hạn nộp hồ sơ *</Text>
                            <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                                {formatDate(deadline)}
                            </Button>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={deadline}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                    minimumDate={new Date()}
                                />
                            )}
                        </View>

                        <View style={styles.switchContainer}>
                            <View style={styles.switchItem}>
                                <Text style={styles.switchLabel}>Đánh dấu là tin khẩn cấp</Text>
                                <Switch value={urgent} onValueChange={setUrgent} color="#1E88E5" />
                            </View>
                            <HelperText type="info">Tin khẩn cấp sẽ được ưu tiên hiển thị và có thêm phí</HelperText>
                        </View>
                    </Surface>

                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        style={styles.submitButton}
                        loading={loading}
                        disabled={loading}
                        contentStyle={styles.submitButtonContent}
                    >
                        {isEditMode ? "Cập nhật" : "Đăng tin"}
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        backgroundColor: '#1E88E5',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    form: {
        padding: 16,
        gap: 16,
    },
    section: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1E88E5',
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
    },
    label: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 8,
        marginTop: 8,
    },
    datePickerContainer: {
        marginBottom: 16,
    },
    dateButton: {
        marginTop: 8,
    },
    switchContainer: {
        marginBottom: 24,
    },
    switchItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    switchLabel: {
        fontSize: 16,
        color: '#212121',
    },
    submitButton: {
        marginVertical: 24,
    },
    submitButtonContent: {
        paddingVertical: 8,
    },
})

export default PostJobScreen

