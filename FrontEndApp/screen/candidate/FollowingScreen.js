import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CompanyContext } from '../../contexts/CompanyContext';

const FollowingScreen = ({ navigation }) => {
    const { loading, followedCompanies, fetchFollowedCompanies, unfollowCompany, error } = useContext(CompanyContext);
    const [refreshing, setRefreshing] = useState(false);
    const [unfollowingId, setUnfollowingId] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);
    
    // Ref để theo dõi việc load data chỉ diễn ra một lần
    const didInitialLoadRef = useRef(false);
    const loadingInProgressRef = useRef(false);

    const loadData = useCallback(async () => {
        // Tránh các lần gọi song song
        if (loadingInProgressRef.current) {
            console.log('Loading already in progress, skipping...');
            return;
        }
        
        loadingInProgressRef.current = true;
        console.log('Loading followed companies data in FollowingScreen...');
        
        try {
            // Kiểm tra token trước khi tải dữ liệu
            const token = await AsyncStorage.getItem('accessToken');
            console.log('Token available in FollowingScreen:', token ? 'Yes' : 'No');

            if (!token) {
                Alert.alert('Lỗi xác thực', 'Bạn cần đăng nhập để xem công ty đã theo dõi');
                navigation.navigate('Login');
                return;
            }

            const result = await fetchFollowedCompanies();
            console.log('Followed companies data loaded in FollowingScreen, count:', result?.length || 0);

            // Lưu thông tin debug
            setDebugInfo({
                tokenExists: !!token,
                companiesCount: followedCompanies?.length || 0,
                apiResponseCount: result?.length || 0,
                error: error
            });
        } catch (error) {
            console.error('Error in loadData:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách công ty. ' + (error.message || ''));
        } finally {
            loadingInProgressRef.current = false;
        }
    }, [fetchFollowedCompanies, error, navigation]);

    // Chỉ gọi loadData khi màn hình được focus và chưa load lần đầu
    useFocusEffect(
        useCallback(() => {
            console.log('FollowingScreen came into focus, didInitialLoad:', didInitialLoadRef.current);
            
            if (!didInitialLoadRef.current) {
                didInitialLoadRef.current = true;
                loadData();
            }
            
            // Thêm log để kiểm tra followedCompanies
            console.log('Current followedCompanies in context:',
                followedCompanies ? `${followedCompanies.length} companies` : 'undefined');
        }, [loadData])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // Reset flag để cho phép load lại dữ liệu khi người dùng chủ động làm mới
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    const handleUnfollow = async (companyId) => {
        try {
            setUnfollowingId(companyId);
            await unfollowCompany(companyId);
            console.log('Successfully unfollowed company:', companyId);
        } catch (error) {
            console.error('Error unfollowing company:', error);
            Alert.alert('Lỗi', 'Không thể bỏ theo dõi công ty. Vui lòng thử lại sau.');
        } finally {
            setUnfollowingId(null);
        }
    };

    const handleCompanyPress = (company) => {
        // Navigate to company detail or job listings by this company
        console.log('Viewing company details:', company.name);
        // navigation.navigate('CompanyDetail', { companyId: company.id });
    };

    const getImageUrl = (company) => {
        if (company.images && company.images.length > 0) {
            const imageObj = company.images[0];
            if (typeof imageObj === 'object' && imageObj.image) {
                return { uri: imageObj.image };
            }
        }
        return require('../../assets/logo.png'); // Default image
    };

    const renderCompanyItem = ({ item }) => {
        const company = item.recruiter_company;
        if (!company) {
            console.log('No recruiter_company found for item:', item.id);
            return null;
        }

        return (
            <View style={styles.companyCard}>
                <TouchableOpacity
                    style={styles.cardContent}
                    onPress={() => handleCompanyPress(company)}
                >
                    <View style={styles.companyHeader}>
                        <Image
                            source={getImageUrl(company)}
                            style={styles.companyLogo}
                            defaultSource={require('../../assets/logo.png')}
                        />
                        <View style={styles.companyInfo}>
                            <View style={styles.companyTitleRow}>
                                <Text style={styles.companyName}>{company.name}</Text>
                                {company.is_verified && (
                                    <Icon name="verified" size={16} color="#4CAF50" style={styles.verifiedIcon} />
                                )}
                            </View>
                            <Text style={styles.companyTax}>MST: {company.tax_code}</Text>
                            <View style={styles.locationRow}>
                                <Icon name="location-on" size={14} color="#666" />
                                <Text style={styles.companyLocation}>{company.location}</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.companyDescription} numberOfLines={2}>
                        {company.description}
                    </Text>

                    <View style={styles.cardFooter}>
                        <Text style={styles.followDate}>
                            Theo dõi từ: {new Date(item.created_date).toLocaleDateString('vi-VN')}
                        </Text>
                        <TouchableOpacity
                            style={styles.unfollowButton}
                            onPress={() => handleUnfollow(company.id)}
                            disabled={unfollowingId === company.id}
                        >
                            {unfollowingId === company.id ? (
                                <ActivityIndicator size="small" color="#FF5252" />
                            ) : (
                                <>
                                    <Icon name="favorite" size={16} color="#FF5252" />
                                    <Text style={styles.unfollowText}>Bỏ theo dõi</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    const renderDebugInfo = () => {
        if (!__DEV__ || !debugInfo) return null;

        return (
            <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text>Token exists: {debugInfo.tokenExists ? 'Yes' : 'No'}</Text>
                <Text>Context companies count: {debugInfo.companiesCount}</Text>
                <Text>API response count: {debugInfo.apiResponseCount}</Text>
                <Text>Error: {debugInfo.error || 'None'}</Text>

                <View style={styles.debugButtonsContainer}>
                    <TouchableOpacity
                        style={styles.debugButton}
                        onPress={async () => {
                            const token = await AsyncStorage.getItem('accessToken');
                            Alert.alert('Token', token || 'No token found');
                        }}
                    >
                        <Text style={styles.debugButtonText}>Show Token</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.debugButton}
                        onPress={() => {
                            console.log('Current followedCompanies:', followedCompanies);
                            Alert.alert(
                                'Companies Data',
                                `Count: ${followedCompanies?.length || 0}\n${followedCompanies && followedCompanies.length > 0 ?
                                    JSON.stringify(followedCompanies[0], null, 2).substring(0, 200) + '...' :
                                    'No companies'}`
                            );
                        }}
                    >
                        <Text style={styles.debugButtonText}>Show Companies Data</Text>
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                >
                    <Text style={styles.debugButtonText}>Tải lại dữ liệu</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Đang tải danh sách công ty...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderDebugInfo()}

            {error && (
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={24} color="#FF5252" />
                    <Text style={styles.errorText}>Lỗi: {error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                        <Text style={styles.retryText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={followedCompanies}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#2196F3"]}
                    />
                }
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                renderItem={renderCompanyItem}
                contentContainerStyle={[
                    styles.listContent,
                    !followedCompanies || followedCompanies.length === 0 ? { flex: 1 } : {}
                ]}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="favorite-border" size={64} color="#BDBDBD" />
                        <Text style={styles.emptyText}>Bạn chưa theo dõi công ty nào</Text>
                        <Text style={styles.emptySubtext}>
                            Hãy theo dõi các công ty bạn quan tâm để nhận thông báo về việc làm mới
                        </Text>
                        <TouchableOpacity
                            style={styles.exploreButton}
                            onPress={() => navigation.navigate('HomeTab')}
                        >
                            <Text style={styles.exploreButtonText}>Khám phá công việc</Text>
                        </TouchableOpacity>
                        <Button
                            mode="outlined"
                            style={styles.browseJobsButton}
                            onPress={() => navigation.navigate('HomeTab')}
                        >
                            Tìm công việc
                        </Button>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212121'
    },
    headerCount: {
        fontSize: 14,
        color: '#757575',
    },
    listContent: {
        padding: 8,
        flexGrow: 1,
    },
    companyCard: {
        backgroundColor: 'white',
        margin: 8,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardContent: {
        padding: 16,
    },
    companyHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    companyLogo: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    companyInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    companyTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    verifiedIcon: {
        marginLeft: 4,
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
    },
    companyTax: {
        fontSize: 12,
        color: '#757575',
        marginTop: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    companyLocation: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    companyDescription: {
        fontSize: 14,
        color: '#424242',
        lineHeight: 20,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    followDate: {
        fontSize: 12,
        color: '#9E9E9E',
    },
    unfollowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#FFF0F0',
        borderRadius: 16,
    },
    unfollowText: {
        fontSize: 12,
        color: '#FF5252',
        marginLeft: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#616161',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#424242',
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        marginBottom: 24,
    },
    exploreButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
    },
    exploreButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    browseJobsButton: {
        marginTop: 16,
        borderColor: '#2196F3',
    },
    errorContainer: {
        backgroundColor: '#FFEBEE',
        margin: 10,
        padding: 15,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    errorText: {
        color: '#D32F2F',
        flex: 1,
        marginHorizontal: 10
    },
    retryButton: {
        backgroundColor: '#D32F2F',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    retryText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    debugContainer: {
        backgroundColor: '#E3F2FD',
        padding: 10,
        margin: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#90CAF9'
    },
    debugTitle: {
        fontWeight: 'bold',
        marginBottom: 4
    },
    debugButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8
    },
    debugButton: {
        backgroundColor: '#2196F3',
        padding: 8,
        borderRadius: 4,
        alignItems: 'center',
        flex: 0.48
    },
    debugButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12
    },
    refreshButton: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 10
    }
});

export default FollowingScreen;