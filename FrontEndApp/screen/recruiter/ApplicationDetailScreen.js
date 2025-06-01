import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Chip, Divider, Snackbar, Text, Title } from "react-native-paper";
import { ApplicationContext } from '../../contexts/ApplicationContext';

const ApplicationDetailScreen = ({ route }) => {
    const { application } = route.params;
    const { acceptApplication, rejectApplication, loading } = useContext(ApplicationContext);
    const navigation = useNavigation();
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [error, setError] = useState(null);
    const [localLoading, setLocalLoading] = useState(false);

    if (!application) return <Text>Không tìm thấy dữ liệu ứng viên</Text>;
    const { applicant_detail, job_detail, status, cv } = application;

    useEffect(() => {
        if (status === 'pending') {
            setSnackbarMessage("Đơn ứng tuyển đang chờ xử lý.");
            setSnackbarVisible(true);
        } else if (status === 'accepted') {
            setSnackbarMessage("Đơn ứng tuyển đã được chấp nhận.");
            setSnackbarVisible(true);
        } else if (status === 'rejected') {
            setSnackbarMessage("Đơn ứng tuyển đã bị từ chối.");
            setSnackbarVisible(true);
        }
    }, [status]);

    // Xử lý accept/reject
    const handleAccept = async () => {
        setLocalLoading(true);
        setError(null);
        try {
            await acceptApplication(application.id);
            setSnackbarMessage("Đã chấp nhận ứng viên thành công!");
            setSnackbarVisible(true);
            setTimeout(() => navigation.goBack(), 1200);
        } catch (e) {
            setError("Có lỗi xảy ra khi chấp nhận ứng viên.");
        } finally {
            setLocalLoading(false);
        }
    };
    const handleReject = async () => {
        setLocalLoading(true);
        setError(null);
        try {
            await rejectApplication(application.id);
            setSnackbarMessage("Đã từ chối ứng viên thành công!");
            setSnackbarVisible(true);
            setTimeout(() => navigation.goBack(), 1200);
        } catch (e) {
            setError("Có lỗi xảy ra khi từ chối ứng viên.");
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.avatarContainer}>
                <Avatar.Image source={{ uri: applicant_detail.avatar }} size={110} style={styles.avatarImage} />
            </View>
            <Card style={styles.card}>
                <Card.Content>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title style={styles.sectionTitle}>Thông tin ứng viên</Title>
                    </View>
                    <Text style={styles.infoText}>Họ tên: <Text style={styles.infoValue}>{applicant_detail.first_name} {applicant_detail.last_name}</Text></Text>
                    <Text style={styles.infoText}>Email: <Text style={styles.infoValue}>{applicant_detail.email}</Text></Text>
                    <Divider style={styles.divider} />
                    <Title style={styles.sectionTitle}>Thông tin công việc</Title>
                    <Text style={styles.infoText}>Vị trí: <Text style={styles.infoValue}>{job_detail.title}</Text></Text>
                    <Text style={styles.infoText}>Chuyên ngành: <Text style={styles.infoValue}>{job_detail.specialized}</Text></Text>
                    <Text style={styles.infoText}>Lương: <Text style={styles.infoValue}>{parseFloat(job_detail.salary).toLocaleString('vi-VN')} VNĐ</Text></Text>
                    <Text style={styles.infoText}>Địa điểm: <Text style={styles.infoValue}>{job_detail.location}</Text></Text>
                    <Text style={styles.infoText}>Mô tả: <Text style={styles.infoValue}>{job_detail.description}</Text></Text>
                    <Divider style={styles.divider} />
                    <Title style={styles.sectionTitle}>Trạng thái đơn ứng tuyển</Title>
                    <Chip style={[
                        styles.statusChip,
                        {
                            backgroundColor:
                                status === 'accepted'
                                    ? '#4CAF50'
                                    : status === 'rejected'
                                    ? '#F44336'
                                    : '#FFC107',
                        },
                    ]}>
                        {status === 'pending'
                            ? 'Đang chờ xử lý'
                            : status === 'accepted'
                            ? 'Đã chấp nhận'
                            : status === 'rejected'
                            ? 'Đã từ chối'
                            : status}
                    </Chip>
                    <Divider style={styles.divider} />
                    <Title style={styles.sectionTitle}>CV</Title>
                    <Text style={styles.infoText}>{cv ? "Đã nộp CV" : "Chưa có CV"}</Text>
                    <Title style={styles.sectionTitle}>Ảnh ứng viên gửi</Title>
                    {application.cv ? (
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${application.cv}` }}
                            style={styles.cvImage}
                            resizeMode="contain"
                        />
                    ) : (
                        <Text style={styles.infoText}>Chưa có ảnh</Text>
                    )}
                    <Divider style={styles.divider} />
                    {error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}
                    {status === 'pending' && (
                        <View style={styles.actionButtonsRow}>
                        <Button
                            mode="contained"
                            style={styles.acceptButton}
                            icon="check"
                            loading={localLoading || loading}
                            onPress={handleAccept}
                            disabled={localLoading || loading}
                        >
                            Chấp nhận
                        </Button>
                        <Button
                            mode="outlined"
                            style={styles.rejectButton}
                            icon="close"
                            loading={localLoading || loading}
                            onPress={handleReject}
                            disabled={localLoading || loading}
                        >
                            Từ chối
                        </Button>
                    </View>)}
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
    actionButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 18,
        gap: 16,
    },
    acceptButton: {
        flex: 1,
        backgroundColor: '#059669',
        marginRight: 8,
        borderRadius: 8,
        elevation: 2,
    },
    rejectButton: {
        flex: 1,
        borderColor: '#DC2626',
        borderWidth: 1.5,
        borderRadius: 8,
        elevation: 2,
    },
    avatarContainer: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 8,
    },
    avatarImage: {
        backgroundColor: '#fff',
        elevation: 4,
    },
});

export default ApplicationDetailScreen;
