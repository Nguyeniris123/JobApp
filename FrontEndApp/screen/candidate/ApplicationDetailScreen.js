import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // Nếu dùng expo, nếu không thì thay thế bằng package bạn dùng
import { useContext, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, Snackbar, Text, Title } from 'react-native-paper';
import { ApplicationContext } from '../../contexts/ApplicationContext';

const CandidateApplicationDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { applicationId, jobId, cv } = route.params || {};
    const { applications, updateApplication, loading } = useContext(ApplicationContext);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedCV, setSelectedCV] = useState(null);

    // Lấy application từ context nếu có
    const application = applications.find(app => app.id === applicationId);
    if (!application) return <Text>Không tìm thấy dữ liệu đơn ứng tuyển</Text>;
    const { job_detail, status, cv: cvUrl, feedback } = application;

    // Hàm chọn ảnh CV mới
    const handlePickCV = async () => {
        // Sử dụng expo-image-picker hoặc react-native-image-picker tuỳ dự án
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const file = result.assets[0];
            setSelectedCV({
                uri: file.uri,
                name: file.fileName || 'cv.jpg',
                type: file.type || 'image/jpeg',
            });
        }
    };

    // Hàm gửi lại CV mới (chỉ cho phép khi trạng thái là pending)
    const handleEditCV = async () => {
        if (!selectedCV) return;
        setLocalLoading(true);
        setError(null);
        try {
            const result = await updateApplication(applicationId, selectedCV);
            if (result.success) {
                setSnackbarMessage("Cập nhật CV thành công!");
                setSnackbarVisible(true);
                setSelectedCV(null);
            } else {
                setError(result.message || "Có lỗi khi cập nhật CV");
            }
        } catch (e) {
            setError("Có lỗi khi cập nhật CV");
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.sectionTitle}>Thông tin công việc</Title>
                    <Text style={styles.infoText}>Vị trí: <Text style={styles.infoValue}>{job_detail?.title}</Text></Text>
                    <Text style={styles.infoText}>Chuyên ngành: <Text style={styles.infoValue}>{job_detail?.specialized}</Text></Text>
                    <Text style={styles.infoText}>Lương: <Text style={styles.infoValue}>{parseFloat(job_detail?.salary).toLocaleString('vi-VN')} VNĐ</Text></Text>
                    <Text style={styles.infoText}>Địa điểm: <Text style={styles.infoValue}>{job_detail?.location}</Text></Text>
                    <Text style={styles.infoText}>Mô tả: <Text style={styles.infoValue}>{job_detail?.description}</Text></Text>
                    <Divider style={styles.divider} />
                    <Title style={styles.sectionTitle}>Trạng thái đơn ứng tuyển</Title>
                    <Chip style={styles.statusChip}>
                        {status === 'pending'
                            ? 'Đang chờ xử lý'
                            : status === 'accepted'
                            ? 'Đã chấp nhận'
                            : status === 'rejected'
                            ? 'Đã từ chối'
                            : status}
                    </Chip>
                    <Divider style={styles.divider} />
                    <Title style={styles.sectionTitle}>CV đã nộp</Title>
                    {cvUrl ? (
                        <Image
                            source={{ uri: cvUrl }}
                            style={styles.cvImage}
                            resizeMode="contain"
                        />
                    ) : (
                        <Text style={styles.infoText}>Chưa có CV</Text>
                    )}
                    {/* Nếu trạng thái là pending thì cho phép chỉnh sửa CV */}
                    {status === 'pending' && (
                        <View style={{ marginTop: 10, alignItems: 'center' }}>
                            <Button
                                mode="outlined"
                                icon="file-upload"
                                style={styles.editCVButton}
                                onPress={handlePickCV}
                                loading={localLoading}
                            >
                                Chọn ảnh CV mới
                            </Button>
                            {selectedCV && (
                                <>
                                    <Image source={{ uri: selectedCV.uri }} style={{ width: 120, height: 120, marginVertical: 8, borderRadius: 8 }} />
                                    <Button
                                        mode="contained"
                                        icon="pencil"
                                        style={styles.editCVButton}
                                        onPress={handleEditCV}
                                        loading={localLoading}
                                    >
                                        Cập nhật CV
                                    </Button>
                                </>
                            )}
                        </View>
                    )}
                    {feedback && (
                        <>
                            <Divider style={styles.divider} />
                            <Title style={styles.sectionTitle}>Phản hồi từ nhà tuyển dụng</Title>
                            <Text style={styles.infoText}>{feedback}</Text>
                        </>
                    )}
                    {error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}
                </Card.Content>
            </Card>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={1500}
                action={{ label: 'OK', onPress: () => setSnackbarVisible(false) }}
            >
                {snackbarMessage}
            </Snackbar>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    card: {
        margin: 16,
        borderRadius: 12,
        backgroundColor: "#fff",
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1976D2',
        marginTop: 12,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 15,
        color: '#374151',
        marginBottom: 4,
    },
    infoValue: {
        fontWeight: '600',
        color: '#111827',
    },
    divider: {
        marginVertical: 12,
    },
    statusChip: {
        alignSelf: 'flex-start',
        marginVertical: 8,
        fontWeight: 'bold',
        color: '#fff',
    },
    cvImage: {
        width: 220,
        height: 220,
        alignSelf: 'center',
        marginVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f9f9f9',
    },
    editCVButton: {
        marginTop: 10,
        borderColor: '#1E88E5',
    },
});

export default CandidateApplicationDetailScreen;
