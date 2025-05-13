import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import testFirebaseConnection from '../../services/FirebaseTestService';

/**
 * Debug screen for testing Firebase connection
 */
const FirebaseDebugScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const testConnection = async () => {
        setLoading(true);
        setResult(null);

        try {
            const success = await testFirebaseConnection();
            setResult({
                success,
                message: success
                    ? 'Firebase connection successful! You can now use chat features.'
                    : 'Connection failed. Check the console for detailed error information.'
            });
        } catch (error) {
            console.error('Error in test connection:', error);
            setResult({
                success: false,
                message: `Error: ${error.message || 'Unknown error'}`
            });
        } finally {
            setLoading(false);
        }
    };
    
    const openFirebaseIndexCreationUrl = () => {
        // URL for creating required Firebase indices
        const indexUrl = 'https://console.firebase.google.com/v1/r/project/jobappchat/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9qb2JhcHBjaGF0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9jaGF0Um9vbXMvaW5kZXhlcy9fEAEaDwoLcmVjcnVpdGVySWQQARoYChRsYXN0TWVzc2FnZVRpbWVzdGFtcBACGgwKCF9fbmFtZV9fEAI';
        
        Linking.canOpenURL(indexUrl).then(supported => {
            if (supported) {
                Linking.openURL(indexUrl);
            } else {
                console.error("Don't know how to open URL: " + indexUrl);
                setResult({
                    success: false,
                    message: "Không thể mở trang web tạo chỉ mục Firebase. Vui lòng liên hệ quản trị viên."
                });
            }
        });
    };

    const deployFirebaseRules = async () => {
        setLoading(true);
        setResult({
            success: undefined,
            message: 'Đang triển khai quy tắc bảo mật Firebase...'
        });

        try {
            // Sử dụng require để động nhập script triển khai
            const { exec } = require('child_process');
            const command = 'node scripts/deploy-firebase-rules.js';
            
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Lỗi: ${error.message}`);
                    setResult({
                        success: false,
                        message: `Không thể triển khai quy tắc: ${error.message}`
                    });
                    setLoading(false);
                    return;
                }
                
                console.log(`Kết quả: ${stdout}`);
                setResult({
                    success: true,
                    message: 'Đã triển khai quy tắc Firebase thành công. Bây giờ bạn có thể sử dụng tính năng trò chuyện.'
                });
                setLoading(false);
            });
        } catch (error) {
            console.error('Lỗi khi triển khai quy tắc:', error);
            setResult({
                success: false,
                message: `Lỗi: ${error.message || 'Lỗi không xác định'}`
            });
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Firebase Connection Debugger</Text>

            <Text style={styles.description}>
                This screen helps diagnose issues with Firebase connectivity.
                Press the button below to test the connection to your Firebase project.
            </Text>

            <Button
                mode="contained"
                onPress={testConnection}
                style={styles.button}
                disabled={loading}
            >
                Test Firebase Connection
            </Button>
            
            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Fix Common Issues</Text>
            
            <Text style={styles.description}>
                Nếu bạn gặp lỗi khi sử dụng tính năng chat, hãy thực hiện các bước sau theo thứ tự:
            </Text>
            
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Bước 1: Triển khai quy tắc Firebase</Text>
                <Text style={styles.stepDescription}>
                    Cập nhật quy tắc bảo mật để cho phép truy cập vào chức năng chat.
                </Text>
                <Button
                    mode="contained"
                    onPress={deployFirebaseRules}
                    style={[styles.button, styles.fixButton]}
                    icon="shield"
                >
                    Triển khai quy tắc Firebase
                </Button>
            </View>
            
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Bước 2: Tạo chỉ mục Firestore</Text>
                <Text style={styles.stepDescription}>
                    Nếu gặp lỗi "failed-precondition", bạn cần tạo chỉ mục (index) cho Firestore.
                    Nhấn nút dưới đây để mở trang tạo chỉ mục Firebase.
                </Text>
                <Button
                    mode="contained"
                    onPress={openFirebaseIndexCreationUrl}
                    style={[styles.button, styles.fixButton]}
                    icon="database"
                >
                    Tạo chỉ mục Firebase
                </Button>
            </View>
            
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Bước 3: Kiểm tra kết nối</Text>
                <Text style={styles.stepDescription}>
                    Sau khi hoàn tất 2 bước trên, kiểm tra kết nối với Firebase để xác nhận mọi thứ hoạt động đúng.
                </Text>
                <Button
                    mode="contained"
                    onPress={testConnection}
                    style={[styles.button, styles.checkButton]}
                    icon="check-circle"
                >
                    Kiểm tra lại kết nối
                </Button>
            </View>
            
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Bước 4: Kiểm tra Giao diện Chat</Text>
                <Text style={styles.stepDescription}>
                    Kiểm tra chức năng trò chuyện với giao diện thử nghiệm.
                    Nhấn nút dưới đây để mở giao diện chat test.
                </Text>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('TestChat')}
                    style={[styles.button, { backgroundColor: '#8E24AA' }]}
                    icon="chat-testing"
                >
                    Mở giao diện Chat Test
                </Button>
            </View>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.loadingText}>Testing connection...</Text>
                </View>
            )}

            {result && (
                <View style={[
                    styles.resultContainer,
                    { backgroundColor: result.success ? '#E8F5E9' : '#FFEBEE' }
                ]}>
                    <Text style={[
                        styles.resultText,
                        { color: result.success ? '#2E7D32' : '#C62828' }
                    ]}>
                        {result.message}
                    </Text>
                </View>
            )}

            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Troubleshooting Tips:</Text>
                <Text style={styles.infoText}>• Make sure you have internet connectivity</Text>
                <Text style={styles.infoText}>• Check the Firebase configuration</Text>
                <Text style={styles.infoText}>• Verify Firebase security rules allow access</Text>
                <Text style={styles.infoText}>• Check console for detailed error messages</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 24,
    },
    button: {
        marginVertical: 16,
    },
    fixButton: {
        backgroundColor: '#1565C0',
    },
    checkButton: {
        backgroundColor: '#2E7D32',
    },
    stepContainer: {
        marginBottom: 24,
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        borderLeftWidth: 4,
        borderLeftColor: '#1976D2',
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1565C0',
    },
    stepDescription: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 16,
        color: '#424242',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        marginVertical: 24,
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
    resultContainer: {
        padding: 16,
        borderRadius: 8,
        marginVertical: 16,
    },
    resultText: {
        fontSize: 16,
    },
    infoContainer: {
        marginTop: 24,
        padding: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 4,
    },
});

export default FirebaseDebugScreen;
