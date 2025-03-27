import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

const ScreenHeader = ({
    title,
    subtitle,
    leftIcon = 'arrow-left',
    rightIcon,
    onLeftPress,
    onRightPress,
    style,
    titleStyle,
    subtitleStyle,
}) => {
    const navigation = useNavigation();

    const handleLeftPress = () => {
        if (onLeftPress) {
            onLeftPress();
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={[styles.header, style]}>
            {leftIcon && (
                <IconButton
                    icon={leftIcon}
                    size={24}
                    onPress={handleLeftPress}
                    style={styles.leftIcon}
                />
            )}

            <View style={styles.titleContainer}>
                <Text style={[styles.title, titleStyle]}>{title}</Text>
                {subtitle && <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>}
            </View>

            {rightIcon && (
                <IconButton
                    icon={rightIcon}
                    size={24}
                    onPress={onRightPress}
                    style={styles.rightIcon}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        elevation: 2,
    },
    leftIcon: {
        marginRight: 8,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    rightIcon: {
        marginLeft: 8,
    },
});

export default ScreenHeader;