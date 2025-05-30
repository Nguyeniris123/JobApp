"use client"

import * as ImagePicker from "expo-image-picker";
import { useContext, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, HelperText, Text } from "react-native-paper";
import { ApplicationContext } from "../../contexts/ApplicationContext";

const ApplyScreen = ({ route, navigation }) => {
    const { jobId } = route.params;
    const { submitApplication, loading: submitting } = useContext(ApplicationContext);
    const [resume, setResume] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Chỉ cần upload ảnh
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                setResume({
                    name: selectedImage.fileName || 'image.jpg',
                    uri: selectedImage.uri,
                    type: selectedImage.type || 'image/jpeg',
                });
                if (errors.resume) setErrors({ ...errors, resume: null });
            } else {
                console.log('Image picking canceled or failed');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi chọn ảnh. Vui lòng thử lại.');
        }
    };

    const handleSubmit = async () => {
        if (!resume) {
            setErrors({ resume: 'Vui lòng tải lên CV của bạn' });
            return;
        }
        setLoading(true);
        try {
            const result = await submitApplication(jobId, resume);
            if (result.success) {
                Alert.alert('Thành công', 'Đơn ứng tuyển của bạn đã được gửi thành công', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                Alert.alert('Lỗi', result.message || 'Có lỗi xảy ra khi gửi đơn ứng tuyển');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi đơn ứng tuyển. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Ứng tuyển vị trí</Text>
                <Text style={styles.jobTitle}>{jobId}</Text>
            </View>
            <Divider />
            <View style={styles.form}>
                <Button
                    mode="outlined"
                    icon="image"
                    onPress={pickImage}
                    style={[styles.uploadButton, errors.resume && styles.errorButton]}
                >
                    {resume ? 'Đã chọn ảnh: ' + resume.name : 'Tải lên CV (ảnh) *'}
                </Button>
                {errors.resume && <HelperText type="error">{errors.resume}</HelperText>}
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
    );
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
    form: {
        padding: 20,
    },
    uploadButton: {
        marginBottom: 16,
    },
    errorButton: {
        borderColor: "#F44336",
    },
    submitButton: {
        paddingVertical: 8,
    },
})

export default ApplyScreen

