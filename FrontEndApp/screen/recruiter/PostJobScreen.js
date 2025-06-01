import { useContext, useEffect, useState } from "react"
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from "react-native"
import { Button, Surface, Text } from "react-native-paper"
import AppInput from "../../components/ui/AppInput"
import { AuthContext } from "../../contexts/AuthContext"
import { JobContext } from "../../contexts/JobContext"

const PostJobScreen = ({ navigation, route }) => {
    const { createJob, updateJob, fetchJobById, fetchRecruiterJobs } = useContext(JobContext)
    const { accessToken } = useContext(AuthContext)
    const [title, setTitle] = useState("")
    const [specialized, setSpecialized] = useState("")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")
    const [salary, setSalary] = useState("")
    const [workingHours, setWorkingHours] = useState("")
    const [loading, setLoading] = useState(false)
    const [loadingJob, setLoadingJob] = useState(false)

    const isEditMode = route.params?.jobId;

    useEffect(() => {
        if (isEditMode) {
            const loadJob = async () => {
                try {
                    setLoadingJob(true);
                    const jobData = await fetchJobById(route.params.jobId);
                    if (jobData) {
                        setTitle(jobData.title || "");
                        setSpecialized(jobData.specialized || "");
                        setDescription(jobData.description || "");
                        setLocation(jobData.location || "");
                        setSalary(jobData.salary ? jobData.salary.toString() : "");
                        setWorkingHours(jobData.working_hours || "");
                    }
                } catch (error) {
                    console.error("Không thể tải thông tin công việc:", error);
                    Alert.alert("Lỗi", "Không thể tải thông tin công việc");
                } finally {
                    setLoadingJob(false);
                }
            };
            loadJob();
        }
    }, [isEditMode, route.params?.jobId]);

    const validateForm = () => {
        let isValid = true;
        let errorMessage = "";

        // Chỉ kiểm tra trường để trống
        if (!title.trim()) {
            errorMessage += "- Tiêu đề công việc không được để trống\n";
            isValid = false;
        }

        if (!specialized.trim()) {
            errorMessage += "- Chuyên môn không được để trống\n";
            isValid = false;
        }

        if (!description.trim()) {
            errorMessage += "- Mô tả công việc không được để trống\n";
            isValid = false;
        }

        if (!salary.trim()) {
            errorMessage += "- Mức lương không được để trống\n";
            isValid = false;
        }

        if (!workingHours.trim()) {
            errorMessage += "- Số giờ làm việc không được để trống\n";
            isValid = false;
        }

        if (!location.trim()) {
            errorMessage += "- Địa điểm làm việc không được để trống\n";
            isValid = false;
        }

        if (!isValid) {
            Alert.alert("Lỗi dữ liệu", errorMessage);
        }
        return isValid;
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
                working_hours: workingHours
            };

            let result;
            if (isEditMode) {
                result = await updateJob(route.params.jobId, jobData, accessToken);
            } else {
                result = await createJob(jobData, accessToken);
            }

            if (result) {
                // Fetch lại dữ liệu job ngay sau khi tạo/cập nhật thành công
                await fetchRecruiterJobs();
                Alert.alert(
                    "Thành công",
                    isEditMode 
                        ? "Tin tuyển dụng đã được cập nhật thành công"
                        : "Tin tuyển dụng đã được đăng thành công",
                    [{ text: "OK", onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error("Lỗi khi gửi dữ liệu:", error?.response?.data || error.message);
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

            {loadingJob ? (
                <View style={styles.loadingContainer}>
                    <Text>Đang tải...</Text>
                </View>
            ) : (
                <ScrollView style={styles.container}>
                    <View style={styles.form}>
                        <Surface style={styles.section} elevation={1}>
                            <Text style={styles.sectionTitle}>Thông tin công việc</Text>

                            <AppInput
                                label="Tiêu đề công việc *"
                                value={title}
                                onChangeText={setTitle}
                                style={styles.input}
                            />

                            <AppInput
                                label="Chuyên môn *"
                                value={specialized}
                                onChangeText={setSpecialized}
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
                                label="Mức lương (VNĐ) *"
                                value={salary}
                                onChangeText={setSalary}
                                keyboardType="numeric"
                                style={styles.input}
                            />

                            <AppInput
                                label="Số giờ làm việc *"
                                value={workingHours}
                                onChangeText={setWorkingHours}
                                style={styles.input}
                            />

                            <AppInput
                                label="Địa điểm làm việc *"
                                value={location}
                                onChangeText={setLocation}
                                style={styles.input}
                            />
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
            )}
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
    submitButton: {
        marginVertical: 24,
    },
    submitButtonContent: {
        paddingVertical: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default PostJobScreen

