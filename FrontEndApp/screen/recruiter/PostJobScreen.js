"use client"

import DateTimePicker from "@react-native-community/datetimepicker"
import { useContext, useState } from "react"
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from "react-native"
import { Button, Chip, HelperText, Surface, Switch, Text } from "react-native-paper"
import AppInput from "../../components/ui/AppInput"
import { JobContext } from "../../contexts/JobContext"

const PostJobScreen = ({ navigation }) => {
    const { createJob } = useContext(JobContext)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")
    const [salary, setSalary] = useState("")
    const [category, setCategory] = useState("")
    const [type, setType] = useState("")
    const [hours, setHours] = useState("")
    const [requirements, setRequirements] = useState("")
    const [benefits, setBenefits] = useState("")
    const [deadline, setDeadline] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [urgent, setUrgent] = useState(false)
    const [loading, setLoading] = useState(false)

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
        if (!title || !description || !location || !salary || !category || !type || !hours || !requirements || !benefits) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc")
            return false
        }
        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        setLoading(true)
        try {
            const jobData = {
                title,
                description,
                location,
                salary: Number(salary),
                category,
                type,
                hours,
                requirements: requirements.split('\n').filter(req => req.trim()),
                benefits: benefits.split('\n').filter(ben => ben.trim()),
                deadline,
                urgent,
            }

            const result = await createJob(jobData)
            if (result) {
                Alert.alert("Thành công", "Tin tuyển dụng đã được đăng thành công", [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                    },
                ])
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể đăng tin. Vui lòng thử lại sau.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <Surface style={styles.header} elevation={2}>
                <Text style={styles.title}>Đăng tin tuyển dụng</Text>
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

                        <Text style={styles.label}>Danh mục công việc *</Text>
                        <View style={styles.chipContainer}>
                            {categories.map((item, index) => (
                                <Chip
                                    key={index}
                                    selected={category === item}
                                    onPress={() => setCategory(item)}
                                    style={styles.chip}
                                    mode="outlined"
                                >
                                    {item}
                                </Chip>
                            ))}
                        </View>

                        <Text style={styles.label}>Loại công việc *</Text>
                        <View style={styles.chipContainer}>
                            {jobTypes.map((item, index) => (
                                <Chip
                                    key={index}
                                    selected={type === item}
                                    onPress={() => setType(item)}
                                    style={styles.chip}
                                    mode="outlined"
                                >
                                    {item}
                                </Chip>
                            ))}
                        </View>

                        <AppInput
                            label="Thời gian làm việc *"
                            value={hours}
                            onChangeText={setHours}
                            placeholder="Ví dụ: 20 giờ/tuần, 9:00-17:00"
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
                        Đăng tin
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
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    chip: {
        marginBottom: 8,
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

