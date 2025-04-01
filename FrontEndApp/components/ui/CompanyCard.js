import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

const CompanyCard = ({ company, onPress, onUnfollow }) => {
    return (
        <Card style={styles.card} onPress={onPress}>
            <Card.Content style={styles.content}>
                <Image
                    source={{ uri: company.logoUrl }}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <View style={styles.info}>
                    <Text style={styles.name}>{company.name}</Text>
                    <Text style={styles.industry}>{company.industry}</Text>
                    <Text style={styles.location}>{company.location}</Text>
                </View>
            </Card.Content>
            <Card.Actions>
                <Button 
                    mode="outlined" 
                    onPress={() => onUnfollow()}
                    color="#FF5252"
                >
                    Bỏ theo dõi
                </Button>
            </Card.Actions>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    logo: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    info: {
        marginLeft: 16,
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    industry: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    location: {
        fontSize: 14,
        color: '#666',
    },
});

export default CompanyCard;
