import React from 'react';
import { StyleSheet } from 'react-native';
import { Divider } from 'react-native-paper';

const AppDivider = ({ style }) => {
    return <Divider style={[styles.divider, style]} />;
};

const styles = StyleSheet.create({
    divider: {
        marginVertical: 12,
    },
});

export default AppDivider;