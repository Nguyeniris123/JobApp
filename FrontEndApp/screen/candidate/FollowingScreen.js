import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { CompanyContext } from '../../contexts/CompanyContext';

const FollowingScreen = () => {
    const { loading, followedCompanies, fetchFollowedCompanies } = useContext(CompanyContext);
    const [refreshing, setRefreshing] = React.useState(false);

    const loadData = useCallback(async () => {
        console.log('Loading followed companies data...');
        try {
            await fetchFollowedCompanies();
            console.log('Followed companies loaded:', followedCompanies);
        } catch (error) {
            console.error('Error loading followed companies:', error);
        }
    }, [fetchFollowedCompanies]);

    useFocusEffect(
        useCallback(() => {
            console.log('FollowingScreen came into focus');
            loadData();
        }, [loadData])
    );

    useEffect(() => {
        console.log('Current followed companies:', followedCompanies);
    }, [followedCompanies]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    if (loading && !refreshing) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={followedCompanies}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.companyCard}>
                        <Text style={styles.companyName}>{item.recruiter_company.name}</Text>
                        <Text style={styles.companyLocation}>{item.recruiter_company.location}</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Bạn chưa theo dõi công ty nào</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    companyCard: {
        backgroundColor: 'white',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    companyLocation: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#666',
    },
});

export default FollowingScreen;