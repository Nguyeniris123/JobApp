import { Image, ScrollView, StyleSheet } from "react-native"
import { Avatar, Card, Chip, Divider, Text, Title } from "react-native-paper"

const ApplicationDetailScreen = ({ route }) => {
    const { application } = route.params
    if (!application) return <Text>Không tìm thấy dữ liệu ứng viên</Text>
    const { applicant_detail, job_detail, status, cv } = application
    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Title
                    title={applicant_detail.username}
                    subtitle={applicant_detail.email}
                    left={() => (
                        <Avatar.Image source={{ uri: applicant_detail.avatar }} size={60} />
                    )}
                />
                <Card.Content>
                    <Title>Thông tin ứng viên</Title>
                    <Text>Họ tên: {applicant_detail.first_name} {applicant_detail.last_name}</Text>
                    <Text>Email: {applicant_detail.email}</Text>
                    <Text>Username: {applicant_detail.username}</Text>
                    <Divider style={styles.divider} />
                    <Title>Thông tin công việc</Title>
                    <Text>Vị trí: {job_detail.title}</Text>
                    <Text>Chuyên ngành: {job_detail.specialized}</Text>
                    <Text>Lương: {parseFloat(job_detail.salary).toLocaleString('vi-VN')} VNĐ</Text>
                    <Text>Địa điểm: {job_detail.location}</Text>
                    <Text>Mô tả: {job_detail.description}</Text>
                    <Divider style={styles.divider} />
                    <Title>Trạng thái đơn</Title>
                    <Chip style={{ marginVertical: 8 }}>{status}</Chip>
                    <Divider style={styles.divider} />
                    <Title>CV</Title>
                    <Text>{cv ? "Đã nộp CV" : "Chưa có CV"}</Text>
                    <Title>Ảnh ứng viên gửi</Title>
                    {application.cv ? (
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${application.cv}` }}
                            style={{ width: 200, height: 200, alignSelf: 'center', marginVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ccc' }}
                            resizeMode="contain"
                        />
                    ) : (
                        <Text>Chưa có ảnh</Text>
                    )}
                </Card.Content>
            </Card>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    card: {
        margin: 16,
        borderRadius: 12,
        backgroundColor: "#fff",
    },
    divider: {
        marginVertical: 12,
    },
})

export default ApplicationDetailScreen
